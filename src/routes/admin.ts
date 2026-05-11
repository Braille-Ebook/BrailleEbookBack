import express from 'express';
import passport from 'passport';
//import { isAdmin } from "../middlewares";
import { getBooks, addBook, deleteBook } from '../controllers/admin';

const router = express.Router();

router.get('/books', getBooks);
router.post('/books', addBook);
router.delete('/books/:id', deleteBook);

export default router;
