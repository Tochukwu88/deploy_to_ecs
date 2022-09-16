import express from 'express';
import { verifyToken } from '../../controllers/auth.js';
import News from '../../controllers/news.js';
import {celebrate, Joi,Segments} from 'celebrate'



const router = express.Router();




router.get('/:slug',verifyToken, celebrate({
    [Segments.PARAMS]: Joi.object().keys({
     slug: Joi.string().required(),
    }),
   }),News.getSingleNews);
router.get('/',verifyToken,celebrate({
    [Segments.QUERY]: Joi.object().keys({
     page: Joi.string(),
     limit: Joi.string(),
     q: Joi.string(),
    }),
   }),News.getAllNews);
router.get('/trending',verifyToken,News.getTrendingNews);



// const r ={
    
//     baseUrl: '/news',
//     router
// } 

export  default router
