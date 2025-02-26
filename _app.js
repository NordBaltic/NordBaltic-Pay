import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "dark", // arba "light"
    primary: {
      main: "#FFD700", // Auksinė spalva
    },
    background: {
      default: "#0A1F44", // Tamsiai mėlyna, kaip tavo brandas
    },
  },
});

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
