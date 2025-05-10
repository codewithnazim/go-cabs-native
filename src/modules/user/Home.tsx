import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, {useState, useEffect} from "react";
import {useRecoilState} from "recoil";
import {rideAtom} from "../../store/atoms/ride/rideAtom";
import HomeBanner from "./components/HomeBanner";
import Margin from "../../components/Margin";
import {useSocket} from "../../hooks/useSocket";
import {useNavigation, NavigationProp} from "@react-navigation/native";
import {
  BookingStackParamList,
  RootStackParamList,
} from "../../types/navigation/navigation.types";

const Home = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [rideState, setRideState] = useRecoilState(rideAtom);
  const {isConnected} = useSocket();

  const handleGoToBooking = () => {
    navigation.navigate("BookingRoutes", {screen: "BookRide"});
  };

  return (
    <View style={styles.container}>
      <Margin margin={30} />
      <HomeBanner />

      <TouchableOpacity
        onPress={handleGoToBooking}
        style={styles.bookingButton}>
        <Text style={styles.bookingButtonText}>Book a New Ride</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#242E2A",
    padding: 20,
  },
  bookingButton: {
    backgroundColor: "#00BF72",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 20,
  },
  bookingButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
