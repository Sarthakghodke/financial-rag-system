try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter


def chunk_text(text: str) -> list[str]:
    """Split long document text into smaller searchable chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        # The splitter tries these separators in order.
        separators=["\n\n", "\n", ".", " ", ""],
    )
    return splitter.split_text(text)
