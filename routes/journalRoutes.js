// routes/journalRoutes.js
const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journalController');
const { authenticateToken, isTeacher } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

// Protected journal routes
router.use(authenticateToken);

// Journal feed for both teachers and students
router.get('/feed', journalController.getJournalFeed);

// Routes accessible only by teachers
router.post('/', isTeacher, journalController.createJournal);
router.put('/:id', isTeacher, journalController.updateJournal);
router.delete('/:id', isTeacher, journalController.deleteJournal);
router.post('/:id/publish', isTeacher, journalController.publishJournal);

// Attachment route with file upload
router.post(
  '/:id/attachment',
  isTeacher,
  (req, res, next) => {
    const uploadMiddleware = upload.single('file');
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
      if (!req.file && req.body.attachment_type !== 'url') {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }
      next();
    });
  },
  journalController.addAttachment
);

module.exports = router;