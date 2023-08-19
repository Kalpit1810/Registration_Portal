import express from "express";
import { userSignupControl, userLoginControl } from "../controller/userControl.js";

const userRouter = express.Router();

userRouter.post("/signup", userSignupControl);
userRouter.post("/login", userLoginControl);

export default userRouter;