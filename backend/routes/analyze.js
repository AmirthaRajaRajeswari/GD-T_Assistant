const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");

const router = express.Router();

/* ---------- File Upload ---------- */
const upload = multer({
  dest: path.join(__dirname, "../uploads")
});

/* ---------- Paths ---------- */
const PYTHON = path.join(
  __dirname,
  "../../.venv/Scripts/python.exe"
);

const RUN_SCRIPT = path.join(
  __dirname,
  "../../gdt_inspector/run.py"
);

const OUTPUT_DIR = path.join(
  __dirname,
  "../../gdt_inspector/output"
);

/* ---------- INSPECT ROUTE ---------- */
router.post("/", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "PDF file required" });
  }

  execFile(
    PYTHON,
    [RUN_SCRIPT, req.file.path],
    (error, stdout, stderr) => {
      if (error) {
        console.error("Python error:", stderr);
        return res.status(500).json({
          error: "Processing failed",
          details: stderr
        });
      }

      /* ✅ Parse Python JSON output */
      let pythonResult;
      try {
        pythonResult = JSON.parse(stdout);
      } catch (err) {
        console.error("Invalid Python output:", stdout);
        return res.status(500).json({
          error: "Invalid Python output",
          raw: stdout
        });
      }

      /* ✅ Read summary.json */
      const summaryPath = path.join(OUTPUT_DIR, "summary.json");

      if (!fs.existsSync(summaryPath)) {
        return res.status(500).json({
          error: "summary.json not generated"
        });
      }

      const summary = JSON.parse(
        fs.readFileSync(summaryPath, "utf-8")
      );

      /* ✅ Excel file name from Python */
      const excelName = pythonResult.excel_name;

      if (!excelName) {
        return res.status(500).json({
          error: "Excel filename missing from Python output"
        });
      }

      /* ✅ FINAL RESPONSE */
      res.json({
        status: "success",
        summary,
        excel_download_url: `/inspect/download/${excelName}`
      });
    }
  );
});

/* ---------- DOWNLOAD ROUTE ---------- */
router.get("/download/:filename", (req, res) => {
  const filePath = path.join(OUTPUT_DIR, req.params.filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: "File not found",
      file: req.params.filename
    });
  }

  res.download(filePath);
});

module.exports = router;
