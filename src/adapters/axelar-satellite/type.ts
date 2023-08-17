export interface LinkedDepositAddress {
  deposit_address: string;
  destination_chain: string;
  source_chain: string;
  sender_address: string;
  recipient_address: string;
}

export interface FetchDepositTransfersOptions {
  isDeposit: boolean;
  size?: number;
}

export interface FetchDepositTransfersResponse {
  data: {
    link: LinkedDepositAddress;
  }[];
}
