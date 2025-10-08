import mongoose, { Document, Schema } from 'mongoose';
import { isPasswordHash } from '../utils/password';
import { randomUUID } from 'crypto';
import { ROLES } from 'shared';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  role: string;
  refreshToken: string;
  teamId?: mongoose.Types.ObjectId;
  inviteToken?: string;
  inviteExpires?: Date;
  invitedBy?: mongoose.Types.ObjectId;
}

const schema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    validate: { validator: isPasswordHash, message: 'Invalid password hash' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  name: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: [ROLES.ADMIN, ROLES.MANAGER, ROLES.IC],
    default: ROLES.IC,
  },
  refreshToken: {
    type: String,
    unique: true,
    index: true,
    default: () => randomUUID(),
  },
  teamId: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: false,
  },
  inviteToken: {
    type: String,
    required: false,
    index: true,
  },
  inviteExpires: {
    type: Date,
    required: false,
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
}, {
  versionKey: false,
});

schema.set('toJSON', {
  transform: (doc: Document, ret: Record<string, unknown>) => {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model<IUser>('User', schema);

export default User;
