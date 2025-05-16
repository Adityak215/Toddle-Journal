// models/index.js
const { sequelize } = require('../../config/database');
const User = require('./User');
const Journal = require('./Journal');
const { Attachment, AttachmentType } = require('./Attachment');
const StudentJournalTag = require('./StudentJournalTag');
const Notification = require('./Notification');

// Define associations
User.hasMany(Journal, { foreignKey: 'teacher_id', as: 'journals' });
Journal.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });

Journal.hasMany(Attachment, { foreignKey: 'journal_id', as: 'attachments' });
Attachment.belongsTo(Journal, { foreignKey: 'journal_id' });

Journal.belongsToMany(User, { 
  through: StudentJournalTag,
  foreignKey: 'journal_id',
  otherKey: 'student_id',
  as: 'taggedStudents'
});

User.belongsToMany(Journal, {
  through: StudentJournalTag,
  foreignKey: 'student_id',
  otherKey: 'journal_id',
  as: 'taggedJournals'
});

User.hasMany(Notification, { foreignKey: 'student_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'student_id' });

Journal.hasMany(Notification, { foreignKey: 'journal_id' });
Notification.belongsTo(Journal, { foreignKey: 'journal_id' });

module.exports = {
  sequelize,
  User,
  Journal,
  Attachment,
  AttachmentType,
  StudentJournalTag,
  Notification
};