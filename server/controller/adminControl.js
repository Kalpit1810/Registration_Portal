import { userModel } from "../models/Users.js";
import { ishmtFileModel } from "../models/IshmtFile.js";
import { paymentFileModel } from "../models/PaymentFile.js";
import { formModel } from "../models/Form.js";

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

export { userListControl, userDeleteControl };
