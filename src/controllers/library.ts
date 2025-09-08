import { Request, Response, NextFunction } from 'express';
import { UserBookBookmark } from '../models';
import Book from '../models/book';

export const getBookmarkedBooks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const libraryBooks = await UserBookBookmark.findAll({
            where: {
                user_id: req.user?.user_id,
            },
            attributes: ['book_id'],
        });
        const bookIds = libraryBooks.map((b) => b.book_id);
        const books = await Book.findAll({
            where: {
                book_id: bookIds,
            },
            attributes: [
                'image_url',
                'title',
                'author',
                'translator',
                'publish_date',
                'bookmark_num',
            ],
        });
        return res.status(200).json({
            success: true,
            message: '북마크된 책 조회가 성공했습니다.',
            data: books,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
};
