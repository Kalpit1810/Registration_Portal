import { ishmtFileModel } from "../models/IshmtFile.js";
import { paymentFileModel } from "../models/PaymentFile.js";
import { formModel } from "../models/Form.js";
import { userModel } from "../models/Users.js";
import nodemailer from "nodemailer";
import { DateTime } from "luxon";
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

  const currentTime = DateTime.now().setZone("Asia/Kolkata"); // IST timezone
  const givenTimeString = "2023-09-14T23:59:59";
  const givenTime = DateTime.fromISO(givenTimeString, { zone: "Asia/Kolkata" }); // IST timezone

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
  <h1 class="congrats">Thanks for filling the IHMTC 2023 registration form.</h1>
      <h3><strong>NOTE:</strong> Your registration as per the details provided below is pending verification. The conference organizing committee after verifying payment status will send another confirmation email. Kindly contact the conference organizers at ihmtc2023@iitp.ac.in if you do not receive the confirmation email within next 3 working days.</h3>
      <h3>Conference Registration Details</h3>
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
          ? `<p><strong>ISHMT ID Number:</strong> ${formData?.ishmtIDno} (subject to verification)</p>`
          : ""
      }
      <p><strong>Payment Reference Number:</strong> ${
        formData?.paymentReferenceNumber
      } (subject to verification)</p>
      <p><strong>Category:</strong> ${formData?.category}</p>
      <p><strong>Fee Paid:</strong> ₹ ${
        formData?.fee
      }.00  (subject to verification)</p>
       ${
         formData?.comment
           ? `<p><strong>Comment:</strong></p> ${formData?.comment}`
           : ""
       }
      
  <h3 class="verification-msg">We are currently verifying your registration details. You will be notified once your submitted data is verified. </h3>
  <p>For more information, please visit the <a class="link" href="https://ihmtc2023.iitp.ac.in/">official website</a>.</p>
  <p>For inquiries, contact us at <a class="link" href="mailto:ihmtc2023@gmail.com">ihmtc2023@gmail.com</a></p>
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
      // return res.json({ message: "File Uploaded", success: "true" });
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
      user: "ihmtc2023@iitp.ac.in",
      pass: process.env.PASS_EMAIL,
    },
  });
  const mailOptions = {
    from: "ihmtc2023@iitp.ac.in",
    to: userMail,
    subject: "Your Conference Registration Details",
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
        message: `Registration Details sent to ${userMail}`,
        success: "true",
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
    return res.json({
      message: `An error occurred. Please try again.`,
      success: false,
    });
  }
};

export { feesControl, submitControl };
