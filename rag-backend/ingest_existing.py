import os
import sys
import time

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.rag_service import process_and_ingest_document

docs_dir = r"E:\SIH'26\SIH26036\E-Maap-Nirikshak\Data-docs"
INTER_DOC_DELAY = 45  # seconds between docs to respect 100 req/min free tier

def main():
    if not os.path.exists(docs_dir):
        print(f"[ERROR] Directory not found: {docs_dir}")
        return

    pdf_files = [f for f in os.listdir(docs_dir) if f.lower().endswith(".pdf")]
    print(f"Found {len(pdf_files)} PDF(s). Ingesting with rate-limit delays...\n")

    success, skipped, failed = 0, 0, 0

    for idx, filename in enumerate(pdf_files):
        file_path = os.path.join(docs_dir, filename)
        print(f"[{idx+1}/{len(pdf_files)}] {filename}")
        try:
            chunks = process_and_ingest_document(file_path)
            if chunks == 0:
                print(f"  [SKIP] 0 chunks - scanned/image PDF (needs OCR)\n")
                skipped += 1
            else:
                print(f"  [OK] {chunks} chunks stored in Pinecone\n")
                success += 1
                # Wait between docs to avoid rate limit (skip delay after last doc)
                if idx < len(pdf_files) - 1:
                    print(f"  [WAIT] Waiting {INTER_DOC_DELAY}s before next doc (rate limit)...")
                    time.sleep(INTER_DOC_DELAY)
        except Exception as e:
            print(f"  [FAIL] {e}\n")
            failed += 1

    print("=" * 60)
    print(f"Done! OK:{success}  SKIPPED:{skipped}  FAILED:{failed}")

if __name__ == "__main__":
    main()
