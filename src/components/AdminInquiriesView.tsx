"use client";

import React, { useState, useEffect } from "react";
import { Mail, Phone, Clock, MessageSquare, CheckCircle, Reply, Search, ArrowRight, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface MessageData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied";
  createdAt: string;
}

export default function AdminInquiriesView() {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    let result = messages;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }
    setFilteredMessages(result);
  }, [search, statusFilter, messages]);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/inquiries");
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "unread" | "read" | "replied") => {
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const data = await res.json();
      
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: data.message.status } : m))
      );
      if (selectedMessage?._id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status: data.message.status } : null));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <Badge variant="warning">Unread</Badge>;
      case "read":
        return <Badge variant="outline">Read</Badge>;
      case "replied":
        return <Badge variant="success">Replied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleOpenMessage = (msg: MessageData) => {
    setSelectedMessage(msg);
    if (msg.status === "unread") {
      updateStatus(msg._id, "read");
    }
  };

  // Clean phone number for WhatsApp URL
  const getWhatsAppLink = (msg: MessageData) => {
    let cleanPhone = msg.phone.replace(/[^0-9]/g, "");
    // Default prefix if not present (Pakistan country code +92)
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "92" + cleanPhone.substring(1);
    }
    const text = encodeURIComponent(
      `Assalam-o-Alaikum ${msg.name},\n\nThis is the administration team from Duaa Academy, Mirpur Mathelo. We received your inquiry regarding "${msg.subject}".`
    );
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Contact Inquiries</h1>
        <p className="text-sm text-text/60 mt-1">
          Review visitor contact requests. Click to view messages, and respond directly via email or WhatsApp.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries (name, email, message...)"
            className="w-full pl-3 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-all text-text"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-xs text-text/60 font-semibold uppercase">Status:</span>
          {["all", "unread", "read", "replied"].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === filter
                  ? "bg-primary text-white"
                  : "bg-surface text-text/70 hover:bg-border/20 border border-border"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-text/60">Loading inquiries...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : filteredMessages.length === 0 ? (
        <div className="py-12 text-center text-text/60 bg-surface/50 rounded-xl border border-border/50">
          No inquiries found matching selected criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left panel - List */}
          <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {filteredMessages.map((msg) => (
              <Card
                key={msg._id}
                onClick={() => handleOpenMessage(msg)}
                hoverLift={true}
                className={`p-4 border cursor-pointer transition-all ${
                  selectedMessage?._id === msg._id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-bold text-sm text-text truncate">{msg.name}</h4>
                  {getStatusBadge(msg.status)}
                </div>
                <p className="text-xs font-semibold text-text/70 truncate mb-2">{msg.subject || "No Subject"}</p>
                <p className="text-xs text-text/50 line-clamp-2 mb-3">{msg.message}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-text/50">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(msg.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </Card>
            ))}
          </div>

          {/* Right panel - Details */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card className="p-6 border border-border bg-surface space-y-6">
                {/* Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-text">{selectedMessage.subject || "No Subject"}</h2>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-text/50">
                      <Clock className="w-4 h-4" />
                      <span>
                        Received on{" "}
                        {new Date(selectedMessage.createdAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedMessage.status)}
                    {selectedMessage.status !== "replied" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatus(selectedMessage._id, "replied")}
                      >
                        Mark as Replied
                      </Button>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bg/50 p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-text/50">Email Address</p>
                      <a href={`mailto:${selectedMessage.email}`} className="text-xs text-primary hover:underline font-medium">
                        {selectedMessage.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-text/50">Phone Number</p>
                      <span className="text-xs text-text font-medium">{selectedMessage.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-semibold text-text/50 tracking-wider">Message</p>
                  <div className="p-4 bg-bg/30 border border-border/30 rounded-xl text-sm leading-relaxed whitespace-pre-line text-text">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 border-t border-border/50 pt-4">
                  <a
                    href={getWhatsAppLink(selectedMessage)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => updateStatus(selectedMessage._id, "replied")}
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-green-600/10 cursor-pointer"
                  >
                    Reply via WhatsApp <ExternalLink className="w-4 h-4" />
                  </a>

                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    onClick={() => updateStatus(selectedMessage._id, "replied")}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-primary/10 cursor-pointer"
                  >
                    Reply via Email <Mail className="w-4 h-4" />
                  </a>
                </div>
              </Card>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-surface/50 border border-border/50 rounded-2xl">
                <MessageSquare className="w-12 h-12 text-text/30 mb-4" />
                <h3 className="text-lg font-serif font-bold text-text/70">No Message Selected</h3>
                <p className="text-xs text-text/50 mt-1 max-w-sm">
                  Choose a contact message inquiry from the list on the left to read its contents and reply.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
