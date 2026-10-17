import assert from "node:assert/strict";
import test from "node:test";
import { estimateBlockTimestamp, getSampleBlocks, TIMESTAMP_SAMPLE_COUNT } from "./blockTimestamps";

const constantBlockTime = (minBlock: number, blockTime: number, firstTimestamp: number) => (block: number) =>
  firstTimestamp + (block - minBlock) * blockTime;

const sampleWith = (minBlock: number, maxBlock: number, timeOfBlock: (block: number) => number) => {
  const sampleBlocks = getSampleBlocks(minBlock, maxBlock);
  const timestamps = {} as { [block: number]: number };
  for (const block of sampleBlocks) timestamps[block] = timeOfBlock(block);
  return { sampleBlocks, timestamps };
};

test("the samples span the whole range, so every event block sits between two of them", () => {
  const sampleBlocks = getSampleBlocks(1000, 1300);
  assert.equal(sampleBlocks.length, TIMESTAMP_SAMPLE_COUNT);
  assert.equal(sampleBlocks[0], 1000);
  assert.equal(sampleBlocks[sampleBlocks.length - 1], 1300);
});

test("a range shorter than the sample count is not sampled more than once per block", () => {
  assert.deepEqual(getSampleBlocks(500, 503), [500, 501, 502, 503]);
  assert.deepEqual(getSampleBlocks(500, 500), [500]);
});

test("every block in a 300 block chunk of 12s blocks gets its own timestamp", () => {
  const timeOfBlock = constantBlockTime(26209114, 12, 1760000000);
  const { sampleBlocks, timestamps } = sampleWith(26209114, 26209414, timeOfBlock);
  for (let block = 26209114; block <= 26209414; block++) {
    assert.equal(estimateBlockTimestamp(block, sampleBlocks, timestamps), timeOfBlock(block));
  }
});

test("the last block of the chunk is not stamped with an earlier sample", () => {
  const timeOfBlock = constantBlockTime(0, 12, 1760000000);
  const { sampleBlocks, timestamps } = sampleWith(0, 300, timeOfBlock);
  assert.equal(estimateBlockTimestamp(300, sampleBlocks, timestamps), timeOfBlock(300));
  assert.equal(estimateBlockTimestamp(299, sampleBlocks, timestamps), timeOfBlock(299));
});

test("a 3000 block chunk of 2s blocks lands every block in the right hour", () => {
  const minBlock = 52709204;
  const timeOfBlock = constantBlockTime(minBlock, 2, 1760001234);
  const { sampleBlocks, timestamps } = sampleWith(minBlock, minBlock + 3000, timeOfBlock);
  let wrongHour = 0;
  for (let block = minBlock; block <= minBlock + 3000; block++) {
    const estimated = estimateBlockTimestamp(block, sampleBlocks, timestamps);
    if (Math.floor(estimated / 3600) !== Math.floor(timeOfBlock(block) / 3600)) wrongHour++;
  }
  assert.equal(wrongHour, 0);
});

test("a sampled block gets back exactly what the provider reported for it", () => {
  const timestamps = { 100: 1000, 200: 1500, 300: 2600 };
  const sampleBlocks = [100, 200, 300];
  assert.equal(estimateBlockTimestamp(100, sampleBlocks, timestamps), 1000);
  assert.equal(estimateBlockTimestamp(200, sampleBlocks, timestamps), 1500);
  assert.equal(estimateBlockTimestamp(300, sampleBlocks, timestamps), 2600);
});

test("an estimate stays between the two samples that bracket it", () => {
  const timestamps = { 100: 1000, 200: 1500, 300: 2600 };
  const sampleBlocks = [100, 200, 300];
  const first = estimateBlockTimestamp(150, sampleBlocks, timestamps);
  assert.equal(first, 1250);
  const second = estimateBlockTimestamp(250, sampleBlocks, timestamps);
  assert.ok(second > 1500 && second < 2600);
  assert.equal(second, 2050);
});

test("a sample the provider never answered for is skipped, not treated as the epoch", () => {
  const timestamps = { 100: 1000, 300: 2000 } as { [block: number]: number };
  const sampleBlocks = [100, 200, 300];
  assert.equal(estimateBlockTimestamp(200, sampleBlocks, timestamps), 1500);
});

test("no usable sample gives zero, which is what the solana path relies on", () => {
  assert.equal(estimateBlockTimestamp(150, [100, 200], { 100: 0, 200: 0 }), 0);
  assert.equal(estimateBlockTimestamp(150, [100, 200], {}), 0);
});

test("one usable sample is used for the whole chunk", () => {
  assert.equal(estimateBlockTimestamp(150, [100, 200], { 100: 1234 }), 1234);
  assert.equal(estimateBlockTimestamp(500, [100, 200], { 200: 1234 }), 1234);
});
