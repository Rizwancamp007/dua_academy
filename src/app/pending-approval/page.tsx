"use client";

import { useSession, signOut } from "next-auth/react";
import { MessageCircle, LogOut, Clock, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function PendingApprovalPage() {
  const { data: session } = useSession();
  const email = session?.user?.email || "";

  const whatsappMessage = `Assalam-o-Alaikum, I have registered my student account at Duaa Academy using the email: ${email}. Please verify and approve my enrollment.`;
  const whatsappUrl = `https://wa.me/923335524440?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card hoverLift={false} className="w-full max-w-lg border border-border bg-surface p-8 shadow-2xl text-center">
        
        {/* Visual Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-ping" />
            <div className="p-4 rounded-full bg-yellow-500/10 text-yellow-600 relative">
              <Clock className="w-10 h-10" />
            </div>
          </div>
        </div>

        <Badge variant="warning" className="mb-4 uppercase tracking-wider">
          Approval Pending
        </Badge>

        <h1 className="font-serif text-3xl font-bold mb-4">
          Account Verification Required
        </h1>

        <p className="text-sm text-text/70 leading-relaxed mb-6">
          Assalam-o-Alaikum, your registration has been successfully received. To safeguard classroom and assessment integrity, student accounts must be verified by a clerk or administrator before accessing mock tests, video lectures, and student stats.
        </p>

        {email && (
          <div className="mb-8 p-3 rounded-lg bg-primary/5 border border-border/80 text-xs font-mono text-text/60">
            Registered Email: {email}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 !text-white border-0 shadow-lg">
              <MessageCircle className="w-5 h-5 fill-current" />
              Request Verification on WhatsApp
            </Button>
          </a>

          <Button
            variant="outline"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Account
          </Button>
        </div>

        <p className="text-xs text-text/40 mt-8 flex items-center justify-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          Secured by Duaa Academy Administration
        </p>
      </Card>
    </div>
  );
}
