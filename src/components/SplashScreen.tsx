import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import GoLogo from '../../assets/images/logo.svg';
import { userEmailSelector, userIsPhoneVerifiedSelector, userOtpConfirmationSelector, userPhoneNumberSelector } from '../store/selectors/user/userSelectors';
import { useRecoilValue } from 'recoil';

import auth from "@react-native-firebase/auth";
import { mmkvUtils } from '../store/mmkv/storage';


const SplashScreen = () => {
    const navigation = useNavigation();
    const userEmail = useRecoilValue(userEmailSelector)
    const userIsPhoneVerified = useRecoilValue(userIsPhoneVerifiedSelector);
    const userPhoneNumber = useRecoilValue(userPhoneNumberSelector);
    const userOtpConfirmation = useRecoilValue(userOtpConfirmationSelector)

    async function handleLogout() {
        await auth().signOut();
        mmkvUtils.setUser(null);
        navigation.navigate("Login" as never);
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (userEmail) {
                // mmkvUtils.deletePhone();
                if (!userIsPhoneVerified) {
                    if (userOtpConfirmation) {
                        navigation.navigate("VerifyOtp" as never);
                    }
                    else {
                        navigation.navigate("Login" as never);
                    }
                }
                else {
                    navigation.navigate("UserScreens" as never);
                }
            } else {
                navigation.navigate('Login' as never);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [userEmail, navigation]);

    return (
        <View style={styles.container}>
            <GoLogo width={220} height={114} />
            <Text style={styles.text}>let's go</Text>
        </View>
    );
};

export default SplashScreen;

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    image: { width: 200, height: 114 },
    text: {
        color: '#fff', fontSize: 28, marginTop: 20,
        fontFamily: 'Montserrat-Regular',
    },
});
