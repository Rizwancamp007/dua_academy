import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { env } from "@/lib/config";

// Setup credential schema validation
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await dbConnect();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("Invalid credentials");
        }

        const { email, password } = parsed.data;

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          // Generic message to prevent email enumeration
          throw new Error("Invalid credentials");
        }

        // Check if account is active
        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Please contact support.");
        }

        // Check lock state
        if (user.lockUntil && user.lockUntil > new Date()) {
          const waitMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
          throw new Error(`Account locked. Try again in ${waitMinutes} minute(s).`);
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
          // Increment login attempts
          user.loginAttempts = (user.loginAttempts || 0) + 1;
          if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // lock for 15 mins
            await user.save();
            throw new Error("Too many failed attempts. Account locked for 15 minutes.");
          }
          await user.save();
          throw new Error("Invalid credentials");
        }

        // Reset attempts on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        if (!user.isApproved) {
          throw new Error("Your account is pending approval by the administration.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.isApproved = (user as any).isApproved;

        // Set dynamic expiry on creation
        const nowSeconds = Math.floor(Date.now() / 1000);
        if (["admin", "clerk", "teacher"].includes((user as any).role)) {
          token.expiresAt = nowSeconds + 3 * 3600; // 3 hours for staff
        } else {
          token.expiresAt = nowSeconds + 7 * 24 * 3600; // 7 days for students
        }
      }

      // Check custom expiry on subsequent requests
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (token.expiresAt && nowSeconds > (token.expiresAt as number)) {
        return {} as any; // Return empty token to force logout
      }

      return token;
    },
    async session({ session, token }) {
      if (!token || !token.id) {
        // Invalidate user session
        if (session) {
          (session as any).user = undefined;
        }
        return session;
      }
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).isApproved = token.isApproved;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
