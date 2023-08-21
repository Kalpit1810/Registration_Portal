import mongoose from "mongoose";

const schema = mongoose.Schema({
  fileName: { type: String, require: true, unique: true },
  fileData: { type: Buffer, require: true },
  userID : {type : mongoose.Schema.Types.ObjectId, ref: "users", require: true, unique: true},
  date: { type: Date, default : Date.now },
});

export const ishmtFileModel = mongoose.model("IshmtFile", schema);