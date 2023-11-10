import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userID: {type : mongoose.Schema.Types.ObjectId, ref: "users", required: true, unique: true},
  userEmail: { type: String, ref: "users", required: true, unique: true },
  accommodationChoice: { type: String, default: "None", required: true },
  date: { type: Date, default: Date.now },
});

export const waitingModel = mongoose.model("waiting", schema);
