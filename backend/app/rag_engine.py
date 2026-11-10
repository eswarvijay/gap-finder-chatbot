import re
import io
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class DocumentChunk:
    def __init__(self, chunk_id: str, text: str, source_title: str, citation: str, material_type: str):
        self.chunk_id = chunk_id
        self.text = text
        self.source_title = source_title
        self.citation = citation
        self.material_type = material_type

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_id": self.chunk_id,
            "text": self.text,
            "source_title": self.source_title,
            "citation": self.citation,
            "material_type": self.material_type
        }


class RAGEngine:
    """Retrieval-Augmented Generation Engine with exact citations and provenance tracking."""

    @staticmethod
    def extract_text_from_pdf(pdf_bytes: bytes) -> Tuple[str, List[Dict[str, Any]]]:
        """Extracts text and page-by-page metadata from uploaded PDF bytes."""
        reader = PdfReader(io.BytesIO(pdf_bytes))
        total_pages = len(reader.pages)
        # For large textbooks, index up to 60 pages for fast sub-3-second real-time responsiveness
        pages_to_process = reader.pages[:min(total_pages, 60)]
        print(f"[RAG Engine] Processing {len(pages_to_process)} pages out of {total_pages} total pages in PDF...")

        full_text = ""
        pages_data = []

        for idx, page in enumerate(pages_to_process):
            page_text = page.extract_text() or ""
            if page_text.strip():
                full_text += f"\n--- Page {idx + 1} ---\n" + page_text
                pages_data.append({
                    "page_number": idx + 1,
                    "text": page_text
                })

        print(f"[RAG Engine] PDF extracted successfully: {len(full_text)} characters across {len(pages_data)} pages.")
        return full_text, pages_data

    @staticmethod
    def chunk_material(content: str, title: str, material_type: str) -> List[DocumentChunk]:
        """
        Chunks text into coherent passages preserving section labels or citations.
        Detects markdown headers or bracketed citations like [Source: Chapter X, Section Y].
        """
        chunks: List[DocumentChunk] = []

        # Check for explicit bracketed sources first: [Source: ...]
        pattern = r"(\[Source:\s*[^\]]+\])"
        parts = re.split(pattern, content)

        if len(parts) > 1:
            current_citation = f"{title}"
            for part in parts:
                part = part.strip()
                if not part:
                    continue
                if part.startswith("[Source:") and part.endswith("]"):
                    current_citation = part[8:-1].strip()
                else:
                    sub_chunks = [p.strip() for p in part.split("\n\n") if len(p.strip()) > 40]
                    for idx, sc in enumerate(sub_chunks):
                        chunks.append(DocumentChunk(
                            chunk_id=f"{title}_{len(chunks)}",
                            text=sc,
                            source_title=title,
                            citation=current_citation,
                            material_type=material_type
                        ))
            if chunks:
                return chunks

        # Fallback: Split by chapters, units, or paragraphs with rolling window
        paragraphs = [p.strip() for p in content.split("\n\n") if len(p.strip()) > 30]
        
        chunk_accum = ""
        citation_header = title
        chunk_idx = 1

        for para in paragraphs:
            # Check for unit / chapter line
            if re.match(r"^(UNIT|CHAPTER|SECTION|TOPIC|Question\s+\d+)", para, re.IGNORECASE):
                citation_header = f"{title} - {para[:60]}..."

            if len(chunk_accum) + len(para) < 1200:
                chunk_accum += "\n" + para
            else:
                if chunk_accum.strip():
                    chunks.append(DocumentChunk(
                        chunk_id=f"{title}_{chunk_idx}",
                        text=chunk_accum.strip(),
                        source_title=title,
                        citation=citation_header,
                        material_type=material_type
                    ))
                    chunk_idx += 1
                chunk_accum = para

        if chunk_accum.strip():
            chunks.append(DocumentChunk(
                chunk_id=f"{title}_{chunk_idx}",
                text=chunk_accum.strip(),
                source_title=title,
                citation=citation_header,
                material_type=material_type
            ))

        return chunks

    @staticmethod
    def retrieve_relevant_chunks(query: str, all_chunks: List[DocumentChunk], top_k: int = 4) -> List[Dict[str, Any]]:
        """
        Performs TF-IDF retrieval over uploaded chunks and ranks them by cosine similarity.
        Returns top-k chunks with their exact citation provenance.
        """
        if not all_chunks:
            return []

        if len(all_chunks) <= top_k:
            return [c.to_dict() for c in all_chunks]

        corpus = [c.text for c in all_chunks]
        try:
            vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
            tfidf_matrix = vectorizer.fit_transform(corpus)
            query_vec = vectorizer.transform([query])
            similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

            top_indices = similarities.argsort()[::-1][:top_k]
            results = []
            for idx in top_indices:
                chunk_dict = all_chunks[idx].to_dict()
                chunk_dict["score"] = float(similarities[idx])
                results.append(chunk_dict)
            return results
        except Exception as e:
            print(f"[RAG Retrieval Exception] {e}. Falling back to keyword search.")
            # Simple keyword matching fallback
            scored = []
            query_words = set(query.lower().split())
            for c in all_chunks:
                match_count = sum(1 for w in query_words if w in c.text.lower())
                scored.append((match_count, c))
            scored.sort(key=lambda x: x[0], reverse=True)
            return [c.to_dict() for _, c in scored[:top_k]]

