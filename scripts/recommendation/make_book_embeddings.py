import os, json
from datetime import datetime

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sentence_transformers import SentenceTransformer


def build_db_url():
    url = os.getenv("DATABASE_URL")
    if url:
        if url.startswith("mysql://"):
            url = url.replace("mysql://", "mysql+pymysql://", 1)
        return url

    host = os.getenv("DB_HOST", "127.0.0.1")
    port = os.getenv("DB_PORT", "3306")
    user = os.getenv("DB_USER", "root")
    pw = os.getenv("DB_PASSWORD", "")
    name = os.getenv("DB_NAME", "")
    charset = os.getenv("DB_CHARSET", "utf8mb4")
    return f"mysql+pymysql://{user}:{pw}@{host}:{port}/{name}?charset={charset}"


def safe(x) -> str:
    return "" if x is None else str(x)


def main():
    load_dotenv()
    engine = create_engine(build_db_url())
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    BOOK_TABLE = "Book"

    select_sql = text(f"""
        SELECT book_id, title, author, genre, summary
        FROM {BOOK_TABLE}
    """)

    with engine.connect() as conn:
        rows = conn.execute(select_sql).mappings().all()

    if not rows:
        print("No books found in Book table.")
        return

    texts = []
    book_ids = []
    for r in rows:
        book_ids.append(int(r["book_id"]))
        texts.append(" ".join([
            f"제목: {safe(r.get('title'))}",
            f"저자: {safe(r.get('author'))}",
            f"장르: {safe(r.get('genre'))}",
            f"요약: {safe(r.get('summary'))}",
        ]).strip())

    model = SentenceTransformer("jhgan/ko-sroberta-multitask")
    emb = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=True,
        normalize_embeddings=True,
    )

    upsert_sql = text("""
        INSERT INTO BookEmbedding (book_id, embedding, updated_at)
        VALUES (:book_id, :embedding, :updated_at)
        ON DUPLICATE KEY UPDATE
          embedding = VALUES(embedding),
          updated_at = VALUES(updated_at)
    """)

    payload = [
        {
            "book_id": book_ids[i],
            "embedding": json.dumps(emb[i].tolist()),
            "updated_at": now,
            
        }
        for i in range(len(book_ids))
    ]

    with engine.begin() as conn:
        conn.execute(upsert_sql, payload)

    print(f"✅ BookEmbedding upsert 완료: {len(payload)}권")


if __name__ == "__main__":
    main()
