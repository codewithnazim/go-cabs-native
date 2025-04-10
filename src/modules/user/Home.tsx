import {StyleSheet, View, BackHandler, Alert} from "react-native";
import React, {useEffect} from "react";
import HomeBanner from "./components/HomeBanner";
import SearchDriver from "../booking/SearchDriver";
import Margin from "../../components/Margin";
// import {useNavigation} from "@react-navigation/native";
// import {RootNavigationProp} from "../../types/navigation/navigation.types";

const Home = () => {
//   const navigation = useNavigation<RootNavigationProp>();

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      // Show confirmation dialog
      Alert.alert("Exit App", "Are you sure you want to exit the app?", [
        {
          text: "Cancel",
          onPress: () => null,
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: () => BackHandler.exitApp(),
        },
      ]);

      // Return true to prevent default back behavior
      return true;
    };

    // Add event listener for back button press
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    // Clean up the event listener when component unmounts
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      <SearchDriver />
      <Margin margin={30} />
      <HomeBanner />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  text: {color: "#fff", fontSize: 28, marginTop: 10, fontStyle: "italic"},
});
