import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const { ARC_TESTNET_RPC_URL, DEPLOYER_PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;
const accounts = DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    arcTestnet: {
      url: ARC_TESTNET_RPC_URL ?? "https://rpc.testnet.arc.network",
      chainId: 5042002,
      accounts,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY ?? "",
  },
};

export default config;
