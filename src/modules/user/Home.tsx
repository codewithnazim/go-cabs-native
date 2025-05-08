import {StyleSheet, View, BackHandler, Alert} from "react-native";
import React, {useState, useCallback, useEffect} from "react";
import HomeBanner from "./components/HomeBanner";
import SearchDriver from "../booking/SearchDriver";
import Margin from "../../components/Margin";
import {useFocusEffect} from "@react-navigation/native";
import {dummyRideRequest} from "../../data/dummyRideRequest";
import {useSocket} from "../../hooks/useSocket";
import {SocketControls} from "../../components/SocketControls";
import {RideRequest} from "../../types/ride/types/ride.types";

const Home = () => {
  const [isFocused, setIsFocused] = useState(false);
  const roomId = "room_123";

  const {
    isConnected,
    roomStatus,
    roomMembers,
    joinRoom,
    sendRideRequest,
    keepOneClient,
    disconnect,
    getRoomMembers,
  } = useSocket(roomId);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  useEffect(() => {
    const backAction = () => {
      if (isFocused) {
        Alert.alert("Exit App", "Are you sure you want to exit the app?", [
          {text: "Cancel", style: "cancel"},
          {text: "Yes", onPress: () => BackHandler.exitApp()},
        ]);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction,
    );

    return () => backHandler.remove();
  }, [isFocused]);

  const handleSendRideRequest = () => {
    const rideRequestData: RideRequest = {
      ...dummyRideRequest,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sendRideRequest(rideRequestData);
  };

  return (
    <View style={styles.container}>
      <SearchDriver />
      <Margin margin={30} />
      <HomeBanner />
      <SocketControls
        isConnected={isConnected}
        roomStatus={roomStatus}
        roomMembers={roomMembers}
        onJoinRoom={joinRoom}
        onSendRideRequest={handleSendRideRequest}
        onKeepOneClient={keepOneClient}
        onDisconnect={disconnect}
        onGetRoomMembers={getRoomMembers}
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});
