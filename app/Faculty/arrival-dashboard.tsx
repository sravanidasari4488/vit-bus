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
import { Clock, MapPin, Bus, RefreshCw, Calendar, Map } from 'lucide-react-native';

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
  stopsCoordinates: { name: string; lat: number; lng: number }[];
  busId: string; // GPS tracker ID
}

// All routes data with GPS coordinates and bus IDs
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
    stopsCoordinates: [
      { name: 'Kankipadu', lat: 12.52746, lng: 80.628769 },
      { name: 'Gosala', lat: 16.52746, lng: 80.628769},
      { name: 'Edupugallu', lat: 16.5282, lng: 80.6292 },
      { name: 'Penumaluru', lat: 16.5120, lng: 80.6204 },
      { name: 'Poranki', lat: 16.5032, lng: 80.6310 }
    ],
    busId: 'VV-12'
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
    stopsCoordinates: [
      { name: 'Poranki center', lat: 16.5032, lng: 80.6310 },
      { name: 'Thumu center', lat: 16.5045, lng: 80.6325 },
      { name: 'Tadigadapa', lat: 16.5058, lng: 80.6340 },
      { name: 'KCP colony', lat: 16.5071, lng: 80.6355 },
      { name: 'VR Siddartha', lat: 16.5084, lng: 80.6370 },
      { name: 'Bharath petrol pump', lat: 16.5097, lng: 80.6385 },
      { name: 'Kamayyathopu', lat: 16.5110, lng: 80.6400 },
      { name: 'Time hospital', lat: 16.5123, lng: 80.6415 }
    ],
    busId: 'VV-13'
  },
  {
    routeId: 'vv3',
    routeName: 'VV3',
    description: 'Kamayyathopu center to Screw bridge',
    stops: ['Kamayyathopu center', 'Pappula mill center', 'Ashok nagar', 'Time hospital', 'Auto nagar gate', 'Screw bridge'],
    schedule: [
      { time: '07:40 AM', stopName: 'Kamayyathopu center' },
      { time: '07:42 AM', stopName: 'Pappula mill center' },
      { time: '07:45 AM', stopName: 'Ashok nagar' },
      { time: '07:47 AM', stopName: 'Time hospital' },
      { time: '07:48 AM', stopName: 'Auto nagar gate' },
      { time: '07:58 AM', stopName: 'Screw bridge' },
    ],
    stopsCoordinates: [
      { name: 'Kamayyathopu center', lat: 16.5110, lng: 80.6400 },
      { name: 'Pappula mill center', lat: 16.5125, lng: 80.6420 },
      { name: 'Ashok nagar', lat: 16.5140, lng: 80.6440 },
      { name: 'Time hospital', lat: 16.5123, lng: 80.6415 },
      { name: 'Auto nagar gate', lat: 16.5155, lng: 80.6460 },
      { name: 'Screw bridge', lat: 16.5170, lng: 80.6480 }
    ],
    busId: 'VV-14'
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
    stopsCoordinates: [
      { name: 'Lodge center', lat: 16.2970, lng: 80.4365 },
      { name: 'Arundalpeta', lat: 16.2985, lng: 80.4380 },
      { name: 'Sankar vilas', lat: 16.3000, lng: 80.4395 },
      { name: 'Naaz center', lat: 16.3015, lng: 80.4410 },
      { name: 'Market - Guntur', lat: 16.3030, lng: 80.4425 },
      { name: 'Chandana bros', lat: 16.3045, lng: 80.4440 },
      { name: 'Bus stand - Guntur', lat: 16.3060, lng: 80.4455 }
    ],
    busId: 'GV-15'
  }
];

// Utility function to calculate distance in meters
function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function ArrivalDashboard() {
  const [stopArrivalTimes, setStopArrivalTimes] = useState<{ [routeId: string]: { [stopName: string]: string } }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [busDistances, setBusDistances] = useState<{ [routeId: string]: number }>({});
  const [busPositions, setBusPositions] = useState<{ [routeId: string]: { lat: number, lng: number } }>({});

  // Initialize distances to 0 for all routes
  useEffect(() => {
    const initialDistances: { [routeId: string]: number } = {};
    allRoutes.forEach(route => {
      initialDistances[route.routeId] = 0;
    });
    setBusDistances(initialDistances);
  }, []);

  // Track all buses and their arrival times
  useEffect(() => {
    const trackAllBuses = async () => {
      try {
        for (const route of allRoutes) {
          const res = await fetch(`https://git-backend-1-production.up.railway.app/api/gps/latest_location/${route.busId}`);
          const data = await res.json();
          
          if (!data?.lat || !data?.lon) continue;

          const busLat = parseFloat(data.lat);
          const busLon = parseFloat(data.lon);

          // Calculate distance traveled if we have previous position
          if (busPositions[route.routeId]) {
            const prevPos = busPositions[route.routeId];
            const distance = getDistanceFromLatLonInMeters(
              prevPos.lat, 
              prevPos.lng, 
              busLat, 
              busLon
            );
            
            // Only add to distance if it's a reasonable movement (not GPS jump)
            if (distance < 100) { // Filter out jumps > 100m
              setBusDistances(prev => ({
                ...prev,
                [route.routeId]: prev[route.routeId] + distance
              }));
            }
          }

          // Update current position
          setBusPositions(prev => ({
            ...prev,
            [route.routeId]: { lat: busLat, lng: busLon }
          }));

          route.stopsCoordinates.forEach((stop) => {
            const distance = getDistanceFromLatLonInMeters(busLat, busLon, stop.lat, stop.lng);
            
            if (distance < 50 && !stopArrivalTimes[route.routeId]?.[stop.name]) {
              const now = new Date();
              const hr = now.getHours();
              const min = now.getMinutes().toString().padStart(2, '0');
              const ampm = hr >= 12 ? "PM" : "AM";
              const hr12 = hr % 12 || 12;
              const time = `${hr12}:${min} ${ampm}`;

              setStopArrivalTimes(prev => ({
                ...prev,
                [route.routeId]: {
                  ...prev[route.routeId],
                  [stop.name]: time
                }
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error tracking buses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load
    trackAllBuses();
    
    // Set up interval to track buses every 10 seconds
    const interval = setInterval(trackAllBuses, 10000);
    return () => clearInterval(interval);
  }, [stopArrivalTimes, busPositions]);

  // Generate arrival data for display
  const generateArrivalData = (): ArrivalData[] => {
    const arrivalData: ArrivalData[] = [];
    
    allRoutes.forEach(route => {
      route.schedule.forEach(scheduleItem => {
        const actualTime = stopArrivalTimes[route.routeId]?.[scheduleItem.stopName] || null;
        let delay = 0;
        let status: 'on-time' | 'delayed' | 'early' | 'pending' = 'pending';
        
        arrivalData.push({
          routeId: route.routeId,
          stopName: scheduleItem.stopName,
          scheduledTime: scheduleItem.time,
          actualTime,
          status,
          delay,
          timestamp: new Date().toISOString(),
        });
      });
    });
    
    return arrivalData;
  };

  const arrivalData = generateArrivalData();

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    // Reset arrival times to get fresh data
    setStopArrivalTimes({});
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
          <Text style={styles.headerTitle}>Live Arrival Dashboard</Text>
          <Text style={styles.headerSubtitle}>Real-time bus arrival tracking</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <RefreshCw size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {/* Route Filter */}
       <ScrollView 
        horizontal 
        style={styles.filterContainer} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
          {['all', ...allRoutes.map(r => r.routeId)].map(routeId => {
          const isAll = routeId === 'all';
          const route = allRoutes.find(r => r.routeId === routeId);
          return (
            <TouchableOpacity
              key={routeId}
              style={[
                styles.filterButton, 
                selectedRoute === routeId && styles.filterButtonActive
              ]}
              onPress={() => setSelectedRoute(routeId)}
            >
              <Text style={[
                styles.filterText, 
                selectedRoute === routeId && styles.filterTextActive
              ]}>
                {isAll ? 'All' : route?.routeName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Distance Summary */}
        <View style={styles.distanceSummary}>
          <Text style={styles.sectionTitle}>Distance Traveled</Text>
          <View style={styles.distanceGrid}>
            {allRoutes.map(route => (
              <View key={route.routeId} style={styles.distanceCard}>
                <View style={styles.distanceHeader}>
                  <Bus size={16} color="#2563EB" />
                  <Text style={styles.distanceRoute}>{route.routeName}</Text>
                </View>
                <Text style={styles.distanceValue}>
                  {(busDistances[route.routeId] / 1000).toFixed(1)} km
                </Text>
                <Text style={styles.distanceBusId}>{route.busId}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Arrival Data */}
        {Object.entries(groupedData).map(([routeId, routeArrivals]) => {
          const route = allRoutes.find(r => r.routeId === routeId);
          if (!route) return null;

          return (
            <View key={routeId} style={styles.routeSection}>
              <View style={styles.routeHeader}>
                <View style={styles.routeTitle}>
                  <Bus size={20} color="#2563EB" />
                  <Text style={styles.routeName}>{route.routeName}</Text>
                  <Text style={styles.routeId}>{route.busId}</Text>
                </View>
                <Text style={styles.routeDescription}>{route.description}</Text>
              </View>

              <View style={styles.arrivalTable}>
                <View style={styles.tableHeader}>
                  <Text style={styles.headerCell}>Stop</Text>
                  <Text style={styles.headerCell}>Scheduled</Text>
                  <Text style={styles.headerCell}>Actual</Text>
                </View>

                {routeArrivals.map((arrival, index) => (
                  <View key={index} style={styles.tableRow}>
                    <View style={styles.stopCell}>
                      <MapPin size={14} color="#6B7280" />
                      <Text style={styles.stopName}>{arrival.stopName}</Text>
                    </View>
                    <Text style={styles.timeCell}>{arrival.scheduledTime}</Text>
                    <Text style={[
                      styles.timeCell,
                      arrival.actualTime && styles.arrivedTime
                    ]}>
                      {arrival.actualTime || '-'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <View style={styles.footer}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.footerText}>
            Live tracking active • Updates every 10 seconds
          </Text>
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8, // Reduced padding
  },
  filterContent: {
    paddingHorizontal: 12, // Reduced padding
  },
 filterButton: {
    paddingHorizontal: 12, // Reduced from 16
    paddingVertical: 6,    // Reduced from 8
    borderRadius: 20,
    marginRight: 6,        // Reduced from 8
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 60,          // Added minimum width
    alignItems: 'center',  // Ensure text stays centered
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    fontSize: 13,          // Slightly smaller font
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  mainContent: {
    // flex: 1,
    paddingVertical:12,
    paddingHorizontal: 16,
    height: 500,
  },
  distanceSummary: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  distanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  distanceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  distanceValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563EB',
    marginVertical: 4,
  },
  distanceBusId: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  routeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  routeHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  routeTitle: {
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
  routeId: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  routeDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  arrivalTable: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  stopCell: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopName: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  timeCell: {
    flex: 1,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  arrivedTime: {
    color: '#059669',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
});

export default ArrivalDashboard;
