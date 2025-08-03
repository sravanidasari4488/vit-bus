import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../(auth)/context/AuthProvider';
import { userApi } from '../../src/services/api';
import { AdminRequest } from '../types/auth';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<AdminRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isUserAdmin) {
      loadPendingRequests();
    }
  }, [isUserAdmin]);

  const checkAdminStatus = async () => {
    if (user?.id) {
      try {
        const adminStatus = await userApi.checkAdminStatus(user.id);
        setIsUserAdmin(adminStatus);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsUserAdmin(false);
      }
    }
  };

  const loadPendingRequests = async () => {
    try {
      setIsLoading(true);
      const requests = await userApi.getPendingApprovals();
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      Alert.alert('Error', 'Failed to load pending requests');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingRequests();
    setRefreshing(false);
  };

  const handleApproveUser = async (request: AdminRequest) => {
    Alert.alert(
      'Approve User',
      `Are you sure you want to approve ${request.userEmail}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              await userApi.approveUser(request.userId, user!.id);
              setPendingRequests(prev =>
                prev.filter(req => req.id !== request.id)
              );
              Alert.alert('Success', 'User approved successfully');
            } catch (error) {
              console.error('Error approving user:', error);
              Alert.alert('Error', 'Failed to approve user');
            }
          },
        },
      ]
    );
  };

  const handleRejectUser = (request: AdminRequest) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const confirmRejectUser = async () => {
    if (!selectedRequest) return;

    try {
      await userApi.rejectUser(
        selectedRequest.userId,
        user!.id,
        rejectionReason.trim() || undefined
      );
      setPendingRequests(prev =>
        prev.filter(req => req.id !== selectedRequest.id)
      );
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      Alert.alert('Success', 'User rejected successfully');
    } catch (error) {
      console.error('Error rejecting user:', error);
      Alert.alert('Error', 'Failed to reject user');
    }
  };

  const renderRequestItem = ({ item }: { item: AdminRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.userDisplayName || 'Unknown User'}
          </Text>
          <Text style={styles.userEmail}>{item.userEmail}</Text>
          <Text style={styles.registrationDate}>
            Applied: {item.registrationDate ? new Date(item.registrationDate).toLocaleDateString() : 'Unknown'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>PENDING</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApproveUser(item)}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.approveButtonText}>Approve</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectUser(item)}
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="checkmark-circle" size={64} color="#10B981" />
      <Text style={styles.emptyStateTitle}>All caught up!</Text>
      <Text style={styles.emptyStateMessage}>
        No pending user approval requests at the moment.
      </Text>
    </View>
  );

  if (!isUserAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="ban" size={64} color="#EF4444" />
          <Text style={styles.accessDeniedTitle}>Access Denied</Text>
          <Text style={styles.accessDeniedMessage}>
            You don't have admin privileges to access this page.
          </Text>
          <TouchableOpacity 
            style={styles.refreshAdminButton}
            onPress={checkAdminStatus}
          >
            <Text style={styles.refreshAdminButtonText}>Check Admin Status</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>
          {pendingRequests.length} pending approval{pendingRequests.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={pendingRequests}
        renderItem={renderRequestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Rejection Modal */}
      <Modal
        visible={showRejectModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRejectModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reject User</Text>
            <TouchableOpacity
              onPress={() => setShowRejectModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.rejectUserInfo}>
              Rejecting: {selectedRequest?.userEmail}
            </Text>

            <Text style={styles.reasonLabel}>
              Reason for rejection (optional):
            </Text>
            <TextInput
              style={styles.reasonInput}
              value={rejectionReason}
              onChangeText={setRejectionReason}
              placeholder="Enter reason for rejection..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmRejectButton}
                onPress={confirmRejectUser}
              >
                <Text style={styles.confirmRejectButtonText}>Reject User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  registrationDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 6,
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginTop: 16,
    marginBottom: 8,
  },
  accessDeniedMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  refreshAdminButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshAdminButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  rejectUserInfo: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 24,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    minHeight: 100,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  confirmRejectButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#EF4444',
  },
  confirmRejectButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});