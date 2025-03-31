import { Alert, View } from 'react-native';
import React, { useState } from 'react';
import { Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { styles } from './styles';
import OTPInput from './OtpInput';
import CustomButton from '../../components/CustomButton';
import Margin from '../../components/Margin';
import { useRecoilValue } from 'recoil';
import { userOtpConfirmationSelector } from '../../store/selectors/user/userSelectors';

const VerifyOtp = () => {
    const navigation = useNavigation();
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const userOtpConfirmation = useRecoilValue(userOtpConfirmationSelector);
    const [error, setError] = useState();

    const handleOtpVerify = async () => {
        if (userOtpConfirmation && userOtpConfirmation.confirm(otp.join(""))) {
            navigation.navigate('OnboardingScreens', { screen: 'Screen1' })
        }
        else {
            Alert.alert("Invalid OTP!");
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>
                Phone Verification
            </Text>
            <Text style={styles.h2}>
                Enter your OTP code
            </Text>
            <OTPInput otp={otp} setOtp={setOtp} />
            <Text style={[styles.h2_bold, { fontSize: 14, marginTop: 20, marginBottom: 50 }]}>
                Didn’t receive code? <Text style={[styles.h2_bold, styles.underline, { fontSize: 14, }]}>Resend again</Text>
            </Text>
            <Margin margin={30} />
            <CustomButton title="Verify OTP" onPress={handleOtpVerify} status="primary" size="medium" />
        </View >
    );
};

export default VerifyOtp;


