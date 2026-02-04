import User from "../Models/userSchema.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Mail from "../Utils/mailer.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET not configured");
}

if (!process.env.FRONTEND_URL) {
  throw new Error("FRONTEND_URL not configured");
}

// ---------------- REGISTER ----------------

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const allowedRoles = ["user", "admin", "organizer"];
    const userRole = allowedRoles.includes(role) ? role : "user";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User Already Exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole,
    });

    await user.save();

    res.status(200).json({
      message: "Registered Successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- LOGIN ----------------

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email});

    if (!user) {
      return res.status(401).json({ message: "Email is not valid" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password is not valid" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successfully",
      token,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- FORGOT PASSWORD ----------------

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always return success message (do not reveal user existence)
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${user._id}/${token}`;

    await Mail(
      user.email,
      "Password reset request",
      `You requested a password reset.

Please click the link below to reset your password:

${resetUrl}

If you did not request this, please ignore this email.`
    );

    return res.status(200).json({
      message: "If this email exists, a reset link has been sent",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ---------------- RESET PASSWORD ----------------

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { id, token } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Token expired or invalid" });
    }

    if (decoded._id !== id) {
      return res.status(401).json({ message: "Unauthorized request" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(id, {
      password: hashedPassword,
    });

    res.status(200).json({
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
