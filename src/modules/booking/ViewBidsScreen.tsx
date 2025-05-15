import React, {useEffect, useState} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import {useNavigation, RouteProp} from "@react-navigation/native";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {useRecoilValue} from "recoil"; // If needed for some global state not in socket
import {useSocket} from "../../hooks/useSocket";
import {rideAtom} from "../../store/atoms/ride/rideAtom"; // For local Recoil state if used beyond socket
import {Bid} from "../../types/ride/types/ride.types"; // Import Bid type
import {BookingStackParamList} from "../../types/navigation/navigation.types";
import CustomButton from "../../components/CustomButton";
import Margin from "../../components/Margin";
import {
  primaryColor,
  backgroundPrimary,
  successColor,
  errorColor,
} from "../../theme/colors";

// Define local color constants
const localTextPrimaryColor = "#EAEAEA";
const localTextSecondaryColor = "#B0B0B0";
const localAccentColor = primaryColor;

type ViewBidsScreenRouteProp = RouteProp<
  BookingStackParamList,
  "ViewBidsScreen"
>;

// Use NativeStackNavigationProp for stack-specific methods
type ViewBidsNavigationProp = NativeStackNavigationProp<
  BookingStackParamList,
  "ViewBidsScreen"
>;

interface ViewBidsScreenProps {
  route: ViewBidsScreenRouteProp;
}

const ViewBidsScreen: React.FC<ViewBidsScreenProps> = ({route}) => {
  const navigation = useNavigation<ViewBidsNavigationProp>();
  const {quotationId} = route.params;

  const {currentRideState, selectDriver, isConnected} = useSocket();
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    if (
      currentRideState &&
      currentRideState.rideId === quotationId &&
      currentRideState.bids
    ) {
      const newBids = Array.from(currentRideState.bids.values()).map(
        socketBid => {
          // Adapt the structure from socketClient.currentRideProgress.bids to our Bid interface
          // The Bid type in broadcastSocket might be slightly different from the one in rideTypes.ts
          // This is a placeholder mapping - adjust according to actual structures.
          return {
            id: socketBid.driverSocketId, // Assuming driverSocketId can serve as a unique key for the bid display
            quotationRequestId: quotationId,
            driverId: socketBid.driverInfo?.id || socketBid.driverSocketId,
            driverName: socketBid.driverInfo?.name || "N/A",
            driverRating: socketBid.driverInfo?.rating || 0,
            vehicleDetails: socketBid.driverInfo?.vehicle || "N/A",
            bidAmount: socketBid.bidAmount || 0,
            currency: socketBid.bidDetails?.currency || "USD",
            estimatedArrivalTime: socketBid.bidDetails?.eta || "N/A",
            bidAt: socketBid.bidDetails?.timestamp || new Date().toISOString(),
            status: "PENDING_RIDER_APPROVAL",
            driverFcmToken: socketBid.driverInfo?.fcmToken,
          } as Bid;
        },
      );
      setBids(newBids);
    } else {
      setBids([]); // Clear bids if conditions not met
    }
  }, [currentRideState, quotationId]);

  useEffect(() => {
    if (currentRideState?.rideId === quotationId) {
      if (
        currentRideState.status === "confirmed_in_progress" &&
        currentRideState.selectedDriverInfo
      ) {
        // Find the accepted bid to pass its details
        const acceptedBid = bids.find(
          bid => bid.id === currentRideState.selectedDriverInfo?.id,
        ); // bid.id is driverSocketId

        Alert.alert(
          "Bid Accepted!",
          `You will be riding with ${currentRideState.selectedDriverInfo.name}.`,
        );
        navigation.replace("TrackRideScreen", {
          rideId: quotationId,
          active_ride_room_id: currentRideState.active_ride_room_id || "",
          selectedDriverInfo: currentRideState.selectedDriverInfo,
          rideDetails: currentRideState.requestDetails, // Original quotation
          acceptedAmount: acceptedBid?.bidAmount || 0, // Pass accepted bid amount
          acceptedCurrency: acceptedBid?.currency || "USD", // Pass accepted bid currency
        });
      } else if (currentRideState.status === "error") {
        Alert.alert(
          "Error",
          currentRideState.errorMessage ||
            "An error occurred with your request.",
        );
        if (navigation.canGoBack()) navigation.goBack();
      } else if (currentRideState.status === "cancelled") {
        Alert.alert("Cancelled", "The ride request has been cancelled.");
        if (navigation.canGoBack()) navigation.goBack();
      }
      // No specific navigation for 'pending_bids' here as the screen itself handles this state.
    }
  }, [currentRideState, quotationId, navigation, bids]);

  const handleAcceptBid = (bid: Bid) => {
    if (!isConnected) {
      Alert.alert("Error", "Not connected to server.");
      return;
    }
    if (
      !currentRideState ||
      currentRideState.rideId !== quotationId ||
      currentRideState.status !== "pending_bids"
    ) {
      Alert.alert(
        "Error",
        "Cannot accept bid: Ride request not found, not active for bidding, or mismatch.",
      );
      return;
    }
    Alert.alert(
      "Confirm Bid",
      `Are you sure you want to accept the bid from ${bid.driverName} for ${bid.bidAmount}?`,
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Accept",
          onPress: () => {
            console.log(
              `Accepting bid from driver: ${bid.driverId}, socketId: ${bid.id}`,
            );
            selectDriver(bid.id); // bid.id is the driverSocketId
            // UI should update based on currentRideState.status change to 'confirmed_in_progress'
          },
        },
      ],
    );
  };

  const renderBidItem = ({item}: {item: Bid}) => (
    <TouchableOpacity
      style={styles.bidItem}
      onPress={() => handleAcceptBid(item)}>
      <Text style={styles.driverName}>
        {item.driverName} (Rating:{" "}
        {item.driverRating ? item.driverRating.toFixed(1) : "N/A"}★)
      </Text>
      <Text style={styles.vehicleDetails}>Vehicle: {item.vehicleDetails}</Text>
      <Text style={styles.bidAmount}>
        Bid: {item.bidAmount} {item.currency} (ETA: {item.estimatedArrivalTime})
      </Text>
      <Text style={styles.timestampText}>
        Bid Placed: {new Date(item.bidAt).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );

  // Loading states based on socket state
  if (
    !currentRideState ||
    currentRideState.rideId !== quotationId ||
    currentRideState.status === "idle" ||
    currentRideState.status === "creating_quotation_request" ||
    currentRideState.status === "creating_request"
  ) {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.infoText}>
          Requesting Bids for Quotation ID: {quotationId}...
        </Text>
        <Text style={styles.infoText}>
          Current Status: {currentRideState?.status || "Initializing..."}
        </Text>
      </View>
    );
  }

  // If status is something other than pending_bids (and not a loading/transition state handled above or by navigation effect)
  if (currentRideState.status !== "pending_bids") {
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.infoText}>
          Status: {currentRideState.status}. Waiting for updates or navigation.
        </Text>
        {currentRideState.errorMessage && (
          <Text style={styles.infoTextError}>
            Error: {currentRideState.errorMessage}
          </Text>
        )}
        <Margin margin={10} />
        <CustomButton
          title="Go Back"
          onPress={() => navigation.canGoBack() && navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Available Bids for Quotation ID: {quotationId}
      </Text>
      {bids.length === 0 ? (
        <Text style={styles.infoText}>
          No bids received yet. Waiting for drivers...
        </Text>
      ) : (
        <FlatList
          data={bids}
          renderItem={renderBidItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      )}
      <Margin margin={10} />
      <CustomButton
        title="Cancel Quotation"
        onPress={() => {
          // TODO: Implement cancel quotation request logic via socketClient
          // e.g., socketClient.cancelQuotationRequest(quotationId);
          Alert.alert(
            "Cancel Quotation",
            "Cancel functionality requires server implementation.",
          );
        }}
        status="danger"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundPrimary,
    padding: 16,
  },
  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: backgroundPrimary,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: localTextPrimaryColor, // Use local constant
    marginBottom: 16,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  bidItem: {
    backgroundColor: "#2C3E50", // A slightly different dark shade for items
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: primaryColor,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "bold",
    color: localTextPrimaryColor, // Use local constant
  },
  vehicleDetails: {
    fontSize: 14,
    color: localTextSecondaryColor, // Use local constant
    marginVertical: 4,
  },
  bidAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: localAccentColor, // Use local constant
  },
  infoText: {
    fontSize: 16,
    color: localTextSecondaryColor, // Use local constant
    textAlign: "center",
    marginTop: 20,
  },
  infoTextError: {
    color: errorColor,
    fontSize: 16,
    textAlign: "center",
  },
  timestampText: {
    fontSize: 12,
    color: localTextSecondaryColor,
    marginTop: 4,
  },
});

export default ViewBidsScreen;
