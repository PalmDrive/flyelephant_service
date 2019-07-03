'use strict';

module.exports = {
  Query: {
    async courses(root, { filter, order, page }, ctx) {
      const model = ctx.model.Course;
      order = Object.assign({ createdAt: -1 }, order);
      page = Object.assign({ num: 1, size: 10 }, page);
      filter = filter || {};

      return await model.find(filter)
        .sort(order)
        .skip((page.num - 1) * page.size)
        .limit(page.size);
    },

    async coursesCount(root, { filter }, ctx) {
      const model = ctx.model.Course;
      filter = filter || {};

      const docs = await model.find(filter)
        .select('_id');
      return docs.length;
    },

    async userCourses(root, { filter, order, page }, ctx) {
      const model = ctx.model.UserCourse;
      order = Object.assign({ createdAt: -1 }, order);
      page = Object.assign({ num: 1, size: 10 }, page);
      filter = filter || {};

      const user = ctx.state.user;

      if (!user.isAdmin) filter.userId = user._id;

      return await model.find(filter)
        .sort(order)
        .skip((page.num - 1) * page.size)
        .limit(page.size);
    },

    async userCoursesCount(root, { filter }, ctx) {
      const model = ctx.model.UserCourse;
      filter = filter || {};

      const user = ctx.state.user;

      if (!user.isAdmin) filter.userId = user._id;

      const docs = await model.find(filter)
        .select('_id');
      return docs.length;
    },
  },
  Mutation: {

  },
  Course: {
    async teacher(doc, arg, ctx) {
      return await ctx.model.User.findById(doc.teacherId);
    },

    async childrenCourses(doc, arg, ctx) {
      const courses = [];
      const map = doc.chidrenCoursesMap;
      const keys = map ? map.keys.map(k => Number(k))
        .sort((a, b) => a - b > 0) : [];

      for (const key of keys) {
        const id = map.get(String(key));
        courses.push(await ctx.model.Course.findById(id));
      }

      return courses;
    },

    async questions(doc, arg, ctx) {
      const questions = [];
      const map = doc.questionsMap;
      const keys = map ? map.keys.map(k => Number(k))
        .sort((a, b) => a - b > 0) : [];

      for (const key of keys) {
        const id = map.get(String(key));
        const q = await ctx.model.Question.findById(id);
        q.index = key;
        questions.push(q);
      }

      return questions;
    },

    async numOfPplLearnedDisplay(doc, arg, ctx) {
      if (doc.numOfPplLearned !== null && typeof doc.numOfPplLearned !== 'undefined') {
        return doc.numOfPplLearned;
      }

      const uc = await ctx.model.UserCourse.find({
        courseId: doc._id,
      }).select('_id');

      return uc.length;
    },
  },
  UserCouse: {
    async learnedPercent(doc, arg, ctx) {
      const course = await ctx.model.Course.findById(doc.courseId);

      return 100 * doc.learnedDuration / course.length;
    },

    async course(doc, arg, ctx) {
      return await ctx.model.Course.findById(doc.courseId);
    }
  }
}