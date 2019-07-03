## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

## install yarn
```
npm install yarn -g
```

### Development

```bash
$ yarn
$ yarn dev
$ open http://localhost:5000/
```

### Deploy

Deploy to the production:

```bash
$ yarn deploy
```

To restart nginx:

```bash
$ sudo /etc/init.d/nginx restart
```

### npm scripts

- Use `yarn lint` to check code style.
- Use `yarn test` to run unit test.
- Use `yarn autod` to auto detect dependencies upgrade, see [autod](https://www.npmjs.com/package/autod) for more detail.

[egg]: https://eggjs.org

## 部署流程
### 环境依赖
- node版本大于8
- 需要yarn工具 如果没有需要全局安装一下 `npm install -g yarn`

### 部署
- 代码clone到本地
- 执行yarn install 安装项目依赖
- config/config.prod.js 中配置相关配置 比如mongodb地址 / 跨域前端的origin 等
- 执行yarn deploy开启项目

### 若增加ip或者改变ip
- 交易所ip白名单需要改变
- 数据库白名单需要改变
- DNS需要修改

## API 文档
https://shimo.im/docs/1sQ99UVAiT8CneUO/ 「Coincare Api」，可复制链接后用石墨文档 App 或小程序打开

## Models

### User

### Asset

用户资产，包括质押的资产。

### UserWallet

### Order

借贷的订单记录

### Notification

消息记录

### Fee

记录手续费

### AssetTransaction

流水
