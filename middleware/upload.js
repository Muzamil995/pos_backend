const multer = require("multer");
const fs = require("fs");
const path = require("path");

const createUploader = (folderName) => {

  const storage = multer.diskStorage({

    destination: function (req, file, cb) {

      const userId = req.user.userId;

      const uploadPath = path.join(
        __dirname,
        "../uploads",
        String(userId),
        folderName
      );

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: function (req, file, cb) {

      const ext = path.extname(file.originalname);
      const uniqueName = `${folderName}_${Date.now()}${ext}`;

      cb(null, uniqueName);
    },

  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
};

module.exports = createUploader;