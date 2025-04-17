import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#000", // 主色為黑
      contrastText: "#fff", // 白色文字
    },
    secondary: {
      main: "#888", // 次色灰階
    },
    background: {
      default: "#111", // 背景更深一點
      paper: "#1a1a1a", // 卡片或 app bar 背景
    },
    text: {
      primary: "#fff",
      secondary: "#ccc",
    },
    error: {
      main: "#ff4c4c",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 6,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#000", // AppBar 強制黑底
        },
      },
    },
  },
  typography: {
    fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif",
  },
});

export default theme;
