const { create } = require('express-handlebars');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slugify = require('slugify');

const Product = new Schema({

    name: {type: String, require: true},
    description: {type: String},
    price: {type: Number, require: true},
    image: {type: String},
    category: {type: String},
    availibility: {type: String},
    brand: {type: String},
    type:{type: String},
    color:{type: String},
    rate:{type: Number},
    slug: { type: String, unique: true },
    quantity: { type: Number, default: 0 }, // Thêm trường số lượng
    totalPurchase: { type: Number, default: 0 }, 
    createdAt: { type: Date, default: Date.now },
    // Removed status field
});

Product.pre('save', async function (next) {
    if (this.isModified('name')) {
      let slug = slugify(this.name, { lower: true, strict: true });

      // Ensure uniqueness of the slug
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