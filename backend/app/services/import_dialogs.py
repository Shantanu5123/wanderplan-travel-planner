import os
import csv
import re

DATASET_CSV = os.path.join(os.path.dirname(__file__), "..", "data", "faq_knowledge_base.csv")

def extract_qa_from_text(raw_text: str):
    new_rows = []
    lines = raw_text.strip().splitlines()
    for line in lines:
        line = line.strip()
        if not line or "\t" not in line:
            continue
        parts = line.split("\t", 1)
        q = parts[0].strip().capitalize()
        a = parts[1].strip()
        if q and a:
            words = re.findall(r"\w+", q.lower())
            keywords = [w for w in words if len(w) > 3][:4]
            new_rows.append({
                "question": q,
                "answer": a,
                "category": "conversational",
                "sub-category": "dialogue",
                "source": "user_import",
                "difficulty_level": "easy",
                "keywords": str(keywords)
            })
    return new_rows

def append_to_csv(rows):
    if not os.path.exists(DATASET_CSV):
        return
    with open(DATASET_CSV, mode="a", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        for idx, r in enumerate(rows, start=192):
            writer.writerow([idx, r["question"], r["answer"], r["category"], r["sub-category"], r["source"], r["difficulty_level"], r["keywords"]])
    print(f"Appended {len(rows)} dialogue pairs.")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and os.path.exists(sys.argv[1]):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            content = f.read()
        rows = extract_qa_from_text(content)
        append_to_csv(rows)
