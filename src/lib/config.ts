import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
});

let env: z.infer<typeof envSchema>;

if (typeof window === "undefined") {
  // Normalize NEXTAUTH_URL with protocol support and Vercel fallbacks
  let nextAuthUrl = process.env.NEXTAUTH_URL;
  if (!nextAuthUrl || nextAuthUrl.trim() === "") {
    if (process.env.VERCEL_URL) {
      nextAuthUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      nextAuthUrl = "http://localhost:3000";
    }
  } else if (!nextAuthUrl.startsWith("http://") && !nextAuthUrl.startsWith("https://")) {
    nextAuthUrl = `https://${nextAuthUrl.trim()}`;
  }

  // Provide safe build-time fallbacks to prevent Next.js build-phase crashes
  const parsed = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/dua-build-placeholder",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "build-time-nextauth-secret-placeholder-string",
    NEXTAUTH_URL: nextAuthUrl,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "build-time-gemini-api-key-placeholder",
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error("CRITICAL: Missing or invalid environment variables. The application cannot boot.");
  }
  env = parsed.data;
} else {
  env = {} as any;
}

export { env };
