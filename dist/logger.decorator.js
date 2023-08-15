"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const common_1 = require("@nestjs/common");
const logger_constants_1 = require("./logger.constants");
function Logger(name) {
    return (target, key, index) => {
        name = name || target.constructor.name;
        (0, common_1.Inject)(logger_constants_1.WinstonLoggerService)(target, key, index);
    };
}
exports.Logger = Logger;
//# sourceMappingURL=logger.decorator.js.map