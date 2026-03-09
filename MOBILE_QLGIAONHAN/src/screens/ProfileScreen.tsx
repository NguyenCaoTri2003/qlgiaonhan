import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { logout } from "../store/auth.store";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen({ navigation }: any) {
  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Tài khoản</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.text}>Đăng xuất</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },

  button: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 8,
  },

  text: {
    color: "white",
    textAlign: "center",
  },
});