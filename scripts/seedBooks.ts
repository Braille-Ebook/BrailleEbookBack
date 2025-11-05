/**
 * 카카오 도서 API → Book 테이블 시드 스크립트 (썸네일 없는 항목 스킵)
 * 실행: npx ts-node scripts/seedBooks.ts
 */

import 'dotenv/config';
import axios from 'axios';
import dayjs from 'dayjs';
import Book from '../src/models/book';
import sequelize from '../src/sequelize';

const KAKAO_URL = 'https://dapi.kakao.com/v3/search/book';
const KAKAO_KEY = process.env.KAKAO_ID!;
if (!KAKAO_KEY) throw new Error('❌ KAKAO_REST_API_KEY가 .env에 없습니다.');

const PLAN: Record<string, { target: number; queries: string[] }> = {
    공상과학: {
        target: 50,
        queries: [
            '공상과학',
            '과학소설',
            'SF 소설',
            '사이언스 픽션',
            '우주 소설',
        ],
    },
    '미스터리/호러': {
        target: 50,
        queries: ['미스터리', '추리소설', '스릴러', '호러', '공포 소설'],
    },
    로맨스: {
        target: 50,
        queries: ['로맨스', '연애소설', '멜로', '성장 로맨스'],
    },
    판타지: {
        target: 50,
        queries: [
            '판타지',
            '하이 판타지',
            '어반 판타지',
            '마법 소설',
            '히어로 판타지',
        ],
    },
    '문학 소설': {
        target: 50,
        queries: [
            '문학 소설',
            '한국문학',
            '세계문학',
            '현대문학',
            '장편소설',
            '단편소설',
        ],
    },
    '청소년 소설': {
        target: 50,
        queries: [
            '청소년 소설',
            '영 어덜트',
            'YA 소설',
            '10대 소설',
            '하이스쿨 소설',
        ],
    },
    역사: {
        target: 50,
        queries: ['역사', '세계사', '한국사', '전쟁사', '역사 교양'],
    },
    철학: {
        target: 50,
        queries: [
            '철학',
            '철학 입문',
            '윤리학',
            '서양철학',
            '동양철학',
            '형이상학',
        ],
    },
    종교: {
        target: 50,
        queries: ['종교', '기독교', '불교', '천주교', '이슬람', '종교학'],
    },
    과학: {
        target: 50,
        queries: [
            '과학',
            '물리학',
            '화학',
            '생명과학',
            '천문학',
            '뇌과학',
            '과학 교양',
        ],
    },
};

type KakaoBook = {
    title: string;
    contents: string;
    isbn: string;
    datetime: string;
    authors: string[];
    publisher: string;
    translators: string[];
    thumbnail: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const extractIsbn13 = (raw: string) =>
    raw?.split(/\s+/).find((x) => /^\d{13}$/.test(x)) ?? null;

const keyOf = (d: KakaoBook) =>
    `${(d.title ?? '').trim().toLowerCase()}::${(d.authors ?? [])
        .join(',')
        .trim()
        .toLowerCase()}`;

// ✅ 썸네일이 있고 http/https URL이면 true
function hasValidThumbnail(url?: string) {
    return !!url && /^https?:\/\//i.test(url.trim());
}

function mapToRow(d: KakaoBook, genre: string) {
    return {
        title: d.title ?? null,
        image_url: d.thumbnail ?? null,
        genre,
        author: (d.authors ?? []).join(', '),
        translator: (d.translators ?? []).join(', ') || null,
        publisher: d.publisher ?? null,
        publish_date: d.datetime ? dayjs(d.datetime).toDate() : null,
        summary: d.contents ?? null,
        length: null,
        ISBN: extractIsbn13(d.isbn) ?? null,
        bookmark_num: 0,
        pdf_url: null,
    };
}

async function fetchBooks(query: string, page: number, size: number) {
    const res = await axios.get(KAKAO_URL, {
        headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
        params: { query, page, size, sort: 'accuracy' }, // 최신은 "latest"
        timeout: 8000,
    });
    return res.data as { documents: KakaoBook[]; meta: { is_end: boolean } };
}

// ==============================
// 이미지 url 없는 책 스킵
// ==============================
async function seedGenre(
    genre: string,
    plan: { target: number; queries: string[] }
) {
    const want = plan.target;
    let saved = 0;
    const seen = new Set<string>();

    while (saved < want) {
        const q = plan.queries[Math.floor(Math.random() * plan.queries.length)];
        const page = Math.floor(Math.random() * 30) + 1; // 1~30 랜덤

        const { documents } = await fetchBooks(q, page, 20);

        for (const d of documents) {
            // 1) 썸네일 없는 책 제외
            if (!hasValidThumbnail(d.thumbnail)) continue;

            // 2) 제목+저자 중복 제외
            const k = keyOf(d);
            if (seen.has(k)) continue;
            seen.add(k);

            // 3) 저장
            const row = mapToRow(d, genre);
            await Book.create(row);

            saved++;
            if (saved >= want) break;
        }

        await sleep(300); // rate limit 완화
    }

    return saved;
}

async function main() {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    // 로컬 테스트에서 테이블이 없을 수 있으면 주석 해제:
    // await Book.sync({ alter: true });

    let total = 0;
    for (const [genre, plan] of Object.entries(PLAN)) {
        console.log(`\n[${genre}] 채우는 중… (목표: ${plan.target})`);
        const n = await seedGenre(genre, plan);
        total += n;
        console.log(`[${genre}] ${n}권 저장 완료`);
    }

    console.log(`\n🎉 총 ${total}권 저장 완료!`);
    await sequelize.close();
}

main().catch(async (e) => {
    console.error('❌ 오류:', e?.message || e);
    try {
        await sequelize.close();
    } catch {}
    process.exit(1);
});
