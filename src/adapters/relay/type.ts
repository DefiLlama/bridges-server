export type RelayRequestsResponse = {
  requests?: {
    id?: string;
    status?: "refund" | "delayed" | "waiting" | "failure" | "pending" | "success";
    user?: string;
    recipient?: string;
    data?: {
      /** @enum {string} */
      failReason?:
        | "UNKNOWN"
        | "AMOUNT_TOO_LOW_TO_REFUND"
        | "DEPOSIT_ADDRESS_MISMATCH"
        | "DEPOSIT_CHAIN_MISMATCH"
        | "N/A";
      fees?: {
        gas?: string;
        fixed?: string;
        price?: string;
      };
      feesUsd?: {
        gas?: string;
        fixed?: string;
        price?: string;
      };
      inTxs?: {
        fee?: string;
        data?: unknown;
        stateChanges?: unknown;
        hash?: string;
        type?: string;
        chainId?: number;
        timestamp?: number;
      }[];
      currency?: string;
      currencyObject?: {
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
      feeCurrency?: string;
      feeCurrencyObject?: {
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
      refundCurrencyData?: {
        currency?: {
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
        amount?: string;
        amountFormatted?: string;
        amountUsd?: string;
        minimumAmount?: string;
      };
      appFees?: {
        recipient?: string;
        amount?: string;
      }[];
      metadata?: {
        sender?: string;
        recipient?: string;
        currencyIn?: {
          currency?: {
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
          amount?: string;
          amountFormatted?: string;
          amountUsd?: string;
          minimumAmount?: string;
        };
        currencyOut?: {
          currency?: {
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
          amount?: string;
          amountFormatted?: string;
          amountUsd?: string;
          minimumAmount?: string;
        };
        rate?: string;
      };
      price?: string;
      usesExternalLiquidity?: boolean;
      timeEstimate?: number;
      outTxs?: {
        fee?: string;
        data?: unknown;
        stateChanges?: unknown;
        hash?: string;
        type?: string;
        chainId?: number;
        timestamp?: number;
      }[];
    };
    createdAt?: string;
    updatedAt?: string;
  }[];
  continuation?: string;
};
