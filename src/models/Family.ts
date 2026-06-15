import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFamily extends Document {
  name: string;
  created_at: Date;
  updated_at: Date;
}

const FamilySchema = new Schema<IFamily>({
  name: { type: String, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Family: Model<IFamily> = mongoose.models.Family || mongoose.model<IFamily>('Family', FamilySchema);

export default Family;
