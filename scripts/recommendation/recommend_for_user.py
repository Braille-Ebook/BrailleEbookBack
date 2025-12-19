import os, sys, json, math
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

def cosine(a, b):
    dot = 0.0
    na = 0.0
    nb = 0.0
    for x, y in zip(a, b):
        dot += x * y
        na += x * x
        nb += y * y
    if na == 0.0 or nb == 0.0:
        return -1.0
    return dot / (math.sqrt(na) * math.sqrt(nb))

def mean_vector(vectors):
    n = len(vectors)
    if n == 0:
        return []
    dim = len(vectors[0])
    out = [0.0] * dim
    for v in vectors:
        for i in range(dim):
            out[i] += float(v[i])
    inv = 1.0 / n
    for i in range(dim):
        out[i] *= inv
    return out

def main():
    # 사용: py -3.12 recommend_for_user.py <user_id> [topk]
    if len(sys.argv) < 2:
        print(json.dumps({"ok": False, "error": "user_id required"}))
        return

    user_id = int(sys.argv[1])
    topk = int(sys.argv[2]) if len(sys.argv) >= 3 else 20

    load_dotenv()  # 루트 .env 또는 scripts/recommendation/.env

    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "3306")
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "")
    db_name = os.getenv("DB_NAME", "")

    if not db_name:
        print(json.dumps({"ok": False, "error": "DB_NAME not set"}))
        return

    url = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?charset=utf8mb4"
    engine = create_engine(url, pool_pre_ping=True)

    with engine.connect() as conn:
        # 1) seed book ids = 읽은 책 + 북마크 책
        read_rows = conn.execute(
            text("""
                SELECT DISTINCT book_id
                FROM UserBookProgress
                WHERE user_id = :uid
            """),
            {"uid": user_id}
        ).fetchall()

        bm_rows = conn.execute(
            text("""
                SELECT DISTINCT book_id
                FROM UserBookBookmark
                WHERE user_id = :uid
            """),
            {"uid": user_id}
        ).fetchall()

        seed_book_ids = sorted(set([r[0] for r in read_rows] + [r[0] for r in bm_rows]))

        # seed 없으면 인기순 fallback
        if len(seed_book_ids) == 0:
            pop = conn.execute(
                text("""
                    SELECT book_id
                    FROM Book
                    ORDER BY bookmark_num DESC
                    LIMIT :k
                """),
                {"k": topk}
            ).fetchall()
            print(json.dumps({"ok": True, "book_ids": [r[0] for r in pop], "mode": "popular_fallback"}))
            return

        # 2) seed 책 임베딩 가져오기
        placeholders = ",".join([str(x) for x in seed_book_ids])
        seed_emb_rows = conn.execute(
            text(f"""
                SELECT book_id, embedding
                FROM BookEmbedding
                WHERE book_id IN ({placeholders})
            """)
        ).fetchall()

        seed_vectors = []
        for bid, emb in seed_emb_rows:
            vec = json.loads(emb) if isinstance(emb, str) else emb
            seed_vectors.append(vec)

        # seed는 있는데 임베딩이 없다면 fallback
        if len(seed_vectors) == 0:
            pop = conn.execute(
                text("""
                    SELECT book_id
                    FROM Book
                    ORDER BY bookmark_num DESC
                    LIMIT :k
                """),
                {"k": topk}
            ).fetchall()
            print(json.dumps({"ok": True, "book_ids": [r[0] for r in pop], "mode": "popular_fallback_no_embedding"}))
            return

        user_vec = mean_vector(seed_vectors)

        # 3) 전체 임베딩 로드
        all_rows = conn.execute(
            text("""
                SELECT book_id, embedding
                FROM BookEmbedding
            """)
        ).fetchall()

        exclude = set(seed_book_ids)

        scored = []
        for bid, emb in all_rows:
            if bid in exclude:
                continue
            vec = json.loads(emb) if isinstance(emb, str) else emb
            s = cosine(user_vec, vec)
            scored.append((s, bid))

        scored.sort(reverse=True, key=lambda x: x[0])
        rec_ids = [bid for _, bid in scored[:topk]]

        print(json.dumps({"ok": True, "book_ids": rec_ids, "mode": "embedding"}))

if __name__ == "__main__":
    main()
