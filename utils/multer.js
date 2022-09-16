import multer, { memoryStorage } from 'multer';
import { extname } from 'path';

export default multer({
  storage: memoryStorage(),
  fileFilter: (req, file, cb) => {
    let ext = extname(file.originalname);
    console.log(ext)
    if (ext == '.jpg' || ext == '.jpeg' || ext == '.png' || ext == '.mp4' || ext == '.PNG' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
       cb(null, false);
      return;
    }
  },
});