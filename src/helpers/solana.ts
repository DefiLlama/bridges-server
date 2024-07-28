import { Connection } from "@solana/web3.js";

export const getConnection = (): Connection => {
  const rpc =
    process.env["SOLANA_RPC"] ?? "https://mainnet.helius-rpc.com/?api-key=c73a1568-f94a-4f7f-a903-65e632a66266";
  const connection = new Connection(rpc);
  const getBlock = async (block: number) => {
    return new Connection(rpc).getBlock(block, {
      maxSupportedTransactionVersion: 0,
    }) as any;
  };

  connection.getBlock = getBlock;
  return connection;
};
