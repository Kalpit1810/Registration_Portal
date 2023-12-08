import express from "express";
import {userListControl,userDeleteControl,userAccommodationDeleteControl,userDownloadControl, userPaymentFileControl, userIshmtIDControl, allIshmtIDControl, allPaymentFileControl,userFormDetailControl, userVerifiedControl, userVerificationEmail, userAccommodationPaymentFileControl, allAccomodationFilesControl} from "../controller/adminControl.js"

const adminRouter = express.Router();

adminRouter.post("/user-list", userListControl);
adminRouter.delete("/userDelete", userDeleteControl);
adminRouter.delete("/userAccommodationDelete", userAccommodationDeleteControl);
adminRouter.post("/download", userDownloadControl);
adminRouter.post("/userPaymentFile", userPaymentFileControl);
adminRouter.post("/userIshmtIDFile", userIshmtIDControl);
adminRouter.post("/userAccommodationPaymentFile", userAccommodationPaymentFileControl);
adminRouter.post("/PaymentFiles", allPaymentFileControl);
adminRouter.post("/IshmtIDFiles", allIshmtIDControl);
adminRouter.post("/userFormDetail", userFormDetailControl);
adminRouter.post("/changeVerified", userVerifiedControl);
adminRouter.post("/sendVerificationEmail", userVerificationEmail);
adminRouter.post("/accommodationPaymentFiles", allAccomodationFilesControl);

export default adminRouter;
