import express from "express";
import {userListControl,userDeleteControl} from "../controller/adminControl.js"

const adminRouter = express.Router();

adminRouter.get("/user-list", userListControl);
adminRouter.delete("/delete", userDeleteControl);

export default adminRouter;
