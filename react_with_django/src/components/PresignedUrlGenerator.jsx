import React, { useState } from "react";

const PresignedUrlGenerator = () => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    setUploading(true);

    try {
      // Step 1: Get presigned URLs + requestId
      const fileNames = files.map((file) => file.name);
      const res = await fetch("http://localhost:8000/api/get-presigned-urls/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileNames }),
      });

      if (!res.ok) throw new Error("Failed to get presigned URLs");
      const { urls, requestId } = await res.json();

      // Step 2: Upload each file directly to S3
      await Promise.all(
        files.map(async (file) => {
          const matchingUrl = urls.find((u) => u.fileName === file.name);
          if (!matchingUrl) throw new Error(`No URL for file ${file.name}`);
          await fetch(matchingUrl.url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
        })
      );

      // Step 3: Notify backend upload complete
      const completeRes = await fetch("http://localhost:8000/api/upload-complete/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          files: fileNames,
        }),
      });

      if (!completeRes.ok) throw new Error("Failed to notify backend");

      alert("Upload complete and confirmed!");
      setFiles([]);
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white shadow-2xl rounded-3xl p-6 w-full max-w-xl transition-transform hover:scale-105 duration-300">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Generate Presigned URLs
        </h2>

        <label
          htmlFor="fileUpload"
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-200"
        >
          <svg
            className="w-12 h-12 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0a4 4 0 014-4h6a4 4 0 014 4v12M7 20h10m-5-4v4"
            />
          </svg>
          <p className="text-gray-500 text-sm">Click to upload or drag & drop</p>
          <input
            id="fileUpload"
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="text-gray-700 text-sm font-semibold mb-2">
              Selected Files:
            </h3>
            <ul className="text-xs text-gray-600 max-h-24 overflow-y-auto space-y-1 border border-gray-200 rounded p-2">
              {files.map((file) => (
                <li key={file.name} className="truncate">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="mt-6 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Files"}
        </button>
      </div>
    </div>
  );
};

export default PresignedUrlGenerator;