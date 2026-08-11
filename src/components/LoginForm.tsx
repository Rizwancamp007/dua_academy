"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GraduationCap, LogIn, AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Grab nextauth errors from URL if redirected
  const urlError = searchParams.get("error");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(urlError ? "Session expired or authentication failed." : "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.email) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email format.";
    }
    if (!formData.password) {
      tempErrors.password = "Password is required.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (res?.error) {
        setErrorMsg(res.error);
      } else {
        // Successful login, fetch session details to redirect correctly
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        
        if (session && session.user) {
          const role = session.user.role;
          if (role === "admin") {
            router.push("/admin");
          } else if (role === "clerk") {
            router.push("/clerk");
          } else if (role === "teacher") {
            router.push("/teacher");
          } else {
            router.push("/student");
          }
          router.refresh();
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card hoverLift={false} className="w-full max-w-md border border-border bg-surface p-8 shadow-2xl">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold">Duaa Academy</h2>
        <p className="text-sm text-text/60 mt-1">
          Access your personalized classroom and assessment portal.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-sm flex items-start gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address *"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="khan@gmail.com"
          disabled={loading}
          required
        />

        <Input
          label="Password *"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="••••••••"
          disabled={loading}
          required
        />

        <Button type="submit" loading={loading} className="w-full flex items-center justify-center gap-2">
          <LogIn className="w-4 h-4" /> Sign In
        </Button>

        <div className="text-center text-sm text-text/60 mt-4">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Register as a Student
          </Link>
        </div>
      </form>
    </Card>
  );
}
export default LoginForm;
