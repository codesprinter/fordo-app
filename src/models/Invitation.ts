import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IInvitation extends Document {
  email: string;
  family_id: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted';
  created_at: Date;
  updated_at: Date;
}

const InvitationSchema = new Schema<IInvitation>({
  email: { type: String, required: true },
  family_id: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Invitation: Model<IInvitation> = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);

export default Invitation;
