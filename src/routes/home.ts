import express from 'express';
import {
    getRecent,
    getRecommend,
    getPopular,
    getNew,
    getByGenre,
} from '../controllers/home';
import { isLoggedIn } from '../middlewares';

const router = express.Router();

router.get('/recent', getRecent);
router.get('/recommend', isLoggedIn, getRecommend);
router.get('/popular', getPopular);
router.get('/new', getNew);
router.get('/genre', getByGenre);

export default router;
