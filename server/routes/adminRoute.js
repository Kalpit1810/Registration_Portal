import express from "express";
import {userListControl,userDeleteControl,userDownloadControl, userPaymentFileControl, userIshmtIDControl} from "../controller/adminControl.js"

const adminRouter = express.Router();

adminRouter.post("/user-list", userListControl);
adminRouter.delete("/delete", userDeleteControl);
adminRouter.post("/download", userDownloadControl);
adminRouter.post("/userPaymentFile", userPaymentFileControl);
adminRouter.post("/userIshmtIDFile", userIshmtIDControl);

export default adminRouter;
