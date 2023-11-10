import express from "express";
import {
  waitingListControl,
  accessControl,
  waitingAddControl,
  accommodationSubmitControl,
  accommodationVerifiedControl,
  assignAccommodationControl,
  fetchAccommodationControl,
} from "../controller/accommodationControl.js";
import multer from "multer";

const accommodationRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

accommodationRouter.post("/access", accessControl);
accommodationRouter.post("/waiting-add", waitingAddControl);
accommodationRouter.post("/waiting-list", waitingListControl);
accommodationRouter.put("/verification", accommodationVerifiedControl);
accommodationRouter.put("/assign", assignAccommodationControl);
accommodationRouter.post("/fetch", fetchAccommodationControl);
accommodationRouter.post(
  "/submit",
  upload.fields([{ name: "accommodationPaymentReceipt" }]),
  accommodationSubmitControl
);

export default accommodationRouter;
3;
