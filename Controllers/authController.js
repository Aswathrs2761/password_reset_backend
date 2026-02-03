import User from "../Models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Mail from "../Utils/mailer.js";

dotenv.config()

//   Register a new user

export const register = async (req, res) => {
    try {

        const { name, email, password } = req.body

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: "user already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({ name, email, password: hashedPassword })
        await user.save()

        res.status(201).json({ message: "User registered successfully", data: user })


    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }
}


//      Login user

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        user.token = token;
        await user.save();

        res.status(200).json({
            message: "Login successfully",
            token,
            role: user.role,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};


// forgot password

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Mail(
      user.email,
      "You are receiving this email because a request was made to reset the password for your account.",
      `Please click the link below to reset your password:
      
http://localhost:5173/reset-password/${user._id}/${token} 

If you did not request a password reset, please ignore this email.`
    );

    // ✅ wait 5 seconds before responding
    await new Promise((resolve) => setTimeout(resolve, 5000));

    return res.status(200).json({ message: "Email sent Successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};


// Reset password


export const resetpassword = async (req, res) => {
    try {
        const { password } = req.body
        const { id, token } = req.params

        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        //verify token

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded._id != user._id) {
            return res.status(401).json({ message: "Invalid Token" })
        }

        //hash password

        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword

        // update the password of user in db

        const updatedUser = await User.findByIdAndUpdate(
            id, { password: hashedPassword },
            { new: true })
        res.status(200).json({ message: "Password reset Successfully", data: updatedUser })


    } catch (error) {
        console.error(error)
        res.status(500).json({ message: error.message })
    }
}