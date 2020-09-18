import crypto from 'crypto';
import ejs from 'ejs';
import fs, { promises } from 'fs';
import http from 'http';
import mime from 'mime';
import path from 'path';
import url from 'url';

type httpError = Error & { code: string }

const template = fs.readFileSync(path.join(__dirname, 'template.html')).toString();

class Server {
  port: number;
  root: string;
  httpServer: http.Server;

  constructor(root: string = __dirname) {
    this.root = root;
    this.httpServer = http.createServer();
  }

  public start(port: number = 3000, callback: () => void) {
    this.port = port;
    this.httpServer.listen(port, callback);

    this.httpServer.on('error', (err: httpError) => {
      if (err.code === 'EADDRINUSE') {
        this.httpServer.listen(++port);
        this.port = port;
      }
    });

    // 注意this的指向问题
    this.httpServer.on('request', this.sendFile.bind(this));
    this.httpServer.on('request', this.logger);
  }
 
  /**
   * @description: 静态文件服务，访问服务器上的文件，并返回到浏览器。如果访问了一个目录，则列出目录下的所有子节点
   * @Date: 2020-09-18 09:33:20
   */
  private async sendFile(req: http.IncomingMessage, res: http.ServerResponse) {
    const { pathname } = url.parse(decodeURI(req.url));
    let absPath = path.join(this.root, pathname);
    let stat: fs.Stats;
    let filePath: string;
    try {
      stat = await promises.stat(absPath);
    } catch (error) {
      if (pathname.match(/\/api/)) {
        return this.apiHandler(req, res);
      }
      this.error404(res);
    }

    // 访问文件夹的时候默认访问文件夹下的index.html
    if (stat.isDirectory()) {
      filePath = path.join(absPath, 'index.html');
    }
    
    filePath = filePath || absPath;

    try {
      stat = await promises.stat(filePath);
    } catch (error) {
      // index文件不存在，读取当前文件夹下的目录 
      return this.renderTemplate(res, absPath, pathname === '/' ? '' : pathname);
    }
    
    const fileStream = fs.createReadStream(filePath);
    if (this.cacheControl(res, stat, req)) {
      res.setHeader('Content-Type', `${mime.getType(filePath)};charset=utf-8`);
      fileStream.pipe(res);
    }
  }

  private async renderTemplate(res: http.ServerResponse, url: string, parent: string) {
    const dirs = await promises.readdir(url);
    const html = ejs.render(template, { dirs, parent});
    res.setHeader('Content-Type', `text/html;charset=utf-8`);
    res.end(html);
  }

  private apiHandler(req: http.IncomingMessage, res: http.ServerResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'token');
    res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE');
    res.setHeader('Access-Control-Max-Age', 10 * 60);
    res.end('ok'); 
  }

  private cacheControl(res: http.ServerResponse, stat: fs.Stats, req: http.IncomingMessage) {
    // 强制缓存
    res.setHeader('Expires', new Date(Date.now() + 60 * 60 * 1000).toUTCString());
    res.setHeader('Cache-control', 'max-age=3600');
    // 协商缓存
    const lastModified = stat.mtime.toUTCString();
    const ifModifiedSince = req.headers['if-modified-since'];
    const Etag = crypto.createHash('md5').update(stat.size + '').digest('hex');
    const ifNoneMatch = req.headers['if-none-match'];

    res.setHeader('Etag', Etag);
    res.setHeader('Last-Modified', lastModified);
    if (Etag === ifNoneMatch || lastModified === ifModifiedSince) {
      res.statusCode = 304;
      res.end();
      return false;
    }
    return true;
  }

  private error404(res: http.ServerResponse) {
    res.statusCode = 404;
    res.end('404 NOT FOUND');
  }

  private logger(req: http.IncomingMessage, res: http.ServerResponse) {
    const { pathname, query } = url.parse(req.url)
    console.info(`
      request: ${pathname}
      query: ${query}
    `);
  }
}

module.exports = Server;
