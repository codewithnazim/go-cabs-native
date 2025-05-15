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
import {BookingStackParamList} from "../../types/navigation/navigation.types";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import {Dimensions as RNDimensions} from "react-native";
import Config from "react-native-config";
import {QuotationRequestPayload} from "../../types/ride/types/ride.types";

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
  const passedPickupLocation = route.params?.pickupLocation;
  const passedDropOffLocation = route.params?.dropOffLocation;

  // State to manage if essential data is ready for rendering the main component
  const [isEssentialDataReady, setIsEssentialDataReady] = useState(false);

  // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL EARLY RETURN
  const [rideState, setRideState] = useRecoilState(rideAtom);
  const {
    submitQuotationRequest,
    currentRideState: socketRideState,
    isConnected: isSocketConnected,
  } = useSocket();
  const mapRef = useRef<MapView>(null);

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

  // This useEffect will now control whether the main component logic proceeds
  useEffect(() => {
    if (passedPickupLocation && passedDropOffLocation) {
      setIsEssentialDataReady(true);
    } else {
      setIsEssentialDataReady(false); // Ensure it's false if data is missing
      Alert.alert(
        "Location Error",
        "Pickup and Dropoff locations not provided. Please go back and select them.",
        [{text: "OK", onPress: () => navigation.goBack()}],
      );
    }
  }, [passedPickupLocation, passedDropOffLocation, navigation]);

  // This useEffect now depends on isEssentialDataReady or more directly on the presence of location data.
  // It will initialize rideState once locations are confirmed to be available.
  useEffect(() => {
    // Only proceed if essential data (locations) is ready
    if (isEssentialDataReady && passedPickupLocation && passedDropOffLocation) {
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
        selectedRideType: undefined, // Reset these when new locations are set
        fare: undefined,
        payment: undefined,
        status: "configuring_ride", // Or an appropriate initial status
      }));
    }
  }, [
    isEssentialDataReady,
    passedPickupLocation,
    passedDropOffLocation,
    setRideState,
  ]);

  // The useEffect for socketRideState, and any other useEffects, useState, etc.
  // should be here or after, as long as they are before the conditional return below.
  // Example: The problematic useEffect from your log for socketRideState:
  useEffect(() => {
    if (
      socketRideState.status === "pending_bids" &&
      socketRideState.bidding_room_id
    ) {
      setRideState(prev => ({
        ...prev,
        status: "PENDING_BIDS",
        quotationRequestId: socketRideState.bidding_room_id,
      }));
      navigation.navigate("ViewBidsScreen", {
        quotationId: socketRideState.bidding_room_id,
      });
    } else if (
      socketRideState.status === "error" &&
      rideState.status === "QUOTATION_REQUEST_INITIATED" // Check if error is related to current quotation attempt
    ) {
      Alert.alert(
        "Quotation Error",
        socketRideState.errorMessage || "Failed to submit quotation request.",
      );
      setRideState(prev => ({
        ...prev,
        status: "error",
        errorMessage:
          socketRideState.errorMessage || "Failed to submit quotation request.",
      }));
    }
  }, [
    socketRideState,
    navigation,
    setRideState,
    rideState.status, // Added rideState.status as a dependency
  ]);

  // CONDITIONAL EARLY RETURN: If essential data is not ready, render nothing or a loader.
  // This MUST come AFTER ALL hook declarations.
  if (!isEssentialDataReady) {
    // You can return null or a loading indicator.
    // Returning null is fine if the alert and navigation.goBack() handle user feedback.
    return null;
  }

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

  // Function to handle ride confirmation - RENAMED
  const handleRequestQuotes = () => {
    if (!isSocketConnected) {
      Alert.alert(
        "Connection Error",
        "Not connected to the server. Please check your internet connection or try again later.",
      );
      setRideState(prev => ({
        ...prev,
        status: "error",
        errorMessage: "Connection failed",
      }));
      return;
    }

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
      setRideState(prev => ({
        ...prev,
        status: "error",
        errorMessage: "Location data missing",
      }));
      return;
    }

    const riderId = "current-rider-id"; // FIXME: Replace with actual rider ID from auth/user state

    const quotationDataForServer: QuotationRequestPayload = {
      riderId: riderId,
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
      requestedAt: new Date().toISOString(),
    };

    console.log(
      "Attempting to submit quotation request with data:",
      quotationDataForServer,
    );

    if (!submitQuotationRequest) {
      Alert.alert("Error", "submitQuotationRequest not available. Dev issue.");
      setRideState(prev => ({
        ...prev,
        status: "error",
        errorMessage: "Quotation submission system error",
      }));
      return;
    }

    setRideState(prev => ({
      ...prev,
      status: "QUOTATION_REQUEST_INITIATED", // Set pre-socket call status
      quotationRequestId: undefined, // Will be set by socket event ack
      errorMessage: undefined, // Clear previous errors
    }));

    submitQuotationRequest(quotationDataForServer);

    // Navigation to ViewBidsScreen will be handled by a useEffect hook
    // monitoring socketRideState.status (e.g., 'pending_bids') and
    // socketRideState.bidding_room_id (as quotationId).
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

  // Destructure for easier use in MapViewDirections after null check above
  const finalPickupCoords = passedPickupLocation!.coordinates;
  const finalDropOffCoords = passedDropOffLocation!.coordinates;

  console.log(
    "[BookRide] Final Pickup Coords:",
    JSON.stringify(finalPickupCoords),
  );
  console.log(
    "[BookRide] Final Dropoff Coords:",
    JSON.stringify(finalDropOffCoords),
  );
  console.log(
    "[BookRide] Google Maps API Key Used:",
    GOOGLE_MAPS_API_KEY_BOOKRIDE,
  );

  return (
    <ScrollView
      style={styles.mainScrollContainer}
      contentContainerStyle={styles.scrollContentContainer}>
      <View style={styles.container}>
        <View style={styles.locationSummaryContainer}>
          <Text style={styles.locationSummaryText}>
            Pickup: {rideState.pickupLocation?.address || "Fetching address..."}
          </Text>
          <Text style={styles.locationSummaryText}>
            Drop-off:{" "}
            {rideState.dropOffLocation?.address || "Fetching address..."}
          </Text>
        </View>

        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: (finalPickupCoords.lat + finalDropOffCoords.lat) / 2,
              longitude: (finalPickupCoords.lng + finalDropOffCoords.lng) / 2,
              latitudeDelta:
                Math.abs(finalPickupCoords.lat - finalDropOffCoords.lat) * 2,
              longitudeDelta:
                Math.abs(finalPickupCoords.lng - finalDropOffCoords.lng) * 2,
            }}>
            <Marker
              coordinate={{
                latitude: finalPickupCoords.lat,
                longitude: finalPickupCoords.lng,
              }}
              title="Pickup Location"
              description={
                rideState.pickupLocation?.address || "Fetching address..."
              }
              pinColor="green"
            />
            <Marker
              coordinate={{
                latitude: finalDropOffCoords.lat,
                longitude: finalDropOffCoords.lng,
              }}
              title="Drop-off Location"
              description={
                rideState.dropOffLocation?.address || "Fetching address..."
              }
              pinColor="red"
            />
            {rideState.pickupLocation?.latitude &&
              rideState.dropOffLocation?.latitude &&
              rideState.pickupLocation.longitude &&
              rideState.dropOffLocation.longitude &&
              (() => {
                const origin = {
                  latitude: parseFloat(rideState.pickupLocation!.latitude),
                  longitude: parseFloat(rideState.pickupLocation!.longitude),
                };
                const destination = {
                  latitude: parseFloat(rideState.dropOffLocation!.latitude),
                  longitude: parseFloat(rideState.dropOffLocation!.longitude),
                };
                console.log(
                  "[BookRide] Rendering MapViewDirections with Origin:",
                  origin,
                  "Destination:",
                  destination,
                  "API Key used:",
                  GOOGLE_MAPS_API_KEY_BOOKRIDE.substring(0, 10) + "...",
                );
                return (
                  <MapViewDirections
                    origin={origin}
                    destination={destination}
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
                );
              })()}
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
                    title="Request Quotes"
                    status={paymentMethod !== null ? "primary" : "disabled"}
                    size="medium"
                    onPress={handleRequestQuotes}
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
      {(rideState.status === "creating_request" ||
        rideState.status === "QUOTATION_REQUEST_INITIATED" ||
        socketRideState?.status === "creating_request" || // Retain for direct ride if ever used
        socketRideState?.status === "creating_quotation_request") && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>
            {rideState.status === "QUOTATION_REQUEST_INITIATED" ||
            socketRideState?.status === "creating_quotation_request"
              ? "Requesting quotes..."
              : "Creating your ride request..."}
          </Text>
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
