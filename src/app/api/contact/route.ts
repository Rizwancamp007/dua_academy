import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Message from "@/models/Message";
import { secureRouteHandler } from "@/lib/security";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  subject: z.string().optional().default("General Inquiry"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
  // Use our security route helper which validates inputs and sanitizes NoSQL operator injections
  const security = await secureRouteHandler(req, {
    schema: contactSchema,
  });

  if (!security.authorized || !security.data) {
    return security.response || NextResponse.json({ error: "Validation failed" }, { status: 400 });
  }

  try {
    await dbConnect();
    
    // Save contact message
    const newMessage = await Message.create(security.data);

    return NextResponse.json(
      { success: true, message: "Your message has been received. We will get back to you shortly." },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error saving contact message:", error);
    return NextResponse.json(
      { error: "Internal server error. Failed to send message." },
      { status: 500 }
    );
  }
}
