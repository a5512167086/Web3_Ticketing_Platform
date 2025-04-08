// components/BaseLayout.tsx
import { useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { useSyncProviders } from "@/hooks/useSyncProviders";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userAccount, setUserAccount] = useState<string>("");
  const [chainError, setChainError] = useState<string>("");

  const SEPOLIA_CHAIN_ID = "0xaa36a7";

  const providers = useSyncProviders();

  const handleConnect = async (providerWithInfo: EIP6963ProviderDetail) => {
    try {
      if (providerWithInfo.info.name !== "MetaMask") {
        setChainError("Only MetaMask is supported.");
        return;
      }

      const chainId = await providerWithInfo.provider.request({
        method: "eth_chainId",
      });
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setChainError("Please switch to Sepolia network.");
        return;
      }

      const accounts = (await providerWithInfo.provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts.length === 0) {
        setChainError("No accounts found.");
        return;
      }

      setUserAccount(accounts[0]);
      setChainError("");
    } catch (error) {
      console.error("Wallet connection failed:", error);
      setChainError("Failed to connect wallet.");
    }
  };

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Header
        userAccount={userAccount}
        providers={providers}
        onConnect={handleConnect}
      />

      {chainError && (
        <Box bgcolor="error.main" color="white" py={1} textAlign="center">
          <Typography variant="body2">{chainError}</Typography>
        </Box>
      )}

      <Container sx={{ flexGrow: 1, py: 4 }}>{children}</Container>

      <Footer />
    </Box>
  );
}
