import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useRecoilValue } from 'recoil';
import { backgroundPrimary } from '../theme/colors';
import { navigationLoadingAtom } from '../store/atoms/navigation/navigationAtoms';
import { useNavigationPersistence } from '../hooks/useNavigationPersistence';
import SplashScreen from '../components/SplashScreen';
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
    const isLoading = useRecoilValue(navigationLoadingAtom);
    const { navigationState, handleNavigationStateChange } = useNavigationPersistence();

    // Show splash screen with loader while navigation state is being restored
    if (isLoading) {
        return <SplashScreen isRestoringNavigation={true} />;
    }

    return (
        <NavigationContainer 
            theme={MyTheme}
            initialState={navigationState || undefined}
            onStateChange={handleNavigationStateChange}
        >
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
