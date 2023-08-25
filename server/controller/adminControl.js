import { userModel } from "../models/Users.js";
import { ishmtFileModel } from "../models/IshmtFile.js";
import { paymentFileModel } from "../models/PaymentFile.js";
import { formModel } from "../models/Form.js";
import jwt from "jsonwebtoken";
import archiver from "archiver";
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
      .find({ isAdmin: "false" }, { userEmail: 1, formFilled: 1, isVerified: 1 })
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

const allPaymentFileControl = async (req, res) => {
  const token = req.body?.token;
  const adminID = jwt.decode(token, process.env.JWT_SECRET);
  const admin = await userModel.findById(adminID?.id);
  if (!admin?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    const files = await paymentFileModel.find();
    if (files.length === 0) {
      return res.json({ message: "No files found", success: "false" });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=aPaymentFiles.zip"
    );
    res.setHeader("Content-Type", "application/zip");

    const output = res;
    archive.pipe(output);

    files.forEach((file) => {
      archive.append(file.fileData, { name: file.fileName });
    });

    archive.finalize(() => {
      output.end();
    });
    console.log("All payment files downloaded successfully");
  } catch (error) {
    console.error(error);
    res.json({ message: "Internal server error" });
  }
};

const allIshmtIDControl = async (req, res) => {
  const token = req.body?.token;
  const adminID = jwt.decode(token, process.env.JWT_SECRET);
  const admin = await userModel.findById(adminID?.id);
  if (!admin?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }
  try {
    const files = await ishmtFileModel.find();
    if (files.length === 0) {
      return res.json({ message: "No files found", success: "false" });
    }

    const archive = archiver("zip", { zlib: { level: 9 } });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=IshmtIDFiles.zip"
    );
    res.setHeader("Content-Type", "application/zip");

    const output = res;
    archive.pipe(output);

    files.forEach((file) => {
      archive.append(file.fileData, { name: file.fileName });
    });

    archive.finalize(() => {
      output.end();
    });
    console.log("All ISHMT ID files downloaded successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const userFormDetailControl = async (req, res) => {
  const token = req.body?.token;
  const userID = req.body?.userID;
  const adminID = jwt.decode(token, process.env.JWT_SECRET);
  const admin = await userModel.findById(adminID?.id);
  if (!admin?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    const formData = await formModel.findOne({ userID });
    if (!formData) {
      console.log("can't find form data of the user.");
      return res.json({
        message: "Can't find form data of the user",
        success: "false",
      });
    }

    return res.json({ formData, success: "true" });
  } catch (error) {
    console.log("Error: ", error);
    return res.json({
      message: "Error finding Details. Please try again.",
      success: "false",
    });
  }
};

export {
  userListControl,
  userDeleteControl,
  userDownloadControl,
  userPaymentFileControl,
  userIshmtIDControl,
  allPaymentFileControl,
  allIshmtIDControl,
  userFormDetailControl,
};
