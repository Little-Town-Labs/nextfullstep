"use client";

import React, { useEffect, useState } from "react";

export default function AICoachingPromptAdminPage() {
  const [prompt, setPrompt] = useState("");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedBy, setUpdatedBy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [adminId, setAdminId] = useState(""); // For demo, manually enter admin userId

  // Fetch current prompt on mount
  useEffect(() => {
    fetch("/api/admin/ai-coaching-prompt")
      .then(res => res.json())
      .then(data => {
        setPrompt(data.prompt || "");
        setUpdatedAt(data.updatedAt);
        setUpdatedBy(data.updatedBy);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setStatus(null);
    if (!adminId) {
      setStatus("Please enter your admin user ID.");
      return;
    }
    const res = await fetch("/api/admin/ai-coaching-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin": "true", // Demo: mark as admin
      },
      body: JSON.stringify({ prompt, updatedBy: adminId }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("Prompt updated successfully.");
      setUpdatedAt(data.updatedAt);
      setUpdatedBy(data.updatedBy);
    } else {
      setStatus(data.error || "Failed to update prompt.");
    }
  };

  const handleReset = () => {
    setPrompt("Welcome to AI Coaching! Please configure your custom prompt.");
    setStatus("Prompt reset to default. Click Save to apply.");
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Coaching Prompt Customization (Admin)</h1>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Admin User ID (for demo)</label>
        <input
          type="text"
          value={adminId}
          onChange={e => setAdminId(e.target.value)}
          className="border px-2 py-1 w-full"
          placeholder="Enter your admin user ID"
        />
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-1">Coaching Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={10}
          className="border px-2 py-1 w-full font-mono"
        />
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          Reset to Default
        </button>
      </div>
      {status && (
        <div className="mb-4 p-2 rounded bg-gray-100 text-gray-800">{status}</div>
      )}
      <div className="text-sm text-gray-500">
        Last updated: {updatedAt ? new Date(updatedAt).toLocaleString() : "Never"}
        {updatedBy && <> by <span className="font-mono">{updatedBy}</span></>}
      </div>
    </div>
  );
}