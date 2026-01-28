import sys
import cv2
import numpy as np
from pathlib import Path
from pdf2image import convert_from_path
import json

PDF_PATH = Path(sys.argv[1])

BASE_DIR = Path(__file__).parent
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

POPPLER_PATH = r"C:/Users/Amirtha/Downloads/Release-25.12.0-0/poppler-25.12.0/Library/bin"
DPI = 400

PAGE_CROP_RATIO = 0.03
MIN_VIEW_AREA = 30000

pages = convert_from_path(PDF_PATH, dpi=DPI, poppler_path=POPPLER_PATH)
page = cv2.cvtColor(np.array(pages[0]), cv2.COLOR_RGB2BGR)

H0, W0 = page.shape[:2]
mx, my = int(W0 * PAGE_CROP_RATIO), int(H0 * PAGE_CROP_RATIO)
page = page[my:H0-my, mx:W0-mx]
H, W = page.shape[:2]

gray = cv2.cvtColor(page, cv2.COLOR_BGR2GRAY)
edges = cv2.Canny(gray, 50, 150)
edges = cv2.dilate(edges, cv2.getStructuringElement(cv2.MORPH_RECT, (15, 15)), iterations=2)

cnts, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

views = []
for c in cnts:
    x, y, w, h = cv2.boundingRect(c)
    if w * h > MIN_VIEW_AREA and 0.25 < w / h < 4.5:
        views.append((x, y, w, h))

th = cv2.adaptiveThreshold(
    gray, 255,
    cv2.ADAPTIVE_THRESH_MEAN_C,
    cv2.THRESH_BINARY_INV, 41, 15
)

row_density = np.sum(th > 0, axis=1).astype(np.float32)
row_density /= row_density.max()

ys = np.where(row_density > 0.15)[0]
notes_block = None
if len(ys) > 0:
    y1, y2 = ys[0], ys[-1]
    if y2 - y1 < H * 0.4:
        notes_block = (0, y1, W, y2 - y1)

bottom = gray[int(0.72 * H):H, :]
edges_b = cv2.Canny(bottom, 50, 150)

# FIXED DILATION
kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (50, 10))
edges_b = cv2.dilate(edges_b, kernel, iterations=2)

tcnts, _ = cv2.findContours(edges_b, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

title_block = None
candidates = []
for c in tcnts:
    x, y, w, h = cv2.boundingRect(c)
    if w * h > 40000 and w > 0.25 * W:
        candidates.append((x, y, w, h))

if candidates:
    tx = min(c[0] for c in candidates)
    ty = min(c[1] for c in candidates)
    tw = max(c[0] + c[2] for c in candidates) - tx
    th = max(c[1] + c[3] for c in candidates) - ty
    title_block = (tx, int(0.72 * H) + ty, tw, th)

blocks = []

if title_block:
    blocks.append({
        "id": "TITLE_BLOCK",
        "type": "TITLE_BLOCK",
        "bbox": list(title_block)
    })

if notes_block:
    blocks.append({
        "id": "NOTES",
        "type": "NOTES",
        "bbox": list(notes_block)
    })

for i, (x, y, w, h) in enumerate(views):
    blocks.append({
        "id": f"VIEW_{i+1}",
        "type": "VIEW",
        "bbox": [x, y, w, h]
    })

for b in blocks:
    x, y, w, h = b["bbox"]
    crop = page[y:y+h, x:x+w]
    cv2.imwrite(str(OUTPUT_DIR / f"{b['id']}.png"), crop)

debug = page.copy()
for b in blocks:
    x, y, w, h = b["bbox"]
    color = (0, 255, 0) if b["type"] == "VIEW" else (0, 0, 255)
    cv2.rectangle(debug, (x, y), (x+w, y+h), color, 2)
    cv2.putText(debug, b["id"], (x+5, y-6),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

cv2.imwrite(str(OUTPUT_DIR / "segmented_blocks.png"), debug)

with open(OUTPUT_DIR / "blocks.json", "w") as f:
    json.dump(blocks, f, indent=2)

print("Blocks segmented")