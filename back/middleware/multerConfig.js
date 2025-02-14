import multer from 'multer';
import path from 'path';

// Multer configuration
const storage = multer.diskStorage({
  // Destination to store csv file
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

// Init Upload
const upload = multer({
  storage: storage,
});

export default upload;
