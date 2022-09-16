import AssestUpload from "../../services/assetUploadservice.js";
import { errorResponse, successRes } from "../../utils/responseHandler.js";
import slugify from "slugify";
import Category from "../../models/category.js";
import NewsFeed from "../../models/newsFeed.js";
import models from "../../models/index.js";
import sequelize from "sequelize";
import { publishSns, sendToQueue } from "../../utils/aws.js";
const Op = sequelize.Op;

export default class News {
  static async createNews(req, res) {
    try {
      const isAuth = req.user;
      const user = await models.User.findOne({
        where: { email: isAuth.email, isAdmin: true },
      });
      let imageGallery = [];
      let featuredImage;
      const urls = await AssestUpload.uploadfile(req);
      console.log(user, "url");

      if (urls.length) {
        for (const url of urls) {
          if (url.imageType === "gallery" && url.type === "image") {
            imageGallery.push(url.url);
          }
          if (url.imageType === "featured" && url.type === "image") {
            featuredImage = url.url;
          }
        }
      }

      const reqPayload = req.body;
      console.log(reqPayload);

      //check for the category
      const category = await models.Category.findOne({
        where: { name: reqPayload.category },
      });
      if (!category) return errorResponse(res, "category not found", 404);

      let slug = slugify(reqPayload.title, {
        lower: true,
        strict: true,
        replacement: "-",
        remove: /[*+~.()'"!:@%]/g,
      });
      // check if slugExist
      const slugExist = await models.NewsFeed.findOne({ where: { slug } });
      if (slugExist) {
        slug = `${slug}-${Math.random()}`;
      }
      console.log(category.dataValues);
      const payload = {
        userId: user.id,
        categoryId: category.id,
        title: reqPayload.title,
        slug,
        body: reqPayload.body,
        imageGallery,
        featuredImage,
        time2read: reqPayload.time2read,
        createdAt: new Date(),
      };

      await models.NewsFeed.create(payload);
      // publishSns(payload);
      sendToQueue(payload);
      return successRes(res, {}, `operation successful`, 201);
    } catch (error) {
      console.log(error);
      return errorResponse(res, "error occourred, contact support", 500);
    }
  }
  static async editNews(req, res) {
    try {
      const oldNews = await models.NewsFeed.findOne({
        where: { id: req.params.id },
      });
      let imageGallery = [];
      let featuredImage;
      const urls = AssestUpload.uploadfile(req);
      if (urls.length) {
        for (const url of urls) {
          if (url.imageType === "gallery" && url.type === "image") {
            imageGallery.push(url.location);
          }
          if (url.imageType === "featured" && url.type === "image") {
            featuredImage = url.location;
          }
        }
      }

      const reqPayload = req.body;

      //check for the category

      let slug;
      if (reqPayload.title) {
        slug = slugify(reqPayload.title, {
          lower: true,
          strict: true,
          replacement: "-",
          remove: /[*+~.()'"!:@%]/g,
        });
        // check if slugExist
        const slugExist = await models.NewsFeed.findOne({ where: { slug } });
        if (slugExist) {
          slug = `${slug}-${Math.random()}`;
        }
      }
      const payload = {
        title: reqPayload.title ? reqPayload.title : oldNews.title,
        slug,
        body: reqPayload.body ? reqPayload.body : oldNews.body,
        imageGallery: imageGallery.length ? imageGallery : oldNews.imageGallery,
        featuredImage: featuredImage ? featuredImage : oldNews.featuredImage,
        time2read: reqPayload.time2read
          ? reqPayload.time2read
          : oldNews.time2read,
        updatedAt: new Date(),
      };

      await models.NewsFeed.update(payload, { where: { id: oldNews.id } });
      return successRes(res, {}, `operation successful`, 200);
    } catch (error) {
      return errorResponse(res, "error occourred, contact support", 500);
    }
  }
  static async getSingleNews(req, res) {
    const news = await models.NewsFeed.findOne({
      where: { slug: req.params.slug },
    });
    if (!news) return errorResponse(res, "not found", 404);
    await news.increment("views", { by: 1 });

    return successRes(res, news, ` successful`, 200);
  }
  static async getAllNews(req, res) {
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? req.query.limit : 10;

    let skip = page * limit - limit;
    console.log(page, skip, limit);
    let result;
    if (req.query.q) {
      const news = await models.NewsFeed.findAndCountAll({
        where: {
          [Op.or]: [
            {
              title: {
                [Op.like]: `%${req.query.q}%`,
              },
            },
            {
              body: {
                [Op.like]: `%${req.query.q}%`,
              },
            },
          ],
        },
        limit,
        offset: skip,
        orderBy: [["createdAt", "DESC"]],
      });
      result = news;
    } else {
      const news = await models.NewsFeed.findAndCountAll({
        limit,
        offset: skip,
        orderBy: [["createdAt", "DESC"]],
      });
      result = news;
    }
    if (!result) return errorResponse(res, "no news found", 404);

    return successRes(res, result, ` successful`, 200);
  }

  static async deleteNews(req, res) {
    const news = await models.NewsFeed.findOne({
      where: { id: req.params.id },
    });
    if (!news) return errorResponse(res, "not found", 404);
    await models.NewsFeed.destroy({
      where: {
        id: news.id,
      },
    });
    return successRes(res, {}, ` deleted successfully`, 200);
  }
}
