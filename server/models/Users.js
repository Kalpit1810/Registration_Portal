import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  userPassword: { type: String, required: true },
  formFilled: { type: Boolean, default: false, required: true },
  isAdmin: { type: Boolean, default: false, required: true },
  date: { type: Date, default : Date.now },
});

export const userModel = mongoose.model("users", schema);
