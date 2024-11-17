const { model } = require("mongoose");
const addToCartModel = require("../../models/cartProduct");
const productModel = require("../../models/productModel");

const addToCartViewProduct = async (req, res) => {
    try {
        const currentUser = req.userId;

        // Tìm tất cả sản phẩm trong giỏ hàng của người dùng hiện tại và lấy thông tin chi tiết sản phẩm
        const cartItems = await addToCartModel.find({ userId: currentUser })
            .populate({
                path: "productId",
                model: productModel,
                select: "productName productImage availableColors originalPrice discountedPrice discountPercentage giftItems stock",
            });

        let totalAmount = 0;
        let totalQuantity = 0; // Khai báo biến để tính tổng số lượng

        const cartDetails = cartItems.map((item) => {
            const product = item.productId;
            if (!product) return null; // Kiểm tra sản phẩm có tồn tại hay không

            // Tính giá hiển thị: nếu có giảm giá, sử dụng `discountedPrice`, nếu không thì sử dụng `originalPrice`
            const price = product.discountedPrice || product.originalPrice;
            const totalPrice = price * item.quantity;
            totalAmount += totalPrice; // Cộng dồn vào tổng tiền giỏ hàng
            totalQuantity += item.quantity; // Cộng dồn số lượng sản phẩm vào tổng số lượng

            return {
                productId: product._id, // Thêm id của sản phẩm
                productName: product.productName,
                productImage: product.productImage[0], // Lấy hình ảnh đầu tiên làm đại diện
                selectedColor: item.selectedColor, // Màu đã chọn từ giỏ hàng
                originalPrice: product.originalPrice,
                discountedPrice: product.discountedPrice || null,
                discountPercentage: product.discountPercentage || 0,
                quantity: item.quantity,
                totalPrice: totalPrice,
                giftItems: product.giftItems.length > 0 ? product.giftItems : null,
            };
        }).filter(item => item !== null); // Lọc ra các sản phẩm null (nếu có)

        res.json({
            data: {
                cartDetails,
                totalAmount,
                totalQuantity, // Trả về tổng số lượng sản phẩm
            },
            success: true,
            error: false,
        });

    } catch (err) {
        res.json({
            message: err.message || err,
            error: true,
            success: false,
        });
    }
};

module.exports = addToCartViewProduct;
