const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { randomUUID: uuidv4 } = require('crypto');

// Vercel serverless requires using /tmp for file writes, local dev uses '../../uploads'
const UPLOAD_DIR = process.env.VERCEL
  ? '/tmp'
  : path.join(__dirname, '../../uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Directory creation skipped:', err.message);
  }
}

// Multer memory storage (we'll process with sharp then save)
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

// Middleware: Process uploaded receipt image → WebP, max 1200px wide
async function processReceiptImage(req, res, next) {
  if (!req.file) return next();
  try {
    const filename = `receipt_${uuidv4()}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    req.receiptFilename = filename;
    req.receiptUrl = `/uploads/${filename}`;
    next();
  } catch (err) {
    next(err);
  }
}

async function processCourseImage(req, res, next) {
  if (!req.file) return next();
  try {
    const filename = `course_${uuidv4()}.webp`;
    const outputPath = path.join(UPLOAD_DIR, filename);

    await sharp(req.file.buffer)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    req.courseImageUrl = `/uploads/${filename}`;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, processReceiptImage, processCourseImage };