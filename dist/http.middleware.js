"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpMiddleware = void 0;
const common_1 = require("@nestjs/common");
const logger_service_1 = require("./logger.service");
const logger_storage_1 = require("./logger.storage");
const uuid_1 = require("uuid");
const logger_constants_1 = require("./logger.constants");
const logger_utils_1 = require("./logger.utils");
const jwt_1 = require("@nestjs/jwt");
let HttpMiddleware = exports.HttpMiddleware = class HttpMiddleware {
    constructor(logger, jwtService) {
        this.logger = logger;
        this.jwtService = jwtService;
    }
    use(req, res, next) {
        const store = new Map();
        const start = process.hrtime();
        const { ip, method, originalUrl } = req;
        const userAgent = req.get('user-agent') || '';
        logger_storage_1.loggerStorage.run(store, () => {
            next();
            const token = req.headers['authorization']?.replace('Bearer ', '');
            if (token) {
                const decodedInfo = this.jwtService.decode(token.replace('Bearer ', ''));
                store.set('user', decodedInfo);
            }
            store.set('requestId', (0, uuid_1.v4)());
            store.set('protocol', req.protocol);
            store.set('method', req.method);
            store.set('originalUrl', req.originalUrl);
            store.set('body', req.body);
            store.set('headers', req.headers);
            store.set('params', req.params);
        });
        res.on('close', () => {
            const durationInMilliseconds = (0, logger_utils_1.getDurationInMilliseconds)(start);
            const { statusCode } = res;
            const contentLength = res.get('content-length');
            logger_storage_1.loggerStorage.run(store, () => {
                store.set('contentLength', contentLength);
                store.set('statusCode', statusCode);
                store.set('duration', durationInMilliseconds);
                store.set('params', req.params);
            });
            this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
        });
    }
};
exports.HttpMiddleware = HttpMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(logger_constants_1.WinstonLoggerService)),
    __metadata("design:paramtypes", [logger_service_1.LoggerService,
        jwt_1.JwtService])
], HttpMiddleware);
//# sourceMappingURL=http.middleware.js.map