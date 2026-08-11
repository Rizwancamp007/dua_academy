import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { secureRouteHandler } from "@/lib/security";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fatherName: z.string().min(2, "Father's name is required"),
  city: z.string().min(2, "City is required"),
  classId: z.string().min(1, "Please select your class"),
  streamId: z.string().min(1, "Please select your stream"),
});

export async function POST(req: NextRequest) {
  const security = await secureRouteHandler(req, {
    schema: registerSchema,
  });

  if (!security.authorized || !security.data) {
    return security.response || NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  try {
    await dbConnect();

    const { name, email, phone, password, fatherName, city, classId, streamId } = security.data;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in pending state
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role: "student",
      isApproved: false, // Must be approved by clerk/admin
      isActive: true,
      studentDetails: {
        fatherName,
        city,
        classRef: classId,
        streamRef: streamId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Your account is pending administrative approval.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
