import os
import csv
import re
from typing import List, Dict, Optional

# Load and index dataset
DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "faq_knowledge_base.csv")

class KnowledgeBase:
    def __init__(self, filepath: str = DATASET_PATH):
        self.qa_pairs: List[Dict[str, str]] = []
        self._load(filepath)

    def _load(self, filepath: str):
        if not os.path.exists(filepath):
            return

        with open(filepath, mode="r", encoding="utf-8", errors="ignore") as f:
            reader = csv.DictReader(f)
            for row in reader:
                q = (row.get("question") or "").strip()
                a = (row.get("answer") or "").strip()
                cat = (row.get("category") or "").strip()
                kw_str = (row.get("keywords") or "").strip()
                if q and a:
                    self.qa_pairs.append({
                        "question": q,
                        "answer": a,
                        "category": cat,
                        "keywords": kw_str
                    })

    def find_relevant(self, query: str, limit: int = 3) -> List[Dict[str, str]]:
        """
        Retrieves the top-k matching FAQ answers using word token overlap scoring.
        """
        if not query or not self.qa_pairs:
            return []

        tokens = set(re.findall(r"\w+", query.lower()))
        # Remove common short words
        tokens = {t for t in tokens if len(t) > 2 and t not in {"the", "and", "for", "with", "about", "what", "how", "where", "can", "you", "tell"}}

        if not tokens:
            return []

        scored = []
        for item in self.qa_pairs:
            score = 0
            q_lower = item["question"].lower()
            a_lower = item["answer"].lower()
            kw_lower = item["keywords"].lower()

            for t in tokens:
                if t in q_lower:
                    score += 3
                if t in kw_lower:
                    score += 2
                if t in a_lower:
                    score += 1

            if score > 0:
                scored.append((score, item))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [pair for _, pair in scored[:limit]]

knowledge_base = KnowledgeBase()
