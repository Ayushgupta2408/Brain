import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "An account with this email already exists" });

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", detail: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await user.comparePassword(password || ""))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ token: signToken(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: "Login failed", detail: err.message });
  }
});

export default router;
