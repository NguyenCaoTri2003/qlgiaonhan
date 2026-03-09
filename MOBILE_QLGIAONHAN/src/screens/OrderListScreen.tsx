import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DraggableFlatList from "react-native-draggable-flatlist";
import { Ionicons } from "@expo/vector-icons";
import debounce from "lodash.debounce";

import { orderService } from "../services/order.service";
import { statusColor, statusLabel, statusTextColor } from "../utils/statusOrder";
import { authService } from "../services/auth.service";
import { getDeptColor, getDeptTextColor } from "../utils/departmentColor";

export default function OrderListScreen({ navigation }: any) {
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

  // ==============================
  // LOAD ORDERS
  // ==============================

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

  // ==============================
  // INITIAL LOAD
  // ==============================

  useEffect(() => {
    fetchOrders(1);
  }, [filter]);

  // ==============================
  // SEARCH DEBOUNCE
  // ==============================

  const debouncedSearch = useCallback(
    debounce((text) => {
      fetchOrders(1, false, text);
    }, 500),
    [],
  );

  const onChangeSearch = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };

  // ==============================
  // REFRESH
  // ==============================

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(1);
  };

  // ==============================
  // LOAD MORE
  // ==============================

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    await fetchOrders(page + 1, true);
  };

  // ==============================
  // DRAG SORT
  // ==============================

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

  // ==============================
  // OPEN DETAIL
  // ==============================

  const openDetail = (order: any) => {
    navigation.navigate("OrderDetail", { id: order.id });
  };

  // ==============================
  // RENDER ORDER CARD
  // ==============================

  const renderItem = ({ item, drag, isActive }: any) => (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: getDeptColor(item.department?.code) },
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
            style={[styles.department, getDeptTextColor(item.department?.code)]}
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

      {/* ADDRESS */}
      <View style={styles.row}>
        <Ionicons name="location-outline" size={16} color="#6b7280" />
        <Text style={styles.address} numberOfLines={2}>
          {item.address}
        </Text>
      </View>

      {/* FOOTER */}
      <View style={styles.cardFooter}>
        <Text style={styles.purpose} numberOfLines={2}>
          {item.purpose}
        </Text>

        <Text style={styles.receiver} numberOfLines={1}>
          {item.receiverName || "Chưa phân công"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // ==============================
  // UI
  // ==============================

  return (
    <SafeAreaView style={styles.container}>
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
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          activationDistance={20}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                style={{ marginVertical: 16 }}
                size="small"
                color="#2563eb"
              />
            ) : null
          }
          contentContainerStyle={{ paddingBottom: 30 }}
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
    justifyContent: "space-around",
    marginBottom: 10,
  },

  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
  },

  tabActive: {
    backgroundColor: "#2563eb",
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
    justifyContent: "space-between",
  },

  purpose: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
    paddingRight: 6,
  },

  receiver: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
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
});
