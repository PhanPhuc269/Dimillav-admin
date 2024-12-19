const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

require('dotenv').config();

cloudinary.config({
  cloud_name: 'dginq7yqw',
  api_key: '139616111469673',
  api_secret: 'P5GZmEtXR1Ig2tzyoF6HeAH8eMk',
});

// Cấu hình Multer để sử dụng Cloudinary làm storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_avatars", // Thư mục lưu trữ trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif"], // Định dạng file cho phép
    public_id: (req, file) => {
      // Tên file tải lên trên Cloudinary
      return `avatar_${Date.now()}`;
    },
  },
});

const upload = multer({ storage });


module.exports = upload;