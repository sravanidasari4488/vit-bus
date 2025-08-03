// src/services/api.ts
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../app/config/firebase';
import { Alert, Linking } from 'react-native';

// Collections
const USERS_COLLECTION = 'approvalUsers';
const NOTIFICATIONS_COLLECTION = 'adminNotifications';

// User Management APIs using Firestore
export const userApi = {
  // Submit user for approval
  submitForApproval: async (userData: {
    userId: string;
    email: string;
    displayName: string | null;
  }) => {
    try {
      // Check if user already exists
      const q = query(
        collection(db, USERS_COLLECTION),
        where('clerkId', '==', userData.userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const existingUser = querySnapshot.docs[0].data();
        return {
          message: 'User already exists',
          approvalStatus: existingUser.approvalStatus
        };
      }

      // Create new user document
      const userDoc = {
        clerkId: userData.userId,
        email: userData.email,
        displayName: userData.displayName,
        approvalStatus: 'pending',
        isAdmin: false,
        registrationDate: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, USERS_COLLECTION), userDoc);

      return {
        message: 'User submitted for approval successfully',
        approvalStatus: 'pending'
      };
    } catch (error) {
      console.error('Error submitting user for approval:', error);
      throw error;
    }
  },

  // Get user approval status
  getUserApprovalStatus: async (userId: string) => {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('clerkId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          approvalStatus: 'pending',
          isAdmin: false
        };
      }

      const userData = querySnapshot.docs[0].data();
      
      return {
        approvalStatus: userData.approvalStatus,
        isAdmin: userData.isAdmin || false,
        approvedBy: userData.approvedBy,
        approvedAt: userData.approvedAt?.toDate(),
        rejectedAt: userData.rejectedAt?.toDate(),
        rejectionReason: userData.rejectionReason,
        registrationDate: userData.registrationDate?.toDate(),
      };
    } catch (error) {
      console.error('Error getting approval status:', error);
      throw error;
    }
  },

  // Get all pending approval requests (Admin only)
  getPendingApprovals: async () => {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('approvalStatus', '==', 'pending'),
        orderBy('registrationDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.data().clerkId,
        userEmail: doc.data().email,
        userDisplayName: doc.data().displayName,
        registrationDate: doc.data().registrationDate?.toDate(),
        status: doc.data().approvalStatus,
      }));
    } catch (error) {
      console.error('Error getting pending approvals:', error);
      throw error;
    }
  },

  // Approve user
  approveUser: async (userId: string, adminId: string) => {
    try {
      // Find user document
      const q = query(
        collection(db, USERS_COLLECTION),
        where('clerkId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      const userDocRef = doc(db, USERS_COLLECTION, querySnapshot.docs[0].id);
      
      await updateDoc(userDocRef, {
        approvalStatus: 'approved',
        approvedBy: adminId,
        approvedAt: serverTimestamp(),
      });

      const userData = querySnapshot.docs[0].data();

      // Show approval message instead of sending email automatically
      showApprovalNotification(userData.email, userData.displayName, true);

      return {
        message: 'User approved successfully',
      };
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  },

  // Reject user
  rejectUser: async (userId: string, adminId: string, reason?: string) => {
    try {
      // Find user document
      const q = query(
        collection(db, USERS_COLLECTION),
        where('clerkId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      const userDocRef = doc(db, USERS_COLLECTION, querySnapshot.docs[0].id);
      
      await updateDoc(userDocRef, {
        approvalStatus: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectionReason: reason || '',
      });

      const userData = querySnapshot.docs[0].data();

      // Show rejection message instead of sending email automatically
      showApprovalNotification(userData.email, userData.displayName, false, reason);

      return {
        message: 'User rejected successfully',
      };
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  },

  // Notify admin about new registration
  notifyAdmin: async (userData: {
    userEmail: string;
    userDisplayName: string | null;
  }) => {
    try {
      // Create notification document
      const notificationDoc = {
        type: 'new_registration',
        userEmail: userData.userEmail,
        userDisplayName: userData.userDisplayName,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationDoc);

      // Get admin users for notification
      const adminsQuery = query(
        collection(db, USERS_COLLECTION),
        where('isAdmin', '==', true)
      );
      const adminsSnapshot = await getDocs(adminsQuery);
      
      const adminEmails = adminsSnapshot.docs.map(doc => doc.data().email);

      if (adminEmails.length > 0) {
        showAdminNotification(adminEmails, userData.userEmail, userData.userDisplayName);
      }

      return {
        message: 'Admin notification created successfully'
      };
    } catch (error) {
      console.error('Error notifying admin:', error);
      throw error;
    }
  },

  // Check if user is admin
  checkAdminStatus: async (userId: string) => {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('clerkId', '==', userId)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return false;
      }

      const userData = querySnapshot.docs[0].data();
      return userData.isAdmin === true && userData.approvalStatus === 'approved';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Create first admin user (call this manually for setup)
  createAdminUser: async (adminData: {
    userId: string;
    email: string;
    displayName: string | null;
  }) => {
    try {
      const adminDoc = {
        clerkId: adminData.userId,
        email: adminData.email,
        displayName: adminData.displayName,
        approvalStatus: 'approved',
        isAdmin: true,
        registrationDate: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, USERS_COLLECTION), adminDoc);

      return {
        message: 'Admin user created successfully'
      };
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }
};

// Helper functions for notifications
function showApprovalNotification(userEmail: string, displayName: string | null, isApproved: boolean, rejectionReason?: string) {
  const title = isApproved ? 'User Approved' : 'User Rejected';
  const message = isApproved 
    ? `${displayName || userEmail} has been approved. You can optionally contact them at ${userEmail}.`
    : `${displayName || userEmail} has been rejected. ${rejectionReason ? `Reason: ${rejectionReason}. ` : ''}You can contact them at ${userEmail}.`;

  Alert.alert(
    title,
    message,
    [
      { text: 'OK', style: 'default' },
      {
        text: 'Send Email',
        style: 'default',
        onPress: () => openEmailApp(userEmail, isApproved, displayName, rejectionReason)
      }
    ]
  );
}

function showAdminNotification(adminEmails: string[], userEmail: string, displayName: string | null) {
  console.log(`New registration notification for admins: ${adminEmails.join(', ')}`);
  console.log(`User: ${displayName || 'Unknown'} (${userEmail})`);
  
  // In a real app, you could:
  // 1. Use push notifications
  // 2. Use Firebase Cloud Messaging
  // 3. Display in-app notifications
  // 4. Send emails via Firebase Functions
}

function openEmailApp(userEmail: string, isApproved: boolean, displayName: string | null, rejectionReason?: string) {
  const subject = isApproved ? 'Account Approved - Welcome to VITAP App!' : 'Account Application Update';
  const body = isApproved 
    ? `Hi ${displayName || 'there'},\n\nGreat news! Your account has been approved and you can now access the VITAP app.\n\nYou can now log in using your registered email address.\n\nBest regards,\nVITAP Team`
    : `Hi ${displayName || 'there'},\n\nWe regret to inform you that your account application has been rejected.\n\n${rejectionReason ? `Reason: ${rejectionReason}\n\n` : ''}If you have any questions, please contact support at support@vitap.ac.in\n\nBest regards,\nVITAP Team`;

  const emailUrl = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  Linking.openURL(emailUrl).catch(err => {
    console.error('Error opening email app:', err);
    Alert.alert('Error', 'Could not open email app. Please send the notification manually.');
  });
}

export default userApi;