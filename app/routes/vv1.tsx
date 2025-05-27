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
    { name: "Kankipadu", lat: 16.515797, lng: 80.610565 },
    { name: "Gosala", lat: 16.5292, lng: 80.6310 },
    { name: "Edupugallu", lat: 16.5282, lng: 80.6292 },
    { name: "Penumaluru", lat: 16.5120, lng: 80.6204 },
    { name: "Poranki", lat: 16.5032, lng: 80.6310 }
  ]
};

export default function VV1Route() {
  const webViewRef = useRef(null);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [currentStop, setCurrentStop] = useState(null);
  const [scheduleStatus, setScheduleStatus] = useState([]);

  // Fetch current stop status from API
  useEffect(() => {
    // Simulate API call to get current stop
    const fetchCurrentStop = () => {
      // In a real app, you would fetch this from your backend API
      // For demo purposes, we'll simulate it
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Find the next upcoming stop
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
      
      // Update schedule status
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
    const interval = setInterval(fetchCurrentStop, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [currentStop]);

  // Improved Mapbox HTML
  const mapHtml = `
  <html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>Route VV-11 Tracker</title>
    <style>
        body {
            font-family: Arial;
            text-align: center;
            background: #f0f0f0;
            margin: 0;
            padding: 0;
        }

        h2 {
            margin-top: 20px;
        }

        #map {
            height: 100vh;
            width: 100%;
        }

        #status {
            font-size: 16px;
            margin-top: 10px;
        }
    </style>
</head>

<body>
   
    <div id="map"></div>

    <script>
        let map, marker;
        const vv11Stops = [
            { stopName: "Ayodhya Nagar", time: "7:32 AM", lat: 16.5292, lon: 80.6310 },
          
            { stopName: "VIT -AP Campus", time: "8:45 AM", lat: 16.4941, lon: 80.4982 }
        ];

        async function initMap() {
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 13,
                center: { lat: 16.5111, lng: 80.5184 },
            });

            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer({ map });

           const waypoints = vv11Stops.slice(1, -1).map(stop => ({
    location: new google.maps.LatLng(stop.lat, stop.lon),
    stopover: true
}));


            directionsService.route({
                origin: new google.maps.LatLng(vv11Stops[0].lat, vv11Stops[0].lon),
                destination: new google.maps.LatLng(vv11Stops[vv11Stops.length - 1].lat, vv11Stops[vv11Stops.length - 1].lon),
                waypoints,
                travelMode: google.maps.TravelMode.DRIVING,
            }, (result, status) => {
                if (status === "OK") {
                    directionsRenderer.setDirections(result);
                } else {
                    document.getElementById("status").innerText = "❌ Failed to draw VV-11 route.";
                }
            });

            vv11Stops.forEach(stop => {
                new google.maps.Marker({
                    map,
                    position: { lat: stop.lat, lng: stop.lon },
                    label: stop.time,
                    title: stop.stopName
                    
                });
            });

            updateLiveLocation();
            setInterval(updateLiveLocation, 5000);
        }

        async function updateLiveLocation() {
            try {
                const res = await fetch("https://git-backend-1-production.up.railway.app/api/gps/latest_location/VV-11");
                const data = await res.json();
                if (data && data.lat && data.lon) {
                    const position = { lat: parseFloat(data.lat), lng: parseFloat(data.lon) };
                    if (!marker) {
                        marker = new google.maps.Marker({
                            map,
                            position,
                            icon: "http://maps.google.com/mapfiles/ms/icons/bus.png",
                            title: "Live VV-11 Bus"
                        });
                    } else {
                        marker.setPosition(position);
                    }
                    map.setCenter(position);
                }
            } catch (err) {
                document.getElementById("status").innerText = "❌ Error fetching VV-11 live location.";
            }
        }
    </script>

    <script async defer
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyB48fIbQ7fTdXAp-pPf_mjXXAf2BEQMDI0&callback=initMap"></script>
</body>

</html>
  `;

  const handleMapResize = () => {
    webViewRef.current?.injectJavaScript('google.maps.event.trigger(map, "resize");');
  };

  const toggleMapExpansion = () => {
    setMapExpanded(!mapExpanded);
    setTimeout(handleMapResize, 300);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{routeData.title}</Text>
        <Text style={styles.description}>{routeData.description}</Text>
      </View>

      {/* Map */}
      <TouchableOpacity 
        style={styles.mapContainer} 
        activeOpacity={0.9}
        onPress={toggleMapExpansion}
      >
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.map}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "positionUpdate") {
              // Handle position updates if needed
            }
          }}
        />
        <View style={styles.mapOverlay}>
          <Text style={styles.mapOverlayText}>Tap to expand</Text>
        </View>
      </TouchableOpacity>

      {/* Expanded Map Modal */}
      <Modal visible={mapExpanded} transparent={false} animationType="fade">
        <View style={styles.expandedMapContainer}>
          <WebView
            ref={webViewRef}
            source={{ html: mapHtml }}
            style={styles.expandedMap}
            onLoad={handleMapResize}
          />
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={toggleMapExpansion}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Bus Stops */}
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
        <View style={styles.scheduleContainer}>
          {(scheduleStatus.length > 0 ? scheduleStatus : routeData.schedule).map((item, i) => (
                      <View key={i} style={styles.scheduleItem}>
              <Text style={styles.scheduleTime}>{item.time}</Text>
              <Text style={styles.scheduleStop}>{item.stopName}</Text>
              <Text style={[
                styles.scheduleStatus,
                item.status === 'Arriving' ? styles.arriving :
                item.status === 'Reached' ? styles.reached :
                styles.pending
              ]}>
                {item.status}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Occupancy */}
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
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 16,
    color: "#666",
  },
  mapContainer: {
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 4,
  },
  mapOverlayText: {
    color: "#fff",
    fontSize: 12,
  },
  expandedMapContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  expandedMap: {
    flex: 1,
  },
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
  cardTitle: {
    fontSize: 18,
    marginLeft: 8,
    fontWeight: "bold",
    color: "#333",
  },
  stopsContainer: {
    marginLeft: 12,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  reachedDot: {
    backgroundColor: "#4CAF50",
  },
  currentDot: {
    backgroundColor: "#FF9800",
  },
  pendingDot: {
    backgroundColor: "#BDBDBD",
  },
  stopText: {
    fontSize: 16,
    color: "#333",
  },
  scheduleContainer: {
    marginLeft: 12,
  },
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
  scheduleStatus: {
    fontSize: 14,
    fontWeight: "bold",
    width: "30%",
    textAlign: "right",
  },
  arriving: {
    color: "#FF9800",
  },
  reached: {
    color: "#4CAF50",
  },
  pending: {
    color: "#BDBDBD",
  },
  occupancyText: {
    fontSize: 16,
    marginLeft: 32,
    color: "#333",
  }
});