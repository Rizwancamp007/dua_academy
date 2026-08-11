import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
});

let env: z.infer<typeof envSchema>;

if (typeof window === "undefined") {
  const parsed = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
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
