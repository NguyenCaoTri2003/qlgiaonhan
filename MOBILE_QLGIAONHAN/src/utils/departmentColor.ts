export const getDeptColor = (code?: string) => {
  switch (code) {
    case "VSVN":
      return "#3b82f6"; // blue
    case "GPLD":
      return "#10b981"; // green
    case "VSNN":
      return "#650bf5"; 
    default:
      return "#9ca3af";
  }
};

export const getDeptTextColor = (code?: string) => {
  switch (code) {
    case "VSVN":
      return { color: "#2563eb" };
    case "GPLD":
      return { color: "#059669" };
    case "VSNN":
      return { color: "#6c0097" };
    default:
      return { color: "#6b7280" };
  }
};