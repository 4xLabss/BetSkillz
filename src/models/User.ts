import mongoose, { Schema, Document, models } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  stats: {
    gamesPlayed: number;
    totalScore: number;
    winRate: number;
    avgGameTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  walletAddress: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, unique: true },
  avatar: { type: String },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    avgGameTime: { type: Number, default: 0 },
  },
}, { timestamps: true });

export default models.User || mongoose.model<IUser>('User', UserSchema);
