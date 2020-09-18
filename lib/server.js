"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var ejs_1 = __importDefault(require("ejs"));
var fs_1 = __importStar(require("fs"));
var http_1 = __importDefault(require("http"));
var mime_1 = __importDefault(require("mime"));
var path_1 = __importDefault(require("path"));
var url_1 = __importDefault(require("url"));
var template = fs_1.default.readFileSync(path_1.default.join(__dirname, 'template.html')).toString();
var Server = /** @class */ (function () {
    function Server(root) {
        if (root === void 0) { root = __dirname; }
        this.root = root;
        this.httpServer = http_1.default.createServer();
    }
    Server.prototype.start = function (port, callback) {
        var _this = this;
        if (port === void 0) { port = 3000; }
        this.port = port;
        this.httpServer.listen(port, callback);
        this.httpServer.on('error', function (err) {
            if (err.code === 'EADDRINUSE') {
                _this.httpServer.listen(++port);
                _this.port = port;
            }
        });
        // 注意this的指向问题
        this.httpServer.on('request', this.sendFile.bind(this));
        this.httpServer.on('request', this.logger);
    };
    /**
     * @description: 静态文件服务，访问服务器上的文件，并返回到浏览器。如果访问了一个目录，则列出目录下的所有子节点
     * @Date: 2020-09-18 09:33:20
     */
    Server.prototype.sendFile = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var pathname, absPath, stat, filePath, error_1, error_2, fileStream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pathname = url_1.default.parse(decodeURI(req.url)).pathname;
                        absPath = path_1.default.join(this.root, pathname);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fs_1.promises.stat(absPath)];
                    case 2:
                        stat = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        if (pathname.match(/\/api/)) {
                            return [2 /*return*/, this.apiHandler(req, res)];
                        }
                        this.error404(res);
                        return [3 /*break*/, 4];
                    case 4:
                        // 访问文件夹的时候默认访问文件夹下的index.html
                        if (stat.isDirectory()) {
                            filePath = path_1.default.join(absPath, 'index.html');
                        }
                        filePath = filePath || absPath;
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, fs_1.promises.stat(filePath)];
                    case 6:
                        stat = _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        // index文件不存在，读取当前文件夹下的目录 
                        return [2 /*return*/, this.renderTemplate(res, absPath, pathname === '/' ? '' : pathname)];
                    case 8:
                        fileStream = fs_1.default.createReadStream(filePath);
                        if (this.cacheControl(res, stat, req)) {
                            res.setHeader('Content-Type', mime_1.default.getType(filePath) + ";charset=utf-8");
                            fileStream.pipe(res);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.renderTemplate = function (res, url, parent) {
        return __awaiter(this, void 0, void 0, function () {
            var dirs, html;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fs_1.promises.readdir(url)];
                    case 1:
                        dirs = _a.sent();
                        html = ejs_1.default.render(template, { dirs: dirs, parent: parent });
                        res.setHeader('Content-Type', "text/html;charset=utf-8");
                        res.end(html);
                        return [2 /*return*/];
                }
            });
        });
    };
    Server.prototype.apiHandler = function (req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'token');
        res.setHeader('Access-Control-Allow-Methods', 'PUT,DELETE');
        res.setHeader('Access-Control-Max-Age', 10 * 60);
        res.end('ok');
    };
    Server.prototype.cacheControl = function (res, stat, req) {
        // 强制缓存
        res.setHeader('Expires', new Date(Date.now() + 60 * 60 * 1000).toUTCString());
        res.setHeader('Cache-control', 'max-age=3600');
        // 协商缓存
        var lastModified = stat.mtime.toUTCString();
        var ifModifiedSince = req.headers['if-modified-since'];
        var Etag = crypto_1.default.createHash('md5').update(stat.size + '').digest('hex');
        var ifNoneMatch = req.headers['if-none-match'];
        res.setHeader('Etag', Etag);
        res.setHeader('Last-Modified', lastModified);
        if (Etag === ifNoneMatch || lastModified === ifModifiedSince) {
            res.statusCode = 304;
            res.end();
            return false;
        }
        return true;
    };
    Server.prototype.error404 = function (res) {
        res.statusCode = 404;
        res.end('404 NOT FOUND');
    };
    Server.prototype.logger = function (req, res) {
        var _a = url_1.default.parse(req.url), pathname = _a.pathname, query = _a.query;
        console.info("\n      request: " + pathname + "\n      query: " + query + "\n    ");
    };
    return Server;
}());
module.exports = Server;
