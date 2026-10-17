export const TIMESTAMP_SAMPLE_COUNT = 10;

export const getSampleBlocks = (minBlock: number, maxBlock: number): number[] => {
  const blockRange = Math.max(0, maxBlock - minBlock);
  const divisor = TIMESTAMP_SAMPLE_COUNT - 1;
  const blocks = new Set<number>();
  for (let i = 0; i < TIMESTAMP_SAMPLE_COUNT; i++) {
    blocks.add(minBlock + Math.floor((i * blockRange) / divisor));
  }
  return Array.from(blocks).sort((a, b) => a - b);
};

export const estimateBlockTimestamp = (
  blockNumber: number,
  sampleBlocks: number[],
  timestamps: { [blockNumber: number]: number }
): number => {
  const known = sampleBlocks.filter((block) => Number.isFinite(timestamps[block]) && timestamps[block] > 0);
  if (!known.length) return 0;
  if (known.length === 1) return timestamps[known[0]];

  let high = known.findIndex((block) => block >= blockNumber);
  if (high === -1) high = known.length - 1;
  if (high === 0) high = 1;

  const lowBlock = known[high - 1];
  const highBlock = known[high];
  const lowTimestamp = timestamps[lowBlock];
  if (highBlock === lowBlock) return lowTimestamp;

  const secondsPerBlock = (timestamps[highBlock] - lowTimestamp) / (highBlock - lowBlock);
  return Math.round(lowTimestamp + secondsPerBlock * (blockNumber - lowBlock));
};
