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
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const authenticate_1 = __importDefault(require("../middleware/authenticate"));
const router = (0, express_1.Router)();
router.get("/me", authenticate_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const user = yield user_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }
        ;
        return res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}));
router.post("/register", [
    (0, express_validator_1.check)("firstName", "first name is required").isString(),
    (0, express_validator_1.check)("lastName", "Last name is required").isString(),
    (0, express_validator_1.check)("email", "email is required").isEmail(),
    (0, express_validator_1.check)("password", "Password with 6 or more characters required").isLength({
        min: 6
    })
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()
        });
    }
    try {
        const { email } = req.body;
        let user = yield user_1.default.findOne({
            email: email
        });
        if (user) {
            return res.status(400).json({
                message: "user aleady exist"
            });
        }
        ;
        user = new user_1.default(req.body);
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie("auth-token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'prodcution', maxAge: 86400000 });
        return res.status(200).json({
            message: "your registered ok"
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "internal server error"
        });
    }
}));
exports.default = router;
//# sourceMappingURL=users.route.js.map