import { TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Input, Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import { primaryColor } from '../../theme/colors';
import { styles } from './styles';
import CustomButton from '../../components/CustomButton';
import Margin from '../../components/Margin';
import GoogleIcon from '../../../assets/images/icons/google.svg';
import FacebookIcon from '../../../assets/images/icons/facebook.svg';
import AppleIcon from '../../../assets/images/icons/apple.svg';
import auth from '@react-native-firebase/auth';
import { User } from '@react-native-firebase/auth';

const Login = () => {
    const navigation = useNavigation();
    const [value, setValue] = React.useState('');
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();

    // Handle user state changes
  function onAuthStateChanged(user : User) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);


    const googleLogin = () => {
        console.log("clciked");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>
                Welcome Back
            </Text>
            <Text style={styles.h2}>
                Log in to continue your  journey {'\n'} with us!
            </Text>
            <Input
                placeholder="Phone Number"
                size="large"
                value={value}
                style={styles.input}
                onChangeText={nextValue => setValue(nextValue)}
            />
            <Margin margin={30} />
            <CustomButton title="Log In" onPress={() => navigation.navigate('VerifyOtp' as never)} status="primary" size="medium" />
            <View style={styles.orContainer}>
                <View style={styles.orDivider} />
                <Text style={[styles.h2_bold, { marginBottom: 0 }]}>
                    Or
                </Text>
                <View style={styles.orDivider} />
            </View>
            <Text style={[styles.h2_bold, { color: primaryColor }]}>
                Log In with
            </Text>
            <View style={styles.social}>
                <TouchableOpacity style={{padding: 10}} onPress={() => googleLogin()}>
                    <GoogleIcon width={50} height={50} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <FacebookIcon width={50} height={50} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <AppleIcon width={50} height={50} />
                </TouchableOpacity>
            </View>
            <Text style={styles.h2_bold}>
                Don’t have an account? <Text onPress={() => navigation.navigate('Register' as never)} style={[styles.h2_bold, styles.underline]}>Sign Up</Text>
            </Text>
        </View >
    );
};

export default Login;

