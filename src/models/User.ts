import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  role: "guest" | "user" | "admin";
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["guest", "user", "admin"], default: "user" },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model<IUser>("User", UserSchema);
export default UserModel;
