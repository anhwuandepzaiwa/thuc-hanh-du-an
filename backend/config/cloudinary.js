const cloudinary = require('cloudinary').v2

cloudinary.config({ 
    cloud_name: 'dcfzpeagq', 
    api_key: '168542726863946', 
    api_secret: '80G6zrVnJC7ExW_3MRhk3fVaHoc' 
});

module.exports = cloudinary