// Main response interface
interface SwapResponse {
  status: string;
  result: {
    data: SwapData[];
  };
}

// Individual swap data item
interface SwapData {
  source_swap: SourceSwap;
  destination_swap: DestinationSwap;
  create_order: CreateOrder;
  created_at: string;
}

// Source swap details (only required fields)
interface SourceSwap {
  chain: string;
  asset: string;
  asset_price: number;
  initiator: string;
  redeemer: string;
  amount: string;
  initiate_tx_hash: string;
  redeem_tx_hash: string;
  refund_tx_hash: string;
  initiate_block_number: string;
  redeem_block_number: string;
  refund_block_number: string;
}

// Destination swap details (only required fields)
interface DestinationSwap {
  chain: string;
  asset: string;
  asset_price: number;
  initiator: string;
  redeemer: string;
  amount: string;
  initiate_tx_hash: string;
  redeem_tx_hash: string;
  refund_tx_hash: string;
  initiate_block_number: string;
  redeem_block_number: string;
  refund_block_number: string;
}

// Create order details (only required fields)
interface CreateOrder {
  block_number: string;
  source_chain: string;
  destination_chain: string;
  source_asset: string;
  destination_asset: string;
  initiator_source_address: string;
  initiator_destination_address: string;
  source_amount: string;
  destination_amount: string;
  additional_data: {
    tx_hash: string;
  };
}

interface SolanaEvent {
  blockNumber: number;
  txHash: string;
  from: string;
  to: string;
  token: string;
  amount: string;
  isDeposit: boolean;
  timestamp: number;
}

// Export the main interface
export type { SwapResponse, SwapData, SourceSwap, DestinationSwap, CreateOrder, SolanaEvent };

