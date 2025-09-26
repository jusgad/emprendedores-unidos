const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

router.post('/image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen',
      error: error.message
    });
  }
});

router.post('/images', authenticateToken, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se han subido archivos' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    res.json({
      success: true,
      message: `${req.files.length} imágenes subidas exitosamente`,
      imageUrls: imageUrls,
      count: req.files.length
    });
  } catch (error) {
    console.error('Error subiendo imágenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir imágenes',
      error: error.message
    });
  }
});

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Demasiados archivos (máximo 5)' });
    }
  }
  
  res.status(400).json({ error: error.message });
});

module.exports = router;