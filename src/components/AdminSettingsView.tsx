"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Settings, Shield, Search, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

interface SettingsData {
  commenceDate: string;
  classTimings: string;
  admissionsOpen: boolean;
  whatsappNumber: string;
  address: string;
  directorName?: string;
  directorTitle?: string;
  directorMessage?: string;
  directorImage?: string;
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminSettingsViewProps {
  initialSettings: SettingsData;
  initialStaff: StaffUser[];
  currentAdminId: string;
  isAdmin: boolean;
}

export default function AdminSettingsView({
  initialSettings,
  initialStaff,
  currentAdminId,
  isAdmin,
}: AdminSettingsViewProps) {
  // Tabs: "general", "roles", or "password"
  const [activeTab, setActiveTab] = useState<"general" | "roles" | "password">("general");

  // Change Password state
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // General settings state
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Staff management state
  const [staffList, setStaffList] = useState<StaffUser[]>(initialStaff);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<StaffUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [roleError, setRoleError] = useState("");
  const [roleSuccess, setRoleSuccess] = useState("");

  // Handle general settings submit
  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError("");
    setSettingsSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok) {
        setSettingsSuccess(true);
      } else {
        setSettingsError(data.error || "Failed to save settings.");
      }
    } catch (err) {
      setSettingsError("Connection issue saving settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Search users for promotion
  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setSearchLoading(true);
    setRoleError("");
    setRoleSuccess("");

    try {
      const res = await fetch(`/api/admin/users/search?email=${encodeURIComponent(searchEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch (err) {
      setRoleError("Failed to search users.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Change user role
  const handleRoleChange = async (userId: string, newRole: string) => {
    setRoleUpdatingId(userId);
    setRoleError("");
    setRoleSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setRoleSuccess(data.message || "User role updated successfully.");
        setSearchResults([]);
        setSearchEmail("");

        // Refresh staff list
        const refreshRes = await fetch("/api/admin/settings");
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          // We can fetch from GET api
          const freshSettingsRes = await fetch("/api/admin/settings");
          // But it's easier to just trigger page reload or update state manually!
        }
        // Let's just update locally
        setStaffList((prev) => {
          const existing = prev.find((u) => u.id === userId);
          if (existing) {
            if (newRole === "student") {
              return prev.filter((u) => u.id !== userId);
            }
            return prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
          } else {
            // Added new staff from search
            const searched = searchResults.find((u) => u.id === userId);
            if (searched && newRole !== "student") {
              return [...prev, { ...searched, role: newRole }].sort((a, b) => a.name.localeCompare(b.name));
            }
          }
          return prev;
        });
      } else {
        setRoleError(data.error || "Failed to update role.");
      }
    } catch (err) {
      setRoleError("Connection issue updating user role.");
    } finally {
      setRoleUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs bar */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-text/60 hover:text-text"
          }`}
        >
          <Settings className="w-4 h-4" /> Global Settings
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "roles"
              ? "border-primary text-primary"
              : "border-transparent text-text/60 hover:text-text"
          }`}
        >
          <Shield className="w-4 h-4" /> Staff Credentials & Roles
        </button>
        <button
          onClick={() => setActiveTab("password")}
          className={`px-5 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "password"
              ? "border-primary text-primary"
              : "border-transparent text-text/60 hover:text-text"
          }`}
        >
          <Lock className="w-4 h-4" /> Change Password
        </button>
      </div>

      {/* Tab 1: General Settings */}
      {activeTab === "general" && (
        <form onSubmit={handleSettingsSubmit} className="max-w-3xl space-y-6">
          {settingsError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-xs">
              {settingsError}
            </div>
          )}

          {settingsSuccess && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 font-medium text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Global settings updated successfully.
            </div>
          )}

          <Card hoverLift={false} className="p-6 border border-border space-y-6">
            <h3 className="font-serif text-lg font-bold border-b border-border/50 pb-2">
              Institution Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text/80">Commence Date</label>
                <input
                  type="text"
                  required
                  value={settings.commenceDate}
                  onChange={(e) => setSettings({ ...settings, commenceDate: e.target.value })}
                  placeholder="e.g. September 1, 2026"
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text/80">Class Hours/Timings</label>
                <input
                  type="text"
                  required
                  value={settings.classTimings}
                  onChange={(e) => setSettings({ ...settings, classTimings: e.target.value })}
                  placeholder="e.g. 03:00 PM - 07:00 PM"
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text/80">Contact WhatsApp Number</label>
                <input
                  type="text"
                  required
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="e.g. 0333-5524440"
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text/80">Institution Venue / Address</label>
                <input
                  type="text"
                  required
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  placeholder="Address"
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <input
                id="admissionsOpen"
                type="checkbox"
                checked={settings.admissionsOpen}
                onChange={(e) => setSettings({ ...settings, admissionsOpen: e.target.checked })}
                className="w-4 h-4 rounded text-primary focus:ring-secondary/50 border-border bg-surface"
              />
              <label htmlFor="admissionsOpen" className="text-sm font-semibold uppercase tracking-wider text-text/75 cursor-pointer">
                Open Online Registrations (Enable registration form)
              </label>
            </div>
          </Card>

          {/* Director's Message Management */}
          <Card hoverLift={false} className="p-6 border border-border space-y-6">
            <h3 className="font-serif text-lg font-bold border-b border-border/50 pb-2">
              Director's Message & Leadership (About Page)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text/80">Director Name</label>
                <input
                  type="text"
                  value={settings.directorName || ""}
                  onChange={(e) => setSettings({ ...settings, directorName: e.target.value })}
                  placeholder="e.g. Sir Rizwan Khan"
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text/80">Designation / Title</label>
                <input
                  type="text"
                  value={settings.directorTitle || ""}
                  onChange={(e) => setSettings({ ...settings, directorTitle: e.target.value })}
                  placeholder="e.g. Founder & Managing Director"
                  className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text/80">Director Photo Image URL</label>
              <input
                type="text"
                value={settings.directorImage || ""}
                onChange={(e) => setSettings({ ...settings, directorImage: e.target.value })}
                placeholder="e.g. /brand/director.jpg or https://..."
                className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text/80">Director's Full Message Statement</label>
              <textarea
                value={settings.directorMessage || ""}
                onChange={(e) => setSettings({ ...settings, directorMessage: e.target.value })}
                rows={5}
                placeholder="Enter the official message statement to display on the About Us page..."
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={settingsLoading}>
              Save Configurations
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: User Roles & Promotions */}
      {activeTab === "roles" && (
        <div className="space-y-8">
          {/* Security lock state if not admin */}
          {!isAdmin ? (
            <Card hoverLift={false} className="p-8 border border-dashed border-border text-center max-w-xl mx-auto space-y-4">
              <div className="p-3 rounded-full bg-red-500/10 text-red-500 w-fit mx-auto">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold">Access Restricted</h3>
              <p className="text-sm text-text/60">
                Staff credentials and role promotions can only be modified by a Super Administrator.
                Please contact the administrator to grant new permissions.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Lookup Form */}
              <div className="space-y-6 lg:col-span-1">
                <Card hoverLift={false} className="p-6 border border-border space-y-4">
                  <h3 className="font-serif text-md font-bold flex items-center gap-1.5 border-b border-border/50 pb-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> Promote User
                  </h3>
                  <p className="text-xs text-text/60">
                    Find users by typing their exact email. Promote them to clerk, teacher, or admin.
                  </p>

                  <form onSubmit={handleUserSearch} className="space-y-3">
                    <Input
                      name="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      placeholder="Search email..."
                    />
                    <Button type="submit" className="w-full justify-center" loading={searchLoading}>
                      Search User
                    </Button>
                  </form>

                  {/* Search results */}
                  {searchResults.length > 0 && (
                    <div className="pt-2 divide-y divide-border/40 max-h-[250px] overflow-y-auto">
                      {searchResults.map((user) => (
                        <div key={user.id} className="py-3 flex flex-col gap-2 text-sm">
                          <div>
                            <div className="font-semibold text-text">{user.name}</div>
                            <div className="text-xs text-text/50">{user.email}</div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-text/60">Set Role:</span>
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              disabled={roleUpdatingId === user.id}
                              className="h-8 rounded border border-border bg-surface px-2 text-xs focus:outline-none"
                            >
                              <option value="student">Student</option>
                              <option value="clerk">Clerk</option>
                              <option value="teacher">Teacher</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.length === 0 && searchEmail && !searchLoading && (
                    <div className="text-center text-xs text-text/40 pt-2">No matching users found.</div>
                  )}
                </Card>
              </div>

              {/* Staff List Table */}
              <div className="space-y-6 lg:col-span-2">
                {roleError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 font-medium text-xs">
                    {roleError}
                  </div>
                )}
                {roleSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 font-medium text-xs">
                    {roleSuccess}
                  </div>
                )}

                <Card hoverLift={false} className="border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border/50 bg-primary/5">
                    <h3 className="font-serif text-lg font-bold">Active Staff Directory</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-primary/5 text-xs font-semibold uppercase tracking-wider text-text/70 border-b border-border">
                          <th className="py-3 px-6">Name</th>
                          <th className="py-3 px-6">Email</th>
                          <th className="py-3 px-6">Role Privilege</th>
                          <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 text-sm">
                        {staffList.map((user) => (
                          <tr key={user.id} className="hover:bg-primary/5 transition-colors">
                            <td className="py-4 px-6 font-medium text-text">{user.name}</td>
                            <td className="py-4 px-6 text-text/60">{user.email}</td>
                            <td className="py-4 px-6">
                              <Badge variant={user.role === "admin" ? "danger" : user.role === "teacher" ? "warning" : "success"}>
                                {user.role.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-right">
                              {user.id === currentAdminId ? (
                                <span className="text-xs text-text/40 italic">You</span>
                              ) : (
                                <select
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  disabled={roleUpdatingId === user.id}
                                  className="h-8 rounded border border-border bg-surface px-2 text-xs focus:outline-none"
                                >
                                  <option value="student">Student (Demote)</option>
                                  <option value="clerk">Clerk</option>
                                  <option value="teacher">Teacher</option>
                                  <option value="admin">Admin</option>
                                </select>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "password" && (
        <Card hoverLift={false} className="p-6 border border-border max-w-xl">
          <h3 className="font-serif text-lg font-bold border-b border-border/50 pb-2 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" /> Update Your Password
          </h3>

              {pwError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold">
                  {pwError}
                </div>
              )}

              {pwSuccess && (
                <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 text-xs font-semibold">
                  {pwSuccess}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPwError("");
                  setPwSuccess("");
                  if (!pwCurrent) {
                    setPwError("Current password is required.");
                    return;
                  }
                  if (pwNew.length < 6) {
                    setPwError("New password must be at least 6 characters.");
                    return;
                  }
                  if (pwNew !== pwConfirm) {
                    setPwError("Passwords do not match.");
                    return;
                  }

                  setPwLoading(true);
                  try {
                    const res = await fetch("/api/auth/change-password", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                      setPwSuccess("Password updated successfully.");
                      setPwCurrent("");
                      setPwNew("");
                      setPwConfirm("");
                    } else {
                      setPwError(data.error || "Failed to update password.");
                    }
                  } catch (err) {
                    setPwError("Network connection error.");
                  } finally {
                    setPwLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-text/80">Current Password</label>
                  <input
                    type="password"
                    required
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text/80">New Password</label>
                    <input
                      type="password"
                      required
                      value={pwNew}
                      onChange={(e) => setPwNew(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-text/80">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={pwConfirm}
                      onChange={(e) => setPwConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-10 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    />
                  </div>
                </div>

                <Button type="submit" loading={pwLoading} className="w-full justify-center mt-2">
                  Update Password
                </Button>
              </form>
        </Card>
      )}
    </div>
  );
}
