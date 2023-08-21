export interface AxelarTransfer {
  deposit_address: string;
  destination_chain: string;
  source_chain: string;
  sender_address: string;
  recipient_address: string;
  denom: string;
}

export interface DepositAddressTransfer extends AxelarTransfer {}

export interface WrapTransfer extends AxelarTransfer {
  tx_hash_wrap: string;
}

export interface FetchDepositTransfersOptions {
  isDeposit: boolean;
  type?: "deposit_address" | "wrap";
  size?: number;
}

export interface FetchDepositTransfersResponse {
  data: {
    link: DepositAddressTransfer;
    wrap: DepositAddressTransfer;
  }[];
}
