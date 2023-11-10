import mongoose from "mongoose";

const schema = mongoose.Schema({
  fileName: { type: String, required: true, unique: true },
  fileData: { type: Buffer, required: true },
  userID : {type : mongoose.Schema.Types.ObjectId, ref: "users", required: true, unique: true},
  date: { type: Date, default : Date.now },
});

export const accommodationPaymentFileModel = mongoose.model("AccommodationPaymentFile", schema);