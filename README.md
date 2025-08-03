# VITAP Admin Approval System

A comprehensive admin approval workflow implementation for React Native Expo applications using Clerk authentication and Firebase Firestore. This system ensures that only admin-approved users can access the application.

## 🚀 Features

- **User Registration**: Users register with email but require admin approval
- **Admin Dashboard**: Clean interface for admins to approve/reject users
- **Email Integration**: Optional email notifications via device's email app
- **Pending Status Screen**: Users see their approval status while waiting
- **Role-based Access**: Only approved users can access the main application
- **Firebase Firestore**: No backend server required - pure Firebase solution

## 📋 How It Works

### User Flow
1. **Registration**: User registers with `@vitapstudent.ac.in` or `@vitap.ac.in` email
2. **Pending Status**: User gets "pending approval" status
3. **Admin Review**: Admin reviews request in dashboard
4. **Wait for Approval**: User sees pending approval screen
5. **Email Notification**: Optional email via admin's device
6. **Access Granted**: Only approved users can access the main app

### Admin Flow
1. **Dashboard Access**: Admin opens admin dashboard
2. **Review Requests**: See all pending user requests
3. **Approve/Reject**: Make decision with optional rejection reason
4. **Email Option**: Send email notification via device's email app

## 🛠 Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- Firebase project setup
- Expo CLI
- Clerk account

### Firebase Setup

1. **Firebase Project Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Set up authentication (if not using Clerk exclusively)

2. **Firebase Configuration**
   Your `app/config/firebase.ts` should already be configured. The system will create these collections:
   - `approvalUsers` - User approval data
   - `adminNotifications` - Admin notification logs

### Application Setup

1. **Install dependencies** (if not already installed)
   ```bash
   npm install firebase
   ```

2. **Create first admin user**
   You need to manually create the first admin. Add this to a temporary screen or run in console:
   ```typescript
   import { userApi } from './src/services/api';
   
   // Call this once to create your first admin
   await userApi.createAdminUser({
     userId: 'your-clerk-user-id',
     email: 'admin@vitap.ac.in',
     displayName: 'Admin User'
   });
   ```

3. **Access admin dashboard**
   Navigate to `/admin/dashboard` once you have admin privileges.

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
- Email integration via device's email app

#### 4. API Service (`src/services/api.ts`)
- Complete Firestore integration for approval workflow
- No backend server required
- Real-time data from Firebase

### Firestore Collections

```javascript
// approvalUsers collection
{
  clerkId: string,           // Clerk user ID
  email: string,             // User email
  displayName: string,       // User display name
  approvalStatus: 'pending' | 'approved' | 'rejected',
  isAdmin: boolean,          // Admin role flag
  approvedBy?: string,       // Admin who approved
  approvedAt?: timestamp,    // Approval date
  rejectedAt?: timestamp,    // Rejection date
  rejectionReason?: string,  // Reason for rejection
  registrationDate: timestamp,
  createdAt: timestamp
}

// adminNotifications collection
{
  type: 'new_registration',
  userEmail: string,
  userDisplayName: string,
  status: 'pending',
  createdAt: timestamp
}
```

### Email Integration

Instead of requiring a backend email service, the system:
- Shows alerts to admins when approving/rejecting users
- Provides option to send email via device's email app
- Pre-fills professional email templates
- Uses device's `mailto:` functionality

## 🔧 Customization

### Email Templates
Modify email templates in `src/services/api.ts`:
```javascript
function openEmailApp(userEmail, isApproved, displayName, rejectionReason) {
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

1. **Firestore Rules**: Set up proper Firestore security rules:
   ```javascript
   // Firestore Rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Only authenticated users can read their own approval status
       match /approvalUsers/{document} {
         allow read: if request.auth != null && resource.data.clerkId == request.auth.uid;
         allow write: if request.auth != null;
       }
       
       // Only admins can read all approval data
       match /approvalUsers/{document} {
         allow read, write: if request.auth != null && 
           exists(/databases/$(database)/documents/approvalUsers/$(request.auth.uid)) &&
           get(/databases/$(database)/documents/approvalUsers/$(request.auth.uid)).data.isAdmin == true;
       }
     }
   }
   ```

2. **Email Validation**: Restricted to institutional email domains
3. **Admin Role**: Protected admin routes and functions
4. **Clerk Integration**: Secure authentication via Clerk

## 📞 Support

For issues or questions:
- Check the console logs for detailed error messages
- Verify Firebase configuration
- Ensure Firestore permissions are correct
- Test admin user creation

## 🎯 Production Deployment

### Firebase Setup
1. Configure production Firebase project
2. Set up Firestore security rules
3. Configure Clerk for production
4. Test the complete approval workflow

### App Deployment
1. Build and deploy your Expo app
2. Ensure Firebase configuration is correct
3. Create initial admin users
4. Test approval workflow end-to-end

## 🔮 Future Enhancements

- **Push Notifications**: Use Firebase Cloud Messaging for real-time notifications
- **Bulk Actions**: Approve/reject multiple users at once
- **Email Service**: Integrate with Firebase Functions for automated emails
- **User Categories**: Different approval workflows for students vs faculty
- **Audit Logs**: Track all admin actions
- **Dashboard Analytics**: User registration statistics

## 💡 Key Benefits of This Approach

✅ **No Backend Server Required** - Pure Firebase solution
✅ **Real-time Updates** - Firestore provides real-time data
✅ **Cost Effective** - No server hosting costs
✅ **Scalable** - Firebase scales automatically
✅ **Secure** - Firebase security rules
✅ **Simple Setup** - No complex backend configuration
✅ **Mobile Friendly** - Works perfectly with Expo/React Native

---

## 📄 License

This project is part of the VITAP application system and follows institutional guidelines.

## 🤝 Contributing

Please follow the established code patterns and test all changes thoroughly before deployment.