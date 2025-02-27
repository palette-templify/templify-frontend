import colors from "vuetify/lib/util/colors";

export const templifyTheme = {
  dark: false,
  colors: {
    background: "#FFFFFF",
    surface: "#FFFFFF",
    primary: "#1976D2", // A solid blue for primary actions
    secondary: "#424242", // Dark grey for secondary elements
    accent: "#82B1FF", // Light blue accent
    error: colors.red.accent3, // Error color from Vuetify's built-in colors
    info: "#2196F3", // Blue tone informing messages
    success: "#4CAF50", // Green for success feedback
    warning: "#FFC107", // Amber for warnings
  },
};
