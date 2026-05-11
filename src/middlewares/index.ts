import { Request, Response, NextFunction } from 'express';
import User from '../models/user';
import { verifyAppTokenValue } from '../utils/jwt';
import { isBookIdValid, isReviewIdValid } from './review';

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send('로그인이 필요합니다.');
    }
};

const isNotLoggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
};

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.admin) {
        return res.status(403).json({
            success: false,
            message: '관리자만 접근 가능합니다.',
        });
    }

    next();
};

const validateEmailFormat = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return res
            .status(400)
            .json({ message: '유효한 이메일 형식을 입력해주세요.' });
    }

    next();
};

const verifyAppToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: '토큰이 없습니다.',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAppTokenValue(token);

        const user = await User.findByPk(decoded.user_id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: '유저를 찾을 수 없습니다.',
            });
        }

        req.user = user as Express.User;
        return next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({
            success: false,
            message: '유효하지 않은 토큰입니다.',
        });
    }
};

const isLoggedInOrAppToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }

    return verifyAppToken(req, res, next);
};

const attachUserIfExists = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (req.isAuthenticated && req.isAuthenticated()) {
            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyAppTokenValue(token);
        const user = await User.findByPk(decoded.user_id);

        if (user) {
            req.user = user as Express.User;
        }

        return next();
    } catch (error) {
        console.error(error);
        return next();
    }
};

export {
    isLoggedIn,
    isNotLoggedIn,
    isBookIdValid,
    isReviewIdValid,
    validateEmailFormat,
    verifyAppToken,
    isLoggedInOrAppToken,
    attachUserIfExists,
    isAdmin,
};
