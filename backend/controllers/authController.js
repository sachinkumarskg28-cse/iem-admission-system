const crypto = require('crypto');
const dataService = require('../services/dataService');
const { sendEmail } = require('../utils/emailService');
const { recordAudit } = require('../middleware/auditMiddleware');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await dataService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address is already registered.',
      });
    }

    const userRole = role && ['student', 'officer', 'admin'].includes(role) ? role : 'student';

    const user = await dataService.createUser({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      role: userRole,
    });

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await dataService.createStudentProfile(user._id);
    }

    const token = user.generateAuthToken();

    await recordAudit(req, {
      action: 'USER_REGISTERED',
      module: 'AUTH',
      details: { userId: user._id, role: user.role, email: user.email },
    });

    sendEmail({
      to: user.email,
      subject: 'Welcome to Institute of Engineering & Management (IEM) Admissions Portal',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0b3b60;">Welcome to IEM Kolkata!</h2>
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>Thank you for registering on the official IEM Admission Management Portal.</p>
          <p>Your account has been created successfully. You can now log in, explore our degree programs, complete your application profile, and submit your admission form.</p>
          <div style="background-color: #f0f4f8; padding: 12px; border-left: 4px solid #0b3b60; margin: 20px 0;">
            <p style="margin: 0;"><strong>Registered Email:</strong> ${user.email}</p>
            <p style="margin: 0;"><strong>Role:</strong> ${user.role.toUpperCase()}</p>
          </div>
          <p>Best regards,<br><strong>IEM Admission Committee</strong></p>
        </div>
      `,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
      },
      studentId: studentProfile ? studentProfile.studentId : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await dataService.findUserByEmail(email, true);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact admissions support.',
      });
    }

    await dataService.updateUser(user._id, { lastLogin: new Date() });

    const token = user.generateAuthToken();

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await dataService.getStudentByUserId(user._id);
    }

    await recordAudit(req, {
      action: 'USER_LOGIN',
      module: 'AUTH',
      details: { userId: user._id, role: user.role, email: user.email },
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        avatar: user.avatar,
      },
      student: studentProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await dataService.findUserById(req.user.id || req.user._id);
    let studentProfile = null;

    if (user.role === 'student') {
      studentProfile = await dataService.getStudentByUserId(user._id || user.id);
    }

    res.status(200).json({
      success: true,
      user,
      student: studentProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await dataService.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'There is no user registered with that email address.',
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    await dataService.updateUser(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: Date.now() + 30 * 60 * 1000,
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'IEM Admissions Portal - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h3 style="color: #0b3b60;">Password Reset Request</h3>
          <p>Dear ${user.name},</p>
          <p>We received a request to reset your password for the IEM Admission Portal.</p>
          <p>Your Password Reset Token is:</p>
          <div style="background: #eef2f7; padding: 12px; font-weight: bold; letter-spacing: 2px; font-size: 16px;">
            ${resetToken}
          </div>
          <p><a href="${resetUrl}" style="display:inline-block; padding: 10px 20px; background: #0b3b60; color: #fff; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset instructions have been sent to your email.',
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await dataService.findUserByEmail(req.body.email || '');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    await dataService.updateUser(user._id, {
      password: req.body.password,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await dataService.findUserByEmail(req.user.email, true);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password provided is incorrect.',
      });
    }

    await dataService.updateUser(user._id, { password: newPassword });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
