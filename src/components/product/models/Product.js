const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const Product = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  sizesAvailable: [{ type: Number }], // Các size khả dụng
  stockBySize: { type: Map, of: Number }, // Số lượng theo size
  material: { type: String },
  style: { type: String },
  gender: { type: String, enum: ['Men', 'Women', 'Unisex'], default: 'Unisex' },
  originalPrice: { type: Number, required: true }, // Giá gốc
  salePrice: { type: Number }, // Giá đang sale
  saleDuration: { type: Number }, // Thời gian sale còn lại (đơn vị: giờ hoặc ngày)
  quantity: { type: Number, required: true }, // Số lượng sản phẩm
  totalPurchased: { type: Number, default: 0 }, // Tổng số lượng khách hàng đã mua
  images: [{ type: String }], // Mảng chứa URL ảnh sản phẩm
  category: { type: String },
  availability: { type: String }, // Tình trạng sản phẩm (e.g., "In stock", "Out of stock")
  brand: { type: String },
  type: { type: String },
  color: { type: String },
  rate: { type: Number },
  warranty: { type: String }, // Bảo hành
  slug: { type: String, unique: true },
  tags: [{ type: String }], // Từ khóa liên quan đến sản phẩm
}, {
  timestamps: true, // Thêm `createdAt` và `updatedAt` tự động
});

Product.pre('save', async function (next) {
    if (this.isModified('name')) {
        let slug = slugify(this.name, { lower: true, strict: true });

        // Đảm bảo uniqueness của slug
        const slugRegex = new RegExp(`^${slug}(-[0-9]*$)?`, 'i');
        const existingProduct = await this.constructor.findOne({ slug: slugRegex });

        if (existingProduct) {
            const slugSuffix = Date.now();
            slug = `${slug}-${slugSuffix}`;
        }

        this.slug = slug;
    }
    next();
});

module.exports = mongoose.model('Product', Product);