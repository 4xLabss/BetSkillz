import mongoose, { Schema, Document, models } from 'mongoose';

export interface IScore extends Document {
  userId: mongoose.Types.ObjectId;
  gameId: mongoose.Types.ObjectId;
  score: number;
  gameTime: number; // Duration in seconds
  achievements: mongoose.Types.ObjectId[];
  metadata: {
    difficulty?: string;
    powerUpsUsed?: string[];
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ScoreSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
  score: { type: Number, required: true, index: true },
  gameTime: { type: Number, default: 0 },
  achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }],
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Compound index for efficient querying by user and game
ScoreSchema.index({ userId: 1, gameId: 1 });
// Index for leaderboard queries
ScoreSchema.index({ gameId: 1, score: -1 });

export default models.Score || mongoose.model<IScore>('Score', ScoreSchema);
