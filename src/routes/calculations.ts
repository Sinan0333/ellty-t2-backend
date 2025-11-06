import express from "express";
import { body, param, validationResult } from "express-validator";
import CalcNodeModel from "../models/CalcNode";
import { authenticate, AuthRequest } from "../middleware/auth";
import { buildTree } from "../utils/buildTree";
import mongoose from "mongoose";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const nodes = await CalcNodeModel.find().lean().exec();
    const tree = buildTree(nodes as any);
    res.json({ tree });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/",
  authenticate,
  body("startingNumber").isNumeric(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { startingNumber } = req.body;
    try {
      const node = new CalcNodeModel({
        value: Number(startingNumber),
        parent: null,
        operationType: null,
        operand: null,
        author: req.user!.id,
      });
      await node.save();
      res.status(201).json({ node });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.post(
  "/:id/operations",
  authenticate,
  param("id").isString(),
  body("op").isIn(["+", "-", "*", "/"]),
  body("operand").isNumeric(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const parentId = req.params.id;
    const { op, operand } = req.body;

    if (!mongoose.Types.ObjectId.isValid(parentId)) {
      return res.status(400).json({ message: "Invalid parent id" });
    }

    try {
      const parentNode = await CalcNodeModel.findById(parentId);
      if (!parentNode)
        return res.status(404).json({ message: "Parent node not found" });

      const left = parentNode.value;
      const right = Number(operand);
      let result: number;
      switch (op) {
        case "+":
          result = left + right;
          break;
        case "-":
          result = left - right;
          break;
        case "*":
          result = left * right;
          break;
        case "/":
          if (right === 0)
            return res
              .status(400)
              .json({ message: "Division by zero is not allowed" });
          result = left / right;
          break;
        default:
          return res.status(400).json({ message: "Invalid operation" });
      }

      const child = new CalcNodeModel({
        value: result,
        parent: parentNode._id,
        operationType: op,
        operand: right,
        author: req.user!.id,
      });
      await child.save();

      parentNode.children = parentNode.children || [];
      parentNode.children.push(child._id);
      await parentNode.save();

      res.status(201).json({ node: child });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
