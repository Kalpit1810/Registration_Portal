import { ishmtFileModel } from "../models/IshmtFile.js";
import { paymentFileModel } from "../models/PaymentFile.js";
import { formModel } from "../models/Form.js";
import { userModel } from "../models/Users.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const feesControl = async (req, res) => {
  const formData = req.body;
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
    SSM: 6500.0,
    SSN: 7200.0,
    SFM: 8400.0,
    SFN: 9600.0,
    SIM: 11000.0,
    SIN: 12100.0,
    NSN: 16600.0,
    NFN: 38180.0,
    NIN: 45650.0,
  };
  if (Saarc.includes(formData?.country)) {
    category += "S";
  } else {
    category += "N";
  }

  if (formData?.profile == "student") {
    category += "S";
  } else if (formData.profile == "faculty") {
    category += "F";
  } else if (formData.profile == "industry researcher") {
    category += "I";
  }

  if (formData?.isIshmtMember == "Yes") {
    category += "M";
  } else if (formData?.isIshmtMember == "No") {
    category += "N";
  }

  if (category[0] == "S") {
    fee =
      categoryFees[category] *
        (1 + 0.25 * Math.max(Number(formData?.paperCount) - 1, 0)) +
      3800 * Number(formData?.accompanyingPersons);
  } else {
    fee =
      categoryFees[category] *
        (1 + 0.25 * Math.max(Number(formData?.paperCount) - 1, 0)) +
      14940 * Number(formData?.accompanyingPersons);
  }

  const currentTime = new Date();
  const givenTimeString = "2023-11-14T23:59:59"; // Replace this with your given time
  const givenTime = new Date(givenTimeString);

  if (currentTime > givenTime) {
    fee = fee * 1.25 * 1.18;
  } else {
    fee = fee * 1.18;
  }

  fee = Number(fee.toFixed(0));
  const updatedFormData = {
    category: category,
    fee: `${fee}`,
  };
  return res.json({ updatedFormData, success: "true" });
};

function generateEmailContent(formData) {
  return `
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      h3 {
        color: #333;
      }
      p {
        margin: 0;
        padding: 0;
        margin-bottom: 10px;
      }
      strong {
        color: #333;
      }
      .container {
        padding: 20px;
        background-color: #fff;
        border-radius: 5px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
      }
    </style>
    <div class="container">
      <h3>Conference Registration Details</h3>
      <p><strong>First Name:</strong> ${formData?.firstName}</p>
      <p><strong>Middle Name:</strong> ${
        formData?.middleName ? formData?.middleName : ""
      }</p>
      <p><strong>Last Name:</strong> ${
        formData?.lastName ? formData?.lastName : ""
      }</p>
      <p><strong>Honorific:</strong> ${formData?.honorific}</p>
      <p><strong>Gender:</strong> ${formData?.gender}</p>
      <p><strong>Year of Birth:</strong> ${formData?.birthYear}</p>
      <p><strong>Primary Affiliation:</strong> ${
        formData?.primaryAffiliation
      }</p>
      <p><strong>Country:</strong> ${formData?.country}</p>
      <p><strong>Email:</strong> ${formData?.email}</p>
      <p><strong>Contact Number:</strong> ${formData?.contactNumberCode}-${
    formData?.contactNumber
  }</p>
      <p><strong>WhatsApp Number:</strong> ${
        formData?.whatsappNumberCode ? formData?.whatsappNumberCode : ""
      }-${formData?.whatsappNumber ? formData?.whatsappNumber : ""}</p>
      <p><strong>Number of Papers:</strong> ${formData?.paperCount}</p>
      <p><strong>Submission ID of Paper #1:</strong> ${formData?.paper1Id}</p>
      ${
        formData?.paperCount === "2"
          ? `<p><strong>Submission ID of Paper #2:</strong> ${formData?.paper2Id}</p>`
          : ""
      }
      <p><strong>Profile:</strong> ${formData?.profile}</p>
      <p><strong>Accompanying Persons:</strong> ${
        formData?.accompanyingPersons
      }</p>
      <p><strong>Is ISHMT Member?:</strong> ${formData?.isIshmtMember}</p>
      ${
        formData?.isIshmtMember == "Yes"
          ? `<p><strong>ISHMT ID Number:</strong> ${formData?.ishmtIDno}`
          : ""
      }</p>
      <p><strong>Payment Reference Number:</strong> ${
        formData?.paymentReferenceNumber
      }</p>
      <p><strong>Category:</strong> ${formData?.category}</p>
      <p><strong>Amount Payable:</strong> ${formData?.fee}</p>
      <p><strong>Comment:</strong> ${
        formData?.comment ? formData?.comment : ""
      }</p>
    </div>
  `;
}

const submitControl = async (req, res) => {
  const formData = req.body;
  const userData = await userModel.findById(formData?.userID);
  if (userData?.formFilled) {
    console.log("form already filled");
    return res.json({ message: "Form was already filled.", success: "false" });
  }
  const { ishmtIDFile, paymentReceipt } = req.files;
  if (ishmtIDFile) {
    const ext = ishmtIDFile[0]?.originalname.split(`.`).pop();

    const fileName = formData?.email + "_ISHMT_ID." + ext;
    try {
      const file1 = new ishmtFileModel({
        fileName,
        fileData: ishmtIDFile[0]?.buffer,
        userID: formData?.userID,
      });
      await file1.save();
      return res.json({ message: "File Uploaded", success: "true" });
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
    const fileName = formData?.email + "_payment_recipt." + ext;

    try {
      const file1 = new paymentFileModel({
        fileName,
        fileData: paymentReceipt[0]?.buffer,
        userID: formData?.userID,
      });
      await file1.save();
    } catch (error) {
      await ishmtFileModel?.findOneAndDelete({
        userID: req.body?.userID,
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
      userID: formData?.userID,
    });

    await paymentFileModel.findOneAndDelete({
      userID: formData?.userID,
    });

    console.log("Error", error);
    return res.json({
      error,
      message: "Error Uploading form Data",
      success: "false",
    });
  }

  console.log("Data and File Uploaded successfully!!");

  await userModel.findByIdAndUpdate(formData?.userID, { formFilled: true });
  const userMail = formData?.email;

  const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: "kalpit_2101cs34@iitp.ac.in",
      pass: process.env.PASS,
    },
  });

  const mailOptions = {
    from: "kalpit_2101cs34@iitp.ac.in",
    to: userMail,
    subject: "Your Conference Registration Details",
    html: generateEmailContent(formData),
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.status(500).json({
          message: `Couldn't send OTP. Please try again.`,
          success: false,
        });
      }
      console.log("Email sent:", info?.response);
      return res.json({
        message: `OTP sent to your email id ${userMail}`,
        success: true,
      });
    });
  } catch (err) {
    console.log("Error:", err);
    await ishmtFileModel.findOneAndDelete({
      userID: formData?.userID,
    });

    await paymentFileModel.findOneAndDelete({
      userID: formData?.userID,
    });
    await formModel.findOneAndDelete({
      userID: formData?.userID,
    });
    await userModel.findByIdAndUpdate(formData?.userID, { formFilled: false });
    return res.status(500).json({
      message: `An error occurred. Please try again.`,
      success: false,
    });
  }

  return res.json({
    message: "Data and File Uploaded successfully.",
    success: "true",
  });
};

export { feesControl, submitControl };
