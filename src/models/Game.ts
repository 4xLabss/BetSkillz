import mongoose, { Schema, Document, models } from 'mongoose';

export interface IGame extends Document {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number; // in seconds
  isActive: boolean;
  thumbnail: string;
  controls: {
    movement: string[];
    action: string[];
    special: string[];
  };
  scoring: {
    basePoints: number;
    bonusMultiplier: number;
    timeBonus: boolean;
  };
  powerUps: string[];
  createdAt: Date;
  updatedAt: Date;
}

const GameSchema: Schema = new Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  minPlayers: { type: Number, default: 1 },
  maxPlayers: { type: Number, default: 1 },
  estimatedDuration: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  thumbnail: { type: String, default: '' },
  controls: {
    movement: [{ type: String }],
    action: [{ type: String }],
    special: [{ type: String }]
  },
  scoring: {
    basePoints: { type: Number, default: 100 },
    bonusMultiplier: { type: Number, default: 1.0 },
    timeBonus: { type: Boolean, default: false }
  },
  powerUps: [{ type: String }]
}, { timestamps: true });

export default models.Game || mongoose.model<IGame>('Game', GameSchema);
