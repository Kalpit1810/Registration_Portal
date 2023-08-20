import express from "express";
import {feesControl, submitControl} from "../controller/formControl.js";
import multer from "multer";

const formRouter = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'C:\\Dev_Project\\Registration_Portal\\server\\images')
    },
    filename: function (req, file, cb) {
      cb(null, `${uuid()}.cpp`)
    }
  });

formRouter.post("/fee",feesControl);
formRouter.post("/submit",submitControl);

export default formRouter;