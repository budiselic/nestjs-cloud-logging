"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDurationInMilliseconds = void 0;
const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e6;
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};
exports.getDurationInMilliseconds = getDurationInMilliseconds;
//# sourceMappingURL=logger.utils.js.map