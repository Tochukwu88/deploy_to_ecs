
import models from '../models/index.js';
import { errorResponse, successRes } from '../utils/responseHandler.js'


 const { User,NewsFeed,Category } = models
 
 
 export default class News{


static async getSingleNews(req,res){
   const news = await models.NewsFeed.findOne({ where: { slug:req.params.slug } });
   if(!news) return errorResponse(res, "not found", 404)
   await news.increment('views',{by:1})

   return successRes(res, news, ` successful`, 200)


}
static async getTrendingNews(req,res){
    
    
    const news = await models.NewsFeed.findAndCountAll( {take:5,orderBy:[ ["views", "DESC"],]});
    if(!news.length) return errorResponse(res, "no news found", 404)
 
    return successRes(res, news, ` successful`, 200)
}
static async getAllNews(req,res){
    let page = req.query.page?req.query.page:1
    let limit = req.query.limit?req.query.limit:10
    let skip = (page * limit) - limit
    let result 
    if(req.query.q){
        const news = await models.NewsFeed.findAndCountAll({where:{[Op.or]: [{title: req.query.q}, {body: req.query.q}]}, take:limit,offset:skip,orderBy:[ ["createdAt", "DESC"]] });
        result = news
    }else{
    const news = await models.NewsFeed.findAndCountAll({ take:limit,offset:skip,orderBy:[ ["createdAt", "DESC"]] });
    result = news
    console.log(news)

}
    if(!result) return errorResponse(res, "no news found", 404)
 
    return successRes(res, result, ` successful`, 200)
}



}