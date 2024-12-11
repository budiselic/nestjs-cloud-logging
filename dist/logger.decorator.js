"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = Logger;
const common_1 = require("@nestjs/common");
const logger_constants_1 = require("./logger.constants");
function Logger(name) {
    return (target, key, index) => {
        name = name || target.constructor.name;
        (0, common_1.Inject)(logger_constants_1.WinstonLoggerService)(target, key, index);
    };
}
//# sourceMappingURL=logger.decorator.js.map