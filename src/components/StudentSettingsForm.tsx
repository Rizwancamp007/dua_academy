"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Phone, MapPin, Key, Save } from "lucide-react";

interface ProfileData {
  name: string;
  phone: string;
  fatherName: string;
  city: string;
}

export function StudentSettingsForm({ initialData }: { initialData: ProfileData }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    phone: initialData.phone || "",
    fatherName: initialData.fatherName || "",
    city: initialData.city || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.name) tempErrors.name = "Full name is required.";
    if (!formData.phone) tempErrors.phone = "Phone number is required.";
    if (!formData.fatherName) tempErrors.fatherName = "Father's name is required.";
    if (!formData.city) tempErrors.city = "City is required.";

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        tempErrors.newPassword = "New password must be at least 6 characters.";
      }
      if (!formData.currentPassword) {
        tempErrors.currentPassword = "Current password is required to set a new password.";
      }
      if (formData.newPassword !== formData.confirmPassword) {
        tempErrors.confirmPassword = "Passwords do not match.";
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/student/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(data.message);
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to update profile settings.");
      }
    } catch (err) {
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card hoverLift={false} className="border border-border bg-surface p-8 shadow-xl max-w-2xl">
      <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2 border-b border-border/50 pb-3 text-text">
        <User className="w-5 h-5 text-primary" /> Update Profile Settings
      </h3>

      {successMsg && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 font-medium text-sm">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Full Name *"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={loading}
          />
          <Input
            label="Father's Name *"
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            error={errors.fatherName}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Phone Number *"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={loading}
          />
          <Input
            label="City *"
            name="city"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            disabled={loading}
          />
        </div>

        <div className="border-t border-border/50 pt-6 mt-6">
          <h4 className="font-serif text-lg font-bold mb-4 flex items-center gap-2 text-text/80">
            <Key className="w-4 h-4 text-primary" /> Change Password (Optional)
          </h4>
          
          <div className="space-y-4">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              placeholder="••••••••"
              disabled={loading}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                error={errors.newPassword}
                placeholder="••••••••"
                disabled={loading}
              />
              <Input
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <Button type="submit" loading={loading} className="w-full flex items-center justify-center gap-2">
          <Save className="w-4 h-4" /> Save Settings
        </Button>
      </form>
    </Card>
  );
}
export default StudentSettingsForm;
