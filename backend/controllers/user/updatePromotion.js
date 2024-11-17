// ../controller/user/updatePromotion.js

const Promotion = require('../../models/promotionSchema');

const updatePromotion = async (req, res) => {
    try {
        const { 
            promotionId, 
            code, 
            discountType, 
            discountValue, 
            minOrderValue, 
            startDate, 
            endDate, 
            usageLimit, 
            isActive 
        } = req.body;

        // Kiểm tra xem mã khuyến mại có tồn tại hay không
        const promotion = await Promotion.findById(promotionId);
        if (!promotion) {
            return res.status(404).json({ success: false, message: 'Promotion not found' });
        }

        // Cập nhật thông tin khuyến mại
        promotion.code = code || promotion.code;
        promotion.discountType = discountType || promotion.discountType;
        promotion.discountValue = discountValue !== undefined ? discountValue : promotion.discountValue;
        promotion.minOrderValue = minOrderValue !== undefined ? minOrderValue : promotion.minOrderValue;
        promotion.startDate = startDate || promotion.startDate;
        promotion.endDate = endDate || promotion.endDate;
        promotion.usageLimit = usageLimit !== undefined ? usageLimit : promotion.usageLimit;
        promotion.isActive = isActive !== undefined ? isActive : promotion.isActive;

        // Lưu khuyến mại đã cập nhật
        await promotion.save();

        res.json({ success: true, message: 'Promotion updated successfully', promotion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to update promotion' });
    }
};

module.exports = updatePromotion;
