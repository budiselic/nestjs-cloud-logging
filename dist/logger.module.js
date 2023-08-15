"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WinstonLoggerModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WinstonLoggerModule = void 0;
const common_1 = require("@nestjs/common");
const http_middleware_1 = require("./http.middleware");
const winston_1 = __importDefault(require("winston"));
const logger_constants_1 = require("./logger.constants");
const core_1 = require("@nestjs/core");
const logger_service_1 = require("./logger.service");
const jwt_1 = require("@nestjs/jwt");
const logging_winston_1 = require("@google-cloud/logging-winston");
let WinstonLoggerModule = exports.WinstonLoggerModule = WinstonLoggerModule_1 = class WinstonLoggerModule {
    configure(consumer) {
        consumer.apply(http_middleware_1.HttpMiddleware).forRoutes('*');
    }
    static forRoot(options) {
        const winstonOptions = {
            level: 'debug',
            transports: [
                new logging_winston_1.LoggingWinston({
                    projectId: options.projectId,
                    keyFilename: options.keyFilename,
                }),
            ],
            defaultMeta: {
                framework: 'nestjs',
            },
        };
        return {
            module: WinstonLoggerModule_1,
            imports: [jwt_1.JwtModule.register({})],
            providers: [
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
                    useFactory(logger, a) {
                        return new logger_service_1.LoggerService(logger, a?.constructor.name);
                    },
                },
                {
                    provide: logger_constants_1.WinstonLoggerServiceApp,
                    inject: [logger_constants_1.WinstonLogger, core_1.INQUIRER],
                    useFactory(logger, a) {
                        return new logger_service_1.LoggerService(logger, a?.constructor.name);
                    },
                },
            ],
            exports: [logger_constants_1.WinstonLoggerService, logger_constants_1.WinstonLoggerServiceApp],
            global: options.isGlobal,
        };
    }
};
exports.WinstonLoggerModule = WinstonLoggerModule = WinstonLoggerModule_1 = __decorate([
    (0, common_1.Module)({})
], WinstonLoggerModule);
//# sourceMappingURL=logger.module.js.map