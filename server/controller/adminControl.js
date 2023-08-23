import { userModel } from "../models/Users.js";
import { ishmtFileModel } from "../models/IshmtFile.js";
import { paymentFileModel } from "../models/PaymentFile.js";
import { formModel } from "../models/Form.js";
import jwt from "jsonwebtoken";

const userListControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  const user = await userModel.findById(userID?.id);

  if (!user?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    const data = await userModel
      .find({ isAdmin: "false" }, { userEmail: 1 })
      .sort({ userEmail: 1 });
    console.log("List Fetched Successfully");
    return res.json({ list: data, success: "true" });
  } catch (error) {
    console.log("Error Catching List", error?.message);
    return res.json({
      error,
      message: "Error Catching List. Please try again",
      success: "false",
    });
  }
};

const userDeleteControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  const user = await userModel.findById(userID?.id);
  if (!user?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }
  try {
    await userModel.findByIdAndDelete(req.body?.userID);

    await ishmtFileModel.findOneAndDelete({
      userID: req.body?.userID,
    });

    await paymentFileModel.findOneAndDelete({
      userID: req.body?.userID,
    });

    await formModel.findOneAndDelete({
      userID: req.body?.userID,
    });

    const data = await userModel
      .find({ isAdmin: "false" }, { userEmail: 1 })
      .sort({ userEmail: 1 });

    console.log("User Deleted Successfully!!");
    return res.json({ list: data, message: "User Deleted.", success: "true" });
  } catch (error) {
    console.log("Error deleting user!", error?.message);
    return res.json({
      error,
      message: "Error deleting user. Please try again",
      success: "false",
    });
  }
};
const userDownloadControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  const user = await userModel.findById(userID?.id);
  if (!user?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }
  const usersData = await formModel.find({}).sort({ fullName: 1 });
  return res.json({ usersData, success: "true" });
};

const userPaymentFileControl = async (req, res) => {
    const token = req.body?.token;
    const userID = req.body?.userID;
    const adminID = jwt.decode(token, process.env.JWT_SECRET);
    const admin = await userModel.findById(adminID?.id);
    if (!admin?.isAdmin) {
      console.log("Unautorized Access!");
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

const userIshmtIDControl = async (req, res) => {
  const token = req.body?.token;
  const userID = req.body?.userID;
  const adminID = jwt.decode(token, process.env.JWT_SECRET);
  const admin = await userModel.findById(adminID?.id);
  if (!admin?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    const fileDocument = await ishmtFileModel.findOne({ userID });

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
    console.log("Ishmt ID File for user sent.");
  } catch (error) {
    console.error("Error retrieving file data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export {
  userListControl,
  userDeleteControl,
  userDownloadControl,
  userPaymentFileControl,
  userIshmtIDControl,
};
