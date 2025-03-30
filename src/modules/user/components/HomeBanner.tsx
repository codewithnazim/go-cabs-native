import {StyleSheet, Text, View, Dimensions} from "react-native";
import React from "react";
import {primaryColor} from "../../../theme/colors";
import {LinearGradient} from "react-native-linear-gradient";
import ClassicRideLogo from "../../../../assets/images/icons/classic-ride.svg";
import DeluxeRideLogo from "../../../../assets/images/icons/deluxe-ride.svg";
import PrimeRideLogo from "../../../../assets/images/icons/prime-ride.svg";

const {width} = Dimensions.get("window");
const HomeBanner = () => {
  return (
    <>
      <LinearGradient
        colors={["#005935", "#00BF72"]}
        start={{x: 1, y: 0}}
        end={{x: 0, y: 0}}
        style={styles.containerChooseRide}>
        <Text style={[styles.h2, {flexGrow: 1}]}>Choose {"\n"}your ride</Text>
        <View>
          <ClassicRideLogo width={50} height={50} />
          <Text style={styles.h4}>Classic</Text>
        </View>
        <View>
          <DeluxeRideLogo width={50} height={50} />
          <Text style={styles.h4}>Deluxe</Text>
        </View>
        <View>
          <PrimeRideLogo width={50} height={50} />
          <Text style={styles.h4}>Prime</Text>
        </View>
      </LinearGradient>
      <View style={styles.container}>
        <View style={{padding: 20, flex: 1}}>
          <Text style={[styles.h1, styles.responsiveH1]}>0.2 Tons</Text>
          <Text style={styles.h3}>Carbon is saved {"\n"}by you this year</Text>
        </View>
        <View style={{width: 1, height: "100%", backgroundColor: "#fff"}} />
        <View style={{padding: 20, flex: 1}}>
          <Text style={[styles.h3, {textAlign: "center"}]}>You Earned</Text>
          <Text style={[styles.h1, styles.responsiveH1]}>$200.80</Text>
          <Text style={[styles.h3, {color: primaryColor, textAlign: "center"}]}>
            Carbon Coins
          </Text>
        </View>
      </View>
    </>
  );
};

export default HomeBanner;

const styles = StyleSheet.create({
  containerChooseRide: {
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: 'space-between',
    gap: 25,
    marginBottom: 30,
    alignItems: "center",
    padding: 20,
  },
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#1c2722",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 2,
  },
  image: {
    width: 50,
    height: 50,
  },
  h1: {
    fontFamily: "Montserrat-ExtraBold",
    fontSize: 35,
    color: primaryColor,
  },
  h2: {
    fontFamily: "Montserrat-ExtraBold",
    fontSize: 22,
    color: "#fff",
  },
  h3: {
    fontFamily: "Montserrat-Bold",
    fontSize: 16,
    color: "#fff",
  },
  h4: {
    fontFamily: "Montserrat-Bold",
    fontSize: 12,
    color: "#fff",
    marginTop: 5,
    textAlign: "center",
  },
  responsiveH1: {
    fontSize: width * 0.07, // Adjust font size based on screen width
    textAlign: "center",
    flexWrap: "wrap", // Allow text wrapping
  },
});
