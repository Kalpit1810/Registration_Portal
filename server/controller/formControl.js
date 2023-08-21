import { ishmtFileModel } from "../models/IshmtFile.js";
import { paymentFileModel } from "../models/PaymentFile.js";
import { formModel } from "../models/Form.js";
import { userModel } from "../models/Users.js";

const feesControl = async (req, res) => {
  const formData = req.body;

  console.log(formData);
  let category = "";
  let fee = 0;
  const Saarc = [
    "Afghanistan",
    "Bangladesh",
    "Bhutan",
    "India",
    "Maldives",
    "Nepal",
    "Pakistan",
    "Sri Lanka",
  ];
  const categoryFees = {
    SSM: 6500,
    SSN: 7200,
    SFM: 8400,
    SFN: 9600,
    SIM: 11000,
    SIN: 12100,
    NSN: 200,
    NFN: 460,
    NIN: 550,
  };
  if (Saarc.includes(formData.country)) {
    category += "S";
  } else {
    category += "N";
  }

  if (formData.profile == "student") {
    category += "S";
  } else if (formData.profile == "faculty") {
    category += "F";
  } else if (formData.profile == "industry") {
    category += "I";
  }

  if (formData.isIshmtMember == "Yes") {
    category += "M";
  } else if (formData.isIshmtMember == "No") {
    category += "N";
  }

  if (category[0] == "S") {
    fee =
      categoryFees[category] * (1 + 0.25 * (Number(formData.paperCount) - 1)) +
      3800 * Number(formData.accompanyingPersons);
  } else {
    fee =
      categoryFees[category] * (1 + 0.25 * (Number(formData.paperCount) - 1)) +
      180 * Number(formData.accompanyingPersons);
  }

  const currentTime = new Date();
  const givenTimeString = "2023-11-14T23:59:59"; // Replace this with your given time
  const givenTime = new Date(givenTimeString);

  if (currentTime > givenTime) {
    fee = fee * 1.25 * 1.18;
  } else {
    fee = fee * 1.18;
  }
  let updatedFormData;
  if (category[0] == "S") {
    updatedFormData = {
      category: category,
      fee: `INR ${fee}`,
    };
  } else {
    updatedFormData = {
      category: category,
      fee: `USD ${fee}`,
    };
  }

  console.log("category and fee calculated");
  return res.json({ updatedFormData, success: "true" });
};

const submitControl = async (req, res) => {
  const formData = req.body.formData;
  const { ishmtIDFile, paymentReceipt } = req.files;

  if (ishmtIDFile) {
    const ext = ishmtIDFile[0].originalname.split(`.`).pop();

    const fileName =
      formData.fullName + "_" + formData.userID + "_ISHMT_ID." + ext;
    try {
      const file1 = new ishmtFileModel({
        fileName,
        fileData: ishmtIDFile[0].buffer,
        userID: formData.userID,
      });
      await file1.save();
    } catch (error) {
      console.log("Error", error);
      return res.json(
        { error },
        { message: "Error Uploading File", success: "false" }
      );
    }
  }

  if (paymentReceipt) {
    const ext = paymentReceipt[0].originalname.split(`.`).pop();
    const fileName =
      formData.fullName + "_" + formData.userID + "_payment_recipt." + ext;

    try {
      const file1 = new paymentFileModel({
        fileName,
        fileData: paymentReceipt[0].buffer,
        userID: formData.userID,
      });
      await file1.save();
    } catch (error) {
      await ishmtFileModel.findOneAndDelete({
        userID: req.body.userID,
      });
      console.log("Error", error);
      return res.json(
        { error },
        { message: "Error Uploading File" },
        { success: "false" }
      );
    }
  }

  try {
    const file1 = new formModel(formData);
    await file1.save();
  } catch (error) {
    await ishmtFileModel.findOneAndDelete({
      userID : formData.userID,
    });

    await paymentFileModel.findOneAndDelete({
      userID: formData.userID,
    });

    console.log("Error", error);
    return res.json({
      error,
      message: "Error Uploading form Data",
      success: "false",
    });
  }

  console.log("Data and File Uploaded successfully!!");

  await userModel.findByIdAndUpdate(formData.userID,{formFilled : true});
  
  return res.json({
    message: "Data and File Uploaded successfully.",
    success: "true",
  });
};

export { feesControl, submitControl };
