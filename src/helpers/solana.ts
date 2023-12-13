import { Connection } from "@solana/web3.js";

export const getConnection = (): Connection => {
  const rpc = process.env["SOLANA_RPC"] ?? "https://api.mainnet-beta.solana.com";
  const connection = new Connection(rpc);
  const getBlock = async (block: number) => {
    return new Connection(rpc).getBlock(block, {
      maxSupportedTransactionVersion: 0,
    }) as any;
  };

  connection.getBlock = getBlock;
  return connection;
};
