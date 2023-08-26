import mongoose from "mongoose";

const schema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  honorific: { type: String, required: true },
  gender: { type: String, required: true },
  birthYear: { type: String, required: true },
  primaryAffiliation: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumberCode: { type: String, required: true },
  contactNumber: { type: String, required: true, unique: true },
  whatsappNumberCode: { type: String, required: false },
  whatsappNumber: { type: String, required: false },
  paperCount: { type: String, required: true },
  paper1Id: { type: String, required: true },
  paper2Id: { type: String, required: false },
  profile: { type: String, required: true },
  accompanyingPersons: { type: String, required: true },
  isIshmtMember: { type: String, required: true },
  ishmtIDno: { type: String},
  paymentReferenceNumber: { type: String, required: true, unique: true },
  userID: {type: mongoose.Schema.Types.ObjectId, ref: "users", require: true, unique: true,},
  category: {type: String,  require: true},
  fee: {type: String,  require: true},
  date: { type: Date, default : Date.now },
});

export const formModel = mongoose.model("Form", schema);
