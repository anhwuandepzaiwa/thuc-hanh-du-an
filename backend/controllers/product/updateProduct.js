const uploadProductPermission = require("../../helpers/permission");
const productModel = require("../../models/productModel");

async function updateProductController(req, res) {
    try {
        const sessionUserId = req.userId;

        // Check if the user has permission to update the product
        if (!uploadProductPermission(sessionUserId)) {
            throw new Error("Permission denied");
        }

        const { _id, replaceImageIndexes, ...updateData } = req.body;

        // Find the product by its ID
        const product = await productModel.findById(_id);
        if (!product) {
            throw new Error("Product not found");
        }

        // Get the current images of the product
        let currentImages = product.productImage || [];

        // Handle if there are new files uploaded
        if (req.files && req.files.length > 0) {
            if (!replaceImageIndexes || replaceImageIndexes.length !== req.files.length) {
                throw new Error("The number of images and replacement indexes must match.");
            }

            // Replace the images at the provided indexes
            for (let i = 0; i < replaceImageIndexes.length; i++) {
                const index = parseInt(replaceImageIndexes[i], 10); // Ensure the index is an integer
                if (index >= 0 && index < currentImages.length) {
                    currentImages[index] = req.files[i].path; // Replace the image at the specified index
                } else {
                    throw new Error(`Invalid image index: ${index}`);
                }
            }

            // Update productImage field with the modified images array
            updateData.productImage = currentImages;
        }

        // Update the product with the new data
        const updatedProduct = await productModel.findByIdAndUpdate(_id, updateData, { new: true });

        res.status(200).json({
            message: "Product updated successfully",
            error: false,
            success: true,
            data: updatedProduct
        });

    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = updateProductController;
