import { TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Input, Text } from "@ui-kitten/components";
import { useNavigation } from "@react-navigation/native";
import { primaryColor } from "../../theme/colors";
import { styles } from "./styles";
import CustomButton from "../../components/CustomButton";
import Margin from "../../components/Margin";
import GoogleIcon from "../../../assets/images/icons/google.svg";
import FacebookIcon from "../../../assets/images/icons/facebook.svg";
import AppleIcon from "../../../assets/images/icons/apple.svg";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useRecoilState } from "recoil";
import { userAtom } from "../../store/atoms/user/userAtom";
import { User } from "../../types/user/userTypes";
import { mmkvUtils } from "../../store/mmkv/storage";
import { FIREBASE_WEB_CLIENT_ID } from "@env";
import { firebase, getFirestore } from "@react-native-firebase/firestore";

const Login = () => {
  const navigation = useNavigation();
  const [value, setValue] = React.useState("");
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useRecoilState<User | null>(userAtom);
  const [loading, setLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const firestore = getFirestore();

  const firebaseWebClientId = FIREBASE_WEB_CLIENT_ID;
  console.log("web client", firebaseWebClientId);

  GoogleSignin.configure({
    webClientId: firebaseWebClientId,
  });

  function onAuthStateChanged(loggedInUser: any | User) {
    setUser(loggedInUser);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  });

  const onGoogleButtonPress = async () => {
    try {
      setLoading(true);
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      let idToken = signInResult.data?.idToken;

      if (!idToken) {
        // if you are using older versions of google-signin
        idToken = signInResult.data?.idToken;
      }
      if (!idToken) {
        throw new Error("No ID token found");
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );
      let loggedinUser = userCredential.user;

      const userRef = firestore.collection('users').doc(loggedinUser.uid);

      var userData = {
        displayName: loggedinUser.displayName || "",
        uid: loggedinUser.uid,
        email: loggedinUser.email || "",
        photoURL: loggedinUser.photoURL || "",
        phoneNumber: loggedinUser.phoneNumber || "",
        isPhoneVerified: false,
        confirm: null
      };

      userRef.get().then((docSnapshot) => {
        if (docSnapshot.exists) {
          const user = docSnapshot.data();
          if (user && user.isPhoneVerified && user.isPhoneVerified === "true") {
            userData.isPhoneVerified = true;
          }
        } else {
          userRef.set({
            displayName: loggedinUser.displayName || "",
            uid: loggedinUser.uid,
            email: loggedinUser.email,
            phoneNumber: loggedinUser.phoneNumber || null,
            isPhoneVerified: false,
            photoURL: loggedinUser.photoURL || "",
            createdAt: firebase.firestore.FieldValue.serverTimestamp,
          })
            .then(() => {
              console.log('New user created in Firestore:', loggedinUser.uid);
            })
            .catch((error) => {
              Alert.alert("Error signing in!");
            });
        }
      }).catch((error) => {
        console.error('Error checking user in Firestore:', error);
        Alert.alert("Error signing in!");
      });

      setUser(userData);
      mmkvUtils.setUser(userData);
      if (userData.phoneNumber && userData.isPhoneVerified) {
        navigation.navigate("UserScreens", { screen: "Home" });
      }
      else if (userData.phoneNumber && userData.isPhoneVerified) {
        navigation.navigate("VerifyOtp" as never);
      }
    } catch (error) {
      Alert.alert("Error signing in!");
    } finally {
      setLoading(false);
    }
  };

  const sendOTP = async (phoneNumber: string) => {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      mmkvUtils.setConfirmation(confirmation);
      navigation.navigate("VerifyOtp" as never);
    } catch (error) {
      Alert.alert("Error sending OTP!")
    }
  };

  const handleLogin = () => {
    setLoginLoading(true);
    const isValidPhone = /^\d{10}$/.test(value);
    if (isValidPhone) {
      mmkvUtils.setPhoneNumber(value)
      sendOTP(value);
    }
    else {
      Alert.alert("Please enter a valid phone number!");
    }
    setLoginLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Welcome Back</Text>
      <Text style={styles.h2}>
        Log in to continue your journey {"\n"} with us!
      </Text>
      {user && !user.phoneNumber ?
        <Text>{user.displayName}, please enter your phone number</Text>
        : <></>}
      <Input
        placeholder="Phone Number"
        size="large"
        value={value}
        style={styles.input}
        onChangeText={nextValue => setValue(nextValue)}
        keyboardType="numeric"
      />
      <Margin margin={30} />
      <CustomButton
        title="Log In"
        onPress={handleLogin}
        status="primary"
        size="medium"
        disabled={loginLoading}
      />
      <View style={styles.orContainer}>
        <View style={styles.orDivider} />
        <Text style={[styles.h2_bold, { marginBottom: 0 }]}>Or</Text>
        <View style={styles.orDivider} />
      </View>
      <Text style={[styles.h2_bold, { color: primaryColor }]}>Log In with</Text>
      <View style={styles.social}>
        <TouchableOpacity
          disabled={loading}
          onPress={() =>
            onGoogleButtonPress().then(() =>
              console.log("Signed in with Google!"),
            )
          }>
          {loading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <GoogleIcon width={50} height={50} />
          )}
        </TouchableOpacity>
        <TouchableOpacity>
          <FacebookIcon width={50} height={50} />
        </TouchableOpacity>
        <TouchableOpacity>
          <AppleIcon width={50} height={50} />
        </TouchableOpacity>
      </View>
      <Text style={styles.h2_bold}>
        Don’t have an account?{" "}
        <Text
          onPress={() => navigation.navigate("Register" as never)}
          style={[styles.h2_bold, styles.underline]}>
          Sign Up
        </Text>
      </Text>
    </View>
  );
};

export default Login;
