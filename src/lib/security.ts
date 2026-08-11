import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Recursively strips keys starting with '$' or containing '.'
 * to prevent MongoDB NoSQL Injection.
 */
export function sanitizeMongoQuery<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeMongoQuery(item)) as unknown as T;
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key.startsWith("$") || key.includes(".")) {
        continue;
      }
      sanitized[key] = sanitizeMongoQuery((obj as any)[key]);
    }
  }
  return sanitized as T;
}

/**
 * Validates session role against allowed roles list.
 */
export async function checkRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { authorized: false, status: 401, message: "Authentication required", user: null };
  }

  const user = session.user as any;
  if (!allowedRoles.includes(user.role)) {
    return { authorized: false, status: 403, message: "Access denied. Insufficient permissions.", user };
  }

  if (!user.isApproved) {
    return { authorized: false, status: 403, message: "Account pending approval.", user };
  }

  return { authorized: true, status: 200, message: "Authorized", user };
}

/**
 * Combined security helper to validate inputs with Zod, sanitize MongoDB objects,
 * and authorize role permissions on mutations.
 */
export async function secureRouteHandler<TSchema extends z.ZodTypeAny>(
  req: NextRequest,
  options: {
    allowedRoles?: string[];
    schema?: TSchema;
  }
) {
  // 1. Check Roles if needed
  if (options.allowedRoles) {
    const auth = await checkRole(options.allowedRoles);
    if (!auth.authorized) {
      return { authorized: false, response: NextResponse.json({ error: auth.message }, { status: auth.status }), data: null, user: null };
    }
  }

  const session = await getServerSession(authOptions);
  const user = session?.user || null;

  // 2. Validate input and sanitize
  if (options.schema) {
    try {
      let body = {};
      if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
        body = await req.json();
      } else {
        const { searchParams } = new URL(req.url);
        body = Object.fromEntries(searchParams.entries());
      }

      // Sanitize Mongo inputs
      const sanitizedBody = sanitizeMongoQuery(body);

      // Zod parse
      const parsed = options.schema.safeParse(sanitizedBody);
      if (!parsed.success) {
        return {
          authorized: false,
          response: NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 }),
          data: null,
          user,
        };
      }

      return { authorized: true, response: null, data: parsed.data, user };
    } catch (err) {
      return {
        authorized: false,
        response: NextResponse.json({ error: "Invalid request payload" }, { status: 400 }),
        data: null,
        user,
      };
    }
  }

  return { authorized: true, response: null, data: null, user };
}
