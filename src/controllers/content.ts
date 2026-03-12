import { RequestHandler } from 'express';
import { UserBookProgress, UserPageBookmark, Book } from '../models';
import { extractPdfData } from '../services/pdfReader';

const getLastLocation: RequestHandler = async (req, res, next) => {
    try {
        const location = await UserBookProgress.findOne({
            where: {
                user_id: req.user!.user_id,
                book_id: req.params.bookId,
            },
            attributes: ['last_page', 'last_char'],
        });
        res.status(200).send({
            success: true,
            message: '마지막으로 읽은 위치 불러오기가 성공했습니다.',
            data: location,
        });
    } catch (e) {
        next(e);
    }
};

const postLastLocation: RequestHandler = async (req, res, next) => {
    try {
        if (req.body.lastPage == null || req.body.lastChar == null) {
            const error = new Error('lastPage와 lastChar을 입력해야합니다.');
            error.status = 400;
            next(error);
        }
        await UserBookProgress.upsert({
            user_id: req.user!.user_id,
            book_id: Number(req.params.bookId),
            updated_at: new Date(),
            last_page: req.body.lastPage,
            last_char: req.body.lastChar,
        });
        res.status(200).send({
            success: true,
            message: '마지막으로 읽은 위치 등록하기가 성공했습니다.',
        });
    } catch (e) {
        next(e);
    }
};

const addPageBookmark: RequestHandler = async (req, res, next) => {
    try {
        await UserPageBookmark.create({
            user_id: req.user!.user_id,
            book_id: req.params.bookId,
            bookmarked_page: req.query.page,
        });
        res.status(200).send({
            success: true,
            message: '페이지 북마크 추가하기가 성공했습니다.',
        });
    } catch (e) {
        next(e);
    }
};

const deletePageBookmark: RequestHandler = async (req, res, next) => {
    try {
        const deletedCount = await UserPageBookmark.destroy({
            where: {
                user_id: req.user!.user_id,
                book_id: req.params.bookId,
                bookmarked_page: req.query.page,
            },
        });
        if (deletedCount) {
            res.status(200).send({
                success: true,
                message: '페이지 북마크 제거하기가 성공했습니다.',
            });
        } else {
            const error = new Error('존재하지 않는 페이지 북마크입니다.');
            error.status = 400;
            next(error);
        }
    } catch (e) {
        next(e);
    }
};

const getPageBookmark: RequestHandler = async (req, res, next) => {
    try {
        const pageBookmarks = await UserPageBookmark.findAll({
            where: {
                user_id: req.user!.user_id,
                book_id: req.params.bookId,
            },
            attributes: ['bookmarked_page'],
        });
        res.status(200).send({
            success: true,
            message: '페이지 북마크 조회하기가 성공했습니다.',
            data: pageBookmarks,
        });
    } catch (e) {
        next(e);
    }
};

const getPageText: RequestHandler = async (req, res, next) => {
    try {
        const { bookId } = req.params;

        const { page } = req.query;

        const bookPdf = await Book.findByPk(bookId, {
            attributes: ['pdf_url'],
        });
        const data = await extractPdfData(
            bookPdf?.dataValues.pdf_url,
            Number(page)
        );

        res.status(200).send({
            success: true,
            message: `pdf ${page}쪽 텍스트 추출 성공했습니다.`,
            data,
        });
    } catch (e) {
        //에러 처리
        //여기에 Invalid page request에러도 포함되어 있음
        next(e);
    }
};

export {
    getLastLocation,
    postLastLocation,
    addPageBookmark,
    deletePageBookmark,
    getPageBookmark,
    getPageText,
};
