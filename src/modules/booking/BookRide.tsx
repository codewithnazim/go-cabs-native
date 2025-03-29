import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
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
import {useNavigation} from "@react-navigation/native";
import LocationInput from "../../components/LocationInput";

const BookRide = () => {
  const navigation = useNavigation();

  const [ev, setEv] = React.useState(false);
  const [compare, setCompare] = React.useState(false);
  const [isPayment, setIsPayment] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState(0);
  const [pickupLocation, setPickupLocation] = React.useState("");
  const [destinationLocation, setDestinationLocation] = React.useState("");

  const onCheckedChange = (isChecked: any) => {
    setEv(isChecked);
  };

  const handlePickupSelect = (location: any) => {
    setPickupLocation(location.address);
  };

  const handleDestinationSelect = (location: any) => {
    setDestinationLocation(location.address);
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
          <View style={{padding: 20}}>
            <LocationInput
              placeholder="Enter Pickup Location"
              onLocationSelect={handlePickupSelect}
              value={pickupLocation}
            />
            <LocationInput
              placeholder="Enter Destination"
              onLocationSelect={handleDestinationSelect}
              value={destinationLocation}
            />
          </View>
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
                {(compare ? ridesDataCompared : ridesData)?.map(
                  (item, index) => (
                    <View key={index.toString()} style={styles.listItem}>
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
                    </View>
                  ),
                )}
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
                <RadioGroup
                  selectedIndex={paymentMethod}
                  onChange={index => setPaymentMethod(index)}>
                  <View style={styles.option}>
                    <Radio />
                    <Text style={styles.h3}>Metamask Wallet</Text>
                    <MetamaskIcon width={25} height={25} />
                  </View>
                  <View style={styles.option}>
                    <Radio />
                    <Text style={styles.h3}>Credit Card</Text>
                    <CardIcon width={25} height={25} />
                  </View>
                  <View style={styles.option}>
                    <Radio />
                    <Text style={styles.h3}>Debit Card</Text>
                    <CardIcon width={25} height={25} />
                  </View>
                  <View style={styles.option}>
                    <Radio />
                    <Text style={styles.h3}>Cash</Text>
                    <CashIcon width={25} height={25} />
                  </View>
                </RadioGroup>
                <View style={{marginTop: 15}}>
                  <CustomButton
                    title="Confirm Ride"
                    status="primary"
                    size="medium"
                    onPress={() =>
                      navigation.navigate("BookingDetails" as never)
                    }
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
