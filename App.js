import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert,} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [location, setLocation] = useState(null);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('No permission to get location');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get the current location. Please try again.');
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://geocode.maps.co/search?q=${searchText}&api_key=65ca5337af680847202891aiv89cee8`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch coordinates');
      }

      const data = await response.json();
      console.log('Geocoding API response:', data);
      if (data.results && data.results.length > 0) {
        const { lat, lon } = data.results[0].location;
        setLocation({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        });
      } else {
        Alert.alert('Location not found', 'Please enter a valid address.');
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error.message);
      Alert.alert('Error', 'Failed to fetch coordinates. Please try again.');
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      <View style={styles.container}>
        <MapView
          style={styles.mapStyle}
          region={{
            latitude: location ? location.latitude : 0,
            longitude: location ? location.longitude : 0,
            latitudeDelta: 0.0322,
            longitudeDelta: 0.0221,
          }}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Selected Location"
              description={searchText}
            />
          )}
        </MapView>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter location"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          <TouchableOpacity style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="auto" />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapStyle: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
