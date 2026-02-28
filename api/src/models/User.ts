import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email:    string;
  name:     string;
  avatar?:  string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    name:     { type: String, required: true },
    avatar:   String,
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
