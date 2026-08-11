"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const contactNumbers = [
    "0333-5524440",
    "0333-7092389",
    "0300-2132072",
    "0301-3679918",
    "0300-3159757",
    "0311-3432433",
  ];

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!formData.name) tempErrors.name = "Name is required.";
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
    if (!formData.message) tempErrors.message = "Message details are required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(data.message);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setErrorMsg(data.error || "Failed to submit message.");
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-20 bg-bg text-text">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-3">Contact Us</Badge>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            Get in Touch With Duaa Academy
          </h1>
          <p className="text-lg text-text/70">
            Have questions about admission criteria, class slots, or timings? Reach out to us directly or fill out the form.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-2 flex flex-col space-y-6">
            <Card hoverLift={false} className="flex-1 flex flex-col space-y-8 p-8 border border-border bg-surface">
              <div>
                <h3 className="font-serif text-2xl font-bold mb-2">Our Campus</h3>
                <p className="text-sm text-text/60">Come visit us or write to us anytime.</p>
              </div>

              {/* Physical Address */}
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Venue Location</h4>
                  <p className="text-sm text-text/70 mt-1">Ikhlas Model High School, Mirpur Mathelo</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Email Address</h4>
                  <a href="mailto:duaacademymirpur@gmail.com" className="text-sm text-text/70 hover:underline block mt-1">
                    duaacademymirpur@gmail.com
                  </a>
                </div>
              </div>

              {/* Contact Numbers */}
              <div className="flex items-start space-x-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Contact Hotlines</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-text/70">
                    {contactNumbers.map((num) => (
                      <span key={num} className="font-medium">{num}</span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick WhatsApp Link banner */}
            <div className="bg-green-500 text-white rounded-xl p-6 shadow-md flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 fill-current" /> Instant Support
                </h4>
                <p className="text-xs text-white/80 mt-1">Chat directly with the admissions officer on WhatsApp.</p>
              </div>
              <a
                href={`https://wa.me/923335524440?text=${encodeURIComponent("Assalam-o-Alaikum, I want information about admissions at Duaa Academy")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="secondary" className="!bg-white !text-green-600 hover:!bg-white/95">
                  Chat Now
                </Button>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <Card hoverLift={false} className="lg:col-span-3 border border-border bg-surface p-8 shadow-xl">
            <h3 className="font-serif text-2xl font-bold mb-6">Send a Message</h3>
            
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
                  label="Your Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="R Khan"
                  required
                />
                <Input
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="khann@gmail.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Phone Number *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="03338477768"
                  required
                />
                <Input
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Admission query / Fee details"
                />
              </div>

              <div className="flex flex-col space-y-1.5 w-full">
                <label htmlFor="message" className="text-sm font-medium text-text/80 cursor-pointer">
                  Message Details *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe your inquiry..."
                  className={`flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all ${
                    errors.message ? "border-red-500 focus:ring-red-500/50" : ""
                  }`}
                  required
                />
                {errors.message && <span className="text-xs text-red-500 font-medium">{errors.message}</span>}
              </div>

              <Button type="submit" loading={loading} className="w-full flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send Inquiry Message
              </Button>
            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}
