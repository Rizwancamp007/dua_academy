"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Check, X, Search, UserCheck, ShieldAlert, CheckCircle, XCircle } from "lucide-react";

interface StudentData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  fatherName: string;
  city: string;
  className: string;
  streamName: string;
  isApproved: boolean;
  createdAt: string;
}

export function AdminApprovalsView({ initialStudents }: { initialStudents: StudentData[] }) {
  const [students, setStudents] = useState<StudentData[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "pending" | "approved">("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleStatusChange = async (userId: string, isApproved: boolean) => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/users/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isApproved }),
      });

      const data = await res.json();
      if (res.ok) {
        // Update local state instantly
        setStudents((prev) =>
          prev.map((student) =>
            student._id === userId ? { ...student, isApproved } : student
          )
        );
      } else {
        alert(data.error || "Failed to update enrollment status.");
      }
    } catch (err) {
      alert("Network error updating enrollment status.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery);

    const matchesStatus =
      filterType === "all" ||
      (filterType === "pending" && !student.isApproved) ||
      (filterType === "approved" && student.isApproved);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-surface p-6 rounded-xl border border-border">
        <div className="flex-1 max-w-md">
          <Input
            label="Search Registered Students"
            placeholder="Search by name, email, or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "pending", "approved"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 text-xs font-semibold capitalize rounded-lg transition-all border cursor-pointer ${
                filterType === type
                  ? "bg-primary text-white border-primary"
                  : "bg-surface text-text/65 border-border hover:bg-border/20 hover:text-text"
              }`}
            >
              {type} ({type === "all" ? students.length : type === "pending" ? students.filter(s => !s.isApproved).length : students.filter(s => s.isApproved).length})
            </button>
          ))}
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length > 0 ? (
        <Card hoverLift={false} className="overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-primary/5 text-xs font-semibold uppercase tracking-wider text-text/70 border-b border-border">
                  <th className="py-3 px-6">Student Info</th>
                  <th className="py-3 px-6">Parentage</th>
                  <th className="py-3 px-6">Contact & Location</th>
                  <th className="py-3 px-6">Academic Stream</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-sm">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-primary/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-text">{student.name}</div>
                      <div className="text-xs text-text/50 font-mono">{student.email}</div>
                    </td>
                    <td className="py-4 px-6 text-text/80">{student.fatherName}</td>
                    <td className="py-4 px-6">
                      <div className="text-text/80">{student.phone}</div>
                      <div className="text-xs text-text/50">{student.city}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-primary dark:text-secondary">{student.className}</div>
                      <div className="text-[10px] uppercase text-text/60 tracking-wider font-medium">{student.streamName}</div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge variant={student.isApproved ? "success" : "danger"}>
                        {student.isApproved ? "Approved" : "Pending Approval"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {student.isApproved ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={processingId === student._id}
                          onClick={() => handleStatusChange(student._id, false)}
                          className="text-red-500 hover:bg-red-500/10 hover:text-red-600 border-red-500/30 flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" /> Revoke Access
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          disabled={processingId === student._id}
                          onClick={() => handleStatusChange(student._id, true)}
                          className="bg-green-600 hover:bg-green-700 !text-white flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve Enrollment
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card hoverLift={false} className="text-center py-20 border border-dashed border-border bg-surface max-w-xl mx-auto">
          <UserCheck className="w-16 h-16 text-text/20 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold mb-2">No Students Found</h3>
          <p className="text-sm text-text/60">
            No student accounts matching your queries or filter criteria were found.
          </p>
        </Card>
      )}
    </div>
  );
}
export default AdminApprovalsView;
