const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const MAX_UPLOAD_SIZE =
  parseInt(process.env.MAX_UPLOAD_SIZE) || 5 * 1024 * 1024;

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ được upload PDF, Word hoặc hình ảnh!"), false);
  }
};

function createUploader({ type, getFileName }) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = path.join(__dirname, "../uploads", "temp");

      fs.mkdirSync(uploadPath, { recursive: true });

      cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
      if (getFileName) {
        return cb(null, getFileName(req, file));
      }

      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

      cb(null, uniqueName + path.extname(file.originalname));
    },
  });

  return multer({
    storage,
    limits: { fileSize: MAX_UPLOAD_SIZE },
    fileFilter,
  });
}

module.exports = createUploader;
