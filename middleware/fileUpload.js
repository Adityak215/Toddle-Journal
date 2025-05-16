const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { AttachmentType } = require('../db/models');

// Ensure upload directory exists
const uploadDir = path.join(process.env.UPLOAD_PATH || './uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Define storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter configuration
const fileFilter = async (req, file, cb) => {
  try {
    const fileType = req.body.attachment_type;
    console.log('Request body:', req.body);
    console.log('File type:', fileType);
    
    // Define allowed MIME types first
    const allowedTypes = {
      'image': ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'],
      'video': ['video/mp4', 'video/mpeg', 'video/quicktime'],
      'pdf': ['application/pdf'],
      'url': ['text/plain']
    };

    if (!fileType || !allowedTypes[fileType]) {
      return cb(new Error(`Invalid attachment type: ${fileType}`), false);
    }
    
    // Verify attachment type exists in database
    const validType = await AttachmentType.findOne({
      where: { name: fileType }
    });
    
    console.log('Valid type from DB:', validType);
    
    if (!validType) {
      // Try to insert the type if it's in allowedTypes but not in DB
      if (allowedTypes[fileType]) {
        await AttachmentType.create({ name: fileType });
      } else {
        return cb(new Error(`Unsupported attachment type: ${fileType}`), false);
      }
    }
    
    // Check file mimetype
    if (!allowedTypes[fileType].includes(file.mimetype)) {
      return cb(new Error(`Invalid file type for ${fileType}. Expected: ${allowedTypes[fileType].join(', ')}`), false);
    }
    
    cb(null, true);
  } catch (error) {
    console.error('File filter error:', error);
    cb(error, false);
  }
};

// Set upload limits
const limits = {
  fileSize: 10 * 1024 * 1024 // 10MB limit
};

// Create multer middleware instance
const upload = multer({ 
  storage,
  fileFilter,
  limits
});

module.exports = upload;
