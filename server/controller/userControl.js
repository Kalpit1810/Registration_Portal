import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { userModel } from "../models/Users.js";
import dotenv from "dotenv";

dotenv.config();

const userSignupControl = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  try {
    const user1 = await userModel.findOne({ userEmail });

    // Check if user already Exists.
    if (user1) {
      console.log("User already exist!");
      return res.json({
        message: `User with email ${userEmail} already exists!`,
        success: 'false'
      });
    }

    // Add new user
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newUser = new userModel({
      userEmail,
      userPassword: hashedPassword,
    });
    await newUser.save();

    console.log("User Registered Successfully!!");
    return res.json({ message: "User Registered Successfully!!", success: "true"});
  } catch (error) {
    console.log("Error: ", error.message);
    return res.json({ message: "Some error occured please try again!", success: 'false' });
  }
};

const userLoginControl = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  // check User's existence
  try {
    const user = await userModel.findOne({ userEmail });

    if (!user) {
      console.log(`User does't exist!`);
      return res.json({
        message: `User with email id ${userEmail} doesnot exist!`,success: "false"
      });
    }

    // Check for password validity
    const passwordValid = await bcrypt.compare(userPassword, user?.userPassword);

    if (!passwordValid) {
      console.log("password doesn't match!");
      return res.json({
        message: "Password doesn't match. Recheck Email and Password!",success: "false"
      });
    }

    // create jwt token
    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET);

    console.log("User LoggedIn Successfully!!");
    return res.json({
      token,
      userID: user?._id,
      isAdmin: user?.isAdmin,
      formFilled: user?.formFilled,
      message: "User LoggedIn Successfully!!",
      success: "true"
    });
  } catch (error) {
    console.log("Error: ", error.message);
    return res.json({ message: "Some error occured please try again!", success: "false" });
  }
};

const userAccessControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  const user = await userModel.findById(userID?.id);
  console.log("Access Decided")
  return res.json({ isAdmin: user?.isAdmin, formFilled: user?.formFilled, userEmail : user?.userEmail, isVerified: user?.isVerified });
  // 
};

export { userSignupControl, userLoginControl, userAccessControl };
