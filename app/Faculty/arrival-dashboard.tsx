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
import { Clock, MapPin, Bus, RefreshCw, Calendar, Route } from 'lucide-react-native';

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

interface LocationData {
  lat: number;
  lon: number;
  timestamp: string;
}

interface DistanceData {
  routeId: string;
  busId: string;
  dailyDistance: number;
  lastUpdated: string;
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
      { name: 'Kankipadu', lat: 16.52746, lng: 80.628769 },
      { name: 'Gosala', lat: 16.5292, lng: 80.6310 },
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

function ArrivalDashboard() {
  const [stopArrivalTimes, setStopArrivalTimes] = useState<{ [routeId: string]: { [stopName: string]: string } }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('all');
  const [distanceData, setDistanceData] = useState<{ [routeId: string]: DistanceData }>({});
  const [previousLocations, setPreviousLocations] = useState<{ [busId: string]: LocationData }>({});

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

          // Calculate distance traveled
          const currentLocation: LocationData = {
            lat: busLat,
            lon: busLon,
            timestamp: new Date().toISOString()
          };

          if (previousLocations[route.busId]) {
            const prevLocation = previousLocations[route.busId];
            const distance = getDistanceFromLatLonInMeters(
              prevLocation.lat,
              prevLocation.lon,
              busLat,
              busLon
            );

            // Only add distance if bus moved more than 10 meters (to avoid GPS noise)
            if (distance > 10) {
              setDistanceData(prev => ({
                ...prev,
                [route.routeId]: {
                  routeId: route.routeId,
                  busId: route.busId,
                  dailyDistance: (prev[route.routeId]?.dailyDistance || 0) + (distance / 1000), // Convert to km
                  lastUpdated: new Date().toISOString()
                }
              }));
            }
          }

          // Update previous location
          setPreviousLocations(prev => ({
            ...prev,
            [route.busId]: currentLocation
          }));

          route.stopsCoordinates.forEach((stop) => {
            const distance = getDistanceFromLatLonInMeters(busLat, busLon, stop.lat, stop.lng);
            
            // If bus is within 50 meters of stop and we haven't recorded arrival time yet
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

              // Send arrival data to backend for logging
              try {
                await fetch('https://git-backend-1-production.up.railway.app/api/arrivals', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    routeId: route.routeId,
                    stopName: stop.name,
                    actualTime: time,
                    timestamp: new Date().toISOString(),
                  }),
                });
              } catch (error) {
                console.error('Error sending arrival data:', error);
              }
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
  }, [stopArrivalTimes]);

  // Generate arrival data for display
  const generateArrivalData = (): ArrivalData[] => {
    const arrivalData: ArrivalData[] = [];
    
    allRoutes.forEach(route => {
      route.schedule.forEach(scheduleItem => {
        const actualTime = stopArrivalTimes[route.routeId]?.[scheduleItem.stopName] || null;
        let delay = 0;
        let status: 'on-time' | 'delayed' | 'early' | 'pending' = 'pending';
        
        if (actualTime) {
          delay = calculateDelay(scheduleItem.time, actualTime);
          status = getStatus(delay);
        }
        
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
    // Reset arrival times and distance data to get fresh data
    setStopArrivalTimes({});
    // Reset daily distance (new day)
    const today = new Date().toDateString();
    const resetDistanceData: { [routeId: string]: DistanceData } = {};
    Object.keys(distanceData).forEach(routeId => {
      const lastUpdated = new Date(distanceData[routeId].lastUpdated).toDateString();
      if (lastUpdated !== today) {
        resetDistanceData[routeId] = {
          ...distanceData[routeId],
          dailyDistance: 0,
          lastUpdated: new Date().toISOString()
        };
      } else {
        resetDistanceData[routeId] = distanceData[routeId];
      }
    });
    setDistanceData(resetDistanceData);
    setRefreshing(false);
  };

  // Filter data based on selected route
  const filteredData = selectedRoute === 'all' 
    ? arrivalData 
    : arrivalData.filter(item => item.routeId === selectedRoute);

  // Calculate total daily distance
  const totalDailyDistance = Object.values(distanceData).reduce((sum, data) => sum + data.dailyDistance, 0);

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
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#3B82F6' }]}>
            {arrivalData.filter(item => item.actualTime !== null).length}
          </Text>
          <Text style={styles.statLabel}>Arrived</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>
            {totalDailyDistance.toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Total KM</Text>
        </View>
      </View>

      {/* Distance Summary */}
      <View style={styles.distanceSection}>
        <View style={styles.sectionHeader}>
          <Route size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Daily Distance Traveled</Text>
        </View>
        <View style={styles.distanceContainer}>
          {Object.values(distanceData).map((data) => {
            const route = allRoutes.find(r => r.routeId === data.routeId);
            if (!route) return null;
            
            return (
              <View key={data.routeId} style={styles.distanceCard}>
                <View style={styles.distanceHeader}>
                  <Bus size={16} color="#8B5CF6" />
                  <Text style={styles.distanceRouteName}>{route.routeName}</Text>
                  <Text style={styles.distanceBusId}>({data.busId})</Text>
                </View>
                <Text style={styles.distanceValue}>
                  {data.dailyDistance.toFixed(2)} km
                </Text>
                <Text style={styles.distanceTime}>
                  Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
                </Text>
              </View>
            );
          })}
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
                  <Text style={styles.busId}>({route.busId})</Text>
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
                    <Text style={[styles.actualTime, arrival.actualTime && styles.actualTimeReceived]}>
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

        {/* Live Tracking Status */}
        <View style={styles.trackingStatus}>
          <Clock size={16} color="#6B7280" />
          <Text style={styles.trackingText}>
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
    marginHorizontal: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  distanceSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
    color: '#1F2937',
  },
  distanceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  distanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  distanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distanceRouteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 6,
  },
  distanceBusId: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  distanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  distanceTime: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
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
  busId: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontStyle: 'italic',
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
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  actualTimeReceived: {
    color: '#059669',
    fontWeight: 'bold',
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
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  trackingText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontStyle: 'italic',
  },
});

export default ArrivalDashboard;