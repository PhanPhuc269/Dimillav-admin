const Product = require('../models/Product');
const nodemailer = require('nodemailer');
const mjml = require('mjml');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class ProductService {
    // Cập nhật sản phẩm dựa trên slug
    async updateProduct(slug, updateData) {
        return Product.findOneAndUpdate({ slug }, updateData, { new: true });
    }

    // Tìm sản phẩm dựa trên slug
    async findProductBySlug(slug) {
        return Product.findOne({ slug });
    }

    // Lưu sản phẩm sau khi cập nhật
    async saveProduct(product) {
        return product.save();
    }
}

module.exports = new ProductService();



















