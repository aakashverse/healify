from app.services.rag import collection, populate_guidelines
from app.data.guidelines import CLINICAL_GUIDELINES

# insert & refresh guideline docs inside chromadb
def ingest():
    print(f"Ingesting {len(CLINICAL_GUIDELINES)} WHO/ICMR clinical guidelines into ChromaDB...")
    populate_guidelines()
    print(f"Total documents in collection: {collection.count()}")

if __name__ == "__main__":
    ingest()