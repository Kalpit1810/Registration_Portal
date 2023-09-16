import express from "express";
import { userSignupControl, userLoginControl, userAccessControl, userDetailsDownloadControl, userIshmtIDControl, userPaymentFileControl } from "../controller/userControl.js";

const userRouter = express.Router();

userRouter.post("/signup", userSignupControl);
userRouter.post("/login", userLoginControl);
userRouter.post("/userAccess", userAccessControl);
userRouter.post("/userDetails", userDetailsDownloadControl);
userRouter.post("/ishmtID", userIshmtIDControl);
userRouter.post("/paymentReciept", userPaymentFileControl);

export default userRouter;