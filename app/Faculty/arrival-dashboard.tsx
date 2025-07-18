import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Clock, MapPin, Bus, RefreshCw, Calendar } from 'lucide-react-native';

interface ArrivalData {
  routeId: string;
  stopName: string;
  scheduledTime: string;
  actualTime: string | null;
  status: 'on-time' | 'delayed' | 'early' | 'pending';
  delay: number; // in minutes
  timestamp: string;
}

interface RouteData {
  routeId: string;
  routeName: string;
  description: string;
  stops: string[];
  schedule: { time: string; stopName: string }[];
}

// All routes data
const allRoutes: RouteData[] = [
  {
    routeId: 'vv1',
    routeName: 'VV1',
    description: 'Kankipadu to Poranki',
    stops: ['Kankipadu', 'Gosala', 'Edupugallu', 'Penumaluru', 'Poranki'],
    schedule: [
      { time: '07:25 AM', stopName: 'Kankipadu' },
      { time: '07:30 AM', stopName: 'Gosala' },
      { time: '07:32 AM', stopName: 'Edupugallu' },
      { time: '07:40 AM', stopName: 'Penumaluru' },
      { time: '07:45 AM', stopName: 'Poranki' },
    ],
  },
  {
    routeId: 'vv2',
    routeName: 'VV2',
    description: 'Poranki center to Time Hospital',
    stops: ['Poranki center', 'Thumu center', 'Tadigadapa', 'KCP colony', 'VR Siddartha', 'Bharath petrol pump', 'Kamayyathopu', 'Time hospital'],
    schedule: [
      { time: '07:40 AM', stopName: 'Poranki center' },
      { time: '07:43 AM', stopName: 'Thumu center' },
      { time: '07:45 AM', stopName: 'Tadigadapa' },
      { time: '07:48 AM', stopName: 'KCP colony' },
      { time: '07:50 AM', stopName: 'VR Siddartha' },
      { time: '07:52 AM', stopName: 'Bharath petrol pump' },
      { time: '07:55 AM', stopName: 'Kamayyathopu' },
      { time: '08:00 AM', stopName: 'Time hospital' },
    ],
  },
  {
    routeId: 'gv1',
    routeName: 'GV1',
    description: 'Lodge center to Bus stand - Guntur',
    stops: ['Lodge center', 'Arundalpeta', 'Sankar vilas', 'Naaz center', 'Market - Guntur', 'Chandana bros', 'Bus stand - Guntur'],
    schedule: [
      { time: '07:20 AM', stopName: 'Lodge center' },
      { time: '07:23 AM', stopName: 'Arundalpeta' },
      { time: '07:30 AM', stopName: 'Sankar vilas' },
      { time: '07:35 AM', stopName: 'Naaz center' },
      { time: '07:40 AM', stopName: 'Market - Guntur' },
      { time: '07:42 AM', stopName: 'Chandana bros' },
      { time: '07:45 AM', stopName: 'Bus stand - Guntur' },
    ],
  },
  // Add more routes as needed
];

function ArrivalDashboard() {
  const [arrivalData, setArrivalData] = useState<ArrivalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());

  // Utility function to calculate delay in minutes
  const calculateDelay = (scheduled: string, actual: string): number => {
    const scheduledTime = new Date(`1970/01/01 ${scheduled}`);
    const actualTime = new Date(`1970/01/01 ${actual}`);
    return Math.round((actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
  };

  // Utility function to determine status
  const getStatus = (delay: number): 'on-time' | 'delayed' | 'early' => {
    if (delay > 5) return 'delayed';
    if (delay < -2) return 'early';
    return 'on-time';
  };

  // Fetch arrival data from backend
  const fetchArrivalData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call - replace with actual backend endpoint
      const response = await fetch('https://git-backend-1-production.up.railway.app/api/arrivals/all');
      
      if (!response.ok) {
        // If API fails, generate mock data for demonstration
        const mockData = generateMockArrivalData();
        setArrivalData(mockData);
        return;
      }
      
      const data = await response.json();
      setArrivalData(data);
    } catch (error) {
      console.error('Error fetching arrival data:', error);
      // Generate mock data as fallback
      const mockData = generateMockArrivalData();
      setArrivalData(mockData);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock arrival data for demonstration
  const generateMockArrivalData = (): ArrivalData[] => {
    const mockData: ArrivalData[] = [];
    const today = new Date();
    
    allRoutes.forEach(route => {
      route.schedule.forEach(scheduleItem => {
        // Simulate some buses having arrived with random delays
        const hasArrived = Math.random() > 0.3;
        let actualTime = null;
        let delay = 0;
        
        if (hasArrived) {
          // Generate random delay between -5 to +15 minutes
          delay = Math.floor(Math.random() * 21) - 5;
          const scheduledTime = new Date(`1970/01/01 ${scheduleItem.time}`);
          const actualTimeObj = new Date(scheduledTime.getTime() + delay * 60000);
          actualTime = actualTimeObj.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          });
        }
        
        mockData.push({
          routeId: route.routeId,
          stopName: scheduleItem.stopName,
          scheduledTime: scheduleItem.time,
          actualTime,
          status: actualTime ? getStatus(delay) : 'pending',
          delay,
          timestamp: today.toISOString(),
        });
      });
    });
    
    return mockData;
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchArrivalData();
    setRefreshing(false);
  };

  // Filter data based on selected route
  const filteredData = selectedRoute === 'all' 
    ? arrivalData 
    : arrivalData.filter(item => item.routeId === selectedRoute);

  // Group data by route
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.routeId]) {
      acc[item.routeId] = [];
    }
    acc[item.routeId].push(item);
    return acc;
  }, {} as Record<string, ArrivalData[]>);

  useEffect(() => {
    fetchArrivalData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchArrivalData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return '#10B981';
      case 'delayed': return '#EF4444';
      case 'early': return '#3B82F6';
      case 'pending': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-time': return 'On Time';
      case 'delayed': return 'Delayed';
      case 'early': return 'Early';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading arrival data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Arrival Dashboard</Text>
          <Text style={styles.headerSubtitle}>Real-time bus arrival tracking</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Route Filter */}
      <ScrollView horizontal style={styles.filterContainer} showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[styles.filterButton, selectedRoute === 'all' && styles.filterButtonActive]}
          onPress={() => setSelectedRoute('all')}
        >
          <Text style={[styles.filterText, selectedRoute === 'all' && styles.filterTextActive]}>
            All Routes
          </Text>
        </TouchableOpacity>
        {allRoutes.map(route => (
          <TouchableOpacity
            key={route.routeId}
            style={[styles.filterButton, selectedRoute === route.routeId && styles.filterButtonActive]}
            onPress={() => setSelectedRoute(route.routeId)}
          >
            <Text style={[styles.filterText, selectedRoute === route.routeId && styles.filterTextActive]}>
              {route.routeName}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {arrivalData.filter(item => item.status === 'on-time').length}
          </Text>
          <Text style={styles.statLabel}>On Time</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#EF4444' }]}>
            {arrivalData.filter(item => item.status === 'delayed').length}
          </Text>
          <Text style={styles.statLabel}>Delayed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#6B7280' }]}>
            {arrivalData.filter(item => item.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* Arrival Data */}
      <ScrollView 
        style={styles.dataContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {Object.entries(groupedData).map(([routeId, routeArrivals]) => {
          const route = allRoutes.find(r => r.routeId === routeId);
          if (!route) return null;

          return (
            <View key={routeId} style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <View style={styles.routeInfo}>
                  <Bus size={20} color="#2563EB" />
                  <Text style={styles.routeName}>{route.routeName}</Text>
                </View>
                <Text style={styles.routeDescription}>{route.description}</Text>
              </View>

              <View style={styles.arrivalsList}>
                {/* Header Row */}
                <View style={styles.arrivalHeader}>
                  <Text style={styles.columnHeader}>Stop</Text>
                  <Text style={styles.columnHeader}>Scheduled</Text>
                  <Text style={styles.columnHeader}>Actual</Text>
                  <Text style={styles.columnHeader}>Status</Text>
                </View>

                {/* Data Rows */}
                {routeArrivals.map((arrival, index) => (
                  <View key={index} style={styles.arrivalRow}>
                    <View style={styles.stopColumn}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={styles.stopName}>{arrival.stopName}</Text>
                    </View>
                    <Text style={styles.scheduledTime}>{arrival.scheduledTime}</Text>
                    <Text style={styles.actualTime}>
                      {arrival.actualTime || '-'}
                    </Text>
                    <View style={styles.statusColumn}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(arrival.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(arrival.status) }]}>
                        {getStatusText(arrival.status)}
                        {arrival.actualTime && arrival.delay !== 0 && (
                          <Text style={styles.delayText}>
                            {arrival.delay > 0 ? ` (+${arrival.delay}m)` : ` (${arrival.delay}m)`}
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  filterContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  dataContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  routeHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  routeDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  arrivalsList: {
    padding: 16,
  },
  arrivalHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  columnHeader: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  stopColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopName: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 6,
    flex: 1,
  },
  scheduledTime: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  actualTime: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '500',
  },
  statusColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  delayText: {
    fontSize: 10,
    fontWeight: 'normal',
  },
});

export default ArrivalDashboard;