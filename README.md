# staticNodeServer

一个原生nodejs的简单静态资源服务。

## 使用方式

下载安装

```bash
npm i easy-node-static
```

直接引入依赖即可开启一个简易的静态资源服务了。

```javascript
const EasyServe = require('easy-node-static')
const serve = new EasyServe();
serve.start(3001, () => {
  console.log('sever start on 3001')
})
```

全局安装

```bash
npm i easy-node-static -g
```

命令行启动服务

```bash
ns -p <port> -d <directory>
```
