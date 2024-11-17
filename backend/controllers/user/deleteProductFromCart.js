const addToCartModel = require("../../models/cartProduct")

const deleteProductFromCart = async (req, res) => {
    try {
        const currentUser = req.userId;  // Lấy userId từ request (thông qua middleware hoặc token)
        const { productId } = req.query;  // Lấy productId từ query parameters

        // Tìm và xóa sản phẩm khỏi giỏ hàng của người dùng
        const cartItem = await addToCartModel.findOneAndDelete({
            userId: currentUser,
            productId: productId,  // Kiểm tra theo userId và productId
        });

        if (!cartItem) {
            return res.status(404).json({
                message: "Product not found in cart",
                success: false,
                error: true,
            });
        }

        res.json({
            message: "Product removed from cart successfully",
            success: true,
            error: false,
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false,
        });
    }
};

module.exports = deleteProductFromCart;
