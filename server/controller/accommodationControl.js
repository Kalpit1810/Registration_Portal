import { userModel } from "../models/Users.js";
import { formModel } from "../models/Form.js";
import { waitingModel } from "../models/Waiting.js";
import { accommodationPaymentFileModel } from "../models/AccommodationPayment.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const accommodationListControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  const user = await userModel.findById(userID?.id);

  if (!user?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    const data = await waitingModel.find().sort({ userEmail: 1 });
    console.log("accommodation List Fetched Successfully");
    return res.json({ list: data, success: "true" });
  } catch (error) {
    console.log("Error catching waiting list", error?.message);
    return res.json({
      error,
      message: "Error catching waiting list. Please try again",
      success: "false",
    });
  }
};

const accommodationAddControl = async (req, res) => {
  try {
    const data = await formModel.find(
      { profile: { $ne: "student" } },
      { userID: 1, email: 1 }
    );
    data.map(async (user) => {
      const newUser = new waitingModel({
        userID: user.userID,
        userEmail: user.email,
        date: user.date,
      });
      await newUser.save();
    });
    const list = await waitingModel.find({});
    console.log("User added in the waiting list Successfully");
    return res.json({ message: "Added In the waiting List", success: "true" });
  } catch (error) {
    console.log("Error adding in the waiting list", error);
    return res.json({
      error,
      message: "Error adding in the waiting list. Please try again",
      success: "false",
    });
  }
};

const accessControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  try {
    const formdata = await formModel.findOne({ userID: userID?.id });
    const user = await userModel.findById(userID?.id);
    const isStudent = formdata?.category[1] === "S" ? true : false;
    return res.json({
      isWaiting: user.isWaiting,
      isAssigned: user.isAssigned,
      isStudent,
      accompanyingPersons: formdata.accompanyingPersons,
      success: "true",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Error in granting access",
      success: "false",
    });
  }
};

function generateEmailContent(
  accommodationChoice,
  accommodationFees,
  accommodationPaymentReferenceNumber,
  arrivalTime,
  departureTime,
  accompanyingPersons
) {
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
  <h2> Your request for accommodation for IHMTC 2023 has been received by the conference organizers.</h2>
      <h3><strong>NOTE:</strong> Your accommodation request as per the details provided below is pending verification. The conference organizing committee after verifying payment status will send another confirmation email. Kindly contact the conference organizers at kalpit_2101cs34@iitp.ac.in if you do not receive the confirmation email within next 3 working days.</h3>
      <h3> Accommodation Details </h3>
      <p><strong>Accommodation choice:</strong> ${accommodationChoice}</p>
      <p><strong>Accompanying Persons:</strong> ${accompanyingPersons}</p>
      <p><strong>Accommodation Fee Paid:</strong> ₹ ${accommodationFees}.00  (subject to verification)</p>
      <p><strong>Accommodation Payment Reference Number:</strong> ${accommodationPaymentReferenceNumber} (subject to verification)</p>
      <p><strong>Arrival Date/Time:</strong> ${arrivalTime}</p>
      <p><strong>Departure Date/Time:</strong> ${departureTime}</p>
      
  <h3 class="verification-msg">We are currently verifying your accommodation details. You will be notified once your submitted data is verified. </h3>
  <p>For more information, please visit the <a class="link" href="https://ihmtc2023.iitp.ac.in/">official website</a>.</p>
  <p>For inquiries, contact us at <a class="link" href="mailto:ihmtc2023.accommodation@gmail.com">ihmtc2023.accommodation@gmail.com </a></p>
</div>
  `;
}

function generateAccommodationEmailContent(accommodationChoice) {
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
  <h1>Now you can book your accommodation for Guest House / Makeshift guest rooms.</h1>
    <h3> Please visit the <a class="link" href="https://ihmtc2023.co.in/">website</a> to book your accommodation.</h3>
      
  <p>For more information, please visit the <a class="link" href="https://ihmtc2023.iitp.ac.in/">official website</a>.</p>
  <p>For inquiries, contact us at <a class="link" href="mailto:ihmtc2023.accommodation@gmail.com">ihmtc2023.accommodation@gmail.com </a></p>
</div>
  `;
}

function generateVerificationEmailContent(
  accommodationChoice,
  accommodationFees,
  accommodationPaymentReferenceNumber,
  arrivalTime,
  departureTime,
  accompanyingPersons
) {
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
  <h1 class="congrats">Congratulations, your accommodation for IHMTC 2023 has been booked</h1>
      <h3><strong>NOTE:</strong> Your accommodation request as per the details provided below has been verified.</h3>
      <h3> Accommodation Details </h3>
      <p><strong>Accommodation choice:</strong> ${accommodationChoice}</p>
      <p><strong>Accompanying Persons:</strong> ${accompanyingPersons}</p>
      <p><strong>Accommodation Fee Paid:</strong> ₹ ${accommodationFees}.00  (Verified)</p>
      <p><strong>Accommodation Payment Reference Number:</strong> ${accommodationPaymentReferenceNumber} (Verified)</p>
      <p><strong>Arrival Date/Time:</strong> ${arrivalTime}</p>
      <p><strong>Departure Date/Time:</strong> ${departureTime}</p>
      
  <h3 class="verification-msg">This email sent by the organizing committee of IHMTC 2023 can be used as the receipt for payment made towards your accommodation.</h3>
  <p>For more information, please visit the <a class="link" href="https://ihmtc2023.iitp.ac.in/">official website</a>.</p>
  <p>For inquiries, contact us at <a class="link" href="mailto:ihmtc2023.accommodation@gmail.com">ihmtc2023.accommodation@gmail.com </a></p>
</div>
  `;
}

const accommodationSubmitControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);

  try {
    const user = await userModel.findByIdAndUpdate(userID?.id, {
      accommodationFormFilled: true,
    });
    const formData = await formModel.findOne({ userID: userID?.id });

    let accommodationFees = 0,
      accommodationChoice = "1";
    const accommodationType = req.body?.accommodationChoice;
    const accommodationPaymentReferenceNumber =
      req.body?.accommodationPaymentReferenceNumber;
    const email = user.userEmail;
    let arrivalDate = "";
    let departureDate = "";
    let arrivalTime = "";
    let departureTime = "";

    const totalHoursSpent = calculateTotalHours(
      arrivalDate,
      arrivalTime,
      departureDate,
      departureTime
    );
    const time = Math.ceil(totalHoursSpent / 24);

    const { accommodationPaymentReceipt } = req.files;
    if (accommodationType === "SHSPSO") {
      accommodationFees = 2600;
      accommodationChoice = "Hostel room with single occupancy";
      arrivalTime = req.body?.arrivalTime;
      departureTime = req.body?.departureTime;
    } else if (accommodationType === "SHSPDO") {
      accommodationFees = 2000;
      accommodationChoice = "Hostel with shared double occupancy";
      arrivalTime = req.body?.arrivalTime;
      departureTime = req.body?.departureTime;
    } else if (accommodationType === "SHDPDO") {
      accommodationFees = 4000;
      accommodationChoice = "Hostel with shared double occupancy";
      arrivalTime = req.body?.arrivalTime;
      departureTime = req.body?.departureTime;
    } else if (accommodationType === "SHTPSDO") {
      accommodationFees = 6600;
      accommodationChoice =
        "Hostel with 1 shared double occupancy + 1 single occupancy";
      arrivalTime = req.body?.arrivalTime;
      departureTime = req.body?.departureTime;
    } else if (accommodationType === "Makeshift guest rooms with attached washrooms in hostels/quarters - 1000/- per day, per head") {
      arrivalDate = req.body?.arrivalDate;
      arrivalTime = req.body?.arrivalTime;
      departureDate = req.body?.departureDate;
      departureTime = req.body?.departureTime;

      const totalHoursSpent = calculateTotalHours(
        arrivalDate,
        arrivalTime,
        departureDate,
        departureTime
      );
      const time = Math.ceil(totalHoursSpent / 24);
      accommodationFees =
        1000 * (Number(formData?.accompanyingPersons) + 1) * Number(time);
      accommodationChoice =
        "Makeshift guest rooms with attached washroom in hostels/quarters";
      departureTime = departureDate + " " + String(departureTime) + ":00 hrs";
      arrivalTime = arrivalDate + " " + String(arrivalTime) + ":00 hrs";
    } else if (
      accommodationType ===
      "Guest House (Single room) - 1400/- per day, per head"
    ) {
      arrivalDate = req.body?.arrivalDate;
      arrivalTime = req.body?.arrivalTime;
      departureDate = req.body?.departureDate;
      departureTime = req.body?.departureTime;

      const totalHoursSpent = calculateTotalHours(
        arrivalDate,
        arrivalTime,
        departureDate,
        departureTime
      );
      const time = Math.ceil(totalHoursSpent / 24);
      accommodationFees =
        1400 * (Number(formData?.accompanyingPersons) + 1) * Number(time);
      accommodationChoice = "Guest House (Single room)";
      arrivalTime = arrivalDate + " " + String(arrivalTime) + ":00 hrs";
      departureTime = departureDate + " " + String(departureTime) + ":00 hrs";
    } else if (
      accommodationType ===
      "Guest House (Double room with Double occupancy) - 2000/- per day, per head"
    ) {
      arrivalDate = req.body?.arrivalDate;
      arrivalTime = req.body?.arrivalTime;
      departureDate = req.body?.departureDate;
      departureTime = req.body?.departureTime;

      const totalHoursSpent = calculateTotalHours(
        arrivalDate,
        arrivalTime,
        departureDate,
        departureTime
      );
      const time = Math.ceil(totalHoursSpent / 24);
      accommodationFees =
        2000 * (Number(formData?.accompanyingPersons) + 1) * Number(time);
      accommodationChoice = "Guest House (Double room with Double occupancy)";
      departureTime = departureDate + " " + String(departureTime) + ":00 hrs";
      arrivalTime = arrivalDate + " " + String(arrivalTime) + ":00 hrs";
    } else if (
      accommodationType ===
      "Guest House (Double room with Single occupancy) - 1700/- per day, per head"
    ) {
      arrivalDate = req.body?.arrivalDate;
      arrivalTime = req.body?.arrivalTime;
      departureDate = req.body?.departureDate;
      departureTime = req.body?.departureTime;

      const totalHoursSpent = calculateTotalHours(
        arrivalDate,
        arrivalTime,
        departureDate,
        departureTime
      );
      const time = Math.ceil(totalHoursSpent / 24);
      accommodationFees =
        1700 * (Number(formData?.accompanyingPersons) + 1) * Number(time);
      accommodationChoice = "Guest House (Double room with Single occupancy)";
      departureTime = departureDate + " " + String(departureTime) + ":00 hrs";
      arrivalTime = arrivalDate + " " + String(arrivalTime) + ":00 hrs";
    }

    const formdata = await formModel.findOneAndUpdate(
      { email },
      {
        accommodationChoice,
        accommodationFees,
        accommodationPaymentReferenceNumber,
        arrivalTime,
        departureTime,
      }
    );

    const ext = accommodationPaymentReceipt[0]?.originalname.split(`.`).pop();

    const fileName = email + "_accommodation_payment_recipt." + ext;
    const file1 = new accommodationPaymentFileModel({
      fileName,
      fileData: accommodationPaymentReceipt[0]?.buffer,
      userID: userID?.id,
    });
    await file1.save();

    const transporter = nodemailer.createTransport({
      service: "outlook",
      auth: {
        user: "kalpit_2101cs34@iitp.ac.in",
        pass: process.env.PASS_EMAIL,
      },
    });
    const mailOptions = {
      from: "kalpit_2101cs34@iitp.ac.in",
      to: email,
      subject: "IHMTC 2023 Accommodation Booking Details",
      html: generateEmailContent(
        accommodationChoice,
        accommodationFees,
        accommodationPaymentReferenceNumber,
        arrivalTime,
        departureTime,
        formdata.accompanyingPersons
      ),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email: ", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    console.log("Booking Successfull");
    return res.json({ message: "Booking Successfull", success: "true" });
  } catch (error) {
    await accommodationPaymentFileModel.findOneAndDelete({
      userID: userID?.id,
    });

    await formModel.findOneAndUpdate(
      { userID: userID?.id },
      {
        accommodationChoice: "",
        accommodationFees: "",
        accommodationPaymentReferenceNumber: "",
        arrivalTime: "",
        departureTime: "",
      }
    );
    await userModel.findByIdAndUpdate(userID?.id, {
      accommodationFormFilled: false,
    });

    console.log("Error while Booking. Please Try Again... ", error);

    return res.json({
      error,
      message: "Error while Booking. Please Try Again...",
      success: "false",
    });
  }
};

function calculateTotalHours(
  arrivalDate,
  arrivalTime,
  departureDate,
  departureTime
) {
  // Convert arrival and departure dates and times to JavaScript Date objects
  const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}:00:00`);
  const departureDateTime = new Date(`${departureDate}T${departureTime}:00:00`);

  // Calculate the time difference in milliseconds
  const timeDifference = departureDateTime - arrivalDateTime;

  // Convert the time difference to hours
  const totalHours = timeDifference / (1000 * 60 * 60);

  return totalHours;
}

const accommodationFeeControl = async (req, res) => {
  const token = req.body?.token;
  const userID = jwt.decode(token, process.env.JWT_SECRET);
  console.log(req.body);

  try {
    const formData = await formModel.findOne({ userID: userID?.id });

    let accommodationFees = 0;
    const accommodationType = req.body?.accommodationChoice;
    const arrivalDate = req.body?.arrivalDate;
    const arrivalTime = req.body?.arrivalTime;
    const departureDate = req.body?.departureDate;
    const departureTime = req.body?.departureTime;

    const totalHoursSpent = calculateTotalHours(
      arrivalDate,
      arrivalTime,
      departureDate,
      departureTime
    );
    const time = Math.ceil(totalHoursSpent / 24);

    if (accommodationType === "Makeshift guest rooms with attached washrooms in hostels/quarters - 1000/- per day, per head") {
      accommodationFees =
        1000 * (Number(formData?.accompanyingPersons) + 1) * Number(time);
    } else if (
      accommodationType ===
      "Guest House (Single room) - 1400/- per day, per head"
    ) {
      accommodationFees =
        1400 * (Number(formData?.accompanyingPersons) + 1) * Number(time);
    } else if (
      accommodationType ===
      "Guest House (Double room with Double occupancy) - 2000/- per day, per head"
    ) {
      accommodationFees =
        2000 * (Number(formData?.accompanyingPersons) + 1) * Number(time);
    } else if (
      accommodationType ===
      "Guest House (Double room with Single occupancy) - 1700/- per day, per head"
    ) {
      console.log(formData?.accompanyingPersons);
      accommodationFees =
        1700 * (Number(formData?.accompanyingPersons) + 1) * Number(time);
    }

    console.log("Accommodation Fee calculated Successfully");
    return res.json({
      accommodationFees,
      message: "Booking Successfull",
      success: "true",
    });
  } catch (error) {
    console.log("Error while calculating Fee:  ", error);

    return res.json({
      error,
      message: "Error while calculating Fee. Please Try Again...",
      success: "false",
    });
  }
};

const accommodationVerifiedControl = async (req, res) => {
  const token = req.body?.token;
  const userID = req.body?.userID;
  const adminID = jwt.decode(token, process.env.JWT_SECRET);
  const admin = await userModel.findById(adminID?.id);
  if (!admin?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    const user = await userModel.findByIdAndUpdate(userID, {
      accommodationVerified: true,
    });
    const formData = await formModel.findOne({ userID });

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
      subject: "IHMTC 2023 Accommodation Confirmation",
      html: generateVerificationEmailContent(
        formData.accommodationChoice,
        formData.accommodationFees,
        formData.accommodationPaymentReferenceNumber,
        formData.arrivalTime,
        formData.departureTime,
        formData.accompanyingPersons
      ),
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email: ", error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    return res.json({
      message: "Verification status changed",
      success: "true",
      accommodationVerified: user.accommodationVerified,
    });
  } catch (error) {
    console.log("Error : ", error);
    return res.json({
      error,
      message: "Couldn't change the verification status",
      success: "false",
    });
  }
};

const assignAccommodationControl = async (req, res) => {
  const token = req.body?.token;
  const userID = req.body?.userID;
  const accommodationChoice = req.body.accommodationChoice;
  const adminID = jwt.decode(token, process.env.JWT_SECRET);
  const admin = await userModel.findById(adminID?.id);
  if (!admin?.isAdmin) {
    console.log("Unautorized Access!");
    return res.json({ message: "Access Denied", success: "false" });
  }

  try {
    const waitingUser = await waitingModel.findByIdAndUpdate(userID, {
      accommodationChoice,
    });
    const ID = waitingUser.userID;
    await userModel.findByIdAndUpdate(ID, {
      isAssigned: true,
    });

    console.log("Accommodation assigned");
    return res.json({ message: "Accommodation assigned", success: "true" });
  } catch (error) {
    console.log("Error : ", error);
    return res.json({
      error,
      message: "Couldn't change the verification status",
      success: "false",
    });
  }
};

const fetchAccommodationControl = async (req, res) => {
  const token = req.body?.token;
  const user = jwt.decode(token, process.env.JWT_SECRET);
  try {
    const u = await waitingModel.findOne(
      { userID: user.id },
      { accommodationChoice: 1 }
    );

    return res.json({
      accommodationChoice: u.accommodationChoice,
      message: "Accommodation fetched",
      success: "true",
    });
  } catch (error) {
    console.log("Error : ", error);
    return res.json({
      error,
      message: "error fetching Accommodation",
      success: "false",
    });
  }
};

export {
  accommodationListControl,
  accessControl,
  accommodationAddControl,
  accommodationSubmitControl,
  accommodationVerifiedControl,
  assignAccommodationControl,
  fetchAccommodationControl,
  accommodationFeeControl,
};
