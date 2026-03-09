import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StatCard({ title, value, color, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      
      <View style={[styles.iconBox, { backgroundColor: color + "15" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>

      <Text style={[styles.number, { color }]}>{value}</Text>
      <Text style={styles.label}>{title}</Text>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "white",
    paddingVertical: 22,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  number: {
    fontSize: 30,
    fontWeight: "700",
  },

  label: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 6,
    fontWeight: "500",
  },
});