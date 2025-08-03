# VITAP Admin Approval System

A comprehensive admin approval workflow implementation for React Native Expo applications using Clerk authentication. This system ensures that only admin-approved users can access the application.

## 🚀 Features

- **User Registration**: Users register with email but require admin approval
- **Admin Notification**: Admins receive email notifications for new registrations
- **Admin Dashboard**: Clean interface for admins to approve/reject users
- **Email Notifications**: Automated emails for approval/rejection status
- **Pending Status Screen**: Users see their approval status while waiting
- **Role-based Access**: Only approved users can access the main application

## 📋 How It Works

### User Flow
1. **Registration**: User registers with `@vitapstudent.ac.in` or `@vitap.ac.in` email
2. **Pending Status**: User gets "pending approval" status
3. **Admin Notification**: Admin receives email about new registration
4. **Wait for Approval**: User sees pending approval screen
5. **Email Notification**: User receives email when approved/rejected
6. **Access Granted**: Only approved users can access the main app

### Admin Flow
1. **Email Notification**: Receive email about new user registrations
2. **Admin Dashboard**: Review pending user requests
3. **Approve/Reject**: Make decision with optional rejection reason
4. **Automatic Emails**: System sends confirmation emails to users

## 🛠 Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- MongoDB database
- Email service (Gmail recommended)
- Expo CLI
- Clerk account

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/adminapproval
   JWT_SECRET=your-super-secret-jwt-key-here
   
   # Email Configuration (Gmail example)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=noreply@vitap.ac.in
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install additional dependencies**
   ```bash
   npm install axios
   ```

2. **Configure API URL**
   Create or update your environment variables:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000/api
   ```

3. **Update your main app navigation**
   The system automatically handles routing based on approval status.

### Database Setup

The system automatically creates the necessary MongoDB collections. For the first admin user, you'll need to manually set `isAdmin: true` in the database.

```javascript
// In MongoDB shell or admin interface
db.users.updateOne(
  { email: "admin@vitap.ac.in" },
  { $set: { isAdmin: true, approvalStatus: "approved" } }
)
```

## 📱 Implementation Details

### Key Components

#### 1. AuthProvider (`app/(auth)/context/AuthProvider.tsx`)
- Extended with approval status checking
- Added helper methods: `isUserApproved()`, `isPending()`, `isRejected()`
- Automatic approval status verification after login

#### 2. Pending Approval Screen (`app/(auth)/pending-approval.tsx`)
- Beautiful UI showing current approval status
- Refresh functionality to check status updates
- Support contact information for rejected users

#### 3. Admin Dashboard (`app/(admin)/dashboard.tsx`)
- List of all pending approval requests
- One-click approve/reject functionality
- Rejection reason input modal

#### 4. API Service (`src/services/api.ts`)
- Complete API integration for approval workflow
- Error handling and authentication headers

### Backend API Endpoints

```
POST /api/user/submit-for-approval     # Submit user for approval
GET  /api/user/approval-status/:userId # Get user approval status
GET  /api/admin/pending-approvals      # Get all pending requests (admin)
POST /api/admin/approve-user/:userId   # Approve user (admin)
POST /api/admin/reject-user/:userId    # Reject user (admin)
POST /api/admin/notify-new-registration # Notify admin of new user
```

### Email Templates

The system includes professional email templates for:
- **Admin Notifications**: New user registration alerts
- **User Approval**: Welcome message with access confirmation
- **User Rejection**: Polite rejection with optional reason and support contact

## 🔧 Customization

### Email Templates
Modify email templates in `backend/server.js`:
```javascript
async function sendApprovalEmail(userEmail, displayName, isApproved, rejectionReason = '') {
  // Customize your email templates here
}
```

### UI Styling
All components use React Native StyleSheet with modern design patterns:
- Consistent color scheme
- Professional typography
- Responsive layouts
- Accessibility-friendly

### Domain Validation
Update email domain validation in `AuthProvider.tsx`:
```javascript
const validateEmail = (email: string): boolean => {
  const validDomains = ['@vitapstudent.ac.in', '@vitap.ac.in'];
  return validDomains.some(domain => email.endsWith(domain));
};
```

## 🚨 Security Considerations

1. **JWT Tokens**: Secure admin verification with JWT
2. **Email Validation**: Restricted to institutional email domains
3. **Admin Role**: Protected admin routes and functions
4. **Environment Variables**: Sensitive data in environment files
5. **Input Validation**: Server-side validation for all inputs

## 📞 Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify environment variable configuration
- Ensure MongoDB connection is established
- Test email service configuration

## 🎯 Production Deployment

### Backend Deployment
1. Deploy to services like Railway, Render, or AWS
2. Configure production MongoDB (MongoDB Atlas recommended)
3. Set up production email service
4. Update environment variables

### Frontend Deployment
1. Update `EXPO_PUBLIC_API_URL` to production backend URL
2. Build and deploy your Expo app
3. Test the complete approval workflow

## 🔮 Future Enhancements

- **Bulk Actions**: Approve/reject multiple users at once
- **User Categories**: Different approval workflows for students vs faculty
- **Audit Logs**: Track all admin actions
- **Dashboard Analytics**: User registration statistics
- **Mobile Admin App**: Dedicated admin mobile interface

---

## 📄 License

This project is part of the VITAP application system and follows institutional guidelines.

## 🤝 Contributing

Please follow the established code patterns and test all changes thoroughly before deployment.