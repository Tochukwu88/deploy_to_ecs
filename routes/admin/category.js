import express from 'express';
import Categories from '../../controllers/admin/category.js';
import {celebrate, Joi,Segments} from 'celebrate'



import { adminAuth } from '../../controllers/auth.js';


const router = express.Router();



router.post('/createcategory',adminAuth, celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
       
    })

}),Categories.createcategory);
router.put('/editcategory/:name',adminAuth,celebrate({
    body: Joi.object().keys({
        name: Joi.string().required(),
       
    }),
    [Segments.PARAMS]: Joi.object().keys({
        name: Joi.string().required(),
       }),

}), Categories.editcategory);
router.delete('/deletecategory/:name',adminAuth,celebrate({
  
    [Segments.PARAMS]: Joi.object().keys({
        name: Joi.string().required(),
       }),

}), Categories.deletecategory);
router.get('/:name',adminAuth, celebrate({
  
    [Segments.PARAMS]: Joi.object().keys({
        name: Joi.string().required(),
       }),

}),Categories.getSinglecategory);
router.get('/',adminAuth, Categories.getAllcategory);



// const r ={
    
//     baseUrl: '/category',
//     router
// } 

export  default router
