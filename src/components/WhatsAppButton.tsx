"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WhatsAppButton() {
  const phoneNumber = "923335524440";
  const greeting = "Assalam-o-Alaikum, I want information about admissions at Duaa Academy";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(greeting)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Pulse Outer Rings */}
      <div className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />
      
      <motion.a
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 transition-colors focus:outline-none focus:ring-4 focus:ring-green-400/50 cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
      </motion.a>
    </div>
  );
}
export default WhatsAppButton;
