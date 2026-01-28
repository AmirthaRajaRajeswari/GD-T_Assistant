import React, { useState } from "react";

export default function UploadBox({ onFileSelect, onInspect, loading }) {
  const [fileName, setFileName] = useState("No file selected");
  const [fileSize, setFileSize] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + " MB");

    // Send file back to parent component
    onFileSelect(file);
  };

  return (
    <div className="inspect-action">
      <div className="upload-box">
        <p>
          <strong>{fileName}</strong>
        </p>
        <span>{fileSize}</span>
      </div>

      <label className="upload-label">
        Choose File
        <input type="file" accept=".pdf" onChange={handleFileChange} />
      </label>

      <button
        className="primary-btn"
        onClick={onInspect}
        disabled={loading}
      >
        {loading ? "Analyzing Drawing..." : "Inspect Drawing"}
      </button>
    </div>
  );
}
