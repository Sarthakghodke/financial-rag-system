from pathlib import Path

from PyPDF2 import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    """Read an uploaded PDF file and return all extractable text."""
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"PDF file not found: {file_path}")

    reader = PdfReader(str(path))
    pages_text = []
    for page in reader.pages:
        # Some PDF pages may not contain selectable text.
        page_text = page.extract_text() or ""
        pages_text.append(page_text)

    return "\n".join(pages_text).strip()
