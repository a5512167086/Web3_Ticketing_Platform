import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ textAlign: "center", py: 2, bgcolor: "grey.100" }}
    >
      <Typography variant="body2">© 2025 EventPass NFT Ticketing</Typography>
    </Box>
  );
}
