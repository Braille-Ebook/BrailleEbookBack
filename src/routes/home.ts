import express from 'express';
import {
    getRecent,
    getRecommend,
    getPopular,
    getNew,
    getByGenre,
} from '../controllers/home';
import { isLoggedIn } from '../middlewares';
import { attachUserIfExists } from '../middlewares/index';

const router = express.Router();

router.get('/recent', attachUserIfExists, getRecent);
router.get('/recommend', attachUserIfExists, getRecommend);
router.get('/popular', getPopular);
router.get('/new', getNew);
router.get('/genre', getByGenre);

export default router;
