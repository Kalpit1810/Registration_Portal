import express from "express";
import {userListControl,userDeleteControl,userDownloadControl} from "../controller/adminControl.js"

const adminRouter = express.Router();

adminRouter.post("/user-list", userListControl);
adminRouter.delete("/delete", userDeleteControl);
adminRouter.post("/download", userDownloadControl);

export default adminRouter;
