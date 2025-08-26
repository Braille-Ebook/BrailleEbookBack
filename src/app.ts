import express, { ErrorRequestHandler } from 'express';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import session from 'express-session';
import passport from 'passport';
import sequelize from './sequelize';
import path from 'path';

import pageRouter from './routes/page';
import reviewRouter from './routes/review';
import authRouter from './routes/auth';
import bookRouter from './routes/book';
import homeRouter from './routes/home';
import mypageRouter from './routes/mypage';
import passportConfig from './passport';
import './models';

const app = express();
passportConfig();

export const syncDB = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('DB 동기화 완료');
    } catch (err) {
        console.error('DB 동기화 실패:', err);
    }
};

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        express.json()(req, res, next);
    } else {
        next();
    }
});
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET!,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    })
);

//passport 연결
app.use(passport.initialize());
app.use(passport.session()); //로그인 상태 세션 기반으로 유지

app.use('/auth', authRouter);
app.use('/', pageRouter);
app.use('/book/:bookId/review', reviewRouter);
app.use('/book', bookRouter);
app.use('/home', homeRouter);
app.use('/mypage', mypageRouter);

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message,
    });
};
app.use(errorHandler);

export default app;
