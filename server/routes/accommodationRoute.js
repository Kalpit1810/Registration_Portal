import express from "express";
import {
  accommodationListControl,
  accessControl,
  accommodationAddControl,
  accommodationSubmitControl,
  accommodationVerifiedControl,
  assignAccommodationControl,
  fetchAccommodationControl,
  accommodationFeeControl
} from "../controller/accommodationControl.js";
import multer from "multer";

const accommodationRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

accommodationRouter.post("/access", accessControl);
accommodationRouter.post("/waiting-add", accommodationAddControl);
accommodationRouter.post("/accommodation-list", accommodationListControl);
accommodationRouter.put("/verification", accommodationVerifiedControl);
accommodationRouter.put("/assign", assignAccommodationControl);
accommodationRouter.post("/fetch", fetchAccommodationControl);
accommodationRouter.post("/fee", accommodationFeeControl);
accommodationRouter.post(
  "/submit",
  upload.fields([{ name: "accommodationPaymentReceipt" }]),
  accommodationSubmitControl
);

export default accommodationRouter;
3;
