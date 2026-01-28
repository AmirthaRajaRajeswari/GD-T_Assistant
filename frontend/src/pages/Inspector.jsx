import React, { useState } from "react";
import SummaryCard from "../components/SummaryCards";
import UploadBox from "../components/UploadBox";
import "../App.css";

function Inspect() {
  const [summary, setSummary] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleInspect = async () => {
    if (!selectedFile) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("pdf", selectedFile);

    try {
      const response = await fetch("http://localhost:5000/inspect", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setSummary(data.summary);
      setDownloadUrl("http://localhost:5000" + data.excel_download_url);
      setLoading(false);
    } catch (error) {
      console.error("Error inspecting drawing:", error);
      setLoading(false);
    }
  };

  return (
    <div className="inspect-page">
      {/* Header */}
      <div className="inspect-header">
        <h1>GD&T Inspector</h1>
        <p>Automated GD&T compliance verification for engineering drawings</p>
      </div>

      {/* Upload Box */}
      <UploadBox
        onFileSelect={(file) => setSelectedFile(file)}
        onInspect={handleInspect}
        loading={loading}
      />

      {/* Results */}
      {summary && (
        <SummaryCard summary={summary} downloadUrl={downloadUrl} />
      )}
    </div>
  );
}

export default Inspect;
