'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const QuestionOptionSchema = new Schema({
    index: Number, // 编号
    content: String,
    isRight: {
      type: Boolean,
      default: false,
    },
  });

  const QuestionSchema = new Schema({
    content: {
      type: String,
      index: true,
    },
    options: {
      type: [ QuestionOptionSchema ],
    },
    type: { // text, single_choice, multi_choice
      type: String,
      index: true,
      default: 'text',
    },
    requireAttachment: {
      type: Boolean,
      index: true,
      default: false,
    },
  }, {
    timestamps: true,
  });

  return mongoose.model('Question', QuestionSchema);
};
