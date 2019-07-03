'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserQuestionSchema = new Schema({
    courseId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      index: true,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      index: true,
      required: true,
    },
    ansText: String,
    ansOptionIndices: [ Number ],
    attachmentUrls: [ String ],
  }, {
    timestamps: true,
  });

  UserQuestionSchema.index({ userId: 1, questionId: 1 }, { unique: true });
  UserQuestionSchema.index({ userId: 1, courseId: 1 });

  return mongoose.model('UserQuestion', UserQuestionSchema);
};
