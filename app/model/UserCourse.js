'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserCourseSchema = new Schema({
    courseId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // 已经学习的时间，单位秒
    learnedDuration: {
      type: Number,
      default: 0,
    },
  }, {
    timestamps: true,
  });

  UserCourseSchema.index({ courseId: 1, userId: 1 }, { unique: true });

  return mongoose.model('UserCourse', UserCourseSchema);
};
