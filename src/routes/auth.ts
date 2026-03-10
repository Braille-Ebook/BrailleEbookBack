import express from 'express';
import passport from 'passport';
import User from '../models/user';
import { generateAppToken } from '../utils/jwt';
import {
    join,
    login,
    logout,
    sendVerificationCode,
    verifyCode,
    findIdByEmail,
    findEmailById,
    sendTempPassword,
    resetPassword,
} from '../controllers/auth';
import {
    isLoggedIn,
    isNotLoggedIn,
    validateEmailFormat,
    isLoggedInOrAppToken,
} from '../middlewares/index';

const router = express.Router();

router.post('/join', isNotLoggedIn, join);
router.post('/login', isNotLoggedIn, login);
router.post('/logout', isLoggedInOrAppToken, logout);

router.post('/send-code', validateEmailFormat, sendVerificationCode);
router.post('/verify-code', verifyCode);

// Kakao OAuth
router.get('/kakao', passport.authenticate('kakao'));
router.get(
    '/kakao/callback',
    passport.authenticate('kakao', {
        failureRedirect: '/?loginError=카카오로그인 실패',
    }),
    (req, res) => {
        const user = req.user as User;
        const token = generateAppToken(user);

        console.log('JWT token:', token);

        return res.redirect(
            `brailleebookfront://auth/kakao/callback?token=${encodeURIComponent(token)}`
        );
    }
);

router.post('/find-id', findIdByEmail);
router.post('/find-email', findEmailById);

router.post('/reset-password/temp', sendTempPassword); //임시 비밀번호 전송
router.patch('/reset-password', isLoggedIn, resetPassword);

export default router;
