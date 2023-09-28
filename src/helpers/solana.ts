import {
  Connection,
  ParsedTransactionWithMeta,
  VersionedBlockResponse,
  SolanaJSONRPCError,
  ConfirmedSignatureInfo,
  PublicKey,
} from "@solana/web3.js";

export const getConnection = (): Connection => {
  const rpc = process.env["SOLANA_RPC"] ?? "https://api.mainnet-beta.solana.com";
  return new Connection(rpc);
};

/**
 * The purpose of this PR is to add a new function to the solana helper file that will fetch and return an array of parsed transactions for a given address within a specified block range.
 * Also added support for fetching `EventData` from Solana for the Portal bridge adapter.
 */

/**
 * Fetches and returns an array of parsed transactions for a given address within a specified block range.
 * @param fromSlot The starting block slot.
 * @param toSlot The ending block slot.
 * @param address The public key of the address to fetch transactions for.
 * @returns An array of parsed transactions within the specified block range.
 * @throws An error if the block range is invalid or too large, or if a transaction cannot be fetched.
 */
export async function getParsedTransactions(
  fromSlot: number,
  toSlot: number,
  address: PublicKey
): Promise<(ParsedTransactionWithMeta | null)[]> {
  const connection = getConnection();
  if (fromSlot > toSlot) throw new Error("invalid block range");
  if (toSlot - fromSlot > 100_000) throw new Error("block range too large");

  // identify block range by fetching signatures of the first and last transactions
  // getSignaturesForAddress walks backwards so fromSignature occurs after toSignature
  let toBlock: VersionedBlockResponse | null = null;
  try {
    toBlock = await connection.getBlock(toSlot, {
      maxSupportedTransactionVersion: 0,
    });
  } catch (e) {
    if (e instanceof SolanaJSONRPCError && (e.code === -32007 || e.code === -32009)) {
      // failed to get confirmed block: slot was skipped or missing in long-term storage
      return getParsedTransactions(fromSlot, toSlot - 1, address);
    } else {
      throw e;
    }
  }
  if (!toBlock || !toBlock.blockTime || toBlock.transactions.length === 0) {
    return getParsedTransactions(fromSlot, toSlot - 1, address);
  }
  const fromSignature = toBlock.transactions[toBlock.transactions.length - 1].transaction.signatures[0];

  let fromBlock: VersionedBlockResponse | null = null;
  try {
    fromBlock = await connection.getBlock(fromSlot, {
      maxSupportedTransactionVersion: 0,
    });
  } catch (e) {
    if (e instanceof SolanaJSONRPCError && (e.code === -32007 || e.code === -32009)) {
      // failed to get confirmed block: slot was skipped or missing in long-term storage
      return getParsedTransactions(fromSlot + 1, toSlot, address);
    } else {
      throw e;
    }
  }
  if (!fromBlock || !fromBlock.blockTime || fromBlock.transactions.length === 0) {
    return getParsedTransactions(fromSlot + 1, toSlot, address);
  }
  const toSignature = fromBlock.transactions[0].transaction.signatures[0];

  // get all `address` signatures between fromTransaction and toTransaction
  const results = [];
  let numSignatures = 0;
  let currSignature: string | undefined = fromSignature;
  const limit = 100;
  do {
    const signatures: ConfirmedSignatureInfo[] = await connection.getSignaturesForAddress(address, {
      before: currSignature,
      until: toSignature,
      limit,
    });
    const txs = await connection.getParsedTransactions(
      signatures.map((s) => s.signature),
      {
        maxSupportedTransactionVersion: 0,
      }
    );
    if (txs.length !== signatures.length) {
      throw new Error(`failed to fetch tx for signatures`);
    }
    results.push(...txs);
    numSignatures = signatures.length;
    currSignature = signatures[signatures.length - 1].signature;
  } while (numSignatures === limit);

  return results;
}
