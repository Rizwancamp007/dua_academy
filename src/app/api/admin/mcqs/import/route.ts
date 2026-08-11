import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { secureRouteHandler } from "@/lib/security";
import { env } from "@/lib/config";

const rateLimitMap = new Map<string, number[]>();

// Helper function: Sanitize text to remove headers, footers, watermarks
const sanitizeDocumentText = (text: string) => {
  let lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  
  // Remove watermarks & common headers
  const stopWords = ["CONFIDENTIAL", "DRAFT", "www.", "http://", "https://", "Scanned by", "CamScanner", "Page"];
  lines = lines.filter(line => {
    const isWatermark = stopWords.some(word => line.toLowerCase().includes(word.toLowerCase()));
    const isStandaloneNumber = /^\d+$/.test(line); // e.g. standalone page numbers
    return !isWatermark && !isStandaloneNumber;
  });

  return lines.join("\n\n");
};

// Helper function: Chunk text by double newlines (natural question boundaries)
const chunkTextByQuestions = (text: string, maxChunkSize = 12000) => {
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const block of blocks) {
    if (currentChunk.length + block.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = "";
    }
    currentChunk += (currentChunk ? "\n\n" : "") + block;
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
};

export async function POST(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    allowedRoles: ["admin", "clerk", "teacher"],
  });

  if (!security.authorized) {
    return security.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiter Check (Max 5 requests per minute per IP)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const LIMIT_WINDOW = 60 * 1000;
  const MAX_REQUESTS = 5;
  const userTimestamps = rateLimitMap.get(ip) || [];
  const activeTimestamps = userTimestamps.filter((ts) => now - ts < LIMIT_WINDOW);

  if (activeTimestamps.length >= MAX_REQUESTS) {
    return NextResponse.json(
      { error: "Too many document uploads. Please wait a minute and try again." },
      { status: 429 }
    );
  }

  activeTimestamps.push(now);
  rateLimitMap.set(ip, activeTimestamps);

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name;
    const isPdf = filename.toLowerCase().endsWith(".pdf");
    const isDocx = filename.toLowerCase().endsWith(".docx");

    if (!isPdf && !isDocx) {
      return NextResponse.json({ error: "Unsupported file format. Please upload PDF or DOCX." }, { status: 400 });
    }

    // Call Gemini API with structured JSON output configuration
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `You are a professional educational assessor and content extractor. Parse the following text material and extract ALL multiple-choice questions (MCQs) present.
Do NOT skip, summarize, or omit any question. Process every single question found in the text.
Each question must have exactly 4 options. Build a helpful explanation statement for each question.
IGNORE academy headers, footers, watermarks, teacher/faculty names, student metadata, total marks, time limit, and page numbers.
PRESERVE all mathematical and scientific symbols, formulas, Greek letters, and LaTeX formatting exactly as they are in the text.
Strip option letter prefixes (like A), B), a., b., etc.) from the option text.
Solve each question and set correctIndex to the 0-based index of the correct option (0 = A, 1 = B, 2 = C, 3 = D).

You MUST format the output strictly as a JSON object matching this schema:
{
  "mcqs": [
    {
      "question": "Question Statement",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation statement of why this is correct."
    }
  ]
}`;

    let allMcqs: any[] = [];
    let extractedText = "";

    // 1. Extract text using local parsers
    if (isPdf) {
      try {
        console.log("Using local PDFParse text extraction...");
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        extractedText = textResult.text || "";
        await parser.destroy();
      } catch (err: any) {
        console.warn("Local PDF text extraction failed:", err.message);
      }
    } else if (isDocx) {
      try {
        console.log("Using local Mammoth DOCX text extraction...");
        const parsedDoc = await mammoth.extractRawText({ buffer });
        extractedText = parsedDoc.value || "";
      } catch (err: any) {
        console.warn("Local DOCX text extraction failed:", err.message);
      }
    }

    // 2. Phase 1: Try chunk-based text parsing using Gemini
    if (extractedText.trim()) {
      const sanitizedText = sanitizeDocumentText(extractedText);
      const chunks = chunkTextByQuestions(sanitizedText, 12000);
      
      console.log(`Parsed text from document. Processing ${chunks.length} chunks with Gemini...`);
      for (let idx = 0; idx < chunks.length; idx++) {
        const chunk = chunks[idx];
        const chunkPrompt = prompt + `\n\nText Material (Chunk ${idx + 1} of ${chunks.length}):\n"""\n${chunk}\n"""`;
        try {
          const result = await model.generateContent(chunkPrompt);
          const responseText = result.response.text();
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed && Array.isArray(parsed.mcqs)) {
              allMcqs = allMcqs.concat(parsed.mcqs);
              console.log(`Chunk ${idx + 1}/${chunks.length} processed. Extracted ${parsed.mcqs.length} MCQs.`);
            }
          }
        } catch (chunkErr: any) {
          console.warn(`Failed parsing chunk ${idx + 1} with Gemini:`, chunkErr.message);
        }
      }
    }

    // 3. Phase 2: If text-based extraction returned 0 questions (e.g. scanned PDF/images), fallback to native Multimodal PDF parsing
    if (allMcqs.length === 0 && isPdf) {
      try {
        console.log("Text chunking yielded 0 MCQs. Falling back to native Gemini PDF multimodal parsing...");
        const base64Data = buffer.toString("base64");
        const filePart = {
          inlineData: {
            data: base64Data,
            mimeType: "application/pdf"
          }
        };

        const result = await model.generateContent([filePart, prompt]);
        const responseText = result.response.text();
        
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed && Array.isArray(parsed.mcqs)) {
            allMcqs = parsed.mcqs;
            console.log(`Native Gemini multimodal fallback extracted ${allMcqs.length} MCQs.`);
          }
        }
      } catch (pdfErr: any) {
        console.warn("Native Gemini PDF multimodal fallback failed:", pdfErr.message);
      }
    }

    // 4. Phase 3: Regex Fallback Parser for structured text if Gemini returned absolutely nothing
    if (allMcqs.length === 0) {
      console.log("Gemini returned zero MCQs, falling back to regex parser...");
      const sanitizedText = sanitizeDocumentText(extractedText);
      const blocks = sanitizedText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);

      let i = 0;
      while (i < blocks.length) {
        const block = blocks[i];
        const isNumberedQuestion = /^(?:Q\d+|\d+)[\.\)]\s*/i.test(block);

        // Case A: Numbered question containing options inline
        if (isNumberedQuestion && block.match(/([a-d])[\.\)]/i)) {
          const optionsMatch = block.match(/([a-d])[\.\)]\s*(.*?)(?=(?:[a-d][\.\)]|$))/gi);
          const qTextMatch = block.split(/(?=[a-d][\.\)])/i)[0];
          const qTextLine = qTextMatch ? qTextMatch.replace(/^(?:Q\d+|\d+)[\.\)]\s*/i, "").trim() : "";
          const options: string[] = [];
          if (optionsMatch) {
            optionsMatch.forEach(optStr => {
              const cleaned = optStr.replace(/^[a-d][\.\)]\s*/i, "").trim();
              if (cleaned) options.push(cleaned);
            });
          }
          if (options.length > 1) {
            while (options.length < 4) {
              options.push("Option " + String.fromCharCode(65 + options.length));
            }
            allMcqs.push({
              question: qTextLine || block,
              options: options.slice(0, 4),
              correctIndex: 0,
              explanation: `Regex parsed from ${filename}`
            });
          }
          i++;
          continue;
        }

        // Case B: Question followed by 4 separate option blocks
        let j = i + 1;
        const potentialOptions: string[] = [];
        while (j < blocks.length && j < i + 5) {
          const cleanedOpt = blocks[j].replace(/^[a-d][\.\)]\s*/i, "").trim();
          potentialOptions.push(cleanedOpt);
          j++;
        }

        if (potentialOptions.length === 4) {
          const qTextLine = block.replace(/^(?:Q\d+|\d+)[\.\)]\s*/i, "").trim();
          allMcqs.push({
            question: qTextLine,
            options: potentialOptions,
            correctIndex: 0,
            explanation: `Regex parsed from ${filename}`
          });
          i = j; // Skip over the options
        } else {
          i++;
        }
      }
    }

    // Clean, map keys and remove duplicates
    if (allMcqs.length > 0) {
      const uniqueMcqs: any[] = [];
      const seen = new Set<string>();
      for (const mcq of allMcqs) {
        // Map question/questionText key safely
        const qText = (mcq.question || mcq.questionText || "").trim();
        if (!qText) continue;

        const normQ = qText.toLowerCase().replace(/\s+/g, "");
        if (!seen.has(normQ)) {
          seen.add(normQ);

          // Clean options: strip prefix letter like A), B), C), D)
          const rawOptions = mcq.options || mcq.choices || [];
          const cleanedOptions = rawOptions.map((opt: any) => {
            const str = String(opt || "").trim();
            return str.replace(/^[a-d][\.\)\s-]+\s*/i, "").trim();
          });

          // Ensure exactly 4 options
          while (cleanedOptions.length < 4) {
            cleanedOptions.push("Option " + String.fromCharCode(65 + cleanedOptions.length));
          }

          uniqueMcqs.push({
            question: qText,
            options: cleanedOptions.slice(0, 4),
            correctIndex: typeof mcq.correctIndex === "number" ? mcq.correctIndex : 0,
            explanation: mcq.explanation || ""
          });
        }
      }
      allMcqs = uniqueMcqs;
    }

    return NextResponse.json({ mcqs: allMcqs });
  } catch (error: any) {
    console.error("AI Import Pipeline Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process the document." }, { status: 500 });
  }
}
