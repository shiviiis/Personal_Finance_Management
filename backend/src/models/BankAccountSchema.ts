import mongoose from "mongoose";

const BankAccountSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  connection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankConnection",
    required: true,
  },
  account_id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  display_name: {
    type: String,
  },
  account_identifier: {
    type: String, // Yodlee's accountNumber (masked)
  },
  type: {
    type: String,
    required: true,
  },
  subtype: {
    type: String,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'DELETED'],
    default: 'ACTIVE',
  },
  balance: {
    type: Number,
    default: 0,
  },
  available_balance: {
    type: Number,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  is_manual: {
    type: Boolean,
    default: false,
  },
  last_sync: {
    type: Date,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient lookups
BankAccountSchema.index({ user: 1, account_id: 1 }, { unique: true });
BankAccountSchema.index({ connection: 1 });
BankAccountSchema.index({ user: 1, type: 1 });

export const BankAccount = mongoose.model("BankAccount", BankAccountSchema);
