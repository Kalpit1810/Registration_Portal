import mongoose from "mongoose";

const schema = mongoose.Schema({
  fileName: { type: String, required: true, unique: true },
  fileData: { type: Buffer, required: true },
  userID : {type : mongoose.Schema.Types.ObjectId, ref: "users", required: true, unique: true},
});

export const paymentFileModel = mongoose.model("PaymentFile", schema);