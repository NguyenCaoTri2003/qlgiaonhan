import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Ionicons } from "@expo/vector-icons";
import debounce from "lodash.debounce";
import { useFocusEffect } from "@react-navigation/native";

import { orderService } from "../services/order.service";
import {
  getStatusBorderColor,
  statusColor,
  statusLabel,
  statusTextColor,
} from "../utils/statusOrder";
import { authService } from "../services/auth.service";
import { getDeptColor, getDeptTextColor } from "../utils/departmentColor";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useOrderContext } from "../contexts/OrderContext";

export default function OrderListScreen({ navigation, route }: any) {
  const PAGE_SIZE = 10;

  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const hasMore = page < totalPages;
  const tabHeight = useBottomTabBarHeight();
  const { pendingOrdersCount } = useOrderContext();

  useEffect(() => {
    if (route.params?.openOrderId) {
      navigation.navigate("OrderDetail", {
        id: route.params.openOrderId,
      });
    }
  }, [route.params?.openOrderId]);

  const fetchOrders = async (
    pageNum = 1,
    isLoadMore = false,
    keyword = search,
    filterVal = filter,
  ) => {
    try {
      if (pageNum === 1 && !isLoadMore) setLoading(true);
      if (isLoadMore) setLoadingMore(true);

      const res = await orderService.getOrders(
        pageNum,
        PAGE_SIZE,
        keyword,
        "",
        filterVal,
      );

      const newData = res.data || [];

      if (isLoadMore) {
        setOrders((prev) => [...prev, ...newData]);
      } else {
        setOrders(newData);
      }

      setTotalPages(res.totalPages || 1);
      setPage(pageNum);
    } catch (err) {
      console.log("Load orders error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders(1);
    }, []),
  );

  useEffect(() => {
    fetchOrders(1, false, search, filter);
  }, [filter, search]);

  const debouncedSearch = useCallback(
    debounce((text) => {
      fetchOrders(1, false, text);
    }, 500),
    [],
  );

  const getHighlightStyle = (color?: string) => {
    switch (color) {
      case "red":
        return {
          backgroundColor: "#fef2f2",
          borderColor: "#fecaca",
        };

      case "blue":
        return {
          backgroundColor: "#eff6ff",
          borderColor: "#bfdbfe",
        };

      case "yellow":
        return {
          backgroundColor: "#fffbeb",
          borderColor: "#fde68a",
        };

      default:
        return null;
    }
  };

  const onChangeSearch = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(1);
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    await fetchOrders(page + 1, true);
  };

  const onDragEnd = async ({ data }: any) => {
    setOrders(data);

    try {
      const ids = data.map((o: any) => Number(o.id));

      const user = await authService.getUser();
      if (!user) return;

      await orderService.updateOrderSort(user.id, ids);
    } catch (err) {
      console.log("Sort error:", err);
    }
  };

  const openDetail = (order: any) => {
    navigation.navigate("OrderDetail", { id: order.id });
  };

  const renderItem = ({ item, drag, isActive }: any) => {
    const highlight = getHighlightStyle(item.shipperHighlightColor);
    return (
      <TouchableOpacity
        style={[
          styles.card,
          { borderLeftColor: getStatusBorderColor(item.status) },
          highlight && {
            backgroundColor: highlight.backgroundColor,
            borderColor: highlight.borderColor,
          },
          isActive && styles.dragging,
        ]}
        onLongPress={drag}
        delayLongPress={200}
        onPress={() => openDetail(item)}
      >
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderCode}>#{item.orderCode || item.id}</Text>

            <Text
              style={[
                styles.department,
                getDeptTextColor(item.department?.code),
              ]}
            >
              {item.department?.name || "Không rõ bộ phận"}
            </Text>
          </View>

          <View style={[styles.statusBadge, statusColor(item.status)]}>
            <Text style={[styles.statusText, statusTextColor(item.status)]}>
              {statusLabel(item.status)}
            </Text>
          </View>
        </View>

        {/* COMPANY */}
        <Text style={styles.company} numberOfLines={2}>
          {item.company}
        </Text>

        <View style={styles.deliveryBox}>
          <Ionicons name="time-outline" size={16} color="#92400e" />

          <Text style={styles.deliveryText}>
            {item.time || "Chưa có giờ"} • {item.date || "Chưa có ngày"}
          </Text>
        </View>

        {/* ADDRESS */}
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.address} numberOfLines={2}>
            {item.address}
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.cardFooter}>
          <View style={styles.contactBox}>
            <Ionicons name="person-outline" size={14} color="#9ca3af" />

            <Text style={styles.receiverName} numberOfLines={2}>
              {item.contact || "Chưa có"}
            </Text>
          </View>

          <Text style={styles.purpose} numberOfLines={2}>
            {item.purpose}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#6b7280" />

        <TextInput
          placeholder="Tìm mã đơn, khách hàng..."
          style={styles.searchInput}
          value={search}
          onChangeText={onChangeSearch}
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearch("");
              fetchOrders(1, false, "");
            }}
          >
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER */}
      <View style={styles.tabs}>
        {[
          { key: "ALL", label: "Tất cả" },
          { key: "PENDING_GROUP", label: "Cần xử lý" },
          { key: "DONE_GROUP", label: "Hoàn tất" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, filter === tab.key && styles.tabActive]}
            onPress={() => setFilter(tab.key)}
          >
            <Text
              style={filter === tab.key ? styles.tabTextActive : styles.tabText}
            >
              {tab.label}
            </Text>

            {tab.key === "PENDING_GROUP" && pendingOrdersCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {pendingOrdersCount > 99 ? "99+" : pendingOrdersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" />
      ) : (
        <DraggableFlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          onDragEnd={onDragEnd}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          activationDistance={20}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#2563eb"]}
            />
          }
          ListFooterComponent={() => {
            if (loadingMore) {
              return (
                <View style={styles.footer}>
                  <ActivityIndicator size="small" color="#2563eb" />
                  <Text style={styles.footerText}>Đang tải thêm...</Text>
                </View>
              );
            }

            if (!hasMore && orders.length > 0) {
              return (
                <View style={styles.footer}>
                  <Text style={styles.footerDone}>
                    Đã hiển thị tất cả đơn hàng
                  </Text>
                </View>
              );
            }

            return null;
          }}
          contentContainerStyle={{ paddingBottom: tabHeight + 60 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 10,
    margin: 12,
    borderRadius: 8,
    gap: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  tabs: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 8,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    position: "relative",
  },

  tabActive: {
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },

  tabText: {
    color: "#374151",
    fontWeight: "500",
  },

  tabTextActive: {
    color: "white",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 14,
    borderRadius: 10,

    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  department: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 2,
  },

  dragging: {
    backgroundColor: "#eef2ff",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  orderCode: {
    fontWeight: "700",
    fontSize: 15,
    color: "#0343c4",
  },

  company: {
    fontSize: 14,
    marginBottom: 6,
    color: "#111827",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  address: {
    color: "#6b7280",
    fontSize: 12,
    flex: 1,
  },

  cardFooter: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  contactBox: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 4,
  },

  receiverName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
    flex: 1,
  },

  purpose: {
    fontSize: 12,
    color: "#ef4444",
    flex: 1,
    textAlign: "right",
  },

  statusBadge: {
    minWidth: 90,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,

    alignItems: "center",
    justifyContent: "center",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  deliveryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 6,
    gap: 6,
  },

  deliveryText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
  },

  footer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  footerText: {
    fontSize: 13,
    color: "#6b7280",
  },

  footerDone: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
  },

  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#ef4444",
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },

  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
});
