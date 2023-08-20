import { userModel } from "../models/Users.js";
import otpGenerator from "otp-generator";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const sendOtpControl = async (req, res) => {
  const userEmail = req.body.email;
  try {
    const user = await userModel.findOne({ userEmail });
    if (!user) {
      console.log(`user doesnot exist`);
      return res.json({
        message: `User with email id ${userEmail} does not exist.`,
        success: "false",
      });
    }

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "kalpit1018@gmail.com",
        pass: "qipcasvogayahqqf",
      },
    });

    const mailOptions = {
      from: "kalpit1018@gmail.com",
      to: userEmail,
      subject: "Your OTP code",
      html: `<h3> Your OTP is ${otp}. Enter this OTP to change password. This OTP will expire in 5 mins.</h3>`,
    };

    const otpToken = jwt.sign({ otp }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    }); // Create OTP token

    try {
      transporter.sendMail(mailOptions, (error, info) => {
        console.log("Email sent:" + info.response);
        return res.json({
          message: `OTP sent to your email id ${userEmail}`,
          success: "true",
          otpToken,
        });
      });
    } catch (err) {
      console.log("Error" + err);
      return res.json({
        message: `Could't send OTP. Please try again.`,
        success: "false",
        otpToken: "",
      });
    }
  } catch (error) {
    console.log(`Error: ${error.message}`);
    return res.json({
      message: `Some error occured. Please try again.`,
      success: "false",
      otpToken: "",
    });
  }
};

const verifyOtpControl = async (req, res) => {
  const { otpToken, userOTP } = req.body;
  const otp = jwt.decode(otpToken, process.env.JWT_SECRET);
  if (userOTP == otp.otp) {
    console.log("OTP verified");
    return res.json({ message: "OTP verified.", success: "true" });
  } else {
    console.log(`Wrong OTP`);
    return res.json({
      message: "Wrong OTP. Please try again.",
      success: "false",
    });
  }
};

const changePassControl = async (req, res) => {
  const { userEmail, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  try {
    await userModel.findOneAndUpdate({userEmail},{userPassword: hashedPassword});
    console.log(`password Updated .${newPassword}.`);
    return res.json({
        message: "Password updated",
        success: "true",
      });
  } catch (error) {
    console.log(error);
    return res.json({
      message: "Couldn't Update the password. Try again",
      success: "false",
    });
  }
};
export { sendOtpControl, verifyOtpControl, changePassControl };
