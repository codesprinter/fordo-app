import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IItem {
  serial_number: number;
  item_name: string;
  quantity: number;
  status: 'pending' | 'completed';
}

export interface IRecord extends Document {
  user_id: mongoose.Types.ObjectId;
  family_id: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  description?: string;
  items: IItem[];
  created_at: Date;
  updated_at: Date;
}

const ItemSchema = new Schema<IItem>({
  serial_number: { type: Number, required: true },
  item_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
}, { _id: false }); // Avoid making _id for subdocuments if not needed

const RecordSchema = new Schema<IRecord>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  family_id: { type: Schema.Types.ObjectId, ref: 'Family', required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String },
  items: [ItemSchema],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

const Record: Model<IRecord> = mongoose.models.Record || mongoose.model<IRecord>('Record', RecordSchema);

export default Record;
