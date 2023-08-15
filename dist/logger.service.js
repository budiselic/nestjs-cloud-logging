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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerService = void 0;
const common_1 = require("@nestjs/common");
const winston_1 = __importDefault(require("winston"));
const logger_storage_1 = require("./logger.storage");
const uuid_1 = require("uuid");
let LoggerService = exports.LoggerService = class LoggerService extends common_1.ConsoleLogger {
    constructor(logger, inquirer) {
        super();
        this.logger = logger;
        this.inquirer = inquirer;
        this.metadata = {
            loggerInstanceId: (0, uuid_1.v4)().split('-')[0],
        };
        this.meta = new Map();
        this.metadata.context = this.inquirer || this.constructor.name;
        this.meta.set('context', this.inquirer || this.constructor.name);
        super.setContext(this.metadata.context);
    }
    error(message, stack, context) {
        super.error(message, stack, context);
        this.metadata.context = context;
        this.metadata.stack = stack;
        this.store = logger_storage_1.loggerStorage.getStore();
        if (this.store)
            Object.assign(this.metadata, Object.fromEntries(this.store));
        this.logger.error(message, this.metadata);
    }
    log(message, context) {
        super.log(message);
        this.store = logger_storage_1.loggerStorage.getStore();
        if (this.store)
            Object.assign(this.metadata, Object.fromEntries(this.store));
        this.logger.info(message, this.metadata);
    }
    debug(message, context) {
        super.debug(message);
        this.store = logger_storage_1.loggerStorage.getStore();
        if (this.store)
            Object.assign(this.metadata, Object.fromEntries(this.store));
        this.logger.debug(message, this.metadata);
    }
    warn(message, context) {
        super.warn(message);
        this.store = logger_storage_1.loggerStorage.getStore();
        if (this.store)
            Object.assign(this.metadata, Object.fromEntries(this.store));
        this.logger.warn(message, this.metadata);
    }
    verbose(message, context) {
        super.verbose(message);
        this.store = logger_storage_1.loggerStorage.getStore();
        if (this.store)
            Object.assign(this.metadata, Object.fromEntries(this.store));
        this.logger.verbose(message, this.metadata);
    }
};
exports.LoggerService = LoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [winston_1.default.Logger, String])
], LoggerService);
//# sourceMappingURL=logger.service.js.map