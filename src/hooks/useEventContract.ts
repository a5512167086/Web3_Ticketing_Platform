import { Contract } from "ethers";
import { useMemo } from "react";
import { useWallet } from "@/context/WalletContext";
import abi from "@/abi/EventTicketing.json";

const CONTRACT_ADDRESS = "0xAa0910471fA73a1BD08E9f83605aB7c51C1f449F";

export function useEventContract() {
  const { signer } = useWallet();

  return useMemo(() => {
    if (!signer) return null;
    return new Contract(CONTRACT_ADDRESS, abi, signer);
  }, [signer]);
}
