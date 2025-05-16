// services/notificationService.js
const { Notification, StudentJournalTag, Journal, User } = require('../db/models');
// const axios = require('axios');

/**
 * Service to handle notifications for students tagged in journals
 */
class NotificationService {
  /**
   * Creates notifications for students tagged in a journal
   * @param {number} journalId - The journal ID
   * @param {number[]} studentIds - Array of student IDs
   */
  async notifyStudents(journalId, studentIds) {
    try {
      // Get journal details
      const journal = await Journal.findByPk(journalId, {
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'username']
          }
        ]
      });
      
      if (!journal) {
        throw new Error('Journal not found');
      }
      
      const notificationPromises = [];
      const tagUpdatePromises = [];
      
      // Create notifications for each student
      for (const studentId of studentIds) {
        // Create notification in database
        notificationPromises.push(
          Notification.create({
            journal_id: journalId,
            student_id: studentId,
            read: false
          })
        );
        
        // Update notification_sent flag in StudentJournalTag
        tagUpdatePromises.push(
          StudentJournalTag.update(
            { notification_sent: true },
            { 
              where: { 
                journal_id: journalId,
                student_id: studentId
              }
            }
          )
        );
        
        // If external notification service exists, send notification there too
        if (process.env.NOTIFICATION_SERVICE_URL) {
          try {
            await axios.post(process.env.NOTIFICATION_SERVICE_URL, {
              recipient_id: studentId,
              journal_id: journalId,
              teacher_name: journal.teacher.username,
              message: `You've been tagged in a new journal entry by ${journal.teacher.username}`
            });
          } catch (error) {
            console.error('External notification service error:', error);
            // Continue even if external service fails
          }
        }
      }
      
      // Wait for all database operations to complete
      await Promise.all([...notificationPromises, ...tagUpdatePromises]);
      
      return true;
    } catch (error) {
      console.error('Notification service error:', error);
      return false;
    }
  }
  
  /**
   * Get all notifications for a student
   * @param {number} studentId - The student ID
   * @param {Object} options - Query options (pagination, etc.)
   */
  async getStudentNotifications(studentId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
    
    try {
      const notifications = await Notification.findAndCountAll({
        where: { student_id: studentId },
        include: [
          {
            model: Journal,
            include: [
              {
                model: User,
                as: 'teacher',
                attributes: ['id', 'username']
              }
            ]
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return {
        totalItems: notifications.count,
        totalPages: Math.ceil(notifications.count / limit),
        currentPage: parseInt(page),
        notifications: notifications.rows
      };
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }
  
  /**
   * Mark a notification as read
   * @param {number} notificationId - The notification ID
   * @param {number} studentId - The student ID
   */
  async markAsRead(notificationId, studentId) {
    try {
      const result = await Notification.update(
        { read: true },
        { 
          where: { 
            id: notificationId,
            student_id: studentId
          }
        }
      );
      
      return result[0] > 0;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();