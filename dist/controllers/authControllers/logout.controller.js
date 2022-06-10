"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = void 0;
const logout = (req, _res, next) => {
    req.token = null;
    req.user = null;
    next();
};
exports.logout = logout;
//# sourceMappingURL=logout.controller.js.map