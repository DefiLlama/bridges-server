// import {
//   SuiClient,
//   SuiTransactionBlockResponse,
//   getFullnodeUrl,
//   PaginatedTransactionResponse,
// } from "@mysten/sui.js/client";

// export const getClient = () => {
//   const url = process.env.SUI_RPC ?? getFullnodeUrl("mainnet");
//   return new SuiClient({ url });
// };

// export const getTransactionBlocks = async (
//   fromCheckpoint: number,
//   toCheckpoint: number,
//   changedObject: string
// ): Promise<SuiTransactionBlockResponse[]> => {
//   const client = getClient();
//   const results: SuiTransactionBlockResponse[] = [];
//   let hasNextPage = false;
//   let cursor: string | null | undefined = undefined;
//   let oldestCheckpoint: string | null = null;
//   do {
//     // TODO: The public RPC doesn't support fetching events by chaining filters with a `TimeRange` filter,
//     // so we have to search backwards for our checkpoint range
//     const response: PaginatedTransactionResponse = await client.queryTransactionBlocks({
//       filter: { ChangedObject: changedObject },
//       cursor,
//       options: {
//         showEffects: true,
//         showEvents: true,
//         showInput: true,
//         showObjectChanges: true,
//       },
//     });
//     for (const txBlock of response.data) {
//       const checkpoint = txBlock.checkpoint;
//       if (!checkpoint) {
//         continue;
//       }
//       if (checkpoint >= fromCheckpoint.toString() && checkpoint <= toCheckpoint.toString()) {
//         results.push(txBlock);
//       }
//       if (oldestCheckpoint === null || checkpoint < oldestCheckpoint) {
//         oldestCheckpoint = checkpoint;
//       }
//     }
//     hasNextPage = response.hasNextPage;
//     cursor = response.nextCursor;
//   } while (hasNextPage && cursor && oldestCheckpoint && oldestCheckpoint >= fromCheckpoint.toString());
//   return results;
// };
