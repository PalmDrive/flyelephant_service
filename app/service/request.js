'use strict';

const Service = require('egg').Service;

class RequestService extends Service {
  async parseQuery(ctx, model, sort) {
    return Object.assign(
      this.parseQueryCreatedAt(ctx),
      await this.parseQueryStartingAfter(ctx, model),
      await this.parseQueryEndingBefore(ctx, model, sort)
    );
  }

  parseQueryCreatedAt(ctx) {
    const filter = {};
    // Handle creatdAt query
    let createdAt = ctx.query.createdAt;

    if (createdAt) {
      if (typeof createdAt === 'string') {
        createdAt = new Date(Number(createdAt));
      } else {
        // for (const key in createdAt) {
        //   const time = Number(createdAt[key]);
        //   createdAt[key] = new Date(time);
        // }
      }
      filter.createdAt = createdAt;
    }
    return filter;
  }

  async parseQueryEndingBefore(ctx, model, sort) {
    const filter = {};
    if (ctx.query.ending_before) {
      const t = await model.findById(ctx.query.ending_before);
      if (!t) {
        ctx.status = 404;
        ctx.body = { type: 'invalid_request_error', message: 'Params ending_before is invalid' };
        return;
      }
      filter.createdAt = {
        $gt: t.createdAt,
      };
      sort.createdAt = 1;
    }
    return filter;
  }

  async parseQueryStartingAfter(ctx, model) {
    const filter = {};
    if (ctx.query.starting_after) {
      const t = await model.findById(ctx.query.starting_after);
      if (!t) {
        ctx.status = 404;
        ctx.body = { type: 'invalid_request_error', message: 'Params starting_after is invalid' };
        return;
      }
      filter.createdAt = {
        $lt: t.createdAt,
      };
    }
    return filter;
  }
}

module.exports = RequestService;
