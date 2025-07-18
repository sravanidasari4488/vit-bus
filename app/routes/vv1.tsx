import React, { useRef, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from "react-native";
import { MapPin, Clock, Users, X } from "lucide-react-native";
import { WebView } from "react-native-webview";

// VV1-specific data
const routeData = {
  title: "VV1 Bus Route",
  description: "Kankipadu to Poranki",
  stops: ["Kankipadu", "Gosala", "Edupugallu", "Penumaluru", "Poranki"],
  schedule: [
    { time: "07:25 AM", stopName: "Kankipadu" },
    { time: "07:30 AM", stopName: "Gosala" },
    { time: "07:32 AM", stopName: "Edupugallu" },
    { time: "07:40 AM", stopName: "Penumaluru" },
    { time: "07:45 AM", stopName: "Poranki" },
  ],
  occupancy: "Medium",
  stopsCoordinates: [
    { name: "Kankipadu", lat: 16.52746, lng: 80.628769 },
    { name: "Gosala", lat: 16.5292, lng: 80.6310 },
    { name: "Edupugallu", lat: 16.5282, lng: 80.6292 },
    { name: "Penumaluru", lat: 16.5120, lng: 80.6204 },
    { name: "Poranki", lat: 16.5032, lng: 80.6310 }
  ]
};

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


export default function VV1Route() {
  const webViewRef = useRef(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [currentStop, setCurrentStop] = useState<string | null>(null);
  const [scheduleStatus, setScheduleStatus] = useState<any[]>([]);
  const [stopArrivalTimes, setStopArrivalTimes] = useState<{ [key: string]: string }>({});

  // Determine current stop
  useEffect(() => {
    const fetchCurrentStop = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
const hours12 = hours % 12 || 12;
const ampm = hours >= 12 ? 'PM' : 'AM';
const time = `${hours12}:${minutes} ${ampm}`;

      let foundStop = null;
      for (let i = 0; i < routeData.schedule.length; i++) {
        const stopTime = routeData.schedule[i].time;
        const [time, period] = stopTime.split(' ');
        const [stopHours, stopMinutes] = time.split(':').map(Number);
        const stopHours24 = period === 'PM' && stopHours !== 12 ? stopHours + 12 : stopHours;

        if (hours < stopHours24 || (hours === stopHours24 && minutes < stopMinutes)) {
          foundStop = routeData.schedule[i].stopName;
          break;
        }
      }

      setCurrentStop(foundStop || "Completed");

      const updatedSchedule = routeData.schedule.map(item => {
        const isReached = currentStop && routeData.stops.indexOf(item.stopName) < routeData.stops.indexOf(currentStop);
        const isCurrent = item.stopName === currentStop;

        return {
          ...item,
          status: isCurrent ? "Arriving" : isReached ? "Reached" : "Pending"
        };
      });

      setScheduleStatus(updatedSchedule);
    };

    fetchCurrentStop();
    const interval = setInterval(fetchCurrentStop, 60000);
    return () => clearInterval(interval);
  }, [currentStop]);

  // Track bus location and record arrival times
  useEffect(() => {
    const fetchLiveLocation = async () => {
      try {
        const res = await fetch("https://git-backend-1-production.up.railway.app/api/gps/latest_location/VV-12");
        const data = await res.json();
        if (!data?.lat || !data?.lon) return;

        const busLat = parseFloat(data.lat);
        const busLon = parseFloat(data.lon);

        routeData.stopsCoordinates.forEach((stop) => {
          const distance = getDistanceFromLatLonInMeters(busLat, busLon, stop.lat, stop.lng);
          if (distance < 50 && !stopArrivalTimes[stop.name]) {
            const now = new Date();
  const hr = now.getHours();
  const min = now.getMinutes().toString().padStart(2, '0');
  const ampm = hr >= 12 ? "PM" : "AM";
  const hr12 = hr % 12 || 12;
  const time = `${hr12}:${min} ${ampm}`;

  setStopArrivalTimes((prev) => ({ ...prev, [stop.name]: time }));
          }
        });
      } catch (err) {
        console.error("Error fetching location:", err);
      }
    };

    fetchLiveLocation();
    const interval = setInterval(fetchLiveLocation, 10000);
    return () => clearInterval(interval);
  }, [stopArrivalTimes]);

  const mapHtml = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>VV1 Map</title>
    <style>
      html, body, #map {
        height: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const stops = ${JSON.stringify(routeData.stopsCoordinates)};
      let map, marker;

      function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
          zoom: 13,
          center: stops[0]
        });

        stops.forEach(stop => {
          new google.maps.Marker({
            map,
            position: { lat: stop.lat, lng: stop.lng },
            title: stop.name
          });
        });

        marker = new google.maps.Marker({
          map,
          icon: "http://maps.google.com/mapfiles/ms/icons/bus.png",
          title: "Live VV1 Bus"
        });

        updateLocation();
        setInterval(updateLocation, 5000);
      }

      async function updateLocation() {
        try {
          const res = await fetch("https://git-backend-1-production.up.railway.app/api/gps/latest_location/VV-12");
          const data = await res.json();
          if (data?.lat && data?.lon) {
            const pos = { lat: parseFloat(data.lat), lng: parseFloat(data.lon) };
            marker.setPosition(pos);
            map.setCenter(pos);
          }
        } catch (e) {
          console.error("Live location error", e);
        }
      }
    </script>
    <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB48fIbQ7fTdXAp-pPf_mjXXAf2BEQMDI0&callback=initMap&callback=initMap"></script>
  </body>
  </html>`;

  const handleMapResize = () => {
    webViewRef.current?.injectJavaScript('google.maps.event.trigger(map, "resize");');
  };

  const toggleMapExpansion = () => {
    setMapExpanded(!mapExpanded);
    setTimeout(handleMapResize, 300);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{routeData.title}</Text>
        <Text style={styles.description}>{routeData.description}</Text>
      </View>

      <TouchableOpacity style={styles.mapContainer} activeOpacity={0.9} onPress={toggleMapExpansion}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.map}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
        />
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayText}>Tap to expand</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={mapExpanded} transparent={false} animationType="fade">
        <View style={styles.expandedMapContainer}>
          <WebView ref={webViewRef} source={{ html: mapHtml }} style={styles.expandedMap} onLoad={handleMapResize} />
          <TouchableOpacity style={styles.closeButton} onPress={toggleMapExpansion}>
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <MapPin size={20} color="#3366FF" />
          <Text style={styles.cardTitle}>Bus Stops</Text>
        </View>
        <View style={styles.stopsContainer}>
          {routeData.stops.map((stop, i) => (
            <View key={i} style={styles.stopItem}>
              <View style={[
                styles.stopDot,
                currentStop && routeData.stops.indexOf(stop) < routeData.stops.indexOf(currentStop) ? styles.reachedDot :
                stop === currentStop ? styles.currentDot : styles.pendingDot
              ]} />
              <Text style={styles.stopText}>{stop}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Clock size={20} color="#3366FF" />
          <Text style={styles.cardTitle}>Schedule</Text>
        </View>

        {/* Header row */}
        <View style={styles.scheduleItem}>
          <Text style={[styles.scheduleTime, { fontWeight: "bold" }]}>Scheduled</Text>
          <Text style={[styles.scheduleStop, { fontWeight: "bold" }]}>Stop</Text>
          <Text style={[styles.scheduleActualTime, { fontWeight: "bold" }]}>Arrived At</Text>
        </View>

        {/* Rows */}
        <View style={styles.scheduleContainer}>
          {(scheduleStatus.length > 0 ? scheduleStatus : routeData.schedule).map((item, i) => (
            <View key={i} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <Text style={styles.scheduleStop}>{item.stopName}</Text>
              <Text style={styles.scheduleActualTime}>
                {stopArrivalTimes[item.stopName] || "-"}
              </Text>
            </View>
          ))}
        </View>
      </View>


      <View style={styles.infoCard}>
        <View style={styles.cardHeader}>
          <Users size={20} color="#3366FF" />
          <Text style={styles.cardTitle}>Occupancy</Text>
        </View>
        <Text style={styles.occupancyText}>{routeData.occupancy}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contentContainer: { padding: 16 },
  header: { marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  description: { fontSize: 16, color: "#666" },
  mapContainer: { height: 200, marginBottom: 16, borderRadius: 8, overflow: 'hidden' },
  map: { flex: 1 },
  mapOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 4,
  },
  mapOverlayText: { color: "#fff", fontSize: 12 },
  expandedMapContainer: { flex: 1, backgroundColor: "#000" },
  expandedMap: { flex: 1 },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "#00000088",
    padding: 8,
    borderRadius: 20,
  },
  infoCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, marginLeft: 8, fontWeight: "bold", color: "#333" },
  stopsContainer: { marginLeft: 12 },
  stopItem: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  stopDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  reachedDot: { backgroundColor: "#4CAF50" },
  currentDot: { backgroundColor: "#FF9800" },
  pendingDot: { backgroundColor: "#BDBDBD" },
  stopText: { fontSize: 16, color: "#333" },
  scheduleContainer: { marginLeft: 12 },
  scheduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  scheduleTime: {
    fontSize: 14,
    color: "#333",
    width: "25%",
  },
  scheduleStop: {
    fontSize: 14,
    color: "#333",
    width: "45%",
  },
  scheduleActualTime: {
    fontSize: 14,
    color: "#333",
    width: "30%",
    textAlign: "right",
  },
  // scheduleStatus: {
  //   fontSize: 14,
  //   fontWeight: "bold",
  //   width: "30%",
  //   textAlign: "right",
  // },
  // arriving: { color: "#FF9800" },
  // reached: { color: "#4CAF50" },
  // pending: { color: "#BDBDBD" },
  occupancyText: { fontSize: 16, marginLeft: 32, color: "#333" },
});
