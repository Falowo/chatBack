"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = void 0;
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.status(403).send("User not authenticated");
    }
};
exports.ensureAuthenticated = ensureAuthenticated;
//# sourceMappingURL=security.config.js.map