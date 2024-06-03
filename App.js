import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  List,
  PaperProvider,
  Switch,
  Text,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { getAllLocations, insertLocation } from "./db";

export default function App() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // darkMode
  async function loadDarkMode() {
    const darkMode = await AsyncStorage.getItem("@darkMode");
    console.log(darkMode);
    setIsSwitchOn(darkMode == "1" ? true : false);
  }

  async function onToggleSwitch() {
    await AsyncStorage.setItem("@darkMode", !isSwitchOn ? "1" : "0");
    setIsSwitchOn(!isSwitchOn);
  }

  // location
  async function getLocation() {
    setIsLoading(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setErrorMsg("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log(location);
    const ret = await insertLocation(location.coords);
    console.log(ret.lastInsertRowId);
    await loadLocations();
    setIsLoading(false);
  }

  async function loadLocations() {
    setIsLoading(true);
    const locations = await getAllLocations();
    setLocations(locations);
    setIsLoading(false);
  }

  useEffect(() => {
    loadDarkMode();
    loadLocations();
  }, []);

  return (
    <PaperProvider>
      <Appbar.Header>
        <Appbar.Content title="Persisência RN" />
      </Appbar.Header>
      <View style={styles.containerDarkMode}>
        <Text>Dark Mode</Text>
        <Switch value={isSwitchOn} onValueChange={onToggleSwitch} />
      </View>
      <Button
        style={styles.containerButton}
        icon="map"
        mode="contained"
        loading={isLoading}
        onPress={() => getLocation()}
      >
        Capturar localização
      </Button>

      <FlatList
        style={styles.containerList}
        data={locations}
        renderItem={({ item }) => (
          <List.Item
            title="localização"
            description={`Latitude: ${item.latitude} | Longitude: ${item.longitude}`}
          ></List.Item>
        )}
      ></FlatList>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  containerDarkMode: {
    margin: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  containerButton: {
    margin: 10,
  },
  containerList: {
    margin: 10,
  },
});
