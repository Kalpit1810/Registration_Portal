import { userModel } from "../models/Users.js";
import { ishmtFileModel } from "../models/IshmtFile.js";
import { paymentFileModel } from "../models/PaymentFile.js";
import { formModel } from "../models/Form.js";
import jwt from "jsonwebtoken";
import archiver from "archiver";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { waitingModel } from "../models/Waiting.js";
import { accommodationPaymentFileModel } from "../models/AccommodationPayment.js";
dotenv.config();

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
      .find(
        { isAdmin: "false", formFilled: "true" },
        {
          userEmail: 1,
          formFilled: 1,
          isVerified: 1,
          accommodationFormFilled: 1,
          accommodationVerified: 1,
        }
      )
      .sort({ userEmail: 1 });
    // accommodationFormFilled
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

    await waitingModel.findOneAndDelete({
      userID: req.body?.userID,
    });

    await paymentFileModel.findOneAndDelete({
      userID: req.body?.userID,
    });

    await accommodationPaymentFileModel.findOneAndDelete({
      userID: req.body?.userID,
    });

    await formModel.findOneAndDelete({
      userID: req.body?.userID,
    });

    const data = await userModel
      .find(
        { isAdmin: "false", formFilled: "true" },
        {
          userEmail: 1,
          formFilled: 1,
          isVerified: 1,
          accommodationFormFilled: 1,
          accommodationVerified: 1,
        }
      )
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

const userAccommodationDeleteControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  const user = await userModel.findById(userID?.id);
  if (!user?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }
  try {
    await userModel.findByIdAndUpdate(req.body?.userID, {
      accommodationFormFilled: false,
      accommodationVerified: false,
      isAssigned: false,
      isWaiting: false,
    });

    await waitingModel.findOneAndUpdate({
      userID: req.body?.userID,
    },{accommodationChoice: ""});

    await accommodationPaymentFileModel.findOneAndDelete({
      userID: req.body?.userID,
    });

    await formModel.updateOne(
      {
        userID: req.body?.userID,
      },
      {
        $set: {
          accommodationFees: "",
          accommodationChoice: "",
          arrivalTime: "",
          departureTime: "",
          accommodationPaymentReferenceNumber: "",
        },
      }
    );

    const data = await userModel
      .find(
        { isAdmin: "false", formFilled: "true" },
        {
          userEmail: 1,
          formFilled: 1,
          isVerified: 1,
          accommodationFormFilled: 1,
          accommodationVerified: 1,
        }
      )
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
  const usersData = await formModel.find({}).sort({ firstName: 1 });
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
      return res.json({ message: "File not found", success: "false" });
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

const userAccommodationPaymentFileControl = async (req, res) => {
  const token = req.body?.token;
  const userID = req.body?.userID;
  const adminID = jwt.decode(token, process.env.JWT_SECRET);
  const admin = await userModel.findById(adminID?.id);
  if (!admin?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    const fileDocument = await accommodationPaymentFileModel.findOne({
      userID,
    });

    if (!fileDocument) {
      console.log("File not found");
      return res.json({ message: "File not found", success: "false" });
    }

    const fileData = fileDocument?.fileData;

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileDocument?.fileName}`
    );

    console.log("Payment File for user sent.");
    return res.send(fileData);
  } catch (error) {
    console.error("Error retrieving file data:", error);
    return res.status(500).json({ error: "Internal server error" });
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
      return res.json({ message: "File not found", success: "false" });
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
    res.status(500).json({ error: "Internal server error", success: "false" });
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

const userVerifiedControl = async (req, res) => {
  const token = req.body?.token;
  const userID = req.body?.userID;
  const adminID = jwt.decode(token, process.env.JWT_SECRET);
  const admin = await userModel.findById(adminID?.id);
  if (!admin?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    let user = await userModel.findById(userID);
    await userModel.findByIdAndUpdate(userID, { isVerified: !user.isVerified });
    res.json({
      message: "Verification status changed",
      success: "true",
      isVerified: !user.isVerified,
    });
  } catch (error) {
    console.log("Error : ", error);
    res.json({
      message: "Couldn't change the verification status",
      success: "false",
    });
  }
};

function generateEmailContent(formData) {
  return `
    <style>
.container {
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f7f7f7;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.header-img {
  width: 100%;
}

.link {
  color: #007bff;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

h2 {
  font-size: 28px;
  margin-top: 10px;
}

strong {
  font-weight: bold;
}

p {
  margin: 10px 0;
}

.congrats {
  font-size: 24px;
  color: #28a745;
  margin-bottom: 10px;
}

.verification-msg {
  font-style: italic;
  color: #666;
  margin-top: 20px;
}

</style>
</head>
<body>
<div class="container">
  
  <img class="header-img" src="https://ihmtc2023.co.in/static/media/headerImg2.cc1dc4946a29924f1790.jpeg" alt="IHMTC Poster">
  <h1 class="congrats"> Congratulations on completing your registration for IHMTC 2023!</h1>
      <h3><strong>NOTE:</strong> Your registration for the IHMTC 2023 as per the details provided below has been verified and is now complete.</h3>
      
      <p><strong>First Name:</strong> ${formData?.firstName}</p>
       ${
         formData?.middleName
           ? `<p><strong>Middle Name:</strong>${formData?.middleName}</p>`
           : ""
       }
       ${
         formData?.lastName
           ? `<p><strong>Last Name:</strong>${formData?.lastName}</p>`
           : ""
       }
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
      ${
        formData?.whatsappNumberCode
          ? `<p><strong>WhatsApp Number:</strong> ${formData?.whatsappNumberCode}-${formData?.whatsappNumber} </p>`
          : ""
      }
      <p><strong>Number of Papers:</strong> ${formData?.paperCount}</p>
      ${
        formData?.paperCount === "1" || formData?.paperCount === "2"
          ? `<p><strong>Submission ID of Paper #1:</strong> ${formData?.paper1Id}</p>`
          : ""
      }
      ${
        formData?.paperCount === "2"
          ? `<p><strong>Submission ID of Paper #2:</strong> ${formData?.paper2Id}</p>`
          : ""
      }
      <p><strong>Profile:</strong> ${formData?.profile}</p>
      <p><strong>Accompanying Persons:</strong> ${
        formData?.accompanyingPersons
      }</p>
      <p><strong>Is ISHMT Member? :</strong> ${formData?.isIshmtMember}</p>
      ${
        formData?.isIshmtMember === "Yes"
          ? `<p><strong>ISHMT ID Number:</strong> ${formData?.ishmtIDno} (verified)</p>`
          : ""
      }
      <p><strong>Payment Reference Number:</strong> ${
        formData?.paymentReferenceNumber
      }  (verified)</p>
      <p><strong>Category:</strong> ${formData?.category}</p>
      <p><strong>Fee Paid:</strong> ₹ ${formData?.fee}.00  (verified)</p>
       ${
         formData?.comment
           ? `<p><strong>Comment:</strong></p> ${formData?.comment}`
           : ""
       }
      <h3 class="verification-msg">This email sent by the organizing committee of IHMTC 2023 can be used as the receipt for payment made towards your IHMTC registration.</h3>
      <p>For more information, please visit the <a class="link" href="https://ihmtc2023.iitp.ac.in/">official website</a>.</p>
      <p>For inquiries, contact us at <a class="link" href="mailto:ihmtc2023@gmail.com">ihmtc2023@gmail.com</a></p>
</div>
  `;
}

const userVerificationEmail = async (req, res) => {
  const token = req.body?.token;
  const userID = req.body?.userID;
  const adminID = jwt.decode(token, process.env.JWT_SECRET);
  const admin = await userModel.findById(adminID?.id);
  const user = await userModel.findById(userID);
  const formData = await formModel.findOne({ userID });

  if (!admin?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  const transporter = nodemailer.createTransport({
    service: "outlook",
    auth: {
      user: "kalpit_2101cs34@iitp.ac.in",
      pass: process.env.PASS_EMAIL,
    },
  });
  const mailOptions = {
    from: "kalpit_2101cs34@iitp.ac.in",
    to: user.userEmail,
    subject: "IHMTC 2023 Verification",
    html: generateEmailContent(formData),
  };

  try {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        return res.json({
          message: `Error sending email.`,
          success: "false",
        });
      }
      console.log("Email sent:", info?.response);
      return res.json({
        message: `Vreification email sent to ${user.userEmail}`,
        success: "true",
      });
    });
  } catch (err) {
    console.log("Error:", err);
    return res.json({
      message: `Error sending email.`,
      success: "false",
    });
  }
};

export {
  userListControl,
  userDeleteControl,
  userAccommodationDeleteControl,
  userDownloadControl,
  userPaymentFileControl,
  userIshmtIDControl,
  allPaymentFileControl,
  allIshmtIDControl,
  userFormDetailControl,
  userVerifiedControl,
  userVerificationEmail,
  userAccommodationPaymentFileControl,
};
