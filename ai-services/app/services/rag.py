from langchain_chroma import Chroma
from langchain_core.documents import Document
from app.core.config import settings
from app.data.guidelines import CLINICAL_GUIDELINES


# loads embedding model (gemini if api key exists, else local all-minilm)
def get_embeddings():
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            return GoogleGenerativeAIEmbeddings(
                model="gemini-embedding-004",
                google_api_key=settings.GEMINI_API_KEY
            )
        except Exception:
            pass

    from langchain_huggingface import HuggingFaceEmbeddings
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


embedding_model = get_embeddings()
vector_store = Chroma(
    collection_name="guidelines",
    embedding_function=embedding_model,
    persist_directory=settings.CHROMA_DIR
)

# pehli baar populate krega,, who and icmr guidelines into chromadb if empty
def populate_vector_store():
    existing = vector_store.get()
    if not existing or len(existing.get("ids", [])) == 0:
        docs = [
            Document(
                page_content=g["content"],
                metadata={
                    "source": g["source"],
                    "category": g["category"],
                    "id": g["id"]
                }
            ) for g in CLINICAL_GUIDELINES
        ]
        vector_store.add_documents(docs)

# runs on start
try:
    populate_vector_store()
except Exception:
    pass

# similarity search on vector store
def search_guidelines(query: str, k: int = 3):
    try:
        results = vector_store.similarity_search(query, k=k)
        if results:
            return results
    except Exception:
        pass

    # fallback 
    return [
        Document(
            page_content=CLINICAL_GUIDELINES[0]["content"],
            metadata={"source": CLINICAL_GUIDELINES[0]["source"]}
        )
    ]

# langchain retriever object for chains (llm invoke krte time chain me use hoga)
def get_retriever(k: int = 2):
    return vector_store.as_retriever(search_kwargs={"k": k})


get_langchain_docs = search_guidelines