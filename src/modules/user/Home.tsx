import { StyleSheet, View, } from 'react-native';
import React from 'react';
import HomeBanner from './components/HomeBanner';
import SearchDriver from '../booking/SearchDriver';
import Margin from '../../components/Margin';

const Home = () => {
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
    text: { color: '#fff', fontSize: 28, marginTop: 10, fontStyle: 'italic' },
});


