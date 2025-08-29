import { RequestHandler } from 'express';
import { UserBookProgress, UserPageBookmark } from '../models';

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
        await UserPageBookmark.destroy({
            where: {
                user_id: req.user!.user_id,
                book_id: req.params.bookId,
                bookmarked_page: req.query.page,
            },
        });
        res.status(200).send({
            success: true,
            message: '페이지 북마크 제거하기가 성공했습니다.',
        });
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

export {
    getLastLocation,
    postLastLocation,
    addPageBookmark,
    deletePageBookmark,
    getPageBookmark,
};
