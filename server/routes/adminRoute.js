import express from "express";
import {userListControl,userDeleteControl,userDownloadControl} from "../controller/adminControl.js"

const adminRouter = express.Router();

adminRouter.get("/user-list", userListControl);
adminRouter.delete("/delete", userDeleteControl);
adminRouter.get("/download", userDownloadControl);

export default adminRouter;
