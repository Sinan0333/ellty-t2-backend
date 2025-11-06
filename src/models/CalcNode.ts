import mongoose, { Document, Schema, Types } from "mongoose";

export type OpType = "+" | "-" | "*" | "/";

export interface ICalcNode extends Document {
  value: number;
  parent?: Types.ObjectId | null;
  operationType?: OpType | null;
  operand?: number | null;
  author: Types.ObjectId;
  createdAt: Date;
  children?: Types.ObjectId[];
}

const CalcNodeSchema = new Schema<ICalcNode>({
  value: { type: Number, required: true },
  parent: { type: Schema.Types.ObjectId, ref: "CalcNode", default: null },
  operationType: { type: String, enum: ["+", "-", "*", "/"], default: null },
  operand: { type: Number, default: null },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  children: [{ type: Schema.Types.ObjectId, ref: "CalcNode" }],
});

const CalcNodeModel = mongoose.model<ICalcNode>("CalcNode", CalcNodeSchema);
export default CalcNodeModel;
