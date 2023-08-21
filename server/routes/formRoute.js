import express from "express";
import {feesControl, submitControl} from "../controller/formControl.js";
import multer from "multer";

const formRouter = express.Router();

const storage = multer.memoryStorage()
const upload = multer({storage});

formRouter.post("/fee",feesControl);
formRouter.post("/submit",upload.fields([{name : "ishmtIDFile"}, {name : "paymentReceipt"}]),submitControl);

export default formRouter;