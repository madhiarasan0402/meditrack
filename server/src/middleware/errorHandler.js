export const errorHandler = (err, req, res, next) => {
  console.error('[API Error Caught]:', err.name || err.message, err.stack);

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyValue || {}).join(', ');
    return res.status(409).json({
      success: false,
      message: `Conflict error: Duplicate entry detected for field (${keys}). This slot or record already exists.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: `Validation failed: ${validationErrors.join(', ')}`
    });
  }

  // Multer limit exceeded
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size exceeds maximum permitted limit (10MB)'
    });
  }

  // Default server error
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error occurred'
  });
};
