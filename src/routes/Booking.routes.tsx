import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BookRide from '../modules/booking/BookRide';
import TopBar from '../components/TopBar';
import BookingDetails from '../modules/booking/BookingDetails';
import CallDriver from '../modules/booking/CallDriver';
import MessageDriver from '../modules/booking/MessageDriver';
import RideCompleted from '../modules/booking/RideComplete';

const BookingStack = createNativeStackNavigator();

const BookingNavigator = () => {
    return (
        <>
            <TopBar />
            <BookingStack.Navigator screenOptions={{ headerShown: false }}>
                <BookingStack.Screen name="BookRide" component={BookRide} />
                <BookingStack.Screen name="BookingDetails" component={BookingDetails} />
                <BookingStack.Screen name="CallDriver" component={CallDriver} />
                <BookingStack.Screen name="MessageDriver" component={MessageDriver} />
                <BookingStack.Screen name="RideCompleted" component={RideCompleted} />
            </BookingStack.Navigator>
        </>
    );
};

export default BookingNavigator;
