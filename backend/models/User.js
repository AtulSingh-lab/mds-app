const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google OAuth users
  googleId: { type: String }, // Optional

  // Plan and quota (monthly reset)
  plan: { 
    type: String, 
    enum: ['free', 'pro'], 
    default: 'free' 
  },
  quota: {
    limit: { type: Number, default: 5 },      // free plan: 5 docs per month
    remaining: { type: Number, default: 5 },
    resetDate: { type: Date, default: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      return date;
    } }
  },

  // Email verification
  isVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpires: Date,

}, { timestamps: true });

// Method to check and reset quota if resetDate is passed
userSchema.methods.checkAndResetQuota = function() {
  const now = new Date();
  if (now >= this.quota.resetDate) {
    this.quota.remaining = this.plan === 'pro' ? 100 : 5;
    const newReset = new Date();
    newReset.setMonth(newReset.getMonth() + 1);
    newReset.setDate(1);
    newReset.setHours(0, 0, 0, 0);
    this.quota.resetDate = newReset;
    return true;
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);