const uploadProductPermission = require("../../helpers/permission")
const productModel = require("../../models/productModel")

async function UploadProductController(req, res) {
    try {
        const sessionUserId = req.userId;

        // Kiểm tra quyền tải lên
        if (!uploadProductPermission(sessionUserId)) {
            throw new Error("Permission denied");
        }

        // Lưu các đường dẫn ảnh sau khi upload lên Cloudinary
        const productImage = [];
        if (req.files) {
            for (const file of req.files) {
                productImage.push(file.path); // Dùng đường dẫn tạm từ multer
            }
        }

        // Thêm ảnh vào request body
        req.body.productImage = productImage;

        // Tạo sản phẩm mới và lưu vào MongoDB
        const uploadProduct = new productModel(req.body);
        const saveProduct = await uploadProduct.save();

        res.status(201).json({
            message: "Product uploaded successfully",
            error: false,
            success: true,
            data: saveProduct
        });

    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}


module.exports = UploadProductController