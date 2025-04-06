import React, {useState, useEffect} from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {Icon} from "@ui-kitten/components";

interface LocationInputProps {
  placeholder: string;
  onLocationSelect: (location: Location) => void;
  value?: string;
  isActive?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface Prediction {
  description: string;
  place_id: string;
}

const LocationInput: React.FC<LocationInputProps> = ({
  placeholder,
  onLocationSelect,
  value,
  isActive,
  onFocus,
  onBlur,
}) => {
  const [searchText, setSearchText] = useState(value || "");
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const searchPlaces = async (text: string) => {
    if (text.length < 2) {
      setPredictions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          text,
        )}&key=AIzaSyD_4Pvt7BDSMnloTzhACsFtvrf_4wPTeMs`,
      );
      const data = await response.json();
      if (data.predictions) {
        setPredictions(data.predictions);
      }
    } catch (error) {
      console.error("Error fetching predictions:", error);
      setPredictions([]);
    }
  };

  const getPlaceDetails = async (placeId: string) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=AIzaSyD_4Pvt7BDSMnloTzhACsFtvrf_4wPTeMs`,
      );
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  const handleSelectPlace = async (prediction: Prediction) => {
    const details = await getPlaceDetails(prediction.place_id);
    setSearchText(prediction.description);
    setPredictions([]);
    onLocationSelect({
      address: prediction.description,
      coordinates: details?.geometry?.location,
    });
  };

  useEffect(() => {
    if (isActive && searchText) {
      searchPlaces(searchText);
    } else {
      setPredictions([]);
    }
  }, [searchText, isActive]);

  useEffect(() => {
    setSearchText(value || "");
  }, [value]);

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Icon name="search" fill="#fff" width={20} height={20} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#fff"
          value={searchText}
          onChangeText={setSearchText}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <Icon name="pin-outline" fill="#fff" width={20} height={20} />
      </View>
      {isActive && predictions.length > 0 && (
        <ScrollView
          style={styles.listView}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}>
          {predictions.map(item => (
            <TouchableOpacity
              key={item.place_id}
              style={styles.row}
              onPress={() => handleSelectPlace(item)}>
              <Text style={styles.predictionText}>{item.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    minHeight: 45,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    height: 45,
    backgroundColor: "#353f3b",
    borderRadius: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    marginHorizontal: 10,
    fontSize: 16,
    fontFamily: "Montserrat-Regular",
    color: "#fff",
  },
  listView: {
    backgroundColor: "#353f3b",
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  row: {
    backgroundColor: "#353f3b",
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#4a5751",
  },
  predictionText: {
    fontSize: 14,
    fontFamily: "Montserrat-Regular",
    color: "#fff",
  },
});

export default LocationInput;
