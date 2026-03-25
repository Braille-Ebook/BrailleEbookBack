import { Request, Response, NextFunction } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import Book from '../models/book';
import UserBookProgress from '../models/userBookProgress';
import { bookmarkInclude } from '../utils/bookmarkAttribute';

export const getRecent = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userPk = req.user?.user_id;

        if (!userPk) {
            return res.status(200).json({
                success: true,
                message: '로그인하지 않은 사용자입니다.',
                data: [],
            });
        }

        const books = await UserBookProgress.findAll({
            where: {
                user_id: userPk,
            },
            include: [
                {
                    model: Book,
                    ...(bookmarkInclude(userPk) as any),
                },
            ],
            order: [['updated_at', 'DESC']],
            limit: 5,
        });

        return res.status(200).json({
            success: true,
            message: '최근에 읽은 책 정보입니다.',
            data: books,
        });
    } catch (err) {
        next(err);
    }
};

export const getRecommend = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.user_id;
    try {
        const userPk = req.user?.user_id;
        const topk = 20;
        const books = await Book.findAll({
            order: [['bookmark_num', 'DESC']],
            limit: 20,
            ...bookmarkInclude(userId),
        });

        // 로그인 안 한 경우
        if (!userPk) {
            return res.status(200).json({
                success: true,
                message: '로그인하지 않은 사용자입니다.',
                data: [],
            });
        }

        // python 추천 스크립트 경로
        const scriptPath = path.join(
            process.cwd(),
            'scripts',
            'recommendation',
            'recommend_for_user.py'
        );

        const isWindows = os.platform() === 'win32';
        const pythonPath = isWindows
            ? path.join(process.cwd(), '.venv-reco', 'Scripts', 'python.exe')
            : path.join(process.cwd(), '.venv-reco', 'bin', 'python');

        const py = spawn(
            pythonPath,
            [scriptPath, String(userPk), String(topk)],
            {
                cwd: process.cwd(),
                env: { ...process.env },
            }
        );

        let out = '';
        let err = '';

        py.stdout.on('data', (d) => (out += d.toString()));
        py.stderr.on('data', (d) => (err += d.toString()));

        py.on('close', async (code) => {
            try {
                if (code !== 0) {
                    console.error('python recommend error:', err);
                    return res.status(500).json({
                        success: false,
                        message: '추천 도서 조회 중 오류가 발생했습니다.',
                    });
                }

                const parsed = JSON.parse(out);
                const ids: number[] = parsed?.book_ids;

                // 추천 결과가 없는 경우
                if (!parsed?.ok || !Array.isArray(ids) || ids.length === 0) {
                    return res.status(200).json({
                        success: true,
                        message: '추천 결과가 없습니다.',
                        data: [],
                    });
                }

                // 추천 book_id로 Book 조회
                const books = await Book.findAll({
                    where: { book_id: ids },
                });

                // 추천 순서 유지
                const map = new Map<number, any>();
                (books as any[]).forEach((b) => map.set(b.book_id, b));
                const ordered = ids.map((id) => map.get(id)).filter(Boolean);

                return res.status(200).json({
                    success: true,
                    message: '추천 책 정보입니다.',
                    data: ordered,
                });
            } catch (err) {
                next(err);
            }
        });
    } catch (err) {
        next(err);
    }
};

export const getPopular = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.user_id;
    try {
        const books = await Book.findAll({
            order: [['bookmark_num', 'DESC']],
            limit: 20,
            ...bookmarkInclude(userId),
        });

        return res.status(200).json({
            success: true,
            message: '인기 도서 정보입니다.',
            data: books,
        });
    } catch (err) {
        next(err);
    }
};

export const getNew = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const userId = req.user?.user_id;
    try {
        const books = await Book.findAll({
            order: [['publish_date', 'DESC']],
            limit: 20,
            ...bookmarkInclude(userId),
        });

        return res.status(200).json({
            success: true,
            message: '신간 도서 정보입니다.',
            data: books,
        });
    } catch (err) {
        next(err);
    }
};

export const getByGenre = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = req.user?.user_id;
        const genre = (req.query.genre as string).trim();

        if (!genre) {
            return res.status(400).json({
                success: false,
                message: '장르가 필요합니다.',
            });
        }

        const books = await Book.findAll({
            where: { genre },
            order: [['bookmark_num', 'DESC']], //인기순으로 정렬
            limit: 20,
            ...bookmarkInclude(userId),
        });

        return res.status(200).json({
            success: true,
            message: `'${genre}' 장르의 인기 도서를 불러왔습니다.`,
            data: books,
        });
    } catch (err) {
        next(err);
    }
};
