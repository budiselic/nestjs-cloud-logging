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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WinstonLoggerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonLoggerModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const logging_winston_1 = require("@google-cloud/logging-winston");
const winston_1 = __importDefault(require("winston"));
const http_middleware_1 = require("./http.middleware");
const logger_constants_1 = require("./logger.constants");
const logger_service_1 = require("./logger.service");
let WinstonLoggerModule = WinstonLoggerModule_1 = class WinstonLoggerModule {
    constructor(options) {
        this.options = options;
    }
    configure(consumer) {
        if (this.options.http === false)
            return;
        consumer.apply(http_middleware_1.HttpMiddleware).forRoutes('*');
    }
    static forRoot(options = {}) {
        const winstonOptions = {
            level: options.level || 'debug',
            transports: [
                new logging_winston_1.LoggingWinston({
                    projectId: options.projectId,
                    keyFilename: options.keyFilename,
                    ...options.transportOptions,
                }),
            ],
            defaultMeta: {
                framework: 'nestjs',
                ...options.defaultMeta,
            },
        };
        return {
            module: WinstonLoggerModule_1,
            providers: [
                {
                    provide: logger_constants_1.WinstonLoggerOptions,
                    useValue: options,
                },
                {
                    provide: logger_constants_1.WinstonLogger,
                    useFactory() {
                        return winston_1.default.createLogger(winstonOptions);
                    },
                },
                {
                    provide: logger_constants_1.WinstonLoggerService,
                    scope: common_1.Scope.TRANSIENT,
                    inject: [logger_constants_1.WinstonLogger, core_1.INQUIRER],
                    useFactory(logger, inquirer) {
                        return new logger_service_1.LoggerService(logger, inquirer?.constructor?.name || logger_service_1.LoggerService.name);
                    },
                },
                {
                    provide: logger_constants_1.WinstonLoggerServiceApp,
                    inject: [logger_constants_1.WinstonLogger],
                    useFactory(logger) {
                        return new logger_service_1.LoggerService(logger, 'Application');
                    },
                },
            ],
            exports: [logger_constants_1.WinstonLoggerService, logger_constants_1.WinstonLoggerServiceApp],
            global: options.isGlobal || false,
        };
    }
};
exports.WinstonLoggerModule = WinstonLoggerModule;
exports.WinstonLoggerModule = WinstonLoggerModule = WinstonLoggerModule_1 = __decorate([
    (0, common_1.Module)({}),
    __param(0, (0, common_1.Inject)(logger_constants_1.WinstonLoggerOptions)),
    __metadata("design:paramtypes", [Object])
], WinstonLoggerModule);
//# sourceMappingURL=logger.module.js.map