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
import {
  useNavigation,
  NavigationProp,
  RouteProp,
} from "@react-navigation/native";
import {useSocket} from "../../hooks/useSocket";
import {RideRequest} from "../../types/ride/types/ride.types";
import {BookingStackParamList} from "../../types/navigation/navigation.types";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import {Dimensions as RNDimensions} from "react-native";
import Config from "react-native-config";

const {width: screenWidth, height: screenHeight} = RNDimensions.get("window");

// IMPORTANT: Ensure GOOGLE_MAPS_API_KEY_BOOKRIDE is set in your .env file
const GOOGLE_MAPS_API_KEY_BOOKRIDE =
  Config.GOOGLE_MAPS_API_KEY_BOOKRIDE ||
  "YOUR_GOOGLE_MAPS_API_KEY_WITH_DIRECTIONS_ENABLED"; // FIXME: Set GOOGLE_MAPS_API_KEY_BOOKRIDE in your .env file. Ensure the Directions API is enabled for this key in your Google Cloud Console.

// Define the expected structure for selected locations
interface SelectedLocation {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Enhanced driver type with animation state
interface AnimatedDriver extends Driver {
  animationId: string;
  visible: boolean;
  exiting: boolean;
}

// Define prop types for BookRide screen
type BookRideRouteProp = RouteProp<BookingStackParamList, "BookRide">;

interface BookRideProps {
  route: BookRideRouteProp;
  // navigation is already available via useNavigation hook
}

const BookRide: React.FC<BookRideProps> = ({route}) => {
  const navigation = useNavigation<NavigationProp<BookingStackParamList>>();
  const [rideState, setRideState] = useRecoilState(rideAtom);
  const {
    createRideRequest,
    currentRideState: socketRideState,
    isConnected: isSocketConnected,
  } = useSocket();
  const mapRef = useRef<MapView>(null);

  // Get pickup and dropOff locations from route params
  const passedPickupLocation = route.params?.pickupLocation;
  const passedDropOffLocation = route.params?.dropOffLocation;

  useEffect(() => {
    // Initialize rideState with passed locations if available
    if (passedPickupLocation && passedDropOffLocation) {
      setRideState(prev => ({
        ...prev,
        pickupLocation: {
          latitude: String(passedPickupLocation.coordinates.lat),
          longitude: String(passedPickupLocation.coordinates.lng),
          address: passedPickupLocation.address,
        },
        dropOffLocation: {
          latitude: String(passedDropOffLocation.coordinates.lat),
          longitude: String(passedDropOffLocation.coordinates.lng),
          address: passedDropOffLocation.address,
        },
        selectedRideType: undefined,
        fare: undefined,
        payment: undefined,
      }));
    } else {
      // Handle case where locations are not passed (e.g., direct navigation or error)
      // Maybe show an alert and navigate back, or require user to go back to Home
      Alert.alert(
        "Location Error",
        "Pickup and Dropoff locations not provided. Please go back and select them.",
        [{text: "OK", onPress: () => navigation.goBack()}],
      );
    }
  }, [passedPickupLocation, passedDropOffLocation, setRideState, navigation]);

  const [compare, setCompare] = useState(false);
  const [isPayment, setIsPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<number | null>(null);
  const [showDrivers, setShowDrivers] = useState(false);
  const [animatedDrivers, setAnimatedDrivers] = useState<AnimatedDriver[]>([]);

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
        toValue: -screenWidth,
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

    // Locations are now expected to be in rideState, set by useEffect from route.params
    if (
      !rideState.pickupLocation?.address ||
      !rideState.dropOffLocation?.address ||
      !rideState.pickupLocation.latitude ||
      !rideState.pickupLocation.longitude ||
      !rideState.dropOffLocation.latitude ||
      !rideState.dropOffLocation.longitude
    ) {
      Alert.alert(
        "Missing Info",
        "Pickup and drop-off locations are missing or incomplete. Please go back to Home.",
        [{text: "OK", onPress: () => navigation.goBack()}],
      );
      return;
    }

    // rideState already contains the correct pickup and dropOff locations with lat/lng
    const rideDataForServer: RideRequest = {
      pickupLocation: {
        latitude: Number(rideState.pickupLocation.latitude),
        longitude: Number(rideState.pickupLocation.longitude),
        address: rideState.pickupLocation.address || "",
      },
      dropoffLocation: {
        latitude: Number(rideState.dropOffLocation.latitude),
        longitude: Number(rideState.dropOffLocation.longitude),
        address: rideState.dropOffLocation.address || "",
      },
      name: "Rider Name Placeholder", // Consider getting actual user name
      phone: "0000000000", // Consider getting actual user phone
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
      "Attempting to create ride request with data from rideState:",
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

  // Check if locations were successfully passed and set in rideState
  // If not, render a message or redirect, rather than the full UI without locations.
  if (
    !rideState.pickupLocation?.address ||
    !rideState.dropOffLocation?.address ||
    !passedPickupLocation ||
    !passedDropOffLocation
  ) {
    return (
      <View style={styles.containerAlteredForMessage}>
        <Text style={styles.headerText}>Loading Location Details...</Text>
        <Text style={styles.messageText}>
          If this persists, please go back and re-select locations on the Home
          screen.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.goBackButton}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Destructure for easier use in MapViewDirections after null check above
  const finalPickupCoords = passedPickupLocation.coordinates;
  const finalDropOffCoords = passedDropOffLocation.coordinates;

  return (
    <ScrollView
      style={styles.mainScrollContainer}
      contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.container}>
        <View style={styles.locationSummaryContainer}>
          <Text style={styles.locationSummaryText}>
            Pickup: {rideState.pickupLocation.address}
          </Text>
          <Text style={styles.locationSummaryText}>
            Drop-off: {rideState.dropOffLocation.address}
          </Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: finalPickupCoords.lat,
              longitude: finalPickupCoords.lng,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <Marker
              coordinate={{
                latitude: finalPickupCoords.lat,
                longitude: finalPickupCoords.lng,
              }}
              title="Pickup Location"
              description={rideState.pickupLocation.address}
              pinColor="green"
            />
            <Marker
              coordinate={{
                latitude: finalDropOffCoords.lat,
                longitude: finalDropOffCoords.lng,
              }}
              title="Drop-off Location"
              description={rideState.dropOffLocation.address}
              pinColor="red"
            />
            {GOOGLE_MAPS_API_KEY_BOOKRIDE !==
              "YOUR_GOOGLE_MAPS_API_KEY_WITH_DIRECTIONS_ENABLED" && (
              <MapViewDirections
                origin={{
                  latitude: finalPickupCoords.lat,
                  longitude: finalPickupCoords.lng,
                }}
                destination={{
                  latitude: finalDropOffCoords.lat,
                  longitude: finalDropOffCoords.lng,
                }}
                apikey={GOOGLE_MAPS_API_KEY_BOOKRIDE}
                strokeWidth={4}
                strokeColor="#007AFF"
                mode="DRIVING"
                onReady={result => {
                  mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: {
                      right: screenWidth / 20,
                      bottom: screenHeight / 20,
                      left: screenWidth / 20,
                      top: screenHeight / 20,
                    },
                  });
                }}
                onError={errorMessage => {
                  console.error(
                    "MapViewDirections Error (BookRide): ",
                    errorMessage,
                  );
                }}
              />
            )}
          </MapView>
        </View>

        <View style={styles.tabContainer}>
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
                            const priceString = item.price;
                            const numericPrice = parseInt(
                              priceString.replace("₹ ", ""),
                              10,
                            );
                            if (!isNaN(numericPrice)) {
                              handleRideSelection(item.name, numericPrice);
                            } else {
                              console.error(
                                "Could not parse price:",
                                priceString,
                              );
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
        </View>
      </View>
      {socketRideState?.status === "creating_request" && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Creating your ride request...</Text>
        </View>
      )}
    </ScrollView>
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
  headerText: {
    fontSize: 22,
    fontFamily: "Montserrat-Bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
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
    marginLeft: 15,
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
  mainScrollContainer: {
    flex: 1,
    backgroundColor: backgroundPrimary,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: backgroundPrimary,
  },
  locationSummaryContainer: {
    padding: 15,
    backgroundColor: "#353f3b", // A slightly different background for emphasis
    borderRadius: 8,
    marginBottom: 20,
  },
  locationSummaryText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    marginBottom: 5,
  },
  containerAlteredForMessage: {
    // Styles for the message view if locations aren't ready
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: backgroundPrimary,
  },
  messageText: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Montserrat-Regular",
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: primaryColor,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
  tabContainer: {
    flex: 1,
  },
  mapContainer: {
    height: screenHeight * 0.3, // Or a fixed height like 250 or 300
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 20,
    borderWidth: 1,
    borderColor: "#444",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
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
