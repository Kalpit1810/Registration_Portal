import { userModel } from "../models/Users.js";

const userListControl = async (req, res) => {
  try {
    const data = await userModel.find({ isAdmin: "false" }, { userEmail: 1 });
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
  try {
    await userModel.findOneAndDelete({
      userEmail: req.body.email,
    });
    const data = await userModel.find({ isAdmin: "false" }, { userEmail: 1 });
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

export { userListControl, userDeleteControl };
