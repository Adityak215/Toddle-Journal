// Add to middleware/validate.js
const { validationResult, body } = require('express-validator');

const validateJournal = [
  body('description').notEmpty().trim(),
  body('student_ids').isArray(),
  body('published_at').optional().isISO8601()
];

const validateAttachment = [
  body('attachment_type').isIn(['image', 'video', 'url', 'pdf']),
  // Add more validation rules
];

module.exports = { validateJournal, validateAttachment };