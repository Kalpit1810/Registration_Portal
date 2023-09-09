import express from "express";
import { userSignupControl, userLoginControl, userAccessControl, userDetailsDownloadControl } from "../controller/userControl.js";

const userRouter = express.Router();

userRouter.post("/signup", userSignupControl);
userRouter.post("/login", userLoginControl);
userRouter.post("/userAccess", userAccessControl);
userRouter.post("/userDetails", userDetailsDownloadControl);

export default userRouter;