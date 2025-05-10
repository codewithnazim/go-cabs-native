import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  TextInput,
} from "react-native";
import React, {useState, useRef, useEffect} from "react";
import WebView from "react-native-webview";
import {backgroundPrimary, primaryColor} from "../../theme/colors";
import {Radio, RadioGroup} from "@ui-kitten/components";
import DullDivider from "../../components/DullDivider";
import CarIcon from "../../../assets/images/icons/car.svg";
import CardIcon from "../../../assets/images/icons/card.svg";
import MetamaskIcon from "../../../assets/images/icons/metamask.svg";
import CashIcon from "../../../assets/images/icons/cash.svg";
import CustomButton from "../../components/CustomButton";
import Margin from "../../components/Margin";
import {useRecoilState} from "recoil";
import {rideAtom} from "../../store/atoms/ride/rideAtom";
import {Driver} from "../../types/driver/driverTypes";
import {useNavigation, NavigationProp} from "@react-navigation/native";
import {useSocket} from "../../hooks/useSocket";
import {RideRequest} from "../../types/ride/types/ride.types";
import {BookingStackParamList} from "../../types/navigation/navigation.types";

const {width} = Dimensions.get("window");

// Enhanced driver type with animation state
interface AnimatedDriver extends Driver {
  animationId: string;
  visible: boolean;
  exiting: boolean;
}

const BookRide = () => {
  const navigation = useNavigation<NavigationProp<BookingStackParamList>>();
  const [rideState, setRideState] = useRecoilState(rideAtom);
  const {
    createRideRequest,
    currentRideState: socketRideState,
    isConnected: isSocketConnected,
  } = useSocket();

  // Effect to handle navigation when ride request is acknowledged and pending bids
  useEffect(() => {
    if (socketRideState?.status === "pending_bids") {
      const {rideId, bidding_room_id, rideDetails} = socketRideState;
      console.log("[BookRide] Attempting navigation to SearchDriver with:", {
        rideId,
        bidding_room_id,
        rideDetails,
      });
      if (rideId && bidding_room_id && rideDetails) {
        navigation.navigate("SearchDriver", {
          rideId,
          biddingRoomId: bidding_room_id,
          initialRideDetails: rideDetails as RideRequest,
        });
      } else {
        console.error("[BookRide] Missing params for SearchDriver navigation", {
          rideId,
          bidding_room_id,
          rideDetails,
        });
      }
    }
    if (socketRideState?.status === "error" && socketRideState.errorMessage) {
      Alert.alert("Ride Request Error", socketRideState.errorMessage);
    }
  }, [socketRideState, navigation]);

  const [compare, setCompare] = useState(false);
  const [isPayment, setIsPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<number | null>(null);
  const [showDrivers, setShowDrivers] = useState(false);
  const [animatedDrivers, setAnimatedDrivers] = useState<AnimatedDriver[]>([]);

  // State for text inputs
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropOffAddress, setDropOffAddress] = useState("");

  // Animation references - using a Map for better tracking by ID
  const animationsMap = useRef(
    new Map<
      string,
      {
        translateX: Animated.Value;
        progress: Animated.Value;
        opacity: Animated.Value;
      }
    >(),
  );

  // Function to handle ride type selection
  const handleRideSelection = (rideName: string, price: number) => {
    setRideState(prev => ({
      ...prev,
      selectedRideType: rideName,
      fare: {baseFare: price},
    }));
    setIsPayment(true);
  };

  // Function to get random drivers - COMMENTED OUT as bids will come via socket
  /*
  const getRandomDrivers = () => {
    const driverEntries = Object.entries(driverData); // driverData was imported, now removed
    const shuffled = [...driverEntries].sort(() => 0.5 - Math.random());
    const selectedDrivers = shuffled.slice(0, 4).map(([id, driver]) => ({
      id,
      ...(driver as object), // Assuming driver is an object, addressing linter hint if driverData was complex
    }));
    return selectedDrivers;
  };
  */

  // Function to handle payment method selection
  const handlePaymentMethodChange = (index: number) => {
    setPaymentMethod(index);

    // Map payment method index to payment type
    const paymentTypes = ["metamask", "credit", "debit", "cash"] as const;

    // Update ride state with payment information
    setRideState(prev => ({
      ...prev,
      payment: {
        method: paymentTypes[index],
        confirmed: true,
      },
    }));
  };

  // Function to start exit animation for a driver
  const startExitAnimation = (animationId: string) => {
    const animationValues = animationsMap.current.get(animationId);
    if (!animationValues) return;

    // Mark this driver as exiting
    setAnimatedDrivers(prev =>
      prev.map(driver =>
        driver.animationId === animationId
          ? {...driver, exiting: true}
          : driver,
      ),
    );

    // Run the exit animation sequence
    Animated.sequence([
      Animated.timing(animationValues.translateX, {
        toValue: -width,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(animationValues.opacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // After animation completes, remove the driver
      setAnimatedDrivers(prev =>
        prev.map(driver =>
          driver.animationId === animationId
            ? {...driver, visible: false}
            : driver,
        ),
      );

      // Clean up animation values
      setTimeout(() => {
        animationsMap.current.delete(animationId);
      }, 100);
    });
  };

  // Function to handle ride confirmation
  const handleConfirmRide = () => {
    if (!isSocketConnected) {
      Alert.alert(
        "Connection Error",
        "Not connected to the server. Please check your internet connection or try again later.",
      );
      return;
    }

    if (paymentMethod === null) {
      Alert.alert("Payment Method", "Please select a payment method.");
      return;
    }

    // if (!rideState.pickupLocation || !rideState.dropOffLocation) { // Old validation
    if (!pickupAddress || !dropOffAddress) {
      // New validation based on text inputs
      Alert.alert(
        "Missing Info",
        "Pickup and drop-off locations are required.",
      );
      return;
    }

    // Update rideState with entered addresses and placeholder coordinates
    const updatedPickupLocation = {
      latitude: "0", // Placeholder
      longitude: "0", // Placeholder
      address: pickupAddress,
    };
    const updatedDropOffLocation = {
      latitude: "0", // Placeholder
      longitude: "0", // Placeholder
      address: dropOffAddress,
    };

    setRideState(prev => ({
      ...prev,
      pickupLocation: updatedPickupLocation,
      dropOffLocation: updatedDropOffLocation,
    }));

    const rideDataForServer: RideRequest = {
      pickupLocation: {
        latitude: Number(updatedPickupLocation.latitude),
        longitude: Number(updatedPickupLocation.longitude),
        address: updatedPickupLocation.address || "",
      },
      dropoffLocation: {
        latitude: Number(updatedDropOffLocation.latitude),
        longitude: Number(updatedDropOffLocation.longitude),
        address: updatedDropOffLocation.address || "",
      },
      name: "Rider Name Placeholder",
      phone: "0000000000",
      fare: {
        baseFare: rideState.fare?.baseFare || 0,
        finalFare: rideState.fare?.finalFare || rideState.fare?.baseFare || 0,
        breakdown: {
          baseCost:
            rideState.fare?.breakdown?.baseCost ||
            rideState.fare?.baseFare ||
            0,
          serviceFee: rideState.fare?.breakdown?.serviceFee || 0,
          taxes: rideState.fare?.breakdown?.taxes || 0,
        },
      },
      bidAmount: rideState.fare?.baseFare || 0,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(
      "Attempting to create ride request with data:",
      rideDataForServer,
    );
    createRideRequest(rideDataForServer);

    // The UI should now react to changes in socketRideState.status
    // e.g., 'creating_request', then 'pending_bids' or 'error'
    // The original logic for showing random local drivers and their animations is bypassed.
    // Navigation or UI changes to show bids will be handled based on socketRideState.
    // For example, navigate to SearchDriver screen when status becomes 'pending_bids'

    // Original logic commented out:
    /*
    const randomDrivers = getRandomDrivers();
    const enhancedDrivers: AnimatedDriver[] = randomDrivers.map(driver => ({
      ...driver,
      animationId: `driver-${driver.id}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}`,
      visible: false,
      exiting: false,
    }));
    setAnimatedDrivers(enhancedDrivers);
    setRideState(prev => ({
      ...prev,
      availableDrivers: randomDrivers,
      status: "searching", // This status in rideAtom might need to align with socketRideState.status
    }));
    setShowDrivers(true);
    setIsPayment(false);
    enhancedDrivers.forEach((driver, index) => {
      // ... animation logic ...
    });
    */
  };

  // Render a single driver item with animations
  const renderDriverItem = (driver: AnimatedDriver) => {
    // Only render if driver is marked as visible
    if (!driver.visible) return null;

    // Get animation values for this driver
    const animationValues = animationsMap.current.get(driver.animationId);
    if (!animationValues) return null;

    const {translateX, progress, opacity} = animationValues;

    return (
      <Animated.View
        key={driver.animationId}
        style={[
          styles.driverItem,
          {
            transform: [{translateX}],
            opacity,
          },
        ]}>
        {/* Progress bar */}
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
        <TouchableOpacity
          style={styles.driverItem}
          onPress={() => {
            setRideState(prev => ({
              ...prev,
              driver: driver,
            }));
            navigation.navigate("BookingDetails");
          }}>
          {/* Driver Avatar */}
          <View style={styles.driverAvatar}>
            <Text style={styles.driverInitial}>{driver.name.charAt(0)}</Text>
          </View>

          {/* Driver Info */}
          <View style={styles.driverDetails}>
            <Text style={styles.h1}>{driver.name}</Text>
            <Text style={styles.h2}>
              {driver.vehiclemodel.split(" ")[0]} • {driver.regnumber.slice(-4)}
            </Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>★ {driver.rating}</Text>
            </View>
          </View>
          <Text style={styles.callButtonText}>{driver.bidAmount}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      <ScrollView>
        <View>
          {/* <View // WebView container commented out
            style={{
              width: "100%",
              height: 320,
              backgroundColor: backgroundPrimary,
            }}>
            <WebView
              originWhitelist={["*"]}
              source={{uri: "file:///android_asset/map.html"}}
              style={styles.webview}
            />
          </View> */}

          {/* New TextInput fields for pickup and drop-off */}
          <View style={styles.locationInputContainer}>
            <Text style={styles.inputLabel}>Pickup Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter pickup address"
              placeholderTextColor="#888"
              value={pickupAddress}
              onChangeText={setPickupAddress}
            />
            <Text style={styles.inputLabel}>Drop-off Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter drop-off address"
              placeholderTextColor="#888"
              value={dropOffAddress}
              onChangeText={setDropOffAddress}
            />
          </View>

          {!isPayment ? (
            <>
              <DullDivider />
              <View>
                {!showDrivers
                  ? (compare ? ridesDataCompared : ridesData)?.map(
                      (item, index) => (
                        <TouchableOpacity
                          key={index.toString()}
                          style={[
                            styles.listItem,
                            rideState.selectedRideType === item.name &&
                              styles.selectedRide,
                          ]}
                          onPress={() => {
                            const priceString = item.price; // e.g., "₹ 150"
                            const numericPrice = parseInt(
                              priceString.replace("₹ ", ""),
                              10,
                            ); // Extract number
                            if (!isNaN(numericPrice)) {
                              handleRideSelection(item.name, numericPrice);
                            } else {
                              console.error(
                                "Could not parse price:",
                                priceString,
                              );
                              // Handle error case, maybe show default price or alert
                            }
                          }}>
                          <CarIcon width={50} height={50} />
                          <View style={{flexGrow: 1}}>
                            <Text style={styles.h1}>{item.name}</Text>
                            <Text style={styles.h2}>{item.arrival}</Text>
                          </View>
                          <Text style={[styles.h1, {alignSelf: "flex-start"}]}>
                            {item.price}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )
                  : animatedDrivers.map(driver => renderDriverItem(driver))}
              </View>
              <Margin margin={10} />
              <View style={{paddingHorizontal: 20, marginTop: 5}}>
                <CustomButton
                  title="Continue Booking Your GO Ride"
                  status="primary"
                  size="medium"
                  onPress={() => {
                    setIsPayment(true);
                  }}
                />
              </View>
            </>
          ) : (
            <>
              <View style={{padding: 20}}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setIsPayment(false)}>
                  <Text style={styles.backButtonText}>
                    ← Back to vehicle selection
                  </Text>
                </TouchableOpacity>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Estimated Price:</Text>
                  <Text style={styles.priceValue}>$25</Text>
                </View>
                <RadioGroup
                  selectedIndex={paymentMethod !== null ? paymentMethod : -1}
                  onChange={handlePaymentMethodChange}>
                  <Radio style={styles.option}>
                    {_evaProps => (
                      <>
                        <Text style={styles.h3}>Metamask Wallet</Text>
                        <MetamaskIcon width={25} height={25} />
                      </>
                    )}
                  </Radio>
                  <Radio style={styles.option}>
                    {_evaProps => (
                      <>
                        <Text style={styles.h3}>Credit Card</Text>
                        <CardIcon width={25} height={25} />
                      </>
                    )}
                  </Radio>
                  <Radio style={styles.option}>
                    {_evaProps => (
                      <>
                        <Text style={styles.h3}>Debit Card</Text>
                        <CardIcon width={25} height={25} />
                      </>
                    )}
                  </Radio>
                  <Radio style={styles.option}>
                    {_evaProps => (
                      <>
                        <Text style={styles.h3}>Cash</Text>
                        <CashIcon width={25} height={25} />
                      </>
                    )}
                  </Radio>
                </RadioGroup>
                <View style={{marginTop: 15}}>
                  <CustomButton
                    title="Confirm Ride"
                    status={paymentMethod !== null ? "primary" : "disabled"}
                    size="medium"
                    onPress={handleConfirmRide}
                    disabled={paymentMethod === null}
                  />
                </View>
                <Text style={styles.paymentNote}>
                  Payment will be processed at the end of your ride
                </Text>
              </View>
            </>
          )}
          <Margin margin={10} />
        </View>
      </ScrollView>
      {socketRideState?.status === "creating_request" && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Creating your ride request...</Text>
        </View>
      )}
    </>
  );
};

export default BookRide;

const styles = StyleSheet.create({
  selectedRide: {
    backgroundColor: "rgba(214, 255, 239, 0.2)",
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 8,
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: primaryColor,
  },
  driverItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(214, 255, 239, 0.1)",
    borderRadius: 8,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: primaryColor,
    justifyContent: "center",
    alignItems: "center",
  },
  driverInitial: {
    color: "#fff",
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
  },
  driverDetails: {
    flex: 1,
    marginLeft: 15, // Space between avatar and details
  },
  h1: {
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    color: "#fff",
  },
  h2: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#B9B9B9",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  rating: {
    color: "#FFD700",
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
  },
  callButton: {
    backgroundColor: primaryColor,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  callButtonText: {
    color: "#000",
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
  },
  switcText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
  },
  webview: {
    width: "100%",
    height: 320,
  },
  heading: {
    fontSize: 20,
    fontFamily: "Montserrat-SemiBold",
    color: "#fff",
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 10,
    paddingBottom: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: "#1c2722",
  },
  h3: {
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    color: "#fff",
    flexGrow: 1,
  },
  listItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  chipContainer: {
    backgroundColor: "#D6FFEF",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "space-between",
  },
  chip: {
    backgroundColor: "#85FFCE",
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  chipText: {
    fontSize: 14,
    fontFamily: "Montserrat-SemiBold",
    color: "#005231",
  },
  backButton: {
    marginBottom: 15,
    paddingVertical: 8,
  },
  backButtonText: {
    color: primaryColor,
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#353f3b",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "80%",
  },
  modalText: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
    marginTop: 15,
    marginBottom: 5,
  },
  modalSubText: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  successButton: {
    width: "100%",
    backgroundColor: primaryColor,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  successButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  spinningIcon: {
    transform: [{rotate: "0deg"}],
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#353f3b",
    borderRadius: 8,
  },
  priceLabel: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#fff",
  },
  priceValue: {
    fontSize: 20,
    fontFamily: "Montserrat-Bold",
    color: primaryColor,
  },
  paymentNote: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    textAlign: "center",
    marginTop: 10,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Montserrat-SemiBold",
    marginTop: 10,
  },
  // Styles for new input fields
  locationInputContainer: {
    padding: 20,
    backgroundColor: backgroundPrimary, // Match existing theme
  },
  inputLabel: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#2C3A35", // Darker input background
    color: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    marginBottom: 15, // Space between inputs
    borderWidth: 1,
    borderColor: "#4A5C55", // Subtle border
  },
});

const ridesData = [
  {
    name: "Classic",
    price: "₹ 150",
    arrival: "Arrives in 15 mins",
  },
  {
    name: "Prime",
    price: "₹ 162",
    arrival: "Arrives in 12 mins",
  },
  {
    name: "Delux",
    price: "₹ 175",
    arrival: "Arrives in 11 mins",
  },
  {
    name: "Pro",
    price: "₹ 198",
    arrival: "Arrives in 09 mins",
  },
];
const ridesDataCompared = [
  {
    id: "7",
    name: "Ola Rides",
    price: "₹ 180-225",
    arrival: "Avg arriving in 22 mins",
  },
  {
    id: "8",
    name: "Rapido Rides",
    price: "₹ 186-218",
    arrival: "Avg arriving in 18 mins",
  },
  {
    id: "9",
    name: "Uber Rides",
    price: "₹ 191-232",
    arrival: "Avg arriving in 18 mins",
  },
  {
    id: "10",
    name: "BluSmart Rides",
    price: "₹ 181-212",
    arrival: "Avg arriving in 20 mins",
  },
];
