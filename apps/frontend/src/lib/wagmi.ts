import type { Config } from "wagmi";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from "wagmi/chains";

let configCache: Config | undefined;

export const getConfig = () => {
  if (typeof window === "undefined") {
    throw new Error("Config can only be created on the client side");
  }

  if (!configCache) {
    configCache = getDefaultConfig({
      ssr: false,
      appName: "ZeroTrace",
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
      chains: [mainnet, sepolia, polygon, optimism, arbitrum, base],
    });
  }

  return configCache;
};
