import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import React, {useState, useRef} from "react";
import WebView from "react-native-webview";
import {backgroundPrimary, primaryColor} from "../../theme/colors";
import {Radio, RadioGroup, Toggle} from "@ui-kitten/components";
import DullDivider from "../../components/DullDivider";
import CarIcon from "../../../assets/images/icons/car.svg";
import CardIcon from "../../../assets/images/icons/card.svg";
import MetamaskIcon from "../../../assets/images/icons/metamask.svg";
import CashIcon from "../../../assets/images/icons/cash.svg";
import CustomButton from "../../components/CustomButton";
import Margin from "../../components/Margin";
import {useRecoilState} from "recoil";
import {rideAtom} from "../../store/atoms/ride/rideAtom";
import driverData from "../driver/data/driver.json";
import {Driver} from "../../types/driver/driverTypes";

const {width} = Dimensions.get("window");

// Enhanced driver type with animation state
interface AnimatedDriver extends Driver {
  animationId: string;
  visible: boolean;
  exiting: boolean;
}

const BookRide = () => {
  const [rideState, setRideState] = useRecoilState(rideAtom);

  const [ev, setEv] = useState(false);
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

  const onCheckedChange = (isChecked: any) => {
    setEv(isChecked);
  };

  // Function to handle ride type selection
  const handleRideSelection = (rideName: string) => {
    setRideState(prev => ({
      ...prev,
      selectedRideType: rideName,
    }));
    setIsPayment(true);
    setEv(false);
  };

  // Function to get random drivers
  const getRandomDrivers = () => {
    const driverEntries = Object.entries(driverData);
    const shuffled = [...driverEntries].sort(() => 0.5 - Math.random());
    // Limit to 4 drivers as requested
    const selectedDrivers = shuffled.slice(0, 4).map(([id, driver]) => ({
      id,
      ...driver,
    }));
    return selectedDrivers;
  };

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
    // Clear any existing animations
    animationsMap.current.clear();

    const randomDrivers = getRandomDrivers();

    // Create enhanced drivers with animation IDs
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
      status: "searching",
    }));

    setShowDrivers(true);
    setIsPayment(false);

    // Sequentially animate drivers in
    enhancedDrivers.forEach((driver, index) => {
      // Create animation values for this driver
      const animationValues = {
        translateX: new Animated.Value(width),
        progress: new Animated.Value(0),
        opacity: new Animated.Value(1),
      };

      // Store animation values in the map
      animationsMap.current.set(driver.animationId, animationValues);

      // Schedule driver appearance
      setTimeout(() => {
        // Make driver visible
        setAnimatedDrivers(prev =>
          prev.map(d =>
            d.animationId === driver.animationId ? {...d, visible: true} : d,
          ),
        );

        // Animate driver entry
        Animated.timing(animationValues.translateX, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();

        // Animate progress bar
        Animated.timing(animationValues.progress, {
          toValue: 1,
          duration: 12000, // 12 seconds as requested
          useNativeDriver: false,
        }).start(() => {
          // When progress completes, start exit animation
          startExitAnimation(driver.animationId);
        });
      }, index * 1500); // 1.5 second gap between each driver
    });
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

        <View style={styles.driverAvatar}>
          <Text style={styles.driverInitial}>{driver.name.charAt(0)}</Text>
        </View>
        <View style={{flexGrow: 1}}>
          <Text style={styles.h1}>{driver.name}</Text>
          <Text style={styles.h2}>
            {driver.vehiclemodel.split(" ")[0]} • {driver.regnumber.slice(-4)}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>★ {driver.rating}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.callButton}>
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      <ScrollView>
        <View>
          {ev && (
            <View style={{padding: 20}}>
              <Text style={styles.heading}>
                Plan Comparison{" "}
                <Text style={[styles.heading, {color: primaryColor}]}>
                  EV Mode
                </Text>
              </Text>
              <Text
                style={[
                  styles.h2,
                  {textAlign: "center", marginTop: 5, marginBottom: 10},
                ]}>
                For the same ride, you are opting, this how will be charges on
                different platforms
              </Text>
            </View>
          )}
          <View
            style={{
              width: "100%",
              height: 320,
              backgroundColor: backgroundPrimary,
            }}>
            <WebView
              originWhitelist={["*"]}
              source={require("./map.html")}
              style={styles.webview}
            />
          </View>
          {!isPayment ? (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 10,
                  alignItems: "center",
                  marginVertical: 15,
                  paddingHorizontal: 10,
                }}>
                <Text style={styles.switcText}>Switch to EV</Text>
                <Toggle checked={ev} onChange={onCheckedChange} />
              </View>
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
                          onPress={() => handleRideSelection(item.name)}>
                          <CarIcon width={50} height={50} />
                          <View style={{flexGrow: 1}}>
                            <Text style={styles.h1}>
                              {ev && "EV "}
                              {item.name}
                            </Text>
                            <Text style={styles.h2}>{item.arrival}</Text>
                          </View>
                          <Text style={[styles.h1, {alignSelf: "flex-start"}]}>
                            {item.price}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )
                  : animatedDrivers.map(driver => renderDriverItem(driver))}
                {compare && (
                  <View style={{paddingHorizontal: 20, marginTop: 5}}>
                    <View
                      style={[
                        styles.listItem,
                        {backgroundColor: "#fff", borderRadius: 8},
                      ]}>
                      <CarIcon width={50} height={50} />
                      <View style={{flexGrow: 1}}>
                        <Text
                          style={[
                            styles.h1,
                            {color: primaryColor, fontSize: 18},
                          ]}>
                          Go Cabs Rides
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.h1,
                          {color: primaryColor, fontSize: 18},
                        ]}>
                        ₹ 150-198
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <Margin margin={10} />
              <View style={{padding: 10}}>
                <View style={styles.chipContainer}>
                  <Text style={[styles.chipText, {paddingLeft: 5}]}>
                    Compare, how others are charging
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCompare(!compare)}
                    style={styles.chip}>
                    <Text style={styles.chipText}>
                      {compare ? "Revert" : "Compare"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{paddingHorizontal: 20, marginTop: 5}}>
                <CustomButton
                  title="Continue Booking Your GO Ride"
                  status="primary"
                  size="medium"
                  onPress={() => {
                    setIsPayment(true);
                    setEv(false);
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
              </View>
            </>
          )}
          <Margin margin={10} />
        </View>
      </ScrollView>
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
  driverItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
    position: "relative", // For absolute positioning of progress bar
    overflow: "hidden", // To contain the progress bar
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: primaryColor,
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
  h2: {
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    marginTop: -5,
    color: "#B9B9B9",
  },
  h1: {
    fontSize: 22,
    fontFamily: "Montserrat-SemiBold",
    color: "#fff",
    marginBottom: 0,
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
