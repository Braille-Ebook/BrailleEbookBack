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

router.post('/login', adminLogin);
router.get('/books', isLoggedIn, isAdmin, getBooks);
router.post('/books', isLoggedIn, isAdmin, addBook);
router.delete('/books/:id', isLoggedIn, isAdmin, deleteBook);

export default router;
