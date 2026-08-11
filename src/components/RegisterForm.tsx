"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GraduationCap, ArrowRight, UserPlus, HelpCircle } from "lucide-react";

interface Option {
  id: string;
  name: string;
}

interface RegisterFormProps {
  classes: Option[];
  streams: Option[];
}

export function RegisterForm({ classes, streams }: RegisterFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    fatherName: "",
    city: "",
    classId: "",
    streamId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.name) tempErrors.name = "Full name is required.";
    if (!formData.email) {
      tempErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = "Invalid email format.";
    }
    if (!formData.phone) {
      tempErrors.phone = "Phone number is required.";
    } else if (formData.phone.length < 10) {
      tempErrors.phone = "Phone must be at least 10 digits.";
    }
    if (!formData.password) {
      tempErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
    }
    if (!formData.fatherName) tempErrors.fatherName = "Father's name is required.";
    if (!formData.city) tempErrors.city = "City is required.";
    if (!formData.classId) tempErrors.classId = "Please select a class.";
    if (!formData.streamId) tempErrors.streamId = "Please select a stream.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(data.message);
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          fatherName: "",
          city: "",
          classId: "",
          streamId: "",
        });
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setErrorMsg(data.error || "Registration failed.");
      }
    } catch (err) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card hoverLift={false} className="w-full max-w-2xl border border-border bg-surface p-8 shadow-2xl">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-3xl font-bold">Student Registration</h2>
        <p className="text-sm text-text/60 mt-1">
          Create an account to access practice tests, video lectures, and results tracking.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 font-medium text-sm text-center">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-sm text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Khan"
            disabled={loading}
          />
          <Input
            label="Father's Name *"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            error={errors.fatherName}
            placeholder="Father's Name"
            disabled={loading}
          />
        </div>

        {/* Auth Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Email Address *"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="khan@gmail.com"
            disabled={loading}
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
          />
        </div>

        {/* contact / city */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Phone Number *"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="03000000000"
            disabled={loading}
          />
          <Input
            label="City *"
            name="city"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            placeholder="Mirpur Mathelo"
            disabled={loading}
          />
        </div>

        {/* Academic selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-1.5 w-full">
            <label htmlFor="classId" className="text-sm font-medium text-text/80">
              Select Class *
            </label>
            <select
              id="classId"
              name="classId"
              value={formData.classId}
              onChange={handleChange}
              disabled={loading}
              className={`flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all ${
                errors.classId ? "border-red-500 focus:ring-red-500/50" : ""
              }`}
            >
              <option value="">-- Choose Class --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
            {errors.classId && <span className="text-xs text-red-500 font-medium">{errors.classId}</span>}
          </div>

          <div className="flex flex-col space-y-1.5 w-full">
            <label htmlFor="streamId" className="text-sm font-medium text-text/80">
              Select Stream / Discipline *
            </label>
            <select
              id="streamId"
              name="streamId"
              value={formData.streamId}
              onChange={handleChange}
              disabled={loading}
              className={`flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all ${
                errors.streamId ? "border-red-500 focus:ring-red-500/50" : ""
              }`}
            >
              <option value="">-- Choose Stream --</option>
              {streams.map((str) => (
                <option key={str.id} value={str.id}>
                  {str.name}
                </option>
              ))}
            </select>
            {errors.streamId && <span className="text-xs text-red-500 font-medium">{errors.streamId}</span>}
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" /> Create Student Account
        </Button>

        <div className="text-center text-sm text-text/60 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            Log in here
          </Link>
        </div>
      </form>
    </Card>
  );
}
export default RegisterForm;
