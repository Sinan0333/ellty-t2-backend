import express from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import UserModel from "../models/User";

const router = express.Router();
const JWT_SECRET: Secret = (process.env.JWT_SECRET ?? "changeme") as Secret;
const JWT_EXPIRES_IN: SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN ??
  "7d") as SignOptions["expiresIn"];

router.post(
  "/register",
  body("username").isString().isLength({ min: 3 }),
  body("password").isString().isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    try {
      const existing = await UserModel.findOne({ username });
      if (existing)
        return res.status(400).json({ message: "Username already exists" });

      const hashed = await bcrypt.hash(password, 10);
      const user = new UserModel({ username, password: hashed });
      await user.save();

      const token = jwt.sign(
        { id: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post(
  "/login",
  body("username").isString(),
  body("password").isString(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { username, password } = req.body;
    try {
      const user = await UserModel.findOne({ username });
      if (!user)
        return res.status(400).json({ message: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign(
        { id: user._id, username: user.username },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      res.json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
