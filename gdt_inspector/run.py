import subprocess
import sys
from pathlib import Path
import shutil
import json
import glob

pdf_path = Path(sys.argv[1]).resolve()

BASE_DIR = Path(__file__).parent
PROCESS_SCRIPT = BASE_DIR / "process.py"
GEMINI_SCRIPT = BASE_DIR / "gemini.py"
PYTHON = sys.executable
OUTPUT_DIR = BASE_DIR / "output"

def run(script, args=[]):
    result = subprocess.run(
        [PYTHON, script, *args],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr)

run(PROCESS_SCRIPT, [str(pdf_path)])
run(GEMINI_SCRIPT, [str(OUTPUT_DIR)])

# 🔍 Find the Excel file dynamically
excel_files = list(OUTPUT_DIR.glob("*.xlsx"))

if not excel_files:
    raise RuntimeError("No Excel file found in output folder")

# If there are multiple Excel files, choose the first one
default_excel = excel_files[0]

summary_path = OUTPUT_DIR / "summary.json"

if not summary_path.exists():
    raise RuntimeError("summary.json not found")

pdf_name = pdf_path.stem              
new_excel_name = f"{pdf_name}.xlsx"
new_excel_path = OUTPUT_DIR / new_excel_name

# Rename the excel file dynamically
shutil.move(default_excel, new_excel_path)

# 👇 Return dynamic path
print(json.dumps({
    "status": "success",
    "excel_name": new_excel_name,
    "excel_path": str(new_excel_path)
}))
