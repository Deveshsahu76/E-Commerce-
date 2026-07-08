const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const normalizeEmail = (email = "") => email.toLowerCase().trim();

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const buildOtpEmail = ({ name, otp }) => {
  const safeName = name || "Customer";

  return {
    subject: "ShopSphere Password Reset OTP",
    text: `Hello ${safeName}, your ShopSphere password reset OTP is ${otp}. This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, please ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:auto;border:1px solid #eee;border-radius:16px;padding:24px">
        <h2 style="margin:0 0 10px">Password Reset OTP</h2>
        <p>Hello ${safeName},</p>
        <p>Use the OTP below to reset your ShopSphere account password.</p>
        <div style="font-size:32px;letter-spacing:8px;font-weight:800;background:#f7f3ec;padding:16px 20px;border-radius:14px;text-align:center">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  };
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email: normalizeEmail(email) });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email: normalizeEmail(email),
      password,
      phone,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to register user",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch user profile",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    const safeMessage =
      "If this email is registered, an OTP has been sent for password reset.";

    if (!user) {
      return res.status(200).json({
        success: true,
        message: safeMessage,
      });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    user.resetPasswordOtpHash = otpHash;
    user.resetPasswordOtpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.resetPasswordOtpAttempts = 0;

    await user.save({ validateBeforeSave: false });

    const emailContent = buildOtpEmail({
      name: user.name,
      otp,
    });

    const sent = await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });

    if (!sent && process.env.NODE_ENV !== "production") {
      console.log(`Password reset OTP for ${user.email}: ${otp}`);
    }

    res.status(200).json({
      success: true,
      message: safeMessage,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to process password reset request",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, password, and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email }).select(
      "+password +resetPasswordOtpHash +resetPasswordOtpExpires +resetPasswordOtpAttempts"
    );

    if (!user || !user.resetPasswordOtpHash || !user.resetPasswordOtpExpires) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (user.resetPasswordOtpExpires < new Date()) {
      user.resetPasswordOtpHash = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetPasswordOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (Number(user.resetPasswordOtpAttempts || 0) >= MAX_OTP_ATTEMPTS) {
      user.resetPasswordOtpHash = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetPasswordOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const isOtpValid = await bcrypt.compare(String(otp), user.resetPasswordOtpHash);

    if (!isOtpValid) {
      user.resetPasswordOtpAttempts = Number(user.resetPasswordOtpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.password = password;
    user.resetPasswordOtpHash = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.resetPasswordOtpAttempts = 0;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can login with your new password.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
};