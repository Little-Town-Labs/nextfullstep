"use client";

import React, { useState } from "react";

export default function BigFiveUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [userTestId, setUserTestId] = useState("");
  const [userId, setUserId] = useState(""); // TODO: Replace with real userId from auth/session
  const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.length || !userTestId || !userId) {
      setStatus({ type: "error", message: "Please provide all fields." });
      return;
    }
    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    files.forEach((file, idx) => {
      formData.append("files", file, file.name);
    });
    formData.append("userTestId", userTestId);
    formData.append("userId", userId);

    try {
      const res = await fetch("/api/bigfiveResults/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        // Show detailed results if available
        let msg = `Upload successful! Imported ${data.totalRows ?? 0} rows from ${files.length} file(s).`;
        if (data.fileResults && Array.isArray(data.fileResults)) {
          msg += "\n\nFile details:\n" + data.fileResults.map(
            (f: any) => `${f.fileName}: ${f.count} rows (${f.resultType})`
          ).join("\n");
        }
        setStatus({ type: "success", message: msg });
        setFiles([]);
        setUserTestId("");
      } else {
        setStatus({ type: "error", message: data.error || "Upload failed." });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Upload failed." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Big Five CSV Results</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">CSV File</label>
          <input type="file" accept=".csv" multiple onChange={handleFileChange} />
        </div>
        <div>
          <label className="block font-semibold mb-1">User Test ID</label>
          <input
            type="text"
            value={userTestId}
            onChange={e => setUserTestId(e.target.value)}
            className="border px-2 py-1 w-full"
            placeholder="e.g. 67f83970b55fed0613a6a2a6"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">User ID (temporary, for demo)</label>
          <input
            type="text"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            className="border px-2 py-1 w-full"
            placeholder="e.g. user-123"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
      {status && (
        <div className={`mt-4 p-2 rounded ${status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          <pre className="whitespace-pre-wrap">{status.message}</pre>
        </div>
      )}
    </div>
  );
}