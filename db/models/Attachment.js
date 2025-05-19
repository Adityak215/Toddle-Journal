// models/Attachment.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const AttachmentType = sequelize.define('AttachmentType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.ENUM('image', 'video', 'url', 'pdf'),
    allowNull: false
  }
}, {
  tableName: 'attachment_types',
  timestamps: false
});

const Attachment = sequelize.define('Attachment', {
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
  attachment_type_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'attachment_types',
      key: 'id'
    }
  },
  file_path: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'attachments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

Attachment.belongsTo(AttachmentType, { foreignKey: 'attachment_type_id' });

module.exports = { Attachment, AttachmentType };