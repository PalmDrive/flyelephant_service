'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const ctx = app.createAnonymousContext();

  const NotificationSchema = new Schema({
    userId: {
      type: Schema.ObjectId,
      index: true,
      require: true,
      ref: 'User',
    },
    sourceId: {
      type: Schema.ObjectId,
      index: true,
    },
    sourceType: {
      type: String,
      index: true,
    },
    type: { // marginCall: 补仓提醒，marginCloseout: 爆仓提醒
      type: String,
      index: true,
    },
    content: String,
    status: {
      type: String,
      index: true,
      default: 'pending',
    },
  }, {
    timestamps: true,
  });

  NotificationSchema.methods.send = async function() {
    ctx.logger.info('Sending notification %s', this.id);
  };

  NotificationSchema.index({ userId: 1, sourceId: 1, sourceType: 1, type: 1 });

  return mongoose.model('Notification', NotificationSchema);
};
