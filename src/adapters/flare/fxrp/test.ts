import { getLogs } from "@defillama/sdk/build/util";
import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import { getLlamaPrices } from "../../../utils/prices";

const FXRP = "0xAd552A648C74D49E10027AB8a618A3ad4901c5bE";
const ZERO = "0x0000000000000000000000000000000000000000";
const TRANSFER_TOPIC = ethers.utils.id("Transfer(address,address,uint256)");

async function main() {
  // pick a recent range; widen if needed
  const fromBlock = 48104361;
  const toBlock = 48185336;

  const logs = (await getLogs({
    target: FXRP,
    topic: "Transfer(address,address,uint256)",
    keys: [],
    fromBlock,
    toBlock,
    topics: [TRANSFER_TOPIC],
    chain: "flare",
  })).output;

  // Fetch price/decimals once for FXRP at a representative timestamp (end of window)
  const tokenKey = `flare:${FXRP.toLowerCase()}`;
  const approxTs = Math.floor(Date.now() / 1000); // Optionally replace with block->ts lookup for higher accuracy
  const prices = await getLlamaPrices([tokenKey], approxTs);
  const priceData = prices[tokenKey];
  if (!priceData) {
    console.warn(`No price data for ${tokenKey}. USD values will be omitted.`);
  }
  const tokenDecimals = priceData?.decimals ?? 18; // fallback to 18 if missing
  const tokenPrice = priceData?.price ?? 0;

  const iface = new ethers.utils.Interface([
    "event Transfer(address indexed from, address indexed to, uint256 value)",
  ]);

  const specialHits: any[] = [];
  let mintCount = 0, burnCount = 0, xferCount = 0;
  let mintUsd = 0, burnUsd = 0, xferUsd = 0;
  for (const log of logs) {
    const parsed = iface.parseLog({ topics: [...log.topics], data: log.data });
    const from = parsed.args.from.toLowerCase();
    const to = parsed.args.to.toLowerCase();
    const rawAmount = new BigNumber(parsed.args.value.toString());
    const amount = rawAmount.dividedBy(new BigNumber(10).pow(tokenDecimals));
    const usd = amount.multipliedBy(tokenPrice).toNumber();
    if (from === ZERO || to === ZERO) {
      specialHits.push({
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        from,
        to,
        amount: amount.toString(10),
        usd,
      });
    }

    if (from === ZERO) {
      mintCount += 1;
      mintUsd += usd || 0;
    } else if (to === ZERO) {
      burnCount += 1;
      burnUsd += usd || 0;
    } else {
      xferCount += 1;
      xferUsd += usd || 0;
    }
  }

  console.log("Special mint/burn-like hits:");
  console.table(specialHits);

  // USD summary
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
  const netMinted = mintUsd - burnUsd;
  console.log(`[flare | FXRP] Summary for blocks ${fromBlock}-${toBlock}`);
  console.log(`Mints (from ZERO): ${mintCount}, USD: ${fmt.format(mintUsd)}`);
  console.log(`Burns (to ZERO): ${burnCount}, USD: ${fmt.format(burnUsd)}`);
  console.log(`Regular transfers: ${xferCount}, USD: ${fmt.format(xferUsd)}`);
  console.log(`Net minted USD (Mints - Burns): ${fmt.format(netMinted)}`);

  // optional: surface any “suspicious” constant sink addresses you might treat as burns
  const counts: Record<string, number> = {};
  for (const l of logs) {
    const parsed = iface.parseLog({ topics: [...l.topics], data: l.data });
    const to = parsed.args.to.toLowerCase();
    counts[to] = (counts[to] || 0) + 1;
  }
  console.log("Top 'to' addresses:");
  console.log(Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,20));
}

main().catch(console.error);

// Run the TypeScript file with tsx
// npx tsx src/adapters/flare/fxrp/test.ts