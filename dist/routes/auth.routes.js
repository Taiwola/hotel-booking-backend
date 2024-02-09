"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const router = (0, express_1.Router)();
router.post('/login', [
    (0, express_validator_1.check)("email", "Email is required").isEmail(),
    (0, express_validator_1.check)("password", "Password with 6 or more characters required").isLength({
        min: 6
    })
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty) {
        return res.status(400).json({
            message: errors.array()
        });
    }
    const { email, password } = req.body;
    try {
        const users = yield user_1.default.findOne({ email: email });
        if (!users) {
            return res.status(400).json({
                message: "invalid credentials"
            });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, users.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "invalid credentials"
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: users._id }, process.env.JWT_SECRET, {
            expiresIn: "1d"
        });
        res.cookie('auth-token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 86400000 });
        res.status(200).json({ userId: users._id });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "internal server error"
        });
    }
}));
router.get('/validate-token', authenticate_1.default, (req, res) => {
    console.log("validate");
    return res.status(200).json({
        userId: req.userId
    });
});
router.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("auth-token", "", {
        expires: new Date(0)
    });
}));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map