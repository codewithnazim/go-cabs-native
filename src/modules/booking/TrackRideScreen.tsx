import React, {useEffect, useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
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
import WebView from "react-native-webview";

const screenHeight = Dimensions.get("window").height;

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
  const webViewRef = React.useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

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

    // console.log("TrackRideScreen mounted with params:", route.params); // Removed for cleanup

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

  // Effect to update map in WebView
  useEffect(() => {
    if (
      webViewRef.current &&
      isMapReady &&
      driverLocation &&
      route.params.rideDetails?.dropoffLocation
    ) {
      const dest = route.params.rideDetails.dropoffLocation as Location;
      const script = `
        if (window.updateDriverTrackingView) {
          window.updateDriverTrackingView(${driverLocation.lon}, ${driverLocation.lat}, ${dest.longitude}, ${dest.latitude});
        } else {
          console.warn('WebView: updateDriverTrackingView function not ready yet for update.');
        }
        true; // Must return true for Android
      `;
      webViewRef.current.injectJavaScript(script);
    }
  }, [driverLocation, route.params.rideDetails?.dropoffLocation, isMapReady]);

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

  const destinationAddress =
    (route.params.rideDetails?.dropoffLocation as Location)?.address || "N/A";

  return (
    <View style={styles.screenContainer}>
      <View style={styles.mapViewContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={["*"]}
          source={{uri: "file:///android_asset/map.html"}}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onLoadEnd={() => {
            // console.log("TrackRideScreen WebView content loaded (onLoadEnd)");
            // Don't inject here directly, wait for MAP_READY message
          }}
          onMessage={event => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === "MAP_READY") {
              // console.log("[TrackRideScreen] WebView signaled MAP_READY");
              setIsMapReady(true);
              // Perform initial injection if data is available now that map is ready
              if (driverLocation && route.params.rideDetails?.dropoffLocation) {
                const dest = route.params.rideDetails
                  .dropoffLocation as Location;
                const script = `if(window.updateDriverTrackingView) window.updateDriverTrackingView(${driverLocation.lon}, ${driverLocation.lat}, ${dest.longitude}, ${dest.latitude}); else { console.warn(\'WebView: updateDriverTrackingView not ready for initial call.\'); } true;`;
                // console.log("[TrackRideScreen] Injecting script for initial location update after MAP_READY:", script);
                webViewRef.current?.injectJavaScript(script);
              }
            }
          }}
          onError={syntheticEvent => {
            const {nativeEvent} = syntheticEvent;
            console.warn("TrackRideScreen WebView error: ", nativeEvent);
          }}
        />
      </View>
      <ScrollView
        style={styles.detailsScrollViewContainer}
        contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Tracking Your Ride</Text>
        <Text style={styles.subtitle}>Ride ID: {route.params.rideId}</Text>

        <View style={styles.rideInfoContainer}>
          <Text style={styles.sectionTitle}>Ride Details:</Text>
          <Text style={styles.infoText}>
            From:{" "}
            {(route.params.rideDetails?.pickupLocation as Location)?.address ||
              "N/A"}
          </Text>
          <Text style={styles.infoText}>To: {destinationAddress}</Text>
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
              <Text style={styles.infoText}>
                Latitude: {driverLocation.lat}
              </Text>
              <Text style={styles.infoText}>
                Longitude: {driverLocation.lon}
              </Text>
            </>
          ) : (
            <Text style={styles.infoText}>Waiting for location updates...</Text>
          )}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  mapViewContainer: {
    height: screenHeight * 0.4,
    width: "100%",
    backgroundColor: "#e0e0e0",
  },
  webview: {
    flex: 1,
  },
  detailsScrollViewContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  container: {
    flex: 1,
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
