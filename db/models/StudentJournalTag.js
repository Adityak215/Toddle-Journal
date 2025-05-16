// models/StudentJournalTag.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const StudentJournalTag = sequelize.define('StudentJournalTag', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  journal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'journals',
      key: 'id'
    }
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notification_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'student_journal_tags',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['journal_id', 'student_id']
    }
  ]
});

module.exports = StudentJournalTag;