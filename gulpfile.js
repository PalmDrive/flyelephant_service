// Run the script
// HTTPS_PROXY=http://127.0.0.1:1087 node script.js

'use strict';

const { Application } = require('egg');

const app = new Application({
  baseDir: process.cwd(),
});

const ctx = app.createAnonymousContext();

async function dev() {
  const id = '5d1b194910c1ff0185996080';
  const assetTxs = await ctx.model.AssetTransaction.find({
    source: ctx.app.mongoose.Types.ObjectId(id),
    sourceType: 'order',
  });

  for (const tx of assetTxs) {
    console.log(tx.toJSON());
  }
}

async function getJwt() {
  const email = 'wyj0912@gmail.com';
  const user = await ctx.model.User.findOne({
    email,
  });
  const jwt = ctx.service.user.getJwtToken(user, 1);

  ctx.logger.info('jwt:', jwt);
}


exports.dev = dev;
exports.getJwt = getJwt;
