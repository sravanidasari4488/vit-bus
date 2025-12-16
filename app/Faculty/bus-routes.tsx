import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import type { Router } from "expo-router";
const router: Router = useRouter();
const busRoutes = [
  { name: "VV1", city: "Vijayawada" },
  { name: "VV2", city: "Vijayawada" },
  { name: "VV3", city: "Vijayawada" },
  { name: "VV4", city: "Vijayawada" },
  { name: "VV5", city: "Vijayawada" },
  { name: "VV6", city: "Vijayawada" },
  { name: "VV7", city: "Vijayawada" },
  { name: "VV8", city: "Vijayawada" },
  { name: "VV9", city: "Vijayawada" },
  { name: "VV10", city: "Vijayawada" },
  { name: "GV1", city: "Guntur" },
  { name: "GV2", city: "Guntur" },
  { name: "GV3", city: "Guntur" },
  { name: "GV4", city: "Guntur" },
  { name: "GV5", city: "Guntur" },
  { name: "GV6", city: "Guntur" },
  { name: "GV7", city: "Guntur" },
  { name: "GV8", city: "Guntur" },
  { name: "GV9", city: "Guntur" },
  { name: "GV10", city: "Guntur" },
  
];

function BusRoutesScreen() {
  const router = useRouter();

  const handleSelectRoute = (busRoute: string) => {
   
  router.push(`/routes/${busRoute.toLowerCase()}`);
};
  

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.safeArea}>
        <Text style={styles.header}>Select a Bus Route</Text>

        {/* Vijayawada Section */}
        <View style={styles.citySection}>
          <Text style={styles.cityTitle}>📍 Vijayawada</Text>
          <View style={styles.routeContainer}>
            {busRoutes.filter(route => route.city === "Vijayawada").map(route => (
              <TouchableOpacity 
                key={route.name} 
                style={styles.routeButton} 
                onPress={() => handleSelectRoute(route.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.routeText}>{route.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Guntur Section */}
        <View style={styles.citySection}>
          <Text style={styles.cityTitle}>📍 Guntur</Text>
          <View style={styles.routeContainer}>
            {busRoutes.filter(route => route.city === "Guntur").map(route => (
              <TouchableOpacity 
                key={route.name} 
                style={styles.routeButton} 
                onPress={() => handleSelectRoute(route.name)}
                activeOpacity={0.7}
              >
                <Text style={styles.routeText}>{route.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F8FAFC",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 30,
    color: "#1E293B",
    textAlign: "center",
  },
  citySection: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  cityTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 16,
  },
  routeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  routeButton: {
    width: "48%",
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  routeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3366FF",
  },
});

export default BusRoutesScreen;
