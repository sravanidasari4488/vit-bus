import React, {useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Clock, Bell, Search, Star, Info } from 'lucide-react-native';
import { useAuth } from '../(auth)/context/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width } = Dimensions.get('window');

const features = [
  {
    icon: MapPin,
    title: 'Real-time Tracking',
    description: 'Track your bus with live GPS updates',
  },
  {
    icon: Clock,
    title: 'Live Schedule',
    description: 'Get accurate arrival times',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Never miss your bus again',
  },
];

const popularRoutes = [
  { id: 'vv1', name: 'VV1', from: 'Campus A', to: 'Campus B' },
  { id: 'vv2', name: 'VV2', from: 'Campus C', to: 'Campus D' },
  { id: 'vv3', name: 'VV3', from: 'Campus E', to: 'Campus F' },
];

 


function HomeScreen() {
  const router = useRouter();
  const [userSelectedRoute, setUserSelectedRoute] = useState<string | null>(null);

  useEffect(() => {
    const loadRoute = async () => {
      const savedRoute = await AsyncStorage.getItem('selectedRoute');
      if (savedRoute) setUserSelectedRoute(savedRoute);
    };
    loadRoute();
  }, []);
  
    const goToUserRoute = () => {
    if (!userSelectedRoute) {
      alert('Please select a route first.');
      return;
    }
    const path = `/routes/${userSelectedRoute.toLowerCase()}`;
    router.push(path);
  };
  const goToAllRoutes = () => {
    router.push('/routes');
  };
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.title}>VIT-AP</Text>
          <Text style={styles.subtitle}>BUS TRACKING</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/bus-routes')}>
        <Search size={20} color="#64748B" />
        <Text style={styles.searchText}>Search for bus routes...</Text>
      </TouchableOpacity>

     

      {/* Popular Routes */}
      <View style={styles.popularRoutes}>
        <View style={styles.sectionHeader}>
          <Star size={20} color="#FACC15" />
          <Text style={styles.sectionTitle}>Popular Routes</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routesScroll}>
          {popularRoutes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={styles.routeCard}
              onPress={() => router.push(`/routes/${route.id.toLowerCase()}`)}
            >
              <Text style={styles.routeName}>{route.name}</Text>
              <View style={styles.routeDetails}>
                <Text style={styles.routeText}>{route.from}</Text>
                <Text style={{ marginHorizontal: 4 }}>➡️</Text>
                <Text style={styles.routeText}>{route.to}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Features Section */}
      <View style={styles.features}>
        <View style={styles.sectionHeader}>
          <Info size={20} color="#3366FF" />
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
        </View>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIcon}>
              <feature.icon size={24} color="#3366FF" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      <Image source={require('./bus.jpeg')} style={styles.cityImage} />

      {/* Button to open the user’s selected bus route */}
      <TouchableOpacity style={styles.exploreButton} onPress={goToUserRoute}>
        <Text style={styles.exploreButtonText}>Go to My Route</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/bus-routes')}>
        <Text style={styles.exploreButtonText}>Explore All Routes</Text>
      </TouchableOpacity>
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
  headerContent: {
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#E0E7FF',
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -25,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#64748B',
  },
  cityImage: {
    width: '100%',
    height: 200,
    marginTop: 32,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#3366FF',
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  features: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    backgroundColor: '#E0E7FF',
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  popularRoutes: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1E293B',
  },
  routesScroll: {
    paddingRight: 20,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: width * 0.7,
  },
  routeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  routeText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
});

export default HomeScreen;
