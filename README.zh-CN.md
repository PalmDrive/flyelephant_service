## 快速入门

<!-- 在此次添加使用文档 -->

如需进一步了解，参见 [egg 文档][egg]。

## 安装yarn
```
npm install yarn -g
```

### 本地开发

```bash
$ yarn
$ yarn dev
$ open http://localhost:5000/
```

### 部署

```bash
$ yarn start
$ yarn stop
```

### 单元测试

- [egg-bin] 内置了 [mocha], [thunk-mocha], [power-assert], [istanbul] 等框架，让你可以专注于写单元测试，无需理会配套工具。
- 断言库非常推荐使用 [power-assert]。
- 具体参见 [egg 文档 - 单元测试](https://eggjs.org/zh-cn/core/unittest)。

### 内置指令

- 使用 `yarn lint` 来做代码风格检查。
- 使用 `yarn test` 来执行单元测试。
- 使用 `yarn autod` 来自动检测依赖更新，详细参见 [autod](https://www.yarnjs.com/package/autod) 。


[egg]: https://eggjs.org
