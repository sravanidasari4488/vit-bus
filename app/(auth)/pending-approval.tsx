import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/AuthProvider';

export default function PendingApproval() {
  const router = useRouter();
  const { user, logout, checkApprovalStatus, isRejected, isPending } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const handleRefreshStatus = async () => {
    try {
      await checkApprovalStatus();
      if (user?.approvalStatus === 'approved') {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
    }
  };

  const getStatusColor = () => {
    if (isRejected()) return '#EF4444';
    if (isPending()) return '#F59E0B';
    return '#10B981';
  };

  const getStatusIcon = () => {
    if (isRejected()) return 'close-circle';
    if (isPending()) return 'time';
    return 'checkmark-circle';
  };

  const getStatusText = () => {
    if (isRejected()) return 'Application Rejected';
    if (isPending()) return 'Pending Approval';
    return 'Approved';
  };

  const getStatusMessage = () => {
    if (isRejected()) {
      return `Your application has been rejected. ${user?.rejectionReason ? `Reason: ${user.rejectionReason}` : 'Please contact support for more information.'}`;
    }
    if (isPending()) {
      return 'Your account is pending admin approval. You will receive an email notification once your account has been reviewed and approved.';
    }
    return 'Your account has been approved! You can now access the app.';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Account Status</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons name={getStatusIcon()} size={48} color={getStatusColor()} />
          </View>
          
          <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <Text style={styles.statusMessage}>
            {getStatusMessage()}
          </Text>

          {user?.registrationDate && (
            <Text style={styles.registrationDate}>
              Applied on: {new Date(user.registrationDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isPending() && (
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshStatus}
            >
              <Ionicons name="refresh" size={20} color="#6366F1" />
              <Text style={styles.refreshButtonText}>Check Status</Text>
            </TouchableOpacity>
          )}

          {isRejected() && (
            <TouchableOpacity
              style={styles.supportButton}
              onPress={() => {
                Alert.alert(
                  'Contact Support',
                  'Please contact support at support@vitap.ac.in for assistance with your application.',
                  [{ text: 'OK' }]
                );
              }}
            >
              <Ionicons name="help-circle" size={20} color="#6366F1" />
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          
          {isPending() && (
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Ionicons name="checkmark" size={16} color="#10B981" />
                <Text style={styles.infoText}>
                  Your application has been submitted successfully
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color="#F59E0B" />
                <Text style={styles.infoText}>
                  Admin is reviewing your application
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="mail" size={16} color="#6B7280" />
                <Text style={styles.infoText}>
                  You'll receive an email notification with the decision
                </Text>
              </View>
            </View>
          )}

          {isRejected() && (
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle" size={16} color="#6366F1" />
                <Text style={styles.infoText}>
                  Review the rejection reason above
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="help-circle" size={16} color="#6366F1" />
                <Text style={styles.infoText}>
                  Contact support if you need clarification
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  logoutButton: {
    padding: 8,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  statusMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  registrationDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  refreshButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});