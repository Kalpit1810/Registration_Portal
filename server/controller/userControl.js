import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { userModel } from "../models/Users.js";
import dotenv from "dotenv";
import { formModel } from "../models/Form.js";
import { ishmtFileModel } from "../models/IshmtFile.js";
import { paymentFileModel } from "../models/PaymentFile.js";

dotenv.config();

const userSignupControl = async (req, res) => {
  const { userEmail, userPassword } = req.body;
  // console.log(userEmail);
  try {
    const user1 = await userModel.findOne({ userEmail });

    // Check if user already Exists.
    if (user1) {
      console.log("User already exist!");
      return res.json({
        message: `User with email ${userEmail} already exists!`,
        success: "false",
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
    return res.json({message: "User Registered Successfully!!", success: "true", });
  } catch (error) {
    await userModel.findOneAndDelete({ userEmail });
    console.log("Error: ", error.message);
    return res.json({message: "Some error occured please try again!", success: "false", });
  }
};
const userDetailsDownloadControl = async (req, res) => {
  const token = req.body?.token;
  const email = req.body.email;

  try {
    const userID = jwt.decode(token, process.env.JWT_SECRET);
    const user = await userModel.findById(userID?.id);

    if (!user) {
      return res.status(404).json({
        message: "User Not found",
        success: "false",
      });
    }

    if (user.userEmail !== email) {
      console.log("Unauthorized Access!");
      return res.status(401).json({
        message: "Unauthorized Access",
        success: "false",
      });
    }

    const usersData = await formModel.find({ email: email });
    return res.status(200).json({ usersData, success: true });
  } catch (error) {
    console.error("Error: ", error.message);
    return res.status(500).json({
      message: "Some error occurred, please try again!",
      success: "false",
    });
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
        message: `User with email id ${userEmail} doesnot exist!`,
        success: "false",
      });
    }

    // Check for password validity
    const passwordValid = await bcrypt.compare(
      userPassword,
      user?.userPassword
    );

    if (!passwordValid) {
      console.log("password doesn't match!");
      return res.json({
        message: "Password doesn't match. Recheck Email and Password!",
        success: "false",
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
      success: "true",
    });
  } catch (error) {
    console.log("Error: ", error.message);
    return res.json({
      message: "Some error occured please try again!",
      success: "false",
    });
  }
};

const userAccessControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  const user = await userModel.findById(userID?.id);
  console.log("Access Decided");
  return res.json({
    isAdmin: user?.isAdmin,
    formFilled: user?.formFilled,
    userEmail: user?.userEmail,
    isVerified: user?.isVerified,
  });
  //
};

const userIshmtIDControl = async (req, res) => {
  const token = req.body?.token;
  // const userID = req.body?.userID;
  const userID = jwt.decode(token, process.env.JWT_SECRET)?.id;
  // const user = await userModel.findById(userID?.id);
  if (!userID) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    const fileDocument = await ishmtFileModel.findOne({ userID });

    if (!fileDocument) {
      console.log("File not found");
      return res
        .status(404)
        .json({ message: "File not found", success: "false" });
    }

    const fileData = fileDocument?.fileData;

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileDocument?.fileName}`
    );
    res.send(fileData);
    console.log("Ishmt ID File for user sent.");
  } catch (error) {
    console.error("Error retrieving file data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const userPaymentFileControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET)?.id; // Extract the 'id' field

  if (!userID) {
    console.log("Unauthorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    const fileDocument = await paymentFileModel.findOne({ userID });

    if (!fileDocument) {
      console.log("File not found");
      return res.status(404).json({ message: "File not found" });
    }

    const fileData = fileDocument?.fileData;

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileDocument?.fileName}`
    );
    res.send(fileData);
    console.log("Payment File for user sent.");
  } catch (error) {
    console.error("Error retrieving file data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export {
  userSignupControl,
  userLoginControl,
  userAccessControl,
  userDetailsDownloadControl,
  userIshmtIDControl,
  userPaymentFileControl
};
