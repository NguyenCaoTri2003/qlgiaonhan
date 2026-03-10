import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  TextInput,
} from "react-native";

import { orderService } from "../services/order.service";
import { statusLabel } from "../utils/statusOrder";
import { Order, Attachment } from "../utils/type";

export default function OrderDetailScreen({ route }: any) {
  const { id } = route.params;

  const [order, setOrder] = useState<Order | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      setLoading(true);

      const res = await orderService.getOrderDetail(id);

      setOrder(res);
      setAttachments(res.attachments || []);
    } catch (err) {
      console.log("Load order error:", err);
    } finally {
      setLoading(false);
    }
  };

  function toggle(index: number) {
    const copy = [...attachments];
    copy[index].checked = !copy[index].checked;
    setAttachments(copy);
  }

  function openMap() {
    if (!order?.address) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      order.address
    )}`;

    Linking.openURL(url);
  }

  function call() {
    if (!order?.phone) return;
    Linking.openURL(`tel:${order.phone}`);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy đơn</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* STATUS */}
      <View style={styles.statusRow}>
        <Text style={styles.status}>{statusLabel(order.status)}</Text>
      </View>

      {/* COMPANY */}
      <View style={styles.block}>
        <Text style={styles.label}>Khách hàng</Text>
        <Text style={styles.value}>{order.company}</Text>
      </View>

      {/* PHONE */}
      <TouchableOpacity style={styles.block} onPress={call}>
        <Text style={styles.label}>SĐT</Text>
        <Text style={styles.link}>{order.phone}</Text>
      </TouchableOpacity>

      {/* ADDRESS */}
      <TouchableOpacity style={styles.block} onPress={openMap}>
        <Text style={styles.label}>Địa chỉ</Text>
        <Text style={styles.link}>{order.address}</Text>
      </TouchableOpacity>

      {/* PURPOSE */}
      <View style={styles.block}>
        <Text style={styles.label}>Mục đích</Text>
        <Text style={styles.value}>{order.purpose}</Text>
      </View>

      {/* CHECKLIST */}
      <View style={styles.block}>
        <Text style={styles.title}>Checklist hồ sơ</Text>

        {attachments.map((a, i) => (
          <TouchableOpacity
            key={a.id}
            style={styles.checkItem}
            onPress={() => toggle(i)}
          >
            <Text style={styles.checkbox}>
              {a.checked ? "☑" : "☐"}
            </Text>

            <Text style={styles.checkText}>
              {a.name} x{a.qty}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* REJECT FORM */}
      {showReject && (
        <View style={styles.block}>
          <TextInput
            placeholder="Lý do từ chối..."
            value={rejectReason}
            onChangeText={setRejectReason}
            style={styles.input}
          />

          <TouchableOpacity style={styles.btnReject}>
            <Text style={styles.btnText}>Xác nhận từ chối</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ACTIONS */}
      {!showReject && (
        <View style={styles.actions}>
          {order.status === "ASSIGNED" && (
            <>
              <TouchableOpacity style={styles.btnAccept}>
                <Text style={styles.btnText}>Nhận đơn</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnReject}
                onPress={() => setShowReject(true)}
              >
                <Text style={styles.btnText}>Từ chối</Text>
              </TouchableOpacity>
            </>
          )}

          {order.status === "PROCESSING" && (
            <TouchableOpacity style={styles.btnDone}>
              <Text style={styles.btnText}>Hoàn tất</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* COMPLETED INFO */}
      {order.completionImages && order.completionImages.length > 0 && (
        <View style={styles.block}>
          <Text style={styles.title}>Hình ảnh</Text>

          {order.completionImages.map((img: string, i: number) => (
            <Image key={i} source={{ uri: img }} style={styles.image} />
          ))}
        </View>
      )}

      {order.signature && (
        <View style={styles.block}>
          <Text style={styles.title}>Chữ ký</Text>
          <Image source={{ uri: order.signature }} style={styles.signature} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  block: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  label: {
    fontSize: 12,
    color: "#888",
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
  },

  link: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "600",
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },

  statusRow: {
    padding: 16,
    backgroundColor: "#f5f5f5",
  },

  status: {
    fontSize: 14,
    fontWeight: "700",
  },

  checkItem: {
    flexDirection: "row",
    marginBottom: 8,
  },

  checkbox: {
    marginRight: 10,
    fontSize: 18,
  },

  checkText: {
    fontSize: 15,
  },

  actions: {
    padding: 16,
    gap: 10,
  },

  btnAccept: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  btnReject: {
    backgroundColor: "#dc2626",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  btnDone: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },

  image: {
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
  },

  signature: {
    height: 80,
    resizeMode: "contain",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
});