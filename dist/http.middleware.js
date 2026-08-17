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
const crypto_1 = require("crypto");
const logger_constants_1 = require("./logger.constants");
const logger_utils_1 = require("./logger.utils");
const http_utils_1 = require("./http.utils");
const DEFAULT_HTTP_OPTIONS = {
    captureHeaders: true,
    captureBody: true,
    captureUser: true,
    requestIdHeader: 'x-request-id',
    redactedValue: '[REDACTED]',
};
let HttpMiddleware = class HttpMiddleware {
    constructor(logger, loggerOptions) {
        this.logger = logger;
        this.loggerOptions = loggerOptions;
    }
    use(req, res, next) {
        const options = {
            ...DEFAULT_HTTP_OPTIONS,
            ...(this.loggerOptions.http || {}),
        };
        const store = new Map();
        const start = process.hrtime();
        const { ip, method, originalUrl } = req;
        const userAgent = req.get('user-agent') || '';
        const requestIdHeader = options.requestIdHeader.toLowerCase();
        const incomingRequestId = req.headers[requestIdHeader];
        const requestId = Array.isArray(incomingRequestId)
            ? incomingRequestId[0]
            : incomingRequestId;
        store.set('requestId', requestId || (0, crypto_1.randomUUID)());
        store.set('protocol', req.protocol);
        store.set('method', method);
        store.set('originalUrl', originalUrl);
        store.set('params', req.params);
        if (options.captureHeaders) {
            store.set('headers', (0, http_utils_1.redactHeaders)(req.headers, options.redactHeaders, options.redactedValue));
        }
        if (options.captureBody) {
            store.set('body', (0, http_utils_1.redactBody)(req.body, options.redactFields, options.redactedValue));
        }
        if (options.captureUser) {
            const token = (0, http_utils_1.getBearerToken)(req.headers.authorization);
            const user = token ? (0, http_utils_1.decodeJwtPayload)(token) : undefined;
            if (user !== undefined)
                store.set('user', user);
        }
        let responseLogged = false;
        const logResponse = (aborted) => {
            if (responseLogged)
                return;
            responseLogged = true;
            const durationInMilliseconds = (0, logger_utils_1.getDurationInMilliseconds)(start);
            const { statusCode } = res;
            const contentLength = res.get('content-length');
            logger_storage_1.loggerStorage.run(store, () => {
                store.set('contentLength', contentLength);
                store.set('statusCode', statusCode);
                store.set('duration', durationInMilliseconds);
                store.set('params', req.params);
                if (aborted)
                    store.set('aborted', true);
                this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength || '-'} - ${userAgent} ${ip || '-'}`);
            });
        };
        res.once('finish', () => logResponse(false));
        res.once('close', () => {
            if (!res.writableFinished)
                logResponse(true);
        });
        logger_storage_1.loggerStorage.run(store, next);
    }
};
exports.HttpMiddleware = HttpMiddleware;
exports.HttpMiddleware = HttpMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(logger_constants_1.WinstonLoggerService)),
    __param(1, (0, common_1.Inject)(logger_constants_1.WinstonLoggerOptions)),
    __metadata("design:paramtypes", [logger_service_1.LoggerService, Object])
], HttpMiddleware);
//# sourceMappingURL=http.middleware.js.map