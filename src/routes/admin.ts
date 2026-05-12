import express from 'express';
import passport from 'passport';
import { isAdmin, isLoggedIn } from '../middlewares';
import {
    adminLogin,
    getBooks,
    addBook,
    deleteBook,
} from '../controllers/admin';

const router = express.Router();

//나중에 isLoggedIn과 isAdmin 미들웨어 추가하기
router.post('/login', adminLogin);
router.get('/books', getBooks);
router.post('/books', addBook);
router.delete('/books/:id', deleteBook);

export default router;
