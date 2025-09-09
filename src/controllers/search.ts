import { Request, Response, NextFunction } from 'express';
import { Op, Sequelize } from 'sequelize';
import Book from '../models/book';
import sequelize from '../sequelize';

export const searchBooks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const q = (req.query.q as string | undefined)?.trim();
        const page = Math.max(1, Number(req.query.page ?? 1));
        const limit = 20;
        const offset = (page - 1) * limit;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: '검색어가 필요합니다.',
            });
        }

        const likeAny = `%${q}%`;
        const likePrefix = `${q}%`;

        const relevanceLiteral = sequelize.literal(`
        CASE
            WHEN title LIKE ${sequelize.escape(likePrefix)} THEN 3
            WHEN title LIKE ${sequelize.escape(likeAny)}   THEN 2
            WHEN author LIKE ${sequelize.escape(likeAny)}  THEN 1
            ELSE 0
        END
    `);

        const { rows, count } = await Book.findAndCountAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: likeAny } },
                    { author: { [Op.like]: likeAny } },
                ],
            },
            attributes: {
                include: [[relevanceLiteral, 'relevance']],
            },
            order: [
                [Sequelize.literal('relevance'), 'DESC'], //정확도 우선
                ['bookmark_num', 'DESC'], //동점이면 인기순
                ['book_id', 'DESC'], //또 동점이면 book_id 역순
            ],
            limit,
            offset,
        });

        const hasNext = offset + rows.length < count;
        const nextPage = hasNext ? page + 1 : null;

        return res.status(200).json({
            success: true,
            message: '도서 검색 결과입니다.',
            data: {
                items: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    hasNext,
                    nextPage,
                    nextUrl: hasNext
                        ? `/search/books?q=${encodeURIComponent(q)}&page=${nextPage}`
                        : null,
                },
            },
        });
    } catch (err) {
        next(err);
    }
};
