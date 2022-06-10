"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function auth(req, res, next) {
    const token = req.cookies.jwt || req.token;
    console.log({ tokenAuth: token });
    console.log(req.cookies);
    if (!token) {
        res.status(401).send("Not authorized...");
    }
    else
        next();
}
exports.default = auth;
//# sourceMappingURL=auth.js.map