export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  // Admin approval fields
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isAdmin: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  registrationDate: Date;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AdminRequest {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string | null;
  registrationDate: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

// Add this default export to fix the warning:
import React from 'react';

export default function DummyComponent() {
  return null;
}
