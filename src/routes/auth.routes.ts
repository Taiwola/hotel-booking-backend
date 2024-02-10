import { Router, Request, Response } from "express";
import { check, validationResult } from "express-validator";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/authenticate";

const router = Router();



router.post('/login', [
    check("email", "Email is required").isEmail(),
    check("password", "Password with 6 or more characters required").isLength({
        min: 6
    })
], async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty) {
        return res.status(400).json({
            message: errors.array()
        })
    }

    const {email, password} = req.body;

    try {
        const users = await User.findOne({email: email});
        if(!users){
            return res.status(400).json({
                message: "invalid credentials"
            });
        }

        const isMatch = await bcrypt.compare(password, users.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "invalid credentials"
            });
        }

        const token = jwt.sign({userId: users._id}, process.env.JWT_SECRET as string, {
            expiresIn: "1d"
        });

        res.cookie('auth-token', token, {httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 86400000});
        res.status(200).json({userId: users._id})
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "internal server error"
        })
    }
})


router.get('/validate-token', verifyToken, (req:Request, res:Response) => {
    return res.status(200).json({
        userId: req.userId
    })
});

router.post('/logout', async (req: Request, res: Response) => {
    console.log('sign-out')
    res.cookie("auth-token", "", {
        expires: new Date(0)
    })

    res.status(200).json({
        message: "request completed"
    })
})

export default router;