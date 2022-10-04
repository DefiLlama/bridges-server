import BigNumber from "bignumber.js";

type EventKeys = "blockNumber" | "txHash" | "from" | "to" | "token" | "amount";

export type EventData = {
    blockNumber: number;
    txHash: string;
    from: string;
    to: string;
    token: string;
    amount: BigNumber;
    isDeposit: boolean;
  };

export type EventKeyMapping = {
    [key in EventKeys]?: string;
  };