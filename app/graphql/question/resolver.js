'use strict';

module.exports = {
  Query: {
    async userQuestions(root, { filter, order, page }, ctx) {
      const model = ctx.model.UserQuestion;
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
  },
  Mutation: {

  },
  Question: {
    
  },
  UserQuestion: {
    async question(doc, arg, ctx) {
      return await ctx.model.Question.findById(doc.questionId);
    },

    async ansOptions(doc, arg, ctx) {
      const q = await ctx.model.Question.findById(doc.questionId);
      const indices = doc.ansOptionIndices || [];

      for (const opt of q.options) {
        opt.isSelected = indices.indexOf(opt.index) !== -1;
      }

      return q.options;
    },
  },
};
