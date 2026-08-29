const multer = require('multer');

const storage = multer.memoryStorage(); 

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      return callback(new Error('Only image files are allowed.'));
    }
    callback(null, true);
  },
});

module.exports = upload;
