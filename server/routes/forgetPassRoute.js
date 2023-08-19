import express from "express";
import { sendOtpControl, verifyOtpControl, changePassControl  } from "../controller/forgetPassControl.js";

const forgetPassRouter = express.Router();

forgetPassRouter.post("/sendotp", sendOtpControl);
forgetPassRouter.post("/verifyotp", verifyOtpControl);
forgetPassRouter.put("/changepass", changePassControl);

export default forgetPassRouter;