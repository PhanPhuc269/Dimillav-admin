const { MAX } = require('uuid');
const { mutipleMongooseToObject } = require('../../../utils/mongoose');
const { mongooseToObject } = require('../../../utils/mongoose');
//const ReviewController = require('../../review/controllers/ReviewController');
const Product = require("../models/Product");
const ProductService = require('../services/ProductService');
const cloudinary = require('cloudinary').v2;
const {upload} = require('../../../config/cloudinary/cloudinaryConfig');

class ProductController {

    // Hiển thị form cập nhật sản phẩm
    async editProductForm(req, res, next) {
        try {
            const { slug } = req.params;

            // Lấy thông tin sản phẩm từ slug
            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Render form với dữ liệu sản phẩm
            res.render('edit-product', { product: mongooseToObject(product) });
        } catch (error) {
            console.error('Error rendering edit form:', error);
            res.status(500).json({ message: 'Error rendering edit form', error });
        }
    }

    // Lọc sản phẩm và render giao diện
    async getFilteredProducts(req, res, next) {
        try {
            const {
                category: productCategory,
                brand: productBrand,
                name: productName,
                minPrice,
                maxPrice,
                page = 1,
                limit = 12,
                keyword,
                sort,
            } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const filters = {};

            if (keyword || productName) {
                filters.name = { $regex: keyword || productName, $options: 'i' };
            }

            if (productCategory) {
                const categoryArray = Array.isArray(productCategory)
                    ? productCategory
                    : productCategory.includes(',')
                        ? productCategory.split(',')
                        : [productCategory];
                filters.category = { $in: categoryArray };
            }

            if (productBrand) {
                const brandArray = Array.isArray(productBrand)
                    ? productBrand
                    : productBrand.includes(',')
                        ? productBrand.split(',')
                        : [productBrand];
                filters.brand = { $in: brandArray };
            }

            if (minPrice || maxPrice) {
                filters.price = {};
                if (minPrice) filters.price.$gte = parseFloat(minPrice);
                if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
            }

            let sortCriteria = {};
            switch (sort) {
                case 'price_asc':
                    sortCriteria = { price: 1 };
                    break;
                case 'price_desc':
                    sortCriteria = { price: -1 };
                    break;
                case 'creation_time_desc':
                    sortCriteria = { createdAt: -1 };
                    break;
                case 'creation_time_asc':
                    sortCriteria = { createdAt: 1 };
                    break;
                case 'total_purchase_desc':
                    sortCriteria = { totalPurchase: -1 };
                    break;
                default:
                    sortCriteria = { createdAt: -1 };
            }

            const total = await ProductService.countProducts(filters);
            const products = await ProductService.getProductList(filters, sortCriteria, skip, parseInt(limit));

            // Fetch distinct categories and brands
            const categories = await ProductService.getAllCategories();
            const brands = await ProductService.getAllBrands();

            res.render('list', { // Changed from res.json to res.render
                products: mutipleMongooseToObject(products),
                total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                keyword,
                sort,
                formData: {
                    category: productCategory,
                    brand: productBrand,
                    name: productName,
                },
                categories: categories,
                brands: brands,
            });
        } catch (error) {
            console.error('Error filtering products:', error);
            res.status(500).json({ message: 'Error filtering products', error });
        }
    }

    async ViewProductListings(req, res, next) {
        try {
            const keyword = req.query.keyword?.trim() || '';
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;
            const sort = req.query.sort || 'default';

            const filters = {};
            if (keyword) filters.name = { $regex: keyword, $options: 'i' };

            let sortCriteria = {};
            switch (sort) {
                case 'price_asc': sortCriteria = { price: 1 }; break;
                case 'price_desc': sortCriteria = { price: -1 }; break;
                case 'creation_time_desc': sortCriteria = { createdAt: -1 }; break;
                case 'rate_desc': sortCriteria = { rate: -1 }; break;
                default: sortCriteria = {};
            }

            const total = await ProductService.countProducts(filters);
            const products = await ProductService.getProductList(filters, sortCriteria, skip, limit);

            // Fetch distinct categories and brands
            const categories = await ProductService.getAllCategories();
            const brands = await ProductService.getAllBrands();

            res.render('list', {
                products: mutipleMongooseToObject(products),
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                keyword,
                sort,
                categories: categories,
                brands: brands,
            });
        } catch (error) {
            next(error);
        }
    }

    async SearchProduct(req, res, next) {
        try {
            const {
                type: productType,
                brand: productBrand,
                color: productColor,
                minPrice,
                maxPrice,
                page = 1,
                limit = 12,
                keyword,
                sort,
            } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const filters = {};

            if (keyword) filters.name = { $regex: keyword, $options: 'i' };
            if (productType) filters.type = { $in: productType.split(',') };
            if (productBrand) filters.brand = { $in: productBrand.split(',') };
            if (productColor) filters.color = { $in: productColor.split(',') };
            if (minPrice || maxPrice) filters.price = { ...(minPrice && { $gte: minPrice }), ...(maxPrice && { $lte: maxPrice }) };

            let sortCriteria = {};
            switch (sort) {
                case 'price_asc': sortCriteria = { price: 1 }; break;
                case 'price_desc': sortCriteria = { price: -1 }; break;
                case 'creation_time_desc': sortCriteria = { createdAt: -1 }; break;
                case 'rate_desc': sortCriteria = { rate: -1 }; break;
                default: sortCriteria = {};
            }

            const total = await ProductService.countProducts(filters);
            const products = await ProductService.getProductList(filters, sortCriteria, skip, parseInt(limit));

            res.render('category', {
                products: mutipleMongooseToObject(products),
                total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req, res, next) {
        upload.single('image')(req, res, async function (err) {
            try {
                if (err) {
                    console.error('Multer error:', err);
                    return res.status(400).json({ message: 'Error uploading file', error: err.message });
                }

                const { slug } = req.params;
                const updateData = req.body;

                // Validate provided fields
                let errors = {};

                if (updateData.price !== undefined) {
                    if (isNaN(updateData.price) || Number(updateData.price) < 0) {
                        errors.price = 'Price must be a non-negative number.';
                    }
                }

                if (updateData.quantity !== undefined) {
                    if (isNaN(updateData.quantity) || Number(updateData.quantity) < 0) {
                        errors.quantity = 'Quantity must be a non-negative number.';
                    }
                }

                // If there are validation errors, render the form again with errors and existing input
                if (Object.keys(errors).length > 0) {
                    // Retrieve the product to display current data
                    const product = await ProductService.findProductBySlug(slug);
                    if (!product) {
                        return res.status(404).json({ message: 'Product not found' });
                    }

                    // Render the edit form with errors and existing product data
                    return res.render('edit-product', { 
                        product: mongooseToObject(product),
                        errors,
                        formData: updateData
                    });
                }

                // Optionally sanitize input data here

                // Tìm sản phẩm theo slug
                const product = await ProductService.findProductBySlug(slug);
                if (!product) {
                    return res.status(404).json({ message: 'Product not found' });
                }

                // Cập nhật các trường từ body (chỉ cập nhật nếu có giá trị)
                for (const key in updateData) {
                    if (updateData[key] !== undefined) {
                        product[key] = updateData[key];
                    }
                }

                // Xử lý cập nhật hình ảnh nếu file được upload
                if (req.file) {
                    product.images.push(req.file.path); // URL của hình ảnh từ Cloudinary
                }

                // Lưu sản phẩm sau khi cập nhật
                const updatedProduct = await ProductService.saveProduct(product);

                res.redirect('/product/list');
            } catch (error) {
                console.error('Error updating product:', error);
                res.status(500).json({ message: 'Error updating product', error });
            }
        });
    }

    // Thêm ảnh cho sản phẩm
    async addImage(req, res, next) {
        upload.single('image')(req, res, async function (err) {
            try {
                // Xử lý lỗi từ Multer
                if (err) {
                    console.error('Multer error:', err);
                    return res.status(400).json({ message: 'Error uploading file', error: err.message });
                }

                // Lấy slug từ params
                const { slug } = req.params;

                // Tìm sản phẩm theo slug
                const product = await ProductService.findProductBySlug(slug);
                if (!product) {
                    return res.status(404).json({ message: 'Product not found' });
                }

                // Kiểm tra nếu file không tồn tại
                if (!req.file) {
                    return res.status(400).json({ message: 'No file uploaded' });
                }

                // Upload thành công, lấy URL của ảnh
                const imageUrl = req.file.path;

                // Cập nhật ảnh vào sản phẩm
                product.image = imageUrl;
                await ProductService.saveProduct(product);

                res.json({ message: 'Image added successfully', product });
            } catch (error) {
                console.error('Error adding image:', error);
                res.status(500).json({ message: 'Error adding image', error });
            }
        });
    }

    // Xóa ảnh của sản phẩm
    async removeImage(req, res, next) {
        try {
            const { slug, index } = req.params;

            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            // Xóa ảnh khỏi mảng images
            product.images.splice(index, 1);
  
            await ProductService.saveProduct(product);

            res.status(200).json({ message: 'Image removed successfully', product });
        } catch (error) {
            console.error('Error removing image:', error);
            res.status(500).json({ message: 'Error removing image', error });
        }
    }

    // Thay đổi danh mục hoặc thương hiệu của sản phẩm
    async changeCategoryOrBrand(req, res, next) {
        try {
            const { slug } = req.params;
            const { category, brand } = req.body;

            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            if (category) {
                product.category = category;
            }
            if (brand) {
                product.brand = brand;
            }

            await ProductService.saveProduct(product);

            res.json({ message: 'Category/Brand updated successfully', product });
        } catch (error) {
            console.error('Error updating category/brand:', error);
            res.status(500).json({ message: 'Error updating category/brand', error });
        }
    }

    // Cập nhật tình trạng của sản phẩm
    async updateAvailability(req, res, next) {
        try {
            const { slug } = req.params;
            const { availability } = req.body;

            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            product.availibility = availability;
            await ProductService.saveProduct(product);

            res.json({ message: 'Availability updated successfully', product });
        } catch (error) {
            console.error('Error updating availability:', error);
            res.status(500).json({ message: 'Error updating availability', error });
        }
    }

    // Render form to create a new product
    async createProductForm(req, res, next) {
        try {
            res.render('create-product');
        } catch (error) {
            console.error('Error rendering create product form:', error);
            res.status(500).json({ message: 'Error rendering create product form', error });
        }
    }

    // Handle creating a new product
    async createProduct(req, res, next) {
        upload.single('image')(req, res, async function (err) {
            try {
                if (err) {
                    console.error('Multer error:', err);
                    return res.status(400).json({ message: 'Error uploading file', error: err.message });
                }

                const { name, description, price, quantity, type, availibility, category, brand, color } = req.body;

                // Validate required fields
                const requiredFields = ['name', 'description', 'price', 'quantity', 'type', 'availibility', 'category', 'brand', 'color'];
                let errors = {};

                for (const field of requiredFields) {
                    if (!req.body[field] || req.body[field].toString().trim() === '') {
                        errors[field] = `Field '${field}' is required.`;
                    }
                }

                // Validate price and quantity
                if (isNaN(price) || Number(price) < 0) {
                    errors.price = 'Price must be a non-negative number.';
                }

                if (isNaN(quantity) || Number(quantity) < 0) {
                    errors.quantity = 'Quantity must be a non-negative number.';
                }

                // If there are validation errors, render the form again with errors and existing input
                if (Object.keys(errors).length > 0) {
                    return res.render('create-product', { errors, formData: req.body });
                }

                const imagePath = req.file ? req.file.path : '';

                const newProduct = new Product({
                    name,
                    description,
                    price,
                    quantity,
                    type,
                    availibility,
                    category,
                    brand,
                    color,
                    image: imagePath,
                    createdAt: new Date(),
                });

                await ProductService.saveProduct(newProduct);

                res.redirect('/product/list');
            } catch (error) {
                console.error('Error creating product:', error);
                res.status(500).json({ message: 'Error creating product', error });
            }
        });
    }

    // Add deleteProduct method
    async deleteProduct(req, res, next) {
        try {
            const { slug } = req.params;

            // Find the product by slug
            const product = await ProductService.findProductBySlug(slug);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }

            // Delete the product
            await ProductService.deleteProduct(slug);

            res.redirect('/product/list');
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Error deleting product', error });
        }
    }

    // New method to handle AJAX requests for products
    async getProductsAjax(req, res, next) {
        try {
            const {
                category: productCategory,
                brand: productBrand,
                name: productName,
                minPrice,
                maxPrice,
                page = 1,
                limit = 12,
                keyword,
                sort,
            } = req.query;

            const skip = (parseInt(page) - 1) * parseInt(limit);
            const filters = {};

            if (keyword || productName) {
                filters.name = { $regex: keyword || productName, $options: 'i' };
            }

            if (productCategory) {
                const categoryArray = Array.isArray(productCategory)
                    ? productCategory
                    : productCategory.includes(',')
                        ? productCategory.split(',')
                        : [productCategory];
                filters.category = { $in: categoryArray };
            }

            if (productBrand) {
                const brandArray = Array.isArray(productBrand)
                    ? productBrand
                    : productBrand.includes(',')
                        ? productBrand.split(',')
                        : [productBrand];
                filters.brand = { $in: brandArray };
            }

            if (minPrice || maxPrice) {
                filters.price = {};
                if (minPrice) filters.price.$gte = parseFloat(minPrice);
                if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
            }

            let sortCriteria = {};
            switch (sort) {
                case 'price_asc':
                    sortCriteria = { price: 1 };
                    break;
                case 'price_desc':
                    sortCriteria = { price: -1 };
                    break;
                case 'creation_time_desc':
                    sortCriteria = { createdAt: -1 };
                    break;
                case 'creation_time_asc':
                    sortCriteria = { createdAt: 1 };
                    break;
                case 'total_purchase_desc':
                    sortCriteria = { totalPurchase: -1 };
                    break;
                default:
                    sortCriteria = { createdAt: -1 };
            }

            const total = await ProductService.countProducts(filters);
            const products = await ProductService.getProductList(filters, sortCriteria, skip, parseInt(limit));

            res.json({
                products: mutipleMongooseToObject(products),
                total,
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
            });
        } catch (error) {
            console.error('Error in getProductsAjax:', error);
            res.status(500).json({ message: 'Error fetching products', error });
        }
    }
}

module.exports = new ProductController();
