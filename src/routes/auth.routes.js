import  Router  from "express-promise-router";
import {  refreshToken, signIn, signUp, verifyEmail, logout } from "../controllers/auth.controller.js";
//import { sign } from "jsonwebtoken";

const router = Router();

//router.post("/login", signIn);

router.post("/register", signUp);

router.get("/verify/:token", verifyEmail);

router.post("/signin", signIn )

router.get("/refresh", refreshToken);

router.post("/logout", logout);

export default router;