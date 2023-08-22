import { userModel } from "../models/Users.js";
import { ishmtFileModel } from "../models/IshmtFile.js";
import { paymentFileModel } from "../models/PaymentFile.js";
import { formModel } from "../models/Form.js";
import jwt from "jsonwebtoken";

const userListControl = async (req, res) => {
  const token = req.body.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  const user = await userModel.findById(userID.id);
  if(!user.isAdmin)
  {
    console.log("Unautorized Access!")
    return res.json({message: "Access Denied", success : "false"})
  }
  try {
    const data = await userModel.find({ isAdmin: "false" }, { userEmail: 1 }).sort({ userEmail: 1 });
    console.log("List Fetched Successfully");
    return res.json({ list: data, success: "true" });
  } catch (error) {
    console.log("Error Catching List", error.message);
    return res.json({
      error,
      message: "Error Catching List. Please try again",
      success: "false",
    });
  }
};

const userDeleteControl = async (req, res) => {

  const token = req.body.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  const user = await userModel.findById(userID.id);
  if(!user.isAdmin)
  {
    console.log("Unautorized Access!")
    return res.json({message: "Access Denied", success : "false"})
  }
  try {
    await userModel.findByIdAndDelete(req.body.userID);

    await ishmtFileModel.findOneAndDelete({
      userID: req.body.userID,
    });

    await paymentFileModel.findOneAndDelete({
      userID: req.body.userID,
    });

    await formModel.findOneAndDelete({
      userID: req.body.userID,
    });

    const data = await userModel
      .find({ isAdmin: "false" }, { userEmail: 1 })
      .sort({ userEmail: 1 });

    console.log("User Deleted Successfully!!");
    return res.json({ list: data, message: "User Deleted.", success: "true" });
  } catch (error) {
    console.log("Error deleting user!", error.message);
    return res.json({
      error,
      message: "Error deleting user. Please try again",
      success: "false",
    });
  }
};
const userDownloadControl = async (req,res) =>{
  const token = req.body.token;
  console.log(token);
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  const user = await userModel.findById(userID.id);
  if(!user.isAdmin)
  {
    console.log("Unautorized Access!")
    return res.json({message: "Access Denied", success : "false"})
  }
  const usersData = await formModel.find({}).sort({ fullName: 1 });
  return res.json({usersData, success:"true"});
};

export { userListControl, userDeleteControl, userDownloadControl };
