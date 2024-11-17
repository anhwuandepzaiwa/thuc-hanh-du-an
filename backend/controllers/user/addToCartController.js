const addToCartModel = require("../../models/cartProduct");
const productModel = require("../../models/productModel"); // Import the product model

const addToCartController = async (req, res) => {
    try {
        const { productId, quantity } = req.body; // Get both productId and quantity from the request body
        const currentUser = req.userId;

        // Find the product to check the stock
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
                success: false,
                error: true
            });
        }

        // Check if the requested quantity is greater than the available stock
        if (quantity > product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} items available in stock`,
                success: false,
                error: true
            });
        }

        // Check if the product is already in the cart
        const isProductAvailable = await addToCartModel.findOne({ productId, userId: currentUser });

        if (isProductAvailable) {
            // Update the quantity if product already exists in the cart
            const updatedQuantity = isProductAvailable.quantity + quantity;

            // Check if the updated quantity exceeds available stock
            if (updatedQuantity > product.stock) {
                return res.status(400).json({
                    message: `You can only add up to ${product.stock - isProductAvailable.quantity} more items`,
                    success: false,
                    error: true
                });
            }

            isProductAvailable.quantity = updatedQuantity;
            await isProductAvailable.save();

            return res.json({
                data: isProductAvailable,
                message: "Product quantity updated in cart",
                success: true,
                error: false
            });
        }

        // If product is not in the cart, add it with the specified quantity
        const payload = {
            productId: productId,
            quantity: quantity || 1, // Default to 1 if quantity is not provided
            userId: currentUser,
        };

        const newAddToCart = new addToCartModel(payload);
        const saveProduct = await newAddToCart.save();

        return res.json({
            data: saveProduct,
            message: "Product added to cart",
            success: true,
            error: false
        });

    } catch (err) {
        res.json({
            message: err?.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = addToCartController;
