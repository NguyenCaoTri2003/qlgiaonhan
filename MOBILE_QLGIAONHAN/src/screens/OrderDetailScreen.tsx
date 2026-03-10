import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { orderService } from "../services/order.service";
import {
  statusColor,
  statusLabel,
  statusTextColor,
} from "../utils/statusOrder";
import { Image } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {
  getDeptColor,
  getDeptStyle,
  getDeptTextColor,
} from "../utils/departmentColor";
import NotFoundView from "../components/NotFoundView";
import { useNavigation } from "@react-navigation/native";

export default function OrderDetailScreen({ route }: any) {
  const { id } = route.params;

  console.log("OrderDetail ID:", id);

  const [order, setOrder] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [missingModal, setMissingModal] = useState(false);
  const [missingDocs, setMissingDocs] = useState<any[]>([]);

  const navigation = useNavigation();
  // console.log("Order:\n", JSON.stringify(order, null, 2));

  const fetchDetail = async () => {
    try {
      const res = await orderService.getOrderDetail(id);

      setOrder(res);
      setAttachments(res.attachments || []);
    } catch (err) {
      console.log("Load detail error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setOrder(null);
    fetchDetail();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDetail();
  };

  const call = () => {
    if (!order?.phone) return;
    Linking.openURL(`tel:${order.phone}`);
  };

  const openMap = () => {
    if (!order?.address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      order.address,
    )}`;
    Linking.openURL(url);
  };

  const isReadonly =
    order?.status === "COMPLETED" || order?.status === "FINISHED";

  const toggleChecklist = (index: number) => {
    if (isReadonly) return;

    const newList = [...attachments];
    newList[index].checked = !newList[index].checked;
    setAttachments(newList);
  };

  const checkAll = () => {
    if (isReadonly) return;

    const newList = attachments.map((a) => ({
      ...a,
      checked: true,
    }));

    setAttachments(newList);
  };

  const downloadFile = async (url: string) => {
    try {
      const fileName = url.split("/").pop() || "file";

      const fileUri = FileSystem.documentDirectory + fileName;

      const download = await FileSystem.downloadAsync(url, fileUri);

      await Sharing.shareAsync(download.uri);
    } catch (err) {
      console.log("Download error:", err);
    }
  };

  const handleAccept = async () => {
    const missing = attachments.filter((a) => !a.checked);

    if (missing.length > 0) {
      setMissingDocs(missing);
      setMissingModal(true);
      return;
    }

    try {
      await orderService.shipperAccept(id, attachments, "");
      fetchDetail();
    } catch (err) {
      console.log(err);
    }
  };

  const acceptWithMissing = async () => {
    try {
      const note =
        "Thiếu hồ sơ: " +
        missingDocs.map((d) => `${d.name} (${d.qty})`).join(", ");

      await orderService.shipperAccept(id, attachments, note);

      setMissingModal(false);
      fetchDetail();
    } catch (err) {
      console.log(err);
    }
  };

  const requestSupplement = async () => {
    try {
      const note =
        "Thiếu hồ sơ: " +
        missingDocs.map((d) => `${d.name} (${d.qty})`).join(", ");

      await orderService.shipperReturnSupplement(id, note);

      setMissingModal(false);
      fetchDetail();
    } catch (err) {
      console.log(err);
    }
  };

  const setHighlight = async (color: "red" | "blue" | "yellow" | null) => {
    try {
      await orderService.setShipperHighlightColor(order.id, color);

      setOrder({
        ...order,
        shipperHighlightColor: color,
      });
    } catch (err) {
      console.log("Highlight error:", err);
    }
  };

  const deptStyle = getDeptStyle(order?.department?.code);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!order) {
    return (
      <NotFoundView
        title="Không tìm thấy đơn hàng"
        subtitle="Đơn có thể đã bị xoá hoặc bạn không có quyền xem."
        onBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.orderCode}>#{order.orderCode || order.id}</Text>

          <View style={styles.headerRow}>
            {order?.department?.name && (
              <View
                style={[
                  styles.deptBadge,
                  {
                    backgroundColor: deptStyle.backgroundColor,
                    borderColor: deptStyle.borderColor,
                  },
                ]}
              >
                <Text style={[styles.deptText, { color: deptStyle.textColor }]}>
                  {order?.department?.name}
                </Text>
              </View>
            )}

            <View
              style={[styles.statusBadge, statusColor(order?.status || "")]}
            >
              <Text style={[styles.statusText, statusTextColor(order?.status)]}>
                {statusLabel(order?.status)}
              </Text>
            </View>
          </View>

          <View style={styles.colorPicker}>
            <TouchableOpacity
              style={[
                styles.colorDot,
                { backgroundColor: "#ef4444" },
                order.shipperHighlightColor === "red" && styles.colorSelected,
              ]}
              onPress={() => setHighlight("red")}
            />

            <TouchableOpacity
              style={[
                styles.colorDot,
                { backgroundColor: "#3b82f6" },
                order.shipperHighlightColor === "blue" && styles.colorSelected,
              ]}
              onPress={() => setHighlight("blue")}
            />

            <TouchableOpacity
              style={[
                styles.colorDot,
                { backgroundColor: "#facc15" },
                order.shipperHighlightColor === "yellow" &&
                  styles.colorSelected,
              ]}
              onPress={() => setHighlight("yellow")}
            />

            <TouchableOpacity onPress={() => setHighlight(null)}>
              <Text style={styles.clearColor}>XÓA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {order.senderName && (
          <View style={styles.creatorBox}>
            <View style={styles.creatorHeader}>
              <Ionicons
                name="person-circle-outline"
                size={18}
                color="#2563eb"
              />
              <Text style={styles.creatorLabel}>Người tạo đơn</Text>
            </View>

            <Text style={styles.creatorName}>{order.senderName}</Text>
          </View>
        )}

        {/* ALERTS */}

        {order.status === "REJECTED" && order.rejectionReason && (
          <View style={styles.alertRed}>
            <Text style={styles.alertRedText}>
              <Text style={{ fontWeight: "700" }}>Lý do từ chối: </Text>
              {order.rejectionReason}
            </Text>
          </View>
        )}

        {order.status === "SUPPLEMENT_REQUIRED" && order.supplementNote && (
          <View style={styles.alertYellow}>
            <Text style={styles.alertYellowText}>
              <Text style={{ fontWeight: "700" }}>Yêu cầu bổ sung: </Text>
              {order.supplementNote}
            </Text>
          </View>
        )}

        {order.adminResponse && (
          <View style={styles.alertGreen}>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.alertGreenText}>{order.adminResponse}</Text>
            </View>
          </View>
        )}

        {/* CUSTOMER CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Khách hàng</Text>

          <Text style={styles.company}>{order.company}</Text>

          <TouchableOpacity style={styles.row} onPress={call}>
            <Ionicons name="call-outline" size={18} color="#2563eb" />
            <Text style={styles.link}>{order.phone}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.row} onPress={openMap}>
            <Ionicons name="location-outline" size={18} color="#2563eb" />
            <Text style={styles.link}>{order.address}</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <Ionicons name="person-outline" size={18} color="#6b7280" />
            <Text style={styles.value}>{order.contact || "Chưa có"}</Text>
          </View>
        </View>

        {/* DELIVERY INFO */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin giao nhận</Text>

          <View style={styles.row}>
            <Ionicons name="time-outline" size={18} color="#92400e" />
            <Text style={styles.value}>
              {order.date || "Chưa có ngày"} • {order.time || "Chưa có giờ"}
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons name="document-text-outline" size={18} color="#dc2626" />
            <Text style={styles.purpose}>{order.purpose}</Text>
          </View>
        </View>

        {/* CHECKLIST */}
        {attachments.length > 0 && (
          <View style={styles.card}>
            <View style={styles.checkHeader}>
              <Text style={styles.cardTitle}>Checklist hồ sơ</Text>

              {!isReadonly && (
                <TouchableOpacity onPress={checkAll}>
                  <Text style={styles.checkAllBtn}>Đã nhận đủ</Text>
                </TouchableOpacity>
              )}
            </View>

            {attachments.map((a, i) => (
              <TouchableOpacity
                key={a.id}
                style={styles.checkItem}
                onPress={() => toggleChecklist(i)}
                disabled={isReadonly}
              >
                <Ionicons
                  name={a.checked ? "checkbox" : "square-outline"}
                  size={22}
                  color={a.checked ? "#16a34a" : "#6b7280"}
                />

                <Text style={styles.checkText}>
                  {a.name} x{a.qty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {(order.status === "COMPLETED" || order.status === "FINISHED") && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Thông tin hoàn tất</Text>

            {/* Images */}
            {order.completionImages.map((img: string, i: number) => (
              <TouchableOpacity key={i} onPress={() => setPreviewImage(img)}>
                <Image source={{ uri: img }} style={styles.image} />
              </TouchableOpacity>
            ))}

            {/* Signature */}
            {order.signature && (
              <View style={styles.signatureBox}>
                <Text style={styles.smallLabel}>Chữ ký khách hàng</Text>
                <Image
                  source={{ uri: order.signature }}
                  style={styles.signature}
                />
              </View>
            )}

            {/* Location */}
            {order.deliveryLocation && (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps?q=${order.deliveryLocation.lat},${order.deliveryLocation.lng}`,
                  )
                }
              >
                <Ionicons name="location-outline" size={18} color="#2563eb" />
                <Text style={styles.link}>Xem vị trí giao</Text>
              </TouchableOpacity>
            )}

            {/* Note */}
            {order.completionNote && (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>"{order.completionNote}"</Text>
              </View>
            )}
          </View>
        )}

        {order.uploadedFiles?.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tài liệu đính kèm</Text>

            {order.uploadedFiles.map((file: any, i: number) => (
              <TouchableOpacity
                key={i}
                style={styles.fileItem}
                onPress={() => downloadFile(file.data)}
              >
                <View style={styles.fileLeft}>
                  {file.type?.includes("image") ? (
                    <TouchableOpacity
                      onPress={() => setPreviewImage(file.data)}
                    >
                      <Image
                        source={{ uri: file.data }}
                        style={styles.fileImage}
                      />
                    </TouchableOpacity>
                  ) : (
                    <Ionicons
                      name={
                        file.type?.includes("pdf")
                          ? "document-text"
                          : "document"
                      }
                      size={28}
                      color="#6b7280"
                    />
                  )}

                  <View>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileType}>
                      {file.type?.split("/")[1]?.toUpperCase() || "FILE"}
                    </Text>
                  </View>
                </View>

                <Ionicons name="download-outline" size={20} color="#2563eb" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ACTION BUTTON */}
      <View style={styles.actions}>
        {order.status === "ASSIGNED" && (
          <>
            <TouchableOpacity style={styles.btnAccept} onPress={handleAccept}>
              <Text style={styles.btnText}>Nhận đơn</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnReject}>
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

      {previewImage && (
        <Modal transparent>
          <View style={styles.previewContainer}>
            <TouchableOpacity
              style={styles.previewClose}
              onPress={() => setPreviewImage(null)}
            >
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            <Image source={{ uri: previewImage }} style={styles.previewImage} />
          </View>
        </Modal>
      )}

      <Modal visible={missingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {/* HEADER */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hồ sơ còn thiếu</Text>
            </View>

            {/* SCROLL CONTENT */}
            <ScrollView style={styles.modalContent}>
              {missingDocs.map((d, i) => (
                <Text key={i} style={styles.missingItem}>
                  • {d.name} x{d.qty}
                </Text>
              ))}
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.btnAcceptMiss}
                onPress={acceptWithMissing}
              >
                <Text style={styles.btnText}>Chấp nhận (Ghi chú thiếu)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnReturn}
                onPress={requestSupplement}
              >
                <Text style={styles.btnText}>Yêu cầu bổ sung (Trở về)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnBack}
                onPress={() => setMissingModal(false)}
              >
                <Text style={styles.btnBackText}>Trở lại kiểm tra</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginTop: 12,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    color: "#374151",
  },

  company: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },

  value: {
    fontSize: 14,
    color: "#374151",
  },

  link: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },

  purpose: {
    fontSize: 14,
    color: "#dc2626",
  },

  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  checkText: {
    fontSize: 14,
  },

  actions: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    gap: 10,
  },

  btnAccept: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  btnReject: {
    backgroundColor: "#ef4444",
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
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  checkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  checkAllBtn: {
    color: "#2563eb",
    fontWeight: "600",
    fontSize: 13,
  },

  image: {
    width: 120,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },

  signatureBox: {
    marginTop: 12,
  },

  signature: {
    height: 80,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    marginTop: 6,
  },

  smallLabel: {
    fontSize: 12,
    color: "#6b7280",
  },

  noteBox: {
    marginTop: 10,
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 6,
  },

  noteText: {
    fontStyle: "italic",
    color: "#374151",
  },

  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },

  fileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  fileImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },

  fileName: {
    fontSize: 14,
    fontWeight: "600",
  },

  fileType: {
    fontSize: 11,
    color: "#6b7280",
  },

  previewContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  previewImage: {
    width: "100%",
    height: "80%",
    resizeMode: "contain",
  },

  previewClose: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalActions: {
    marginTop: 16,
    gap: 10,
  },

  btnBack: {
    backgroundColor: "#6b7280",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },

  btnBackText: {
    color: "#fff",
    fontWeight: "600",
  },

  btnReturn: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },

  btnAcceptMiss: {
    backgroundColor: "#f59e0b",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },

  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    gap: 10,
  },

  missingItem: {
    color: "#dc2626",
    marginBottom: 8,
    fontSize: 14,
  },

  alertRed: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  alertRedText: {
    color: "#991b1b",
    fontSize: 13,
  },

  alertYellow: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },

  alertYellowText: {
    color: "#92400e",
    fontSize: 13,
  },

  alertGreen: {
    marginHorizontal: 12,
    marginTop: 10,
    backgroundColor: "#ecfdf5",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },

  alertGreenText: {
    color: "#065f46",
    fontSize: 13,
    fontWeight: "700",
  },

  creatorBox: {
    marginHorizontal: 12,
    marginTop: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
  },

  creatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },

  creatorLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e40af",
  },

  creatorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },

  header: {
    backgroundColor: "#ffffff",
    marginHorizontal: 12,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  orderCode: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563eb",
    marginBottom: 6,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  deptBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  deptText: {
    fontSize: 11,
    fontWeight: "700",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: {
    fontWeight: "700",
    fontSize: 12,
  },

  colorPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    backgroundColor: "#f9fafb",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },

  colorSelected: {
    borderWidth: 2,
    borderColor: "#111827",
  },

  clearColor: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    marginLeft: 4,
  },
});
