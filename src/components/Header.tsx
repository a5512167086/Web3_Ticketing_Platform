import { AppBar, Button, Toolbar, Typography, Box } from "@mui/material";
import { useWallet } from "@/context/WalletContext";
import { useNavigate } from "react-router";

export default function Header() {
  const { account, connectWallet } = useWallet();
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" component="div">
          🪙 Web3 DApp
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          {account && (
            <Button
              variant="outlined"
              onClick={() => navigate("/my-tickets")}
              sx={{ textTransform: "none" }}
            >
              🎟️ 我的票券
            </Button>
          )}

          {!account ? (
            <Button
              variant="contained"
              color="warning"
              onClick={connectWallet}
              sx={{ textTransform: "none" }}
            >
              連接 MetaMask
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary">
              ✅ {account.slice(0, 6)}...{account.slice(-4)}
            </Typography>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
