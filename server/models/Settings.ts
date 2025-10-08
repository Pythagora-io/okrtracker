import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  hour: number; // 0-23
  minute: number; // 0-59
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ISettings>({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
    default: 1, // Monday
  },
  hour: {
    type: Number,
    required: true,
    min: 0,
    max: 23,
    default: 9,
  },
  minute: {
    type: Number,
    required: true,
    min: 0,
    max: 59,
    default: 0,
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC',
  },
}, {
  timestamps: true,
  versionKey: false,
});

const Settings = mongoose.model<ISettings>('Settings', schema);

export default Settings;
