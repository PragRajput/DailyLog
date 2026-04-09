import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProject extends Document {
  userId:   mongoose.Types.ObjectId;
  name:     string;
  color:    string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:     { type: String, required: true },
    color:    { type: String, default: '#3b82f6' },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

projectSchema.index({ userId: 1 });

export const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);
