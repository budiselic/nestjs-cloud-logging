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
var LoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const logger_storage_1 = require("./logger.storage");
let LoggerService = LoggerService_1 = class LoggerService extends common_1.ConsoleLogger {
    constructor(logger, context = LoggerService_1.name) {
        super(context);
        this.logger = logger;
        this.loggerInstanceId = (0, crypto_1.randomUUID)().split('-')[0];
    }
    error(message, ...optionalParams) {
        if (!this.isLevelEnabled('error'))
            return;
        super.error(message, ...optionalParams);
        const { context, stack } = this.getErrorContextAndStack(optionalParams);
        this.logger.error(this.serializeMessage(message), this.getMetadata(context, stack));
    }
    log(message, ...optionalParams) {
        if (!this.isLevelEnabled('log'))
            return;
        super.log(message, ...optionalParams);
        this.logger.info(this.serializeMessage(message), this.getMetadata(this.getContext(optionalParams)));
    }
    debug(message, ...optionalParams) {
        if (!this.isLevelEnabled('debug'))
            return;
        super.debug(message, ...optionalParams);
        this.logger.debug(this.serializeMessage(message), this.getMetadata(this.getContext(optionalParams)));
    }
    warn(message, ...optionalParams) {
        if (!this.isLevelEnabled('warn'))
            return;
        super.warn(message, ...optionalParams);
        this.logger.warn(this.serializeMessage(message), this.getMetadata(this.getContext(optionalParams)));
    }
    verbose(message, ...optionalParams) {
        if (!this.isLevelEnabled('verbose'))
            return;
        super.verbose(message, ...optionalParams);
        this.logger.verbose(this.serializeMessage(message), this.getMetadata(this.getContext(optionalParams)));
    }
    fatal(message, ...optionalParams) {
        if (!this.isLevelEnabled('fatal'))
            return;
        super.fatal(message, ...optionalParams);
        this.logger.error(this.serializeMessage(message), this.getMetadata(this.getContext(optionalParams), undefined, 'fatal'));
    }
    getContext(optionalParams) {
        const context = optionalParams.at(-1);
        return typeof context === 'string' ? context : undefined;
    }
    serializeMessage(message) {
        if (typeof message === 'string')
            return message;
        if (message instanceof Error)
            return message.stack || message.message;
        try {
            return (JSON.stringify(message, (_key, value) => typeof value === 'bigint' ? value.toString() : value) || String(message));
        }
        catch {
            return String(message);
        }
    }
    getErrorContextAndStack(optionalParams) {
        if (optionalParams.length === 0)
            return {};
        if (optionalParams.length === 1) {
            const value = optionalParams[0];
            if (typeof value !== 'string')
                return {};
            return this.isStack(value) ? { stack: value } : { context: value };
        }
        const context = this.getContext(optionalParams);
        const stackCandidate = optionalParams[optionalParams.length - 2];
        const stack = typeof stackCandidate === 'string' ? stackCandidate : undefined;
        return { context, stack };
    }
    isStack(value) {
        return /^(.)+\n\s+at .+:\d+:\d+/.test(value);
    }
    getMetadata(context, stack, nestLevel) {
        const store = logger_storage_1.loggerStorage.getStore();
        const metadata = {
            ...(store ? Object.fromEntries(store) : {}),
            loggerInstanceId: this.loggerInstanceId,
            context: context || this.context || LoggerService_1.name,
        };
        if (stack)
            metadata.stack = stack;
        if (nestLevel)
            metadata.nestLevel = nestLevel;
        return metadata;
    }
};
exports.LoggerService = LoggerService;
exports.LoggerService = LoggerService = LoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function, Object])
], LoggerService);
//# sourceMappingURL=logger.service.js.map