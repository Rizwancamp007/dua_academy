const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AQ.Ab8RN6I9uhKWQ5RtbtzfqFJ2m1CBbnuXWJl3SitQo5mq-Uaoaw";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Generate a JSON object containing a greeting: {"greeting": "hello world"}`;
    const result = await model.generateContent(prompt);
    console.log("STATUS: SUCCESS");
    console.log("RESPONSE:", result.response.text());
  } catch (err) {
    console.error("STATUS: ERROR");
    console.error(err);
  }
}

run();
