"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Video, Users, Award, Image, Layers, Search, ExternalLink, Play, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface AdminContentViewProps {
  classes: { id: string; name: string }[];
  streams: { id: string; name: string }[];
  subjects: { id: string; name: string; classId: string }[];
}

type TabType = "lecture" | "faculty" | "honor" | "gallery" | "hero";

export default function AdminContentView({ classes, streams, subjects }: AdminContentViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("lecture");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form Fields State
  const [formLecture, setFormLecture] = useState({
    title: "",
    classRef: classes[0]?.id || "",
    streamRef: "",
    subjectRef: "",
    sourceType: "youtube" as "youtube" | "drive" | "mega",
    url: "",
    isPublicDemo: false,
  });

  const [formFaculty, setFormFaculty] = useState({
    name: "",
    subject: "",
    qualification: "",
    experience: "",
    imageUrl: "/brand/placeholder.jpg",
    order: 0,
    isActive: true,
  });

  const [formHonor, setFormHonor] = useState({
    studentName: "",
    scoreText: "",
    achievementYear: new Date().getFullYear().toString(),
    details: "",
    imageUrl: "/brand/placeholder.jpg",
    order: 0,
    isActive: true,
  });

  const [formGallery, setFormGallery] = useState({
    title: "",
    imageUrl: "/brand/placeholder.jpg",
    category: "General",
    order: 0,
    isActive: true,
  });

  const [formHero, setFormHero] = useState({
    title: "",
    subtitle: "",
    imageUrl: "/brand/placeholder.jpg",
    buttonText: "Learn More",
    buttonLink: "#",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Sync subject dropdown options when classRef changes in lecture form
  useEffect(() => {
    const classSubs = subjects.filter((s) => s.classId === formLecture.classRef);
    setFormLecture((prev) => ({
      ...prev,
      subjectRef: classSubs[0]?.id || "",
    }));
  }, [formLecture.classRef, subjects]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/content?type=${activeTab}`);
      if (!res.ok) throw new Error("Failed to fetch content data");
      const json = await res.json();
      setData(json.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/admin/content?type=${activeTab}&id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      setData((prev) => prev.filter((item) => item._id !== id));
    } catch (err: any) {
      alert(err.message || "Delete failed");
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormError("");

    // Reset Forms
    setFormLecture({
      title: "",
      classRef: classes[0]?.id || "",
      streamRef: "",
      subjectRef: subjects.filter((s) => s.classId === (classes[0]?.id || ""))[0]?.id || "",
      sourceType: "youtube",
      url: "",
      isPublicDemo: false,
    });
    setFormFaculty({
      name: "",
      subject: "",
      qualification: "",
      experience: "",
      imageUrl: "/brand/placeholder.jpg",
      order: data.length + 1,
      isActive: true,
    });
    setFormHonor({
      studentName: "",
      scoreText: "",
      achievementYear: new Date().getFullYear().toString(),
      details: "",
      imageUrl: "/brand/placeholder.jpg",
      order: data.length + 1,
      isActive: true,
    });
    setFormGallery({
      title: "",
      imageUrl: "/brand/placeholder.jpg",
      category: "General",
      order: data.length + 1,
      isActive: true,
    });
    setFormHero({
      title: "",
      subtitle: "",
      imageUrl: "/brand/placeholder.jpg",
      buttonText: "Learn More",
      buttonLink: "#",
      order: data.length + 1,
      isActive: true,
    });

    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormError("");

    if (activeTab === "lecture") {
      setFormLecture({
        title: item.title,
        classRef: item.classRef?._id || item.classRef || "",
        streamRef: item.streamRef?._id || item.streamRef || "",
        subjectRef: item.subjectRef?._id || item.subjectRef || "",
        sourceType: item.sourceType,
        url: item.url,
        isPublicDemo: item.isPublicDemo || false,
      });
    } else if (activeTab === "faculty") {
      setFormFaculty({
        name: item.name,
        subject: item.subject,
        qualification: item.qualification,
        experience: item.experience,
        imageUrl: item.imageUrl || "/brand/placeholder.jpg",
        order: item.order || 0,
        isActive: item.isActive ?? true,
      });
    } else if (activeTab === "honor") {
      setFormHonor({
        studentName: item.studentName,
        scoreText: item.scoreText,
        achievementYear: item.achievementYear || "",
        details: item.details || "",
        imageUrl: item.imageUrl || "/brand/placeholder.jpg",
        order: item.order || 0,
        isActive: item.isActive ?? true,
      });
    } else if (activeTab === "gallery") {
      setFormGallery({
        title: item.title,
        imageUrl: item.imageUrl || "/brand/placeholder.jpg",
        category: item.category || "General",
        order: item.order || 0,
        isActive: item.isActive ?? true,
      });
    } else if (activeTab === "hero") {
      setFormHero({
        title: item.title,
        subtitle: item.subtitle || "",
        imageUrl: item.imageUrl || "/brand/placeholder.jpg",
        buttonText: item.buttonText || "Learn More",
        buttonLink: item.buttonLink || "#",
        order: item.order || 0,
        isActive: item.isActive ?? true,
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    let payload: any = {};
    if (activeTab === "lecture") payload = formLecture;
    else if (activeTab === "faculty") payload = formFaculty;
    else if (activeTab === "honor") payload = formHonor;
    else if (activeTab === "gallery") payload = formGallery;
    else if (activeTab === "hero") payload = formHero;

    // If streamRef is empty string, convert to undefined
    if (payload.streamRef === "") {
      delete payload.streamRef;
    }

    if (editingItem) {
      payload._id = editingItem._id;
    }

    try {
      const method = editingItem ? "PATCH" : "POST";
      const res = await fetch(`/api/admin/content?type=${activeTab}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Save action failed");
      }

      await fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const getFilteredData = () => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) => {
      if (activeTab === "lecture") {
        return (
          item.title.toLowerCase().includes(q) ||
          item.subjectRef?.name?.toLowerCase().includes(q) ||
          item.classRef?.name?.toLowerCase().includes(q)
        );
      }
      if (activeTab === "faculty") {
        return item.name.toLowerCase().includes(q) || item.subject.toLowerCase().includes(q);
      }
      if (activeTab === "honor") {
        return item.studentName.toLowerCase().includes(q) || item.scoreText.toLowerCase().includes(q);
      }
      if (activeTab === "gallery") {
        return item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      }
      if (activeTab === "hero") {
        return item.title.toLowerCase().includes(q) || item.subtitle?.toLowerCase().includes(q);
      }
      return false;
    });
  };

  const tabs = [
    { type: "lecture", label: "Video Lectures", icon: Video },
    { type: "faculty", label: "Faculty Members", icon: Users },
    { type: "honor", label: "Wall of Honor", icon: Award },
    { type: "gallery", label: "Gallery Images", icon: Image },
    { type: "hero", label: "Hero slides", icon: Layers },
  ];

  const filteredData = getFilteredData();
  const activeClassSubjects = subjects.filter((s) => s.classId === formLecture.classRef);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Content Management System</h1>
          <p className="text-sm text-text/60 mt-1">
            Publish lecture videos, manage faculty listings, post board score achievers, and customize home page slideshows.
          </p>
        </div>
        <Button onClick={openAddModal} className="flex items-center gap-2 cursor-pointer shadow-md shadow-primary/10">
          <Plus className="w-4 h-4" /> Add New Item
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.type}
              onClick={() => {
                setActiveTab(tab.type as TabType);
                setSearch("");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
                activeTab === tab.type
                  ? "bg-primary text-white border-primary shadow-md shadow-primary/5"
                  : "bg-surface border-border hover:bg-border/20 text-text/70"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md w-full">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text/45">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${tabs.find((t) => t.type === activeTab)?.label.toLowerCase()}...`}
          className="w-full pl-9 pr-4 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-all text-text"
        />
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="py-12 text-center text-text/60">Loading content list...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : filteredData.length === 0 ? (
        <div className="py-12 text-center text-text/60 bg-surface/50 rounded-xl border border-border/50">
          No items found. Click "Add New Item" to populate this collection.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((item) => (
            <Card key={item._id} className="p-4 border border-border bg-surface flex flex-col justify-between h-full">
              {/* Card top */}
              <div>
                {/* Images for slide / media items */}
                {activeTab !== "lecture" && item.imageUrl && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-bg relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name || item.studentName || item.title || "Preview"}
                      className="w-full h-full object-cover"
                    />
                    {!item.isActive && (
                      <span className="absolute top-2 right-2 bg-red-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                )}

                {/* Card Title & Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base text-text">
                    {item.title || item.name || item.studentName}
                  </h3>
                  {activeTab === "lecture" && (
                    <Badge variant="outline">{item.classRef?.name || "General"}</Badge>
                  )}
                </div>

                {/* Subtitles & details based on activeTab */}
                {activeTab === "lecture" && (
                  <div className="text-xs text-text/70 space-y-1.5 mb-4">
                    <p>Subject: <span className="font-semibold text-text">{item.subjectRef?.name || "N/A"}</span></p>
                    <p>Source: <span className="font-semibold text-text uppercase">{item.sourceType}</span></p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs font-semibold"
                    >
                      Watch Stream <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {activeTab === "faculty" && (
                  <div className="text-xs text-text/70 space-y-1 mb-4">
                    <p>Subject: <span className="font-semibold text-text">{item.subject}</span></p>
                    <p>Qualification: <span className="font-semibold text-text">{item.qualification}</span></p>
                    <p>Experience: <span className="font-semibold text-text">{item.experience}</span></p>
                  </div>
                )}

                {activeTab === "honor" && (
                  <div className="text-xs text-text/70 space-y-1 mb-4">
                    <p>Score: <span className="font-semibold text-text">{item.scoreText}</span></p>
                    <p>Year: <span className="font-semibold text-text">{item.achievementYear}</span></p>
                    {item.details && <p className="text-text/50 italic font-serif">"{item.details}"</p>}
                  </div>
                )}

                {activeTab === "gallery" && (
                  <div className="text-xs text-text/70 space-y-1 mb-4">
                    <p>Category: <Badge variant="outline">{item.category}</Badge></p>
                  </div>
                )}

                {activeTab === "hero" && (
                  <div className="text-xs text-text/70 space-y-1 mb-4">
                    <p className="italic">"{item.subtitle || "No Subtitle"}"</p>
                    <p>Link: <span className="font-mono text-[10px] bg-bg/50 px-1 py-0.5 rounded">{item.buttonLink}</span></p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-2">
                <span className="text-[10px] text-text/50 font-mono">Order: {item.order ?? 0}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => openEditModal(item)} className="cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(item._id)} className="text-red-500 hover:bg-red-500/10 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          {/* Modal Content container */}
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-text">
                {editingItem ? "Edit Content Item" : "Create New Content Item"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text/60 hover:text-text cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {formError && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg">{formError}</div>}

              {/* LECTURE FORM */}
              {activeTab === "lecture" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Lecture Title *</label>
                    <input
                      type="text"
                      required
                      value={formLecture.title}
                      onChange={(e) => setFormLecture((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Newton's Laws of Motion - Chapter 3"
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Class Room *</label>
                      <select
                        required
                        value={formLecture.classRef}
                        onChange={(e) => setFormLecture((prev) => ({ ...prev, classRef: e.target.value }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      >
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Subject Ref *</label>
                      <select
                        required
                        value={formLecture.subjectRef}
                        onChange={(e) => setFormLecture((prev) => ({ ...prev, subjectRef: e.target.value }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      >
                        {activeClassSubjects.length === 0 ? (
                          <option value="">No Subjects Found</option>
                        ) : (
                          activeClassSubjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Stream (Optional)</label>
                      <select
                        value={formLecture.streamRef}
                        onChange={(e) => setFormLecture((prev) => ({ ...prev, streamRef: e.target.value }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      >
                        <option value="">General (All Streams)</option>
                        {streams.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Source Platform *</label>
                      <select
                        required
                        value={formLecture.sourceType}
                        onChange={(e) => setFormLecture((prev) => ({ ...prev, sourceType: e.target.value as any }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      >
                        <option value="youtube">YouTube Embed Link</option>
                        <option value="drive">Google Drive Link</option>
                        <option value="mega">Mega.nz Folder/File</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Video or Folder Link URL *</label>
                    <input
                      type="url"
                      required
                      value={formLecture.url}
                      onChange={(e) => setFormLecture((prev) => ({ ...prev, url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="isPublicDemo"
                      checked={formLecture.isPublicDemo}
                      onChange={(e) => setFormLecture((prev) => ({ ...prev, isPublicDemo: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-bg"
                    />
                    <label htmlFor="isPublicDemo" className="text-xs font-semibold uppercase tracking-wider text-text/75 cursor-pointer">
                      Flag as Public Demo Lecture (Visible to unregistered guests)
                    </label>
                  </div>
                </>
              )}

              {/* FACULTY FORM */}
              {activeTab === "faculty" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Instructor Name *</label>
                    <input
                      type="text"
                      required
                      value={formFaculty.name}
                      onChange={(e) => setFormFaculty((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Sir Ali Murad Kehar"
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Subject Specialist *</label>
                      <input
                        type="text"
                        required
                        value={formFaculty.subject}
                        onChange={(e) => setFormFaculty((prev) => ({ ...prev, subject: e.target.value }))}
                        placeholder="e.g. Physics"
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Qualification *</label>
                      <input
                        type="text"
                        required
                        value={formFaculty.qualification}
                        onChange={(e) => setFormFaculty((prev) => ({ ...prev, qualification: e.target.value }))}
                        placeholder="e.g. M.Sc. Physics"
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Experience *</label>
                      <input
                        type="text"
                        required
                        value={formFaculty.experience}
                        onChange={(e) => setFormFaculty((prev) => ({ ...prev, experience: e.target.value }))}
                        placeholder="e.g. 12+ Years"
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Display Order</label>
                      <input
                        type="number"
                        value={formFaculty.order}
                        onChange={(e) => setFormFaculty((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Photo Image URL</label>
                    <input
                      type="text"
                      value={formFaculty.imageUrl}
                      onChange={(e) => setFormFaculty((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="/brand/filename.jpg"
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="facultyIsActive"
                      checked={formFaculty.isActive}
                      onChange={(e) => setFormFaculty((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-bg"
                    />
                    <label htmlFor="facultyIsActive" className="text-xs font-semibold uppercase tracking-wider text-text/75 cursor-pointer">
                      Profile Active (Visible to public visitors)
                    </label>
                  </div>
                </>
              )}

              {/* WALL OF HONOR FORM */}
              {activeTab === "honor" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Student Name *</label>
                    <input
                      type="text"
                      required
                      value={formHonor.studentName}
                      onChange={(e) => setFormHonor((prev) => ({ ...prev, studentName: e.target.value }))}
                      placeholder="e.g. Khan"
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Grade/Score Text *</label>
                      <input
                        type="text"
                        required
                        value={formHonor.scoreText}
                        onChange={(e) => setFormHonor((prev) => ({ ...prev, scoreText: e.target.value }))}
                        placeholder="e.g. A+ Grade (98% Board)"
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Achievement Year *</label>
                      <input
                        type="text"
                        required
                        value={formHonor.achievementYear}
                        onChange={(e) => setFormHonor((prev) => ({ ...prev, achievementYear: e.target.value }))}
                        placeholder="e.g. 2025"
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Honor Quote/Details</label>
                      <input
                        type="text"
                        value={formHonor.details}
                        onChange={(e) => setFormHonor((prev) => ({ ...prev, details: e.target.value }))}
                        placeholder="e.g. Secured 1st position in Mathelo"
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Display Order</label>
                      <input
                        type="number"
                        value={formHonor.order}
                        onChange={(e) => setFormHonor((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Student Photo Image URL</label>
                    <input
                      type="text"
                      value={formHonor.imageUrl}
                      onChange={(e) => setFormHonor((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="/brand/student.jpg"
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="honorIsActive"
                      checked={formHonor.isActive}
                      onChange={(e) => setFormHonor((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-bg"
                    />
                    <label htmlFor="honorIsActive" className="text-xs font-semibold uppercase tracking-wider text-text/75 cursor-pointer">
                      Profile Active (Visible to public visitors)
                    </label>
                  </div>
                </>
              )}

              {/* GALLERY FORM */}
              {activeTab === "gallery" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Photo Caption Title *</label>
                    <input
                      type="text"
                      required
                      value={formGallery.title}
                      onChange={(e) => setFormGallery((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Physics Laboratory Sessions"
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Album Category *</label>
                      <input
                        type="text"
                        required
                        value={formGallery.category}
                        onChange={(e) => setFormGallery((prev) => ({ ...prev, category: e.target.value }))}
                        placeholder="e.g. Events, Campus, Classes"
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Display Order</label>
                      <input
                        type="number"
                        value={formGallery.order}
                        onChange={(e) => setFormGallery((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Image URL *</label>
                    <input
                      type="text"
                      required
                      value={formGallery.imageUrl}
                      onChange={(e) => setFormGallery((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                    />
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="galleryIsActive"
                      checked={formGallery.isActive}
                      onChange={(e) => setFormGallery((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-bg"
                    />
                    <label htmlFor="galleryIsActive" className="text-xs font-semibold uppercase tracking-wider text-text/75 cursor-pointer">
                      Photo Active (Visible on Gallery page)
                    </label>
                  </div>
                </>
              )}

              {/* HERO FORM */}
              {activeTab === "hero" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Slide Main Title *</label>
                    <input
                      type="text"
                      required
                      value={formHero.title}
                      onChange={(e) => setFormHero((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. 20 Years of Excellence"
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Subtitle / Tagline</label>
                    <input
                      type="text"
                      value={formHero.subtitle}
                      onChange={(e) => setFormHero((prev) => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="e.g. Your Future. Our Commitment. Your Success."
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Button Text</label>
                      <input
                        type="text"
                        value={formHero.buttonText}
                        onChange={(e) => setFormHero((prev) => ({ ...prev, buttonText: e.target.value }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Button Action Link</label>
                      <input
                        type="text"
                        value={formHero.buttonLink}
                        onChange={(e) => setFormHero((prev) => ({ ...prev, buttonLink: e.target.value }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Background Image URL *</label>
                      <input
                        type="text"
                        required
                        value={formHero.imageUrl}
                        onChange={(e) => setFormHero((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text/60">Display Order</label>
                      <input
                        type="number"
                        value={formHero.order}
                        onChange={(e) => setFormHero((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-primary text-text"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="heroIsActive"
                      checked={formHero.isActive}
                      onChange={(e) => setFormHero((prev) => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-bg"
                    />
                    <label htmlFor="heroIsActive" className="text-xs font-semibold uppercase tracking-wider text-text/75 cursor-pointer">
                      Slide Active (Rendered on main landing slider)
                    </label>
                  </div>
                </>
              )}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 border-t border-border/50 pt-4 mt-6">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="cursor-pointer shadow-md shadow-primary/10">
                  {formLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
