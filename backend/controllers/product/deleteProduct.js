const cloudinary = require("cloudinary").v2;
const productModel = require("../../models/productModel");

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.query;

        // Check if productId is provided
        if (!productId) {
            return res.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false,
            });
        }

        // Find and delete the product
        const deletedProduct = await productModel.findByIdAndDelete(productId);

        // Check if the product was found
        if (!deletedProduct) {
            return res.status(404).json({
                message: "Product not found",
                error: true,
                success: false,
            });
        }

        // Delete images from Cloudinary
        const productImages = deletedProduct.productImage;
        if (productImages && productImages.length > 0) {
            for (const imagePath of productImages) {
                // Extract public ID from the Cloudinary URL
                const publicId = imagePath.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }
        }

        res.status(200).json({
            message: "Product and associated images deleted successfully",
            error: false,
            success: true,
            data: deletedProduct,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message || "Internal Server Error",
            error: true,
            success: false,
        });
    }
};

module.exports = deleteProduct;
