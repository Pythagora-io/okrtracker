import mongoose, { Document, Schema } from 'mongoose';

export interface IReply {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  text: string;
  createdAt: Date;
}

export interface IComment {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userRole: string;
  text: string;
  highlightedText: string;
  position: number;
  replies: IReply[];
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  weekStart: Date;
  weekEnd: Date;
  goalsContent: string;
  resultsContent?: string;
  comments: IComment[];
  goalsSubmittedAt?: Date;
  resultsSubmittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const replySchema = new Schema<IReply>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const commentSchema = new Schema<IComment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  highlightedText: {
    type: String,
    required: true,
  },
  position: {
    type: Number,
    required: true,
  },
  replies: [replySchema],
  resolved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const goalSchema = new Schema<IGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  weekStart: {
    type: Date,
    required: true,
    index: true,
  },
  weekEnd: {
    type: Date,
    required: true,
  },
  goalsContent: {
    type: String,
    required: true,
  },
  resultsContent: {
    type: String,
    default: '',
  },
  comments: [commentSchema],
  goalsSubmittedAt: {
    type: Date,
    required: false,
  },
  resultsSubmittedAt: {
    type: Date,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  versionKey: false,
});

// Index for finding goals by user and week
goalSchema.index({ userId: 1, weekStart: 1 }, { unique: true });

// Update the updatedAt field on save
goalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Goal = mongoose.model<IGoal>('Goal', goalSchema);

export default Goal;
