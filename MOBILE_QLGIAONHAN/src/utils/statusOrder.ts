export function statusColor(status: string) {
  switch (status) {
    case "PENDING":
      return {
        backgroundColor: "#fee2e2",
      };

    case "ASSIGNED":
      return {
        backgroundColor: "#dbeafe",
      };

    case "PROCESSING":
      return {
        backgroundColor: "#fef9c3",
      };

    case "COMPLETED":
      return {
        backgroundColor: "#ede9fe",
      };

    case "FINISHED":
      return {
        backgroundColor: "#dcfce7",
      };

    case "REJECTED":
      return {
        backgroundColor: "#f3f4f6",
      };

    case "SUPPLEMENT_REQUIRED":
      return {
        backgroundColor: "#ffedd5",
      };

    case "INCOMPLETE":
      return {
        backgroundColor: "#fef2f2",
      };

    default:
      return {
        backgroundColor: "#e5e7eb",
      };
  }
}

export function statusTextColor(status: string) {
  switch (status) {
    case "PENDING":
      return { color: "#b91c1c" };

    case "ASSIGNED":
      return { color: "#1d4ed8" };

    case "PROCESSING":
      return { color: "#a16207" };

    case "COMPLETED":
      return { color: "#6d28d9" };

    case "FINISHED":
      return { color: "#15803d" };

    case "REJECTED":
      return { color: "#374151" };

    case "SUPPLEMENT_REQUIRED":
      return { color: "#c2410c" };

    case "INCOMPLETE":
      return { color: "#dc2626" };

    default:
      return { color: "#374151" };
  }
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: "Chờ tiếp nhận",
    ASSIGNED: "Đã điều phối",
    PROCESSING: "Đang thực hiện",
    COMPLETED: "Đã xong",
    FINISHED: "Hoàn tất",
    REJECTED: "Đã từ chối",
    SUPPLEMENT_REQUIRED: "Cần bổ sung",
    INCOMPLETE: "Chưa hoàn thành",
  };

  return map[status] || status;
}