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

      // Send approval email (you can integrate with email service)
      await sendApprovalEmail(userData.email, userData.displayName, true);

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

      // Send rejection email
      await sendApprovalEmail(userData.email, userData.displayName, false, reason);

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

      // Get admin users to send email notifications
      const adminsQuery = query(
        collection(db, USERS_COLLECTION),
        where('isAdmin', '==', true)
      );
      const adminsSnapshot = await getDocs(adminsQuery);
      
      const adminEmails = adminsSnapshot.docs.map(doc => doc.data().email);

      if (adminEmails.length > 0) {
        await sendAdminNotificationEmail(adminEmails, userData.userEmail, userData.userDisplayName);
      }

      return {
        message: 'Admin notification sent successfully'
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

// Email functions (you can integrate with your preferred email service)
async function sendApprovalEmail(userEmail: string, displayName: string | null, isApproved: boolean, rejectionReason?: string) {
  // Since we're using client-side Firebase, we'll use a cloud function or external email service
  // For now, we'll just log the email content
  
  const emailContent = {
    to: userEmail,
    subject: isApproved ? 'Account Approved - Welcome!' : 'Account Application Update',
    body: isApproved 
      ? `Hi ${displayName || 'there'}, Your account has been approved! You can now access the VITAP app.`
      : `Hi ${displayName || 'there'}, Your account application has been rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ''} Contact support@vitap.ac.in for assistance.`
  };

  console.log('Email to send:', emailContent);
  
  // TODO: Integrate with email service like:
  // - Firebase Cloud Functions with SendGrid
  // - Expo's email service
  // - Third-party email API
}

async function sendAdminNotificationEmail(adminEmails: string[], userEmail: string, displayName: string | null) {
  const emailContent = {
    to: adminEmails,
    subject: 'New User Registration - Approval Required',
    body: `New user registration: ${displayName || 'Unknown'} (${userEmail}) requires approval.`
  };

  console.log('Admin notification email:', emailContent);
  
  // TODO: Integrate with email service
}

export default userApi;