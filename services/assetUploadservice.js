import sharp from "sharp";

import * as dotenv from "dotenv";
import { uploadtos3 } from "../utils/aws.js";

dotenv.config();

export default class AssestUpload {
  static async uploadfile(req) {
    try {
      let promises = [];
      let imageType;
      if (req.files["imageGallery"]) {
        imageType = "gallery";

        for (const file of req.files["imageGallery"]) {
          const img = sharp(file.buffer);
          const resizeImg = img
            .resize(640, 480)
            .jpeg({ quality: 85, chromaSubsampling: "4:4:4" });
          const bufImg = await resizeImg.toBuffer();
          promises.push(uploadtos3(bufImg, file.originalname, imageType));
        }
      }
      if (req.files["featuredImage"]) {
        imageType = "featured";
        for (const file of req.files["featuredImage"]) {
          const img = sharp(file.buffer);
          const resizeImg = img
            .resize(640, 480)
            .jpeg({ quality: 85, chromaSubsampling: "4:4:4" });
          const bufImg = file.buffer;
          console.log(bufImg, "buf");
          promises.push(uploadtos3(bufImg, file.originalname, imageType));
        }
      }
      if (req.files["videos"]) {
        for (const file of req.files["videos"]) {
          promises.push(uploadtos3(file.buffer, file.originalname));
        }
      }
      console.log(imageType, "imageType");
      let urls = await Promise.all(promises);
      console.log(urls);

      return urls;
    } catch (err) {
      console.log(err);
    }
  }
}
