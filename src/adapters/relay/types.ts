export type RelayCurrency = {
  chainId?: number;
  address?: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  metadata?: {
    logoURI?: string;
    verified?: boolean;
    isNative?: boolean;
  };
};

export type RelayCurrencyAmount = {
  currency?: RelayCurrency;
  amount?: string;
  amountFormatted?: string;
  amountUsd?: string;
  minimumAmount?: string;
};

export type RelayRouteLeg = {
  inputCurrency?: RelayCurrencyAmount;
  outputCurrency?: RelayCurrencyAmount;
  router?: string;
};

export type RelayRouteSnapshot = {
  origin?: RelayRouteLeg;
  destination?: RelayRouteLeg;
  rate?: string;
};

export type RelayRoute = {
  quoted?: RelayRouteSnapshot;
  actual?: RelayRouteSnapshot;
  includedSwapSources?: string[];
};

export type RelayTx = {
  txHash?: string;
  block?: number;
  chainId?: number;
  timestamp?: number;
  type?: string;
  status?: string;
  fee?: string;
  feeUsd?: string;
  data?: unknown;
  stateChanges?: unknown;
};

export type RelayRequestStatus =
  | "refund"
  | "waiting"
  | "failure"
  | "pending"
  | "success"
  | "depositing"
  | "submitted";

export type RelayRequest = {
  id?: string;
  status?: RelayRequestStatus;
  sender?: string;
  recipient?: string;
  user?: string;
  refundTo?: string;
  depositAddress?: string;
  requestType?: string;
  protocol?: unknown;
  features?: unknown;
  createdAt?: string;
  updatedAt?: string;
  data?: {
    route?: RelayRoute;
    inTxs?: RelayTx[];
    outTxs?: RelayTx[];
    failReason?: string | null;
    refundFailReason?: string | null;
    fees?: Record<string, unknown>;
    feesUsd?: Record<string, unknown>;
    appFees?: Record<string, unknown>;
    feeSponsorship?: Record<string, unknown>;
    refundCurrencyData?: RelayCurrencyAmount;
    externalMetadata?: { moonpayId?: string };
    usesExternalLiquidity?: boolean;
    timeEstimate?: number;
  };
};

export type RelayRequestsResponse = {
  requests?: RelayRequest[];
  continuation?: string;
};
