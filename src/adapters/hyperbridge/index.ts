import { BridgeAdapter, PartialContractEventParams } from "../../helpers/bridgeAdapter.type";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { Chain } from "@defillama/sdk/build/general";
import { EventData } from "../../utils/types";
import { getProvider } from "@defillama/sdk";
import { ethers } from "ethers";

const intentGateway = "0x1a4ee689a004b10210a1df9f24a387ea13359acf";
const tokenGateway = "0xFd413e3AFe560182C4471F4d143A96d3e259B6dE";

export const intentGatewayAddresses = {
  ethereum: intentGateway,
  arbitrum: intentGateway,
  base: intentGateway,
  bsc: intentGateway,
  polygon: intentGateway,
} as const;

export const tokenGatewayAddresses = {
  ethereum: tokenGateway,
  arbitrum: tokenGateway,
  base: tokenGateway,
  bsc: tokenGateway,
  polygon: tokenGateway,
} as const;

type SupportedChains = keyof typeof intentGatewayAddresses;

const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const constructParams = (chain: SupportedChains) => {
  const igGateway = intentGatewayAddresses[chain];
  const tgGateway = tokenGatewayAddresses[chain];

  return async (fromBlock: number, toBlock: number) => {
    // ========== Intent Gateway Events (need custom filtering) ==========
    const escrowReleasedParams: PartialContractEventParams = {
      target: igGateway,
      topic: "EscrowReleased(bytes32)",
      abi: ["event EscrowReleased(bytes32 indexed commitment)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      isDeposit: true,
    };

    const orderFilledParams: PartialContractEventParams = {
      target: igGateway,
      topic: "OrderFilled(bytes32,address)",
      abi: ["event OrderFilled(bytes32 indexed commitment, address filler)"],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      isDeposit: false,
    };

    // ========== Token Gateway Events (can use getTokenFromReceipt) ==========
    const assetTeleportedParams: PartialContractEventParams = {
      target: tgGateway,
      topic: "AssetTeleported(bytes32,string,uint256,bytes32,address,bytes32,bool)",
      abi: [
        "event AssetTeleported(bytes32 to, string dest, uint256 amount, bytes32 commitment, address indexed from, bytes32 indexed assetId, bool redeem)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      argKeys: {
        from: "from",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
      fixedEventData: {
        to: tgGateway,
      },
      isDeposit: true,
    };

    const assetReceivedParams: PartialContractEventParams = {
      target: tgGateway,
      topic: "AssetReceived(uint256,bytes32,bytes32,address,bytes32)",
      abi: [
        "event AssetReceived(uint256 amount, bytes32 commitment, bytes32 indexed from, address indexed beneficiary, bytes32 indexed assetId)",
      ],
      logKeys: {
        blockNumber: "blockNumber",
        txHash: "transactionHash",
      },
      argKeys: {
        to: "beneficiary",
      },
      getTokenFromReceipt: {
        token: true,
        amount: true,
      },
      fixedEventData: {
        from: tgGateway,
      },
      isDeposit: false,
    };

    const intentGatewayParams = [escrowReleasedParams, orderFilledParams];
    const intentGatewayEvents = await getTxDataFromEVMEventLogs(
      "hyperbridge",
      chain as Chain,
      fromBlock,
      toBlock,
      intentGatewayParams
    );

    const tokenGatewayParams = [assetTeleportedParams, assetReceivedParams];
    const tokenGatewayEvents = await getTxDataFromEVMEventLogs(
      "hyperbridge",
      chain as Chain,
      fromBlock,
      toBlock,
      tokenGatewayParams
    );

    // Process Intent Gateway events with custom filtering
    const processedIntentGatewayEvents: EventData[] = [];

    for (const event of intentGatewayEvents) {
      try {
        const provider = getProvider(chain as Chain);
        const txReceipt = await provider.getTransactionReceipt(event.txHash);
        if (!txReceipt?.logs) continue;

        for (const log of txReceipt.logs) {
          if (log.topics && log.topics[0] === TRANSFER_TOPIC && log.topics.length === 3) {
            const from = "0x" + log.topics[1].slice(26);
            const to = "0x" + log.topics[2].slice(26);
            const token = log.address;
            const amount = ethers.BigNumber.from(log.data);

            if (event.isDeposit) {
              // EscrowReleased: only transfers FROM gateway (escrow release to filler)
              if (from.toLowerCase() === igGateway.toLowerCase()) {
                processedIntentGatewayEvents.push({
                  txHash: event.txHash,
                  blockNumber: event.blockNumber,
                  from: from,
                  to: to,
                  token: token,
                  amount: amount,
                  isDeposit: true,
                });
              }
            } else {
              // OrderFilled: transfers NOT involving gateway (filler → user)
              if (from.toLowerCase() !== igGateway.toLowerCase() && to.toLowerCase() !== igGateway.toLowerCase()) {
                processedIntentGatewayEvents.push({
                  txHash: event.txHash,
                  blockNumber: event.blockNumber,
                  from: from,
                  to: to,
                  token: token,
                  amount: amount,
                  isDeposit: false,
                });
              }
            }
          }
        }
      } catch (e) {
        console.error(`Error processing Intent Gateway transaction ${event.txHash}:`, e);
      }
    }

    return [...processedIntentGatewayEvents, ...tokenGatewayEvents];
  };
};

const adapter: BridgeAdapter = {
  ethereum: constructParams("ethereum"),
  arbitrum: constructParams("arbitrum"),
  base: constructParams("base"),
  bsc: constructParams("bsc"),
  polygon: constructParams("polygon"),
};

export default adapter;
