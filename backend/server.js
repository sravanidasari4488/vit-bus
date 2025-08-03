const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adminapproval', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isAdmin: { type: Boolean, default: false },
  approvedBy: { type: String },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  rejectionReason: { type: String },
  registrationDate: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findOne({ clerkId: decoded.userId });
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// Submit user for approval
app.post('/api/user/submit-for-approval', async (req, res) => {
  try {
    const { userId, email, displayName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ clerkId: userId }, { email }] 
    });

    if (existingUser) {
      return res.json({ 
        message: 'User already exists', 
        approvalStatus: existingUser.approvalStatus 
      });
    }

    // Create new user pending approval
    const newUser = new User({
      clerkId: userId,
      email,
      displayName,
      approvalStatus: 'pending',
    });

    await newUser.save();

    res.json({ 
      message: 'User submitted for approval successfully',
      approvalStatus: 'pending'
    });
  } catch (error) {
    console.error('Error submitting user for approval:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user approval status
app.get('/api/user/approval-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return res.json({ 
        approvalStatus: 'pending',
        isAdmin: false 
      });
    }

    res.json({
      approvalStatus: user.approvalStatus,
      isAdmin: user.isAdmin,
      approvedBy: user.approvedBy,
      approvedAt: user.approvedAt,
      rejectedAt: user.rejectedAt,
      rejectionReason: user.rejectionReason,
      registrationDate: user.registrationDate,
    });
  } catch (error) {
    console.error('Error getting approval status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all pending approvals
app.get('/api/admin/pending-approvals', verifyAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      approvalStatus: 'pending' 
    }).sort({ registrationDate: -1 });

    const formattedUsers = pendingUsers.map(user => ({
      id: user._id,
      userId: user.clerkId,
      userEmail: user.email,
      userDisplayName: user.displayName,
      registrationDate: user.registrationDate,
      status: user.approvalStatus,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Approve user
app.post('/api/admin/approve-user/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { approvedBy } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        approvalStatus: 'approved',
        approvedBy,
        approvedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send approval email
    try {
      await sendApprovalEmail(user.email, user.displayName, true);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
    }

    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Reject user
app.post('/api/admin/reject-user/:userId', verifyAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { rejectedBy, rejectionReason } = req.body;

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        approvalStatus: 'rejected',
        rejectedAt: new Date(),
        rejectionReason,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send rejection email
    try {
      await sendApprovalEmail(user.email, user.displayName, false, rejectionReason);
    } catch (emailError) {
      console.error('Error sending rejection email:', emailError);
    }

    res.json({ message: 'User rejected successfully', user });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notify admin about new registration
app.post('/api/admin/notify-new-registration', async (req, res) => {
  try {
    const { userEmail, userDisplayName } = req.body;

    // Get admin emails
    const admins = await User.find({ isAdmin: true });
    const adminEmails = admins.map(admin => admin.email);

    if (adminEmails.length === 0) {
      console.warn('No admin users found for notification');
      return res.json({ message: 'No admins to notify' });
    }

    // Send notification email to admins
    try {
      await sendAdminNotificationEmail(adminEmails, userEmail, userDisplayName);
    } catch (emailError) {
      console.error('Error sending admin notification:', emailError);
    }

    res.json({ message: 'Admin notification sent successfully' });
  } catch (error) {
    console.error('Error notifying admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email functions
async function sendApprovalEmail(userEmail, displayName, isApproved, rejectionReason = '') {
  const subject = isApproved ? 'Account Approved - Welcome!' : 'Account Application Update';
  
  const html = isApproved 
    ? `
      <h2>Welcome to VITAP App!</h2>
      <p>Hi ${displayName || 'there'},</p>
      <p>Great news! Your account has been approved and you can now access the VITAP app.</p>
      <p>You can now log in using your registered email address.</p>
      <p>Best regards,<br>VITAP Team</p>
    `
    : `
      <h2>Account Application Update</h2>
      <p>Hi ${displayName || 'there'},</p>
      <p>We regret to inform you that your account application has been rejected.</p>
      ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
      <p>If you have any questions, please contact support at support@vitap.ac.in</p>
      <p>Best regards,<br>VITAP Team</p>
    `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@vitap.ac.in',
    to: userEmail,
    subject,
    html,
  });
}

async function sendAdminNotificationEmail(adminEmails, userEmail, displayName) {
  const subject = 'New User Registration - Approval Required';
  const html = `
    <h2>New User Registration</h2>
    <p>A new user has registered and is waiting for approval:</p>
    <ul>
      <li><strong>Name:</strong> ${displayName || 'Not provided'}</li>
      <li><strong>Email:</strong> ${userEmail}</li>
      <li><strong>Registration Date:</strong> ${new Date().toLocaleString()}</li>
    </ul>
    <p>Please log in to the admin dashboard to review and approve this user.</p>
    <p>VITAP Admin System</p>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@vitap.ac.in',
    to: adminEmails,
    subject,
    html,
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Admin approval system is ready!`);
});

module.exports = app;