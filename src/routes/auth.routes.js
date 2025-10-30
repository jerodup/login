import  Router  from "express-promise-router";
import {  refreshToken, signIn, signUp, verifyEmail, logout, setupAdmin, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
//import { sign } from "jsonwebtoken";

const router = Router();

//router.post("/login", signIn);

router.post("/register", signUp);

router.get("/verify/:token", verifyEmail);

router.post("/signin", signIn )

router.get("/refresh", refreshToken);

router.post("/logout", logout);

router.post("/setup-admin", setupAdmin);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

export default router;