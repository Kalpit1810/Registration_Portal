import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DBConnection = async () => {
  // const server = "127.0.0.1:27017";
  // const database = "RegistrationPortal1";
  const MONGO_URI = process.env.MONGODB_URL;

  try {
    // await mongoose.connect(MONGO_URI, { useNewUrlParser: true });
    await mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true });
    console.log("DB Connected Successfully!!");
  } catch (err) {
    console.log("Error Connecting Database", err.message);
  }
};

export default DBConnection;