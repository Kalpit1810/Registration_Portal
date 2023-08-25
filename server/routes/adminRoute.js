import express from "express";
import {userListControl,userDeleteControl,userDownloadControl, userPaymentFileControl, userIshmtIDControl, allIshmtIDControl, allPaymentFileControl,userFormDetailControl} from "../controller/adminControl.js"

const adminRouter = express.Router();

adminRouter.post("/user-list", userListControl);
adminRouter.delete("/delete", userDeleteControl);
adminRouter.post("/download", userDownloadControl);
adminRouter.post("/userPaymentFile", userPaymentFileControl);
adminRouter.post("/userIshmtIDFile", userIshmtIDControl);
adminRouter.post("/PaymentFiles", allPaymentFileControl);
adminRouter.post("/IshmtIDFiles", allIshmtIDControl);
adminRouter.post("/userFormDetail", userFormDetailControl);

export default adminRouter;
