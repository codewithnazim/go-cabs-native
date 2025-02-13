import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { backgroundPrimary } from '../theme/colors';
import AuthRoutes from './Auth.Routes';
import OnbordingRoutes from './Onboarding.Routes';
import UserRoutes from './User.Routes';
import DriverRoutes from './Driver.Routes';
import ProfileRoutes from './Profile.Routes';
import BookingRoutes from './Booking.routes';

const RootStack = createNativeStackNavigator();
const MyTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        background: backgroundPrimary, // This sets the global background color
    },
};

const RootNavigator = () => {
    return (
        <NavigationContainer theme={MyTheme}>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                <RootStack.Screen name="AuthScreens" component={AuthRoutes} />
                <RootStack.Screen name="OnboardingScreens" component={OnbordingRoutes} />
                <RootStack.Screen name="UserScreens" component={UserRoutes} />
                <RootStack.Screen name="DriverScreens" component={DriverRoutes} />
                <RootStack.Screen name="ProfileScreens" component={ProfileRoutes} />
                <RootStack.Screen name="BookingRoutes" component={BookingRoutes} />
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

export default RootNavigator;
