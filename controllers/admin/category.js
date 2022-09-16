
import models from '../../models/index.js'
import { errorResponse, successRes } from '../../utils/responseHandler.js'


 
 
 
 
 export default class Categories{

static async createcategory(req,res){

try {
    

   

    //check for the category
  const category = await models.Category.findOne({where:{name:req.body.name}})
  if(category)  return errorResponse(res, "category already exist", 400)

  const  payload = {
       name:req.body.name
    }

   const newcat = await models.Category.create(payload)
    return successRes(res, {newcat}, `operation successful`, 201)
    
} catch (error) {
    console.log(error)
    return errorResponse(res, "error occourred, contact support", 500)
}



}
static async editcategory(req,res){

    try {
        const category = await models.Category.findOne({where:{name:req.params.name}})
        if(!category)  return errorResponse(res, "category does not exist", 404)
       
      const payload = {
           
          name:req.body.name
        }
    
        await models.Category.update(payload,{where:{name:req.params.name}})
        return successRes(res, {}, `operation successful`, 200)
        
    } catch (error) {
        return errorResponse(res, "error occourred, contact support", 500)
    }
    

}
static async getSinglecategory(req,res){
   const category = await models.Category.findOne({ where: { name:req.params.name } });
   if(!category) return errorResponse(res, "not found", 404)

   return successRes(res, category, ` successful`, 200)


}
static async getAllcategory(req,res){
    let page = req.query.page?req.query.page:1
    let limit = req.query.limit?req.query.limit:10
    let skip = (page * limit) - limit
    const category = await models.Category.findAndCountAll({take:limit,offset:skip});
    if(!category.length) return errorResponse(res, "no category found", 404)
 
    return successRes(res, category, ` successful`, 200)
}
static async deletecategory(req,res){
    const category = await models.Category.findOne({ where: { name:req.params.name } });
    if(!category) return errorResponse(res, "not found", 404)
    models.Category.destroy({
        where: {
          name: req.params.name 
        }
      });

}


}