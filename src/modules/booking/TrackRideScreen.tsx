import React, {useEffect, useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  useNavigation,
  useRoute,
  RouteProp,
  NavigationProp,
} from "@react-navigation/native";
import {useSocket} from "../../hooks/useSocket";
import {BookingStackParamList} from "../../types/navigation/navigation.types";
import {primaryColor, errorColor} from "../../theme/colors";

type TrackRideScreenRouteProp = RouteProp<
  BookingStackParamList,
  "TrackRideScreen"
>;

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

const TrackRideScreen = () => {
  const navigation = useNavigation<NavigationProp<BookingStackParamList>>();
  const route = useRoute<TrackRideScreenRouteProp>();
  const {currentRideState, driverLocation, isConnected} = useSocket();

  // Extract new params for fare
  const {acceptedAmount, acceptedCurrency} = route.params;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!route.params) {
      console.error("TrackRideScreen: No route params found!");
      Alert.alert("Error", "Ride details not found. Navigating back.", [
        {text: "OK", onPress: () => navigation.goBack()},
      ]);
      return;
    }

    console.log("TrackRideScreen mounted with params:", route.params);

    // Validate that we're tracking the correct ride
    if (
      currentRideState.rideId &&
      currentRideState.rideId !== route.params.rideId
    ) {
      Alert.alert(
        "Ride Status Changed",
        "This ride is no longer active. Navigating back.",
        [{text: "OK", onPress: () => navigation.navigate("BookRide")}],
      );
    }
  }, [currentRideState, navigation, route.params]);

  // Effect to handle ride completion
  useEffect(() => {
    if (currentRideState.status === "completed") {
      Alert.alert(
        "Ride Completed",
        "Your ride has been completed successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("RideCompleted"),
          },
        ],
      );
    }
  }, [currentRideState.status, navigation]);

  if (!route.params) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text>Loading ride details...</Text>
      </View>
    );
  }

  if (
    currentRideState.rideId &&
    currentRideState.rideId !== route.params.rideId &&
    currentRideState.status !== "idle"
  ) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          This ride is no longer active or has been superseded.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tracking Your Ride</Text>
      <Text style={styles.subtitle}>Ride ID: {route.params.rideId}</Text>

      <View style={styles.rideInfoContainer}>
        <Text style={styles.sectionTitle}>Ride Details:</Text>
        <Text style={styles.infoText}>
          From:{" "}
          {(route.params.rideDetails?.pickupLocation as Location)?.address ||
            "N/A"}
        </Text>
        <Text style={styles.infoText}>
          To:{" "}
          {(route.params.rideDetails?.dropoffLocation as Location)?.address ||
            "N/A"}
        </Text>
        <Text style={styles.infoText}>
          Fare:{" "}
          {typeof acceptedAmount === "number" && acceptedCurrency
            ? `${acceptedAmount.toFixed(2)} ${acceptedCurrency}`
            : "N/A"}
        </Text>
      </View>

      <View style={styles.driverInfoContainer}>
        <Text style={styles.sectionTitle}>Driver Information:</Text>
        <Text style={styles.infoText}>
          Name: {route.params.selectedDriverInfo?.name || "N/A"}
        </Text>
        <Text style={styles.infoText}>
          Vehicle: {route.params.selectedDriverInfo?.vehicle || "N/A"}
        </Text>
        <Text style={styles.infoText}>
          Rating:{" "}
          {route.params.selectedDriverInfo?.rating
            ? route.params.selectedDriverInfo.rating.toFixed(1) + "★"
            : "N/A"}
        </Text>
      </View>

      <View style={styles.locationContainer}>
        <Text style={styles.sectionTitle}>Driver's Location:</Text>
        {driverLocation ? (
          <>
            <Text style={styles.infoText}>Latitude: {driverLocation.lat}</Text>
            <Text style={styles.infoText}>Longitude: {driverLocation.lon}</Text>
          </>
        ) : (
          <Text style={styles.infoText}>Waiting for location updates...</Text>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: primaryColor,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    color: "#666",
  },
  rideInfoContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  driverInfoContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  locationContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  infoText: {
    fontSize: 16,
    marginBottom: 4,
    color: "#444",
  },
  errorText: {
    color: errorColor,
    textAlign: "center",
    marginVertical: 10,
    fontSize: 16,
  },
});

export default TrackRideScreen;
