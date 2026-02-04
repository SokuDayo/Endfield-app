//import { Image } from 'expo-image';
import { StyleSheet, Text, View } from "react-native";

const essence = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>test</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default essence;
