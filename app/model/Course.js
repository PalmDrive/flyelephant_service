'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const CourseSchema = new Schema({
    name: {
      type: String,
      index: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    description: String,
    type: { // course, column
      type: String,
      index: true,
      default: 'course',
    },
    category: { // '数据学院'，'快消学院'，'运营学院'， '管培学院'
      type: String,
      index: true,
    },
    childrenCoursesMap: { // { '0': 'xxxxx', }
      type: Map,
      of: Schema.Types.ObjectId,
    },

    // 多少人已学
    numOfPplLearned: Number,
    coverImgUrl: String,

    // 课程时常，单位秒
    length: Number,
  }, {
    timestamps: true,
  });

  return mongoose.model('Course', CourseSchema);
};
