import { StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { Text } from '@ui-kitten/components';
import { useNavigation } from '@react-navigation/native';
import GoLogo from '../../assets/images/logo.svg';

const SplashScreen = () => {
    const navigation = useNavigation();
    useEffect(() => {
        setTimeout(() => {
            navigation.navigate('Login' as never);
        }, 5000);
    });
    return (
        <View style={styles.container}>
            <GoLogo width={220} height={114} />
            <Text style={styles.text}>let’s go</Text>
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
