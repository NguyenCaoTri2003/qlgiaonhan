import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import useDashboardStats from "../hooks/useDashboardStats";
import StatCard from "../components/StatCard";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen({ navigation }: any) {
  const { stats, loading } = useDashboardStats();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Xin chào 👋</Text>
        <Text style={styles.subtitle}>
          Hệ thống Nhị Gia Logistics đang hoạt động
        </Text>

        <View style={styles.grid}>
          <StatCard
            title="Tổng đơn"
            value={stats.total}
            color="#2563eb"
            icon="cube-outline"
            onPress={() => navigation.navigate("Orders")}
          />

          <StatCard
            title="Đang thực hiện"
            value={stats.pending}
            color="#f59e0b"
            icon="time-outline"
            onPress={() => navigation.navigate("Orders")}
          />

          <StatCard
            title="Cần bổ sung"
            value={stats.supplement}
            color="#ef4444"
            icon="alert-circle-outline"
            onPress={() => navigation.navigate("Orders")}
          />

          <StatCard
            title="Hoàn thành"
            value={stats.completed}
            color="#22c55e"
            icon="checkmark-circle-outline"
            onPress={() => navigation.navigate("Orders")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f3f4f6",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 26,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
