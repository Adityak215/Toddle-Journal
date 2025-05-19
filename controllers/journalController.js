// controllers/journalController.js (continued)
const { Op } = require('sequelize');
const { 
  Journal, 
  User, 
  Attachment, 
  AttachmentType,
  StudentJournalTag,
  Notification
} = require('../db/models');
const notificationService = require('../services/notificationService');

// Create a new journal
exports.createJournal = async (req, res) => {
  try {
    const { description, student_ids, published_at } = req.body;
    const teacher_id = req.user.id;
    
    // Validate input
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Journal description is required'
      });
    }
    
    // Create journal
    const journal = await Journal.create({
      teacher_id,
      description,
      published_at: published_at || null
    });
    
    // Tag students if provided
    if (student_ids && Array.isArray(student_ids) && student_ids.length > 0) {
      // Verify all IDs are for actual students
      const students = await User.findAll({
        where: {
          id: student_ids,
          role: 'student'
        }
      });
      
      const validStudentIds = students.map(student => student.id);
      
      // Create tags for valid student IDs
      if (validStudentIds.length > 0) {
        const tagPromises = validStudentIds.map(student_id => 
          StudentJournalTag.create({
            journal_id: journal.id,
            student_id
          })
        );
        
        await Promise.all(tagPromises);
        
        // Send notifications to tagged students if journal is published
        if (published_at && new Date(published_at) <= new Date()) {
          notificationService.notifyStudents(journal.id, validStudentIds);
        }
      }
    }
    
    return res.status(201).json({
      success: true,
      message: 'Journal created successfully',
      data: journal
    });
    
  } catch (error) {
    console.error('Journal creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a journal
exports.updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, student_ids, published_at } = req.body;
    const teacher_id = req.user.id;
    
    // Find the journal
    const journal = await Journal.findOne({
      where: { id, teacher_id }
    });
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found or you do not have permission to update it'
      });
    }
    
    // Update journal fields
    if (description) journal.description = description;
    if (published_at !== undefined) journal.published_at = published_at;
    
    await journal.save();
    
    // Update tagged students if provided
    if (student_ids && Array.isArray(student_ids)) {
      // Remove existing tags
      await StudentJournalTag.destroy({
        where: { journal_id: id }
      });
      
      // Add new tags
      if (student_ids.length > 0) {
        // Verify all IDs are for actual students
        const students = await User.findAll({
          where: {
            id: student_ids,
            role: 'student'
          }
        });
        
        const validStudentIds = students.map(student => student.id);
        
        // Create tags for valid student IDs
        if (validStudentIds.length > 0) {
          const tagPromises = validStudentIds.map(student_id => 
            StudentJournalTag.create({
              journal_id: journal.id,
              student_id
            })
          );
          
          await Promise.all(tagPromises);
          
          // Send notifications to tagged students if journal is published
          if (published_at && new Date(published_at) <= new Date()) {
            notificationService.notifyStudents(journal.id, validStudentIds);
          }
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Journal updated successfully',
      data: journal
    });
    
  } catch (error) {
    console.error('Journal update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a journal
exports.deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher_id = req.user.id;
    
    // Find the journal
    const journal = await Journal.findOne({
      where: { id, teacher_id }
    });
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found or you do not have permission to delete it'
      });
    }
    
    // Delete the journal (associated records will be deleted via cascade)
    await journal.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Journal deleted successfully'
    });
    
  } catch (error) {
    console.error('Journal deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Publish a journal
exports.publishJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher_id = req.user.id;
    
    // Find the journal
    const journal = await Journal.findOne({
      where: { id, teacher_id },
      include: [
        {
          model: User,
          as: 'taggedStudents',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found or you do not have permission to publish it'
      });
    }
    
    // Set the published_at date to now
    journal.published_at = new Date();
    await journal.save();
    
    // Send notifications to tagged students
    if (journal.taggedStudents && journal.taggedStudents.length > 0) {
      const studentIds = journal.taggedStudents.map(student => student.id);
      await notificationService.notifyStudents(journal.id, studentIds);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Journal published successfully',
      data: journal
    });
    
  } catch (error) {
    console.error('Journal publish error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get journal feed for teacher or student
exports.getJournalFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    const currentDate = new Date();
    
    let journals;
    
    if (role === 'teacher') {
      // Teacher can see all journals they created
      journals = await Journal.findAndCountAll({
        where: { teacher_id: userId },
        include: [
          {
            model: User,
            as: 'taggedStudents',
            attributes: ['id', 'username'],
            through: { attributes: [] }
          },
          {
            model: Attachment,
            as: 'attachments',
            include: [AttachmentType]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } else if (role === 'student') {
      // Students can see only journals they are tagged in AND are published
      journals = await Journal.findAndCountAll({
        include: [
          {
            model: User,
            as: 'taggedStudents',
            attributes: ['id', 'username'],
            through: { attributes: [] },
            where: { id: userId }
          },
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'username']
          },
          {
            model: Attachment,
            as: 'attachments',
            include: [AttachmentType]
          }
        ],
        where: {
          published_at: {
            [Op.not]: null,
            [Op.lte]: currentDate
          }
        },
        order: [['published_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Invalid role'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Journal feed retrieved successfully',
      data: {
        totalItems: journals.count,
        totalPages: Math.ceil(journals.count / limit),
        currentPage: parseInt(page),
        journals: journals.rows
      }
    });
    
  } catch (error) {
    console.error('Get journal feed error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add attachment to a journal
exports.addAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher_id = req.user.id;
    
    // Find the journal
    const journal = await Journal.findOne({
      where: { id, teacher_id }
    });
    
    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal not found or you do not have permission to update it'
      });
    }
    
    const { attachment_type } = req.body;
    
    if (!attachment_type) {
      return res.status(400).json({
        success: false,
        message: 'Attachment type is required'
      });
    }
    
    // Check if attachment type is valid
    const attachmentType = await AttachmentType.findOne({
      where: { name: attachment_type }
    });
    
    if (!attachmentType) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attachment type'
      });
    }
    
    let filePath;
    
    if (attachment_type === 'url') {
      // For URL attachments
      filePath = req.body.url;
      
      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'URL is required for URL attachment type'
        });
      }
    } else {
      // For file attachments (image, video, pdf)
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File is required'
        });
      }
      
      filePath = req.file.path;
    }
    
    // Create attachment
    const attachment = await Attachment.create({
      journal_id: journal.id,
      attachment_type_id: attachmentType.id,
      file_path: filePath
    });
    
    return res.status(201).json({
      success: true,
      message: 'Attachment added successfully',
      data: attachment
    });
    
  } catch (error) {
    console.error('Add attachment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};