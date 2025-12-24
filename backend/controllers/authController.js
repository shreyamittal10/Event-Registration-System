import { pool } from "../index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) return res.status(500).json({ msg: "JWT_SECRET is not defined" });

    try {
    const { name, email, password, role } = req.body;

    if (!["student", "organizer"].includes(role)) {
      return res.status(400).json({ msg: "Invalid role" });
    }

    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ msg: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, role]
    );

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};

import { sendOTPEmail } from "../utils/mailer.js";

export const login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ msg: "User not found" });
    }

    const user = result.rows[0];

    if (!otp) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await pool.query(
        "INSERT INTO login_otps (user_id, otp, expires_at) VALUES ($1, $2, $3)",
        [user.id, generatedOTP, expiresAt]
      );

      // await sendOTPEmail(user.email, generatedOTP);
    
        console.log("OTP for", user.email, "is:", generatedOTP);

      return res.json({ msg: "OTP sent to email", step: "OTP_REQUIRED" });
    }

    const otpResult = await pool.query(
      `SELECT * FROM login_otps 
       WHERE user_id = $1 AND otp = $2 AND expires_at > NOW()
       ORDER BY id DESC LIMIT 1`,
      [user.id, otp]
    );

    if (otpResult.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    await pool.query("DELETE FROM login_otps WHERE user_id = $1", [user.id]);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
