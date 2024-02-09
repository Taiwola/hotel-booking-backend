import {Router, Request, Response} from "express";
import User from "../models/user";
import jwt from "jsonwebtoken"
import { check, validationResult } from "express-validator";

const router = Router();

router.post("/register", [
    check("firstName", "first name is required").isString(),
    check("lastName", "Last name is required").isString(),
    check("email", "email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
        min: 6
    })
],async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()
        })
    }
    try {
        const {email} = req.body;
        let user = await User.findOne({
            email: email
        });

        if (user) {
            return res.status(400).json({
                message: "user aleady exist"
            });
        };

        user = new User(req.body);
        await user.save();

        const token = jwt.sign(
            {userId: user._id}, 
            process.env.JWT_SECRET as string,
            {expiresIn: '1d'}
            );
            res.cookie("auth-token", token, {httpOnly: true, secure: process.env.NODE_ENV === 'prodcution', maxAge: 86400000})
            return res.status(200).json({
                message: "your registered ok"
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "internal server error"
        })
    }
});

export default router;