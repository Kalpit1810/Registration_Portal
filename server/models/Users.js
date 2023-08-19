import mongoose from "mongoose";

const schema  = new mongoose.Schema({
    userEmail: { type: String, required: true, unique: true },
    userPassword: { type: String, required: true },
    isAdmin: {type: Boolean, required: true}
});

export const userModel = mongoose.model("users",schema);