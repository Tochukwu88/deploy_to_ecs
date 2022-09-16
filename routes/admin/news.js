import express from 'express';

import News from '../../controllers/admin/News.js';
import { adminAuth } from '../../controllers/auth.js';
import upload from '../../utils/multer.js'

import {celebrate, Joi,Segments} from 'celebrate'

const router = express.Router();


const fileUpload = upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'imageGallery', maxCount: 5 },
  ]);

router.post('/createnews',adminAuth,fileUpload,   celebrate({
  [Segments.BODY]: Joi.object().keys({
        body: Joi.string().required(),
        title: Joi.string().required(),
        category: Joi.string().required(),
      time2read: Joi.number().integer()
    })

}),News.createNews);
router.put('/editnews/:id',adminAuth,fileUpload,  celebrate({
    body: Joi.object().keys({
        body: Joi.string(),
        title: Joi.string(),
        category: Joi.string(),
      time2read: Joi.number().integer()
    }),
    [Segments.PARAMS]: Joi.object().keys({
        id: Joi.string().required(),
       }),
}),News.editNews);
router.delete('/deletenews/:id',adminAuth, celebrate({
    [Segments.PARAMS]: Joi.object().keys({
     id: Joi.string().required(),
    }),
   }),News.deleteNews);
router.get('/:slug',adminAuth,celebrate({
    [Segments.PARAMS]: Joi.object().keys({
     slug: Joi.string().required(),
    }),
   }), News.getSingleNews);
router.get('/',adminAuth,celebrate({
    [Segments.QUERY]: Joi.object().keys({
     page: Joi.string(),
     limit: Joi.string(),
     q: Joi.string(),
    }),
   }), News.getAllNews);

// const r ={
    
//     baseUrl: '/news',
//     router
// } 

export  default router