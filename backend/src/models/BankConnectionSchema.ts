import mongoose from "mongoose";

const BankConnectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  provider_account_id: {
    type: String,
    required: true,
  },
  provider_id: {
    type: String,
    required: true,
  },
  provider_name: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  last_sync: {
    type: Date,
  },
  yodlee_user_session: {
    type: String,
  },
  yodlee_cobrand_session: {
    type: String,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE',
  },
  connection_date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient lookups
BankConnectionSchema.index({ user: 1, provider_account_id: 1 }, { unique: true });
BankConnectionSchema.index({ user: 1 });
BankConnectionSchema.index({ provider_id: 1 });

export const BankConnection = mongoose.model("BankConnection", BankConnectionSchema);
