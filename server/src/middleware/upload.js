const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary if credentials are provided
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/tmp/uploads' 
  : path.join(__dirname, '../../uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// Multer memory storage (we process with sharp and upload directly)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, or WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880') },
});

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// Middleware: Process uploaded receipt image → WebP, max 1200px wide
async function processReceiptImage(req, res, next) {
  if (!req.file) return next();
  try {
    const processedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    if (process.env.STORAGE_MODE === 'cloudinary' || process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(processedBuffer, 'english_with_mhs/receipts');
      req.receiptFilename = result.public_id;
      req.receiptUrl = result.secure_url;
    } else {
      ensureUploadDir();
      const filename = `receipt_${crypto.randomUUID()}.webp`;
      const outputPath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(outputPath, processedBuffer);
      req.receiptFilename = filename;
      req.receiptUrl = `/uploads/${filename}`;
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function processCourseImage(req, res, next) {
  if (!req.file) return next();
  try {
    const processedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    if (process.env.STORAGE_MODE === 'cloudinary' || process.env.CLOUDINARY_CLOUD_NAME) {
      const result = await uploadToCloudinary(processedBuffer, 'english_with_mhs/courses');
      req.courseImageUrl = result.secure_url;
    } else {
      ensureUploadDir();
      const filename = `course_${crypto.randomUUID()}.webp`;
      const outputPath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(outputPath, processedBuffer);
      req.courseImageUrl = `/uploads/${filename}`;
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, processReceiptImage, processCourseImage };
