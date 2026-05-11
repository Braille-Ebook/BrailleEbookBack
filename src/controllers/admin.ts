import { Request, Response, NextFunction } from 'express';
import { Op, Order } from 'sequelize';
import passport from 'passport';
import { Book, User } from '../models';
import { pdfSizeCalculator } from '../services/pdfSizeCalculator';

export const adminLogin = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
        'local',
        (
            authError: Error | null,
            user: Express.User | false,
            info: { message: string }
        ) => {
            if (authError) {
                console.error(authError);
                return next(authError);
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: info.message,
                });
            }

            // 관리자 체크
            if (!user.admin) {
                return res.status(403).json({
                    success: false,
                    message: '관리자 계정이 아닙니다.',
                });
            }

            return req.login(user, (loginError) => {
                if (loginError) {
                    console.error(loginError);
                    return next(loginError);
                }

                const { user_id, userId, email, nickname, admin } =
                    user as User;

                return res.status(200).json({
                    success: true,
                    message: '관리자 로그인 성공',
                    user: {
                        id: user_id,
                        userId,
                        email,
                        nickname,
                        admin,
                    },
                });
            });
        }
    )(req, res, next);
};
export const getBooks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { qtype, q, sort, sortDir } = req.query;
        const searchQuery = typeof q === 'string' ? q : undefined;
        const searchType = typeof qtype === 'string' ? qtype : undefined;
        const sortField = typeof sort === 'string' ? sort : undefined;
        const direction =
            typeof sortDir === 'string' && sortDir.toUpperCase() === 'ASC'
                ? 'ASC'
                : 'DESC';

        // 검색 가능 필드
        const allowedQtypes = [
            'title',
            'genre',
            'author',
            'translator',
            'publisher',
            'summary',
        ];
        // 정렬 가능 필드
        const allowedSortFields = [
            'bookmark_num',
            'book_id',
            'publish_date',
            'title',
        ];

        const where: Record<string, any> = {};

        if (searchQuery && searchType && allowedQtypes.includes(searchType)) {
            where[searchType] = {
                [Op.like]: `%${searchQuery}%`,
            };
        }

        // ORDER
        const order: Order = [];

        if (sortField && allowedSortFields.includes(sortField)) {
            order.push([sortField, direction]);
        }

        const result = await Book.findAll({
            where,
            order,
        });

        return res.status(200).json({
            success: true,
            message: '책 찾기 성공',
            data: result,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
};
export const addBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            title,
            genre,
            author,
            translator,
            publisher,
            publish_date,
            summary,
            ISBN,
            image_url,
            pdf_url,
        } = req.body;

        const length = await pdfSizeCalculator(pdf_url);

        const newBook = await Book.create({
            title,
            genre,
            author,
            translator,
            publisher,
            publish_date,
            summary,
            ISBN,
            image_url,
            pdf_url,
            length,
        });
        return res
            .status(200)
            .json({ success: true, message: '책 추가 성공', data: newBook });
    } catch (err) {
        console.error(err);
        return next(err);
    }
};
export const deleteBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const id = Number(req.params.id);
        const book = await Book.findByPk(id);

        if (!book) {
            throw new Error('No such book exists');
        }

        await book.destroy();

        return res.status(200).json({
            sucess: true,
            message: `id ${id}인 책을 삭제했습니다.`,
            data: book,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
};
