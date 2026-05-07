const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
// const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService'); // Will implement later

// @desc    Register a new user (with email verification)
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      quota: {
        limit: 5,
        remaining: 5,
        resetDate: (() => {
          const date = new Date();
          date.setMonth(date.getMonth() + 1);
          date.setDate(1);
          date.setHours(0, 0, 0, 0);
          return date;
        })()
      }
    });

    if (user) {
      // TODO: Send verification email
      // await sendVerificationEmail(user, verificationToken);
      console.log(`Verification link: ${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`);

      generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        isVerified: user.isVerified,
        message: 'Registration successful. Please verify your email.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // TEMPORARILY BYPASS EMAIL VERIFICATION FOR TESTING
      // Uncomment the following lines in production:
      // if (!user.isVerified) {
      //   return res.status(401).json({ message: 'Please verify your email before logging in' });
      // }
      
      generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        quota: user.quota
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
const logoutUser = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile (with quota)
// @route   GET /api/auth/profile
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.checkAndResetQuota();
    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      quota: user.quota
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Get current user (for auth context)
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.checkAndResetQuota();
    await user.save();
    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        isVerified: user.isVerified,
        quota: user.quota
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }
    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ message: 'If that email is registered, you will receive a reset link' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();
    console.log(`Password reset link: ${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`);
    res.json({ message: 'Password reset link sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user quota
// @route   GET /api/auth/quota
const getQuota = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.checkAndResetQuota();
    await user.save();
    res.json(user.quota);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getQuota
};