import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import useNotifications from "../hooks/useNotifications";
import { notificationService } from "../services/notification.service";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native";
import { useNotificationContext } from "../contexts/NotificationContext";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../navigation/types";

type NavigationProp = BottomTabNavigationProp<RootTabParamList>;

export default function NotificationScreen() {
  const { notifications, reload, loadMore, hasMore } = useNotificationContext();
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const navigation = useNavigation<NavigationProp>();

  const formatTime = (timestamp: number) => {
    const date = new Date(Number(timestamp));

    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      reload();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={markAllAsRead} style={{ marginRight: 15 }}>
          <Text style={{ color: "#2563eb", fontWeight: "600" }}>
            Đọc tất cả
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [notifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      reload();
    }, []),
  );

  const markAsRead = async (id: number) => {
    try {
      await notificationService.markRead(id);
      reload();
    } catch (err) {
      console.log(err);
    }
  };
  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;

    setLoadingMore(true);
    await loadMore();
    setLoadingMore(false);
  };

  const handleOpen = async (item: any) => {
    console.log("Notification item:", item);

    try {
      if (item.read_status === 0) {
        await notificationService.markRead(item.id);
      }

      reload();

      navigation.navigate("Orders", {
        screen: "OrderList",
        params: {
          openOrderId: item.orderId || item.order_id,
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = ({ item }: any) => {
    const isUnread = item.read_status === 0;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.unread]}
        onPress={() => handleOpen(item)}
      >
        <View style={styles.icon}>
          <Ionicons
            name={isUnread ? "notifications" : "notifications-outline"}
            size={20}
            color={isUnread ? "#2563eb" : "#6b7280"}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.message}</Text>

          <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
        </View>

        {isUnread && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={() => {
          if (loadingMore) {
            return (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text>Đang tải thêm...</Text>
              </View>
            );
          }

          if (!hasMore && notifications.length > 0) {
            return (
              <View style={styles.footer}>
                <Text style={{ color: "#9ca3af" }}>
                  Đã hiển thị tất cả thông báo
                </Text>
              </View>
            );
          }

          return null;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  card: {
    flexDirection: "row",
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 6,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },

  unread: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
    marginLeft: 6,
  },

  icon: {
    marginRight: 10,
  },

  title: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: 2,
  },

  message: {
    fontSize: 13,
    color: "#374151",
  },

  time: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 4,
  },

  empty: {
    alignItems: "center",
    marginTop: 60,
  },

  emptyText: {
    marginTop: 8,
    color: "#6b7280",
  },

  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
