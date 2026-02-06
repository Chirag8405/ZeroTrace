import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "ZeroTrace",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [mainnet, sepolia, polygon, optimism, arbitrum, base],
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
