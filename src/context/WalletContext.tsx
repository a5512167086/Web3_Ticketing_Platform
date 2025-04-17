import { createContext, useContext, useState } from "react";
import { BrowserProvider } from "ethers";

interface WalletContextProps {
  account: string;
  signer: any;
  connectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextProps>({
  account: "",
  signer: null,
  connectWallet: async () => {},
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState("");
  const [signer, setSigner] = useState<any>(null);

  const connectWallet = async () => {
    if (!window.ethereum) return alert("請先安裝 MetaMask");

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await signer.provider.getNetwork();
    console.log("🧭 Connected to network:", network.name, network.chainId);

    setAccount(address);
    setSigner(signer);
  };

  return (
    <WalletContext.Provider value={{ account, signer, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
