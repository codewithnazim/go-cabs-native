import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Icon, Input } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'

const SearchDriver = () => {
    const navigation = useNavigation()
    return (
        <View>
            <View style={styles.searchContainer}>
                <Input
                    onPress={() => navigation.navigate('BookingRoutes' as never)}
                    size="large"
                    placeholder="Enter Pickup"
                    placeholderTextColor="#fff"
                    accessoryLeft={<Icon name="search" fill="#fff" width={20} height={20} />}
                    accessoryRight={<Icon name="pin-outline" fill="#fff" width={20} height={20} />}
                    style={[styles.inputStyle,
                    { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}
                />
                <Input
                    size="large"
                    placeholder="Enter Destination"
                    placeholderTextColor="#fff"
                    accessoryLeft={<Icon name="search" fill="#fff" width={20} height={20} />}
                    accessoryRight={<Icon name="pin-outline" fill="#fff" width={20} height={20} />}
                    style={[styles.inputStyle,
                    { borderTopRightRadius: 0, borderTopLeftRadius: 0, borderTopWidth: 0 }]}
                />
            </View>
            <View style={{ padding: 20, gap: 20 }}>
                <View style={styles.listItem}>
                    <Icon name="clock-outline" fill="#fff" width={20} height={20} />
                    <Text style={styles.listItemText}>
                        Lalbagh Botanical Garden,
                    </Text>
                    <View style={{ flexGrow: 1 }} />
                    <Icon name="chevron-right-outline" fill="#fff" width={20} height={20} />
                </View>
                <View style={styles.listItem}>
                    <Icon name="clock-outline" fill="#fff" width={20} height={20} />
                    <Text style={styles.listItemText}>
                        Lalbagh Botanical Garden,
                    </Text>
                    <View style={{ flexGrow: 1 }} />
                    <Icon name="chevron-right-outline" fill="#fff" width={20} height={20} />
                </View>
                <View style={styles.listItem}>
                    <Icon name="clock-outline" fill="#fff" width={20} height={20} />
                    <Text style={styles.listItemText}>
                        Lalbagh Botanical Garden,
                    </Text>
                    <View style={{ flexGrow: 1 }} />
                    <Icon name="chevron-right-outline" fill="#fff" width={20} height={20} />
                </View>
            </View>
        </View>
    )
}

export default SearchDriver

const styles = StyleSheet.create({
    searchContainer: {
        borderRadius: 8,
        backgroundColor: "#353f3b"
    },
    inputStyle: {
        backgroundColor: "#353f3b",
        borderRadius: 8
    },
    listItem: {
        flexDirection: "row",
        gap: 10,
        boxSizing: 'border-box',
    },
    listItemText: {
        fontSize: 14,
        fontFamily: "Montserrat-Regular",
        color: "#fff"
    }
})
