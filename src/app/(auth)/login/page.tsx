import LoginForm from "@/components/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <Suspense fallback={<div className="text-sm font-medium animate-pulse text-text/60">Loading login session...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
