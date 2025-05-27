import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Settings, Bell, LogOut, Camera, Globe } from 'lucide-react-native';
import { useAuth } from '../(auth)/context/AuthProvider';
import { useRouter } from 'expo-router';

const menuItems = [
  { icon: Bell, label: 'Notifications', color: '#F59E0B' },
  { icon: Settings, label: 'Preferences', color: '#10B981', action: 'preferences' },
  { icon: Globe, label: 'VTOP', color: '#3B82F6', action: 'vtop' },
  { icon: LogOut, label: 'Logout', color: '#EF4444', action: 'logout' },
];

function ProfilePage() {
  const { user, logout, uploadProfileImage, isLoading } = useAuth();
  const router = useRouter();
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleMenuItemPress = async (action: string | undefined) => {
    if (action === 'logout') {
      try {
        await logout();
        router.replace('/login');
      } catch (error) {
        Alert.alert('Logout Failed', 'An error occurred while logging out.');
      }
    } else if (action === 'preferences') {
      router.push('/settings');
    } else if (action === 'vtop') {
      Linking.openURL('https://vtop.vitap.ac.in/vtop/open/page');
    }
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0].uri) {
        setUploadingImage(true);
        try {
          await uploadProfileImage(result.assets[0].uri);
          Alert.alert('Success', 'Profile picture updated successfully!');
        } catch (error: any) {
          console.error('Error uploading image:', error);
          Alert.alert('Upload Failed', `Failed to upload profile picture: ${error.message || 'Unknown error'}`);
        } finally {
          setUploadingImage(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'An error occurred while selecting the image.');
      setUploadingImage(false);
    }
  };

  const emailDomain = user?.email ? user.email.split('@')[1] : '';
  const isStudent = emailDomain === 'vitapstudent.ac.in';
  const profileImage = user?.photoURL || 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {uploadingImage ? (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
              </View>
            ) : (
              <>
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                  <Camera size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            )}
          </View>
          <Text style={styles.name}>{user?.displayName || 'Faculty Member'}</Text>
          <Text style={styles.email}>{user?.email || 'faculty@example.com'}</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>Faculty</Text>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={() => handleMenuItemPress(item.action)}>
            <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
              <item.icon size={24} color={item.color} />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Account Information</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>User Type</Text>
          <Text style={styles.infoValue}>Faculty</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Department</Text>
          <Text style={styles.infoValue}>Computer Science (Example)</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3A33A3',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: {
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3366FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
  },
  email: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 4,
  },
  badgeContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badge: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  infoSection: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
});

export default ProfilePage;
