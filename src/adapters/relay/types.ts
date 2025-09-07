export type RelayRequestsResponse = {
  requests?: {
    id?: string;
    /**
     * @description Note that fallback is returned in the case of a refund
     * @enum {string}
     */
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
        /** @description Estimated gas cost required for execution, in wei */
        gas?: string;
        /** @description The fixed fee which is always added to execution, in wei */
        fixed?: string;
        /** @description The dynamic fee which is a result of the chain and the amount, in wei */
        price?: string;
      };
      feesUsd?: {
        gas?: string;
        fixed?: string;
        price?: string;
      };
      inTxs?: {
        /** @description Total fees in wei */
        fee?: string;
        data?: unknown;
        stateChanges?: unknown;
        hash?: string;
        block?: number;
        /** @description The type of transaction, always set to onchain */
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
      /**
       * @example {
       *   "currency": {
       *     "chainId": 8453,
       *     "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
       *     "symbol": "USDC",
       *     "name": "USD Coin",
       *     "decimals": 6,
       *     "metadata": {
       *       "logoURI": "https://ethereum-optimism.github.io/data/USDC/logo.png",
       *       "verified": false,
       *       "isNative": false
       *     }
       *   },
       *   "amount": "30754920",
       *   "amountFormatted": "30.75492",
       *   "amountUsd": "30.901612",
       *   "minimumAmount": "30454920"
       * }
       */
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
        /**
         * @example {
         *   "currency": {
         *     "chainId": 8453,
         *     "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
         *     "symbol": "USDC",
         *     "name": "USD Coin",
         *     "decimals": 6,
         *     "metadata": {
         *       "logoURI": "https://ethereum-optimism.github.io/data/USDC/logo.png",
         *       "verified": false,
         *       "isNative": false
         *     }
         *   },
         *   "amount": "30754920",
         *   "amountFormatted": "30.75492",
         *   "amountUsd": "30.901612",
         *   "minimumAmount": "30454920"
         * }
         */
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
        /**
         * @example {
         *   "currency": {
         *     "chainId": 8453,
         *     "address": "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
         *     "symbol": "USDC",
         *     "name": "USD Coin",
         *     "decimals": 6,
         *     "metadata": {
         *       "logoURI": "https://ethereum-optimism.github.io/data/USDC/logo.png",
         *       "verified": false,
         *       "isNative": false
         *     }
         *   },
         *   "amount": "30754920",
         *   "amountFormatted": "30.75492",
         *   "amountUsd": "30.901612",
         *   "minimumAmount": "30454920"
         * }
         */
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
        /** @description Total fees in wei */
        fee?: string;
        data?: unknown;
        stateChanges?: unknown;
        hash?: string;
        block?: number;
        /** @description The type of transaction, always set to onchain */
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