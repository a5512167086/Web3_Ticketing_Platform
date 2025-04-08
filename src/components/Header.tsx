import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { formatAddress } from "@/utils";

interface HeaderProps {
  userAccount: string;
  providers: EIP6963ProviderDetail[];
  onConnect: (provider: EIP6963ProviderDetail) => void;
}

export default function Header({
  userAccount,
  providers,
  onConnect,
}: HeaderProps) {
  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6">EventPass</Typography>
        {userAccount ? (
          <Typography fontSize="0.9rem">
            {formatAddress(userAccount)}
          </Typography>
        ) : (
          <Box display="flex" gap={1}>
            {providers
              .filter((provider) => provider.info.name === "MetaMask")
              .map((provider) => (
                <Button
                  variant="contained"
                  key={provider.info.uuid}
                  onClick={() => onConnect(provider)}
                >
                  Connect MetaMask
                </Button>
              ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
