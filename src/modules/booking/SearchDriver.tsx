import {StyleSheet, Text, View, ScrollView} from "react-native";
import React, {useState} from "react";
import {Icon} from "@ui-kitten/components";
import LocationInput from "../../components/LocationInput";

interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const SearchDriver = () => {
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] =
    useState<Location | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<
    "pickup" | "destination" | null
  >(null);
  const [recentLocations] = useState([
    "Lalbagh Botanical Garden",
    "MG Road",
    "Bangalore Airport",
  ]);

  const handleLocationSelect = (
    type: "pickup" | "destination",
    location: Location,
  ) => {
    if (type === "pickup") {
      setPickupLocation(location);
    } else {
      setDestinationLocation(location);
    }
    setActiveDropdown(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <View
          style={[
            styles.searchContainer,
            {zIndex: activeDropdown === "pickup" ? 2 : 1},
          ]}>
          <LocationInput
            placeholder="Enter Pickup Location"
            onLocationSelect={location =>
              handleLocationSelect("pickup", location)
            }
            value={pickupLocation?.address}
            isActive={activeDropdown === "pickup"}
            onFocus={() => setActiveDropdown("pickup")}
            onBlur={() => setActiveDropdown(null)}
          />
        </View>
        <View
          style={[
            styles.searchContainer,
            {zIndex: activeDropdown === "destination" ? 2 : 1},
          ]}>
          <LocationInput
            placeholder="Enter Destination"
            onLocationSelect={location =>
              handleLocationSelect("destination", location)
            }
            value={destinationLocation?.address}
            isActive={activeDropdown === "destination"}
            onFocus={() => setActiveDropdown("destination")}
            onBlur={() => setActiveDropdown(null)}
          />
        </View>
      </View>
      <ScrollView
        style={styles.recentContainer}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled">
        {recentLocations.map((location, index) => (
          <View key={index} style={styles.listItem}>
            <Icon name="clock-outline" fill="#fff" width={20} height={20} />
            <Text style={styles.listItemText}>{location}</Text>
            <View style={{flexGrow: 1}} />
            <Icon
              name="chevron-right-outline"
              fill="#fff"
              width={20}
              height={20}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SearchDriver;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 2,
  },
  searchContainer: {
    marginBottom: 10,
    zIndex: 1,
  },
  recentContainer: {
    padding: 20,
    marginTop: 10,
  },
  listItem: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  listItemText: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#fff",
  },
});
