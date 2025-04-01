import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, {useState} from "react";
import {Icon} from "@ui-kitten/components";
import LocationInput from "../../components/LocationInput";
import {primaryColor} from "../../theme/colors";
import {useNavigation} from "@react-navigation/native";
import {useRecoilState} from "recoil";
import {rideAtom} from "../../store/atoms/ride/rideAtom";

interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const SearchDriver = () => {
  const navigation = useNavigation();
  const [rideState, setRideState] = useRecoilState(rideAtom);
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
      setRideState(prev => ({
        ...prev,
        pickupLocation: {
          latitude: location.coordinates.lat.toString(),
          longitude: location.coordinates.lng.toString(),
          address: location.address,
        },
      }));
    } else {
      setDestinationLocation(location);
      setRideState(prev => ({
        ...prev,
        dropLocation: {
          latitude: location.coordinates.lat.toString(),
          longitude: location.coordinates.lng.toString(),
          address: location.address,
        },
      }));
    }
    setActiveDropdown(null);
  };

  const handleNavigateToBooking = () => {
    if (pickupLocation && destinationLocation) {
      navigation.navigate("BookingRoutes" as never);
    }
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
            onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
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
            onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
          />
        </View>
        {pickupLocation && destinationLocation && (
          <TouchableOpacity
            style={[styles.confirmButton, {marginTop: 10}]}
            onPress={handleNavigateToBooking}>
            <Text style={styles.confirmButtonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        style={styles.recentContainer}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled">
        {recentLocations.map((location, index) => (
          <TouchableOpacity
            key={index}
            style={styles.listItem}
            onPress={() => {
              if (!pickupLocation) {
                handleLocationSelect("pickup", {
                  address: location,
                  coordinates: {lat: 0, lng: 0}, // You should replace with actual coordinates
                });
              } else if (!destinationLocation) {
                handleLocationSelect("destination", {
                  address: location,
                  coordinates: {lat: 0, lng: 0}, // You should replace with actual coordinates
                });
              }
            }}>
            <Icon name="clock-outline" fill="#fff" width={20} height={20} />
            <Text style={styles.listItemText}>{location}</Text>
            <View style={{flexGrow: 1}} />
            <Icon
              name="chevron-right-outline"
              fill="#fff"
              width={20}
              height={20}
            />
          </TouchableOpacity>
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
    alignItems: "center",
    padding: 10,
    backgroundColor: "#353f3b",
    borderRadius: 8,
  },
  listItemText: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#fff",
  },
  confirmButton: {
    width: "100%",
    backgroundColor: primaryColor,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Montserrat-SemiBold",
  },
});
