import {StyleSheet, View, BackHandler, Alert} from "react-native";
import React, {useEffect} from "react";
import HomeBanner from "./components/HomeBanner";
import SearchDriver from "../booking/SearchDriver";
import Margin from "../../components/Margin";
import {useFocusEffect} from "@react-navigation/native";

const Home = () => {
  const [isFocused, setIsFocused] = React.useState(false);

  // Track when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, [])
  );

  useEffect(() => {
    const backAction = () => {
      // Only show exit dialog when Home screen is focused
      if (isFocused) {
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
        return true; 
      }
      return false; 
    };

    // Add event listener for back button press
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    // Clean up the event listener when component unmounts
    return () => backHandler.remove();
  }, [isFocused]);

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
