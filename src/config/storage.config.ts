import { diskStorage } from 'multer';

export const storage = diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    const extention = file.mimetype.split('/')[1];
    cb(null, `${Date.now()}.${extention}`);
  },
});
