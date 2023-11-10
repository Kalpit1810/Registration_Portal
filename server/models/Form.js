import mongoose from "mongoose";

const schema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String,  },
  lastName: { type: String, required: true},
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
  paper1Id: { type: String, required: false },
  paper2Id: { type: String, required: false },
  profile: { type: String, required: true },
  accompanyingPersons: { type: String, required: true },
  isIshmtMember: { type: String, required: true },
  ishmtIDno: { type: String, required: false },
  paymentReferenceNumber: { type: String, required: true, unique: true },
  userID: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true, unique: true,},
  category: {type: String,  required: true},
  fee: {type: String,  required: true},
  accommodationFees: {type: String, default: "", required: false},
  accommodationChoice: {type: String, default: "",  required: false},
  arrivalTime: {type: String, default: "", required: false},
  departureTime: {type: String,default: "",  required: false},
  accommodationPaymentReferenceNumber: {type: String, required: false,unique: true, sparse: true},
  comment: {type: String, required: false},
  date: { type: Date, default : Date.now },
});

export const formModel = mongoose.model("Form", schema);
