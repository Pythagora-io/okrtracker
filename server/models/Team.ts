import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  managerId: mongoose.Types.ObjectId;
  icIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<ITeam>({
  name: {
    type: String,
    required: true,
  },
  managerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  icIds: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
  versionKey: false,
});

const Team = mongoose.model<ITeam>('Team', schema);

export default Team;
