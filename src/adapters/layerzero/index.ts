import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  ListObjectsV2CommandOutput,
  GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import { createGunzip } from "zlib";
import { Readable } from "stream";
import allChains from "./allChains";
import { getCache, setCache } from "../../utils/cache";

export interface LayerZeroTransaction {
  txHashSource: string;
  txHashDestination: string;
  chainSource: string;
  chainDestination: string;
  token: string;
  symbol: string;
  usdAmount: number;
  contractAddressFrom: string;
  contractAddressTo: string;
  eoaAddressFrom: string;
  eoaAddressTo: string;
  timestampSource: string;
  timestampDestination: string;
  timestampUpdated: string;
  primaryKey: string;
  bridge: string;
  _fileName: string;
}

export const layerZeroChainMapping: { [key: string]: string } = {
  "BNB Chain": "bsc",
  "Celo Mainnet": "celo",
  "Klaytn Mainnet Cypress": "klaytn",
  "zkSync Era Mainnet": "zksync_era",
  "Core Blockchain Mainnet": "core",
  "Aurora Mainnet": "aurora",
  DFK: "dfk_chain",
  "Rari Chain": "rari_chain",
  "Fuse Mainnet": "fuse",
  "OKXChain Mainnet": "okx",
  "Horizen EON Mainnet": "eon",
  TelosEVM: "telos",
  "XPLA Mainnet": "xpla",
  "PGN (Public Goods Network)": "pgn",
  "Shrapnel Subnet": "shrapnel",
  "Astar zkEVM": "astar_zkevm",
  Gravity: "gravity_bridge",
  "Merit Circle": "mc",
  "Orderly Mainnet": "orderly",
  "Conflux eSpace": "conflux",
  "Meter Mainnet": "meter",
  Real: "real",
  Xlayer: "x_layer",
  Sepolia: "sepolia",
  Hemi: "hemi",
  Lisk: "lisk",
  Hyperliquid: "hyperliquid",
  zkConsensys: "linea",
  Rarible: "rarible",
  Unichain: "unichain",
  Glue: "glue",
  CoreDAO: "coredao",
  PlumePhoenix: "plumephoenix",
  Soneium: "soneium",
  CronosEVM: "cronosevm",
  XDC: "xdc",
  Story: "story",
  Nibiru: "nibiru",
  TAC: "tac",
  TRON: "tron",
  Worldchain: "worldchain",
  Tomo: "tomo",
  TON: "ton",
  Movement: "movement",
  Botanix: "botanix",
  Goat: "goat",
  BOB: "bob",
  MP1: "mp1",
  Somnia: "somnia",
  Sophon: "sophon",
  Morph: "morph",
  BB1: "bb1",
  BounceBit: "bouncebit",
  Katana: "katana",
  Monad: "monad",
};

async function assumeRole(retryCount = 0, maxRetries = 3) {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials not found in environment variables");
  }

  try {
    const stsClient = new STSClient({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } as const,
    });

    const params = {
      RoleArn: process.env.AWS_ROLE_ARN,
      RoleSessionName: "S3AccessSession",
      ExternalId: process.env.AWS_EXTERNAL_ID,
    };

    const command = new AssumeRoleCommand(params);
    const response = await stsClient.send(command);

    if (
      !response.Credentials?.AccessKeyId ||
      !response.Credentials?.SecretAccessKey ||
      !response.Credentials?.SessionToken
    ) {
      throw new Error("Failed to obtain credentials");
    }

    return {
      accessKeyId: response.Credentials.AccessKeyId,
      secretAccessKey: response.Credentials.SecretAccessKey,
      sessionToken: response.Credentials.SessionToken,
    } as const;
  } catch (error) {
    if (retryCount < maxRetries) {
      console.log(`Retrying assumeRole, attempt ${retryCount + 1} of ${maxRetries}`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      return assumeRole(retryCount + 1, maxRetries);
    }
    console.error("Error assuming role:", error);
    throw error;
  }
}

export async function* processLayerZeroData(bucketName: string, processedFiles: Set<string>) {
  let s3Client: S3Client | null = null;
  let temporaryCredentials: any = null;

  const getS3Client = async () => {
    temporaryCredentials = await assumeRole();
    return new S3Client({
      region: "us-east-1",
      credentials: temporaryCredentials,
    });
  };

  const executeS3Command = async <T>(command: any): Promise<T> => {
    try {
      if (!s3Client) {
        s3Client = await getS3Client();
      }
      return (await s3Client.send(command)) as T;
    } catch (error: any) {
      if (error.name === "ExpiredToken") {
        console.log("Token expired, refreshing credentials");
        s3Client = await getS3Client();
        await new Promise((resolve) => setTimeout(resolve, 1000 * 2));
        return executeS3Command(command);
      }
      throw error;
    }
  };

  try {
    let allContents: any[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });

      const response = await executeS3Command<ListObjectsV2CommandOutput>(command);

      if (response.Contents) {
        allContents = [...allContents, ...response.Contents];
      }

      continuationToken = response.NextContinuationToken;
      console.log(`Retrieved ${allContents.length} files`);
    } while (continuationToken);

    allContents.sort((a, b) => {
      return (a.LastModified?.getTime() || 0) - (b.LastModified?.getTime() || 0);
    });

    const filesToProcess = allContents.filter((file) => file.Key && !processedFiles.has(file.Key)).reverse();
    console.log(`Processing ${filesToProcess.length} new files`);

    for (const file of filesToProcess) {
      if (!file.Key) continue;

      try {
        console.log(`Processing file: ${file.Key}`);
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: file.Key,
        });

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`S3 operation timeout for ${file.Key}`)), 60000);
        });

        const response = (await Promise.race([
          executeS3Command<GetObjectCommandOutput>(command),
          timeoutPromise,
        ])) as GetObjectCommandOutput;

        if (!response.Body) {
          console.error(`File ${file.Key} has no Body`);
          continue;
        }

        const data = await new Promise<string>((resolve, reject) => {
          const chunks: Buffer[] = [];
          const gunzip = createGunzip();

          const timeout = setTimeout(() => {
            reject(new Error(`Stream processing timeout for ${file.Key}`));
          }, 300000);

          const stream = Readable.from(response.Body as any).pipe(gunzip);

          stream.on("data", (chunk) => {
            chunks.push(Buffer.from(chunk));
          });

          stream.on("end", () => {
            clearTimeout(timeout);
            resolve(Buffer.concat(chunks).toString("utf8"));
          });

          stream.on("error", (err) => {
            clearTimeout(timeout);
            reject(err);
          });

          Readable.from(response.Body as any).on("error", (err) => {
            clearTimeout(timeout);
            reject(err);
          });

          gunzip.on("error", (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        });

        console.log(`Data read from ${file.Key}, size: ${data.length} bytes`);
        const rows = data.split("\n").filter((row) => row.trim());

        if (rows.length <= 1) {
          console.warn(`File ${file.Key} has no data rows (only header?), skipping`);
          processedFiles.add(file.Key);
          continue;
        }

        const transactions: LayerZeroTransaction[] = rows.slice(1).map((row) => {
          const values = row.split(",");
          return {
            txHashSource: values[0],
            txHashDestination: values[1],
            chainSource: layerZeroChainMapping[values[2]] || values[2],
            chainDestination: layerZeroChainMapping[values[3]] || values[3],
            token: values[4],
            symbol: values[5],
            usdAmount: parseFloat(values[6]),
            contractAddressFrom: values[7],
            contractAddressTo: values[8],
            eoaAddressFrom: values[9],
            eoaAddressTo: values[10],
            timestampSource: values[11],
            timestampDestination: values[12],
            timestampUpdated: values[13],
            primaryKey: values[14],
            bridge: values[15],
            _fileName: file.Key!,
          };
        });

        console.log(`Yielding ${transactions.length} transactions from ${file.Key}`);
        yield { fileName: file.Key, transactions };
        console.log(`Successfully yielded transactions from ${file.Key}, moving to next file`);
      } catch (error) {
        console.error(`Error processing individual file ${file.Key}:`, error);
        continue;
      }
    }
    console.log("Completed iterating through all files");
  } catch (error) {
    console.error("Error processing LayerZero files:", error);
    throw error;
  }
}

export async function updateLayerZeroTokenSymbols(transactions: LayerZeroTransaction[]) {
  if (!transactions || transactions.length === 0) return;

  const KEY = "lz_token_symbols";
  const existing = ((await getCache(KEY)) || {}) as Record<string, string>;
  const updated: Record<string, string> = { ...existing };

  for (const tx of transactions) {
    const addr = (tx.token || "").toLowerCase();
    const sym = (tx.symbol || "").trim();
    if (!addr || addr === "0x" || addr === "0x0000000000000000000000000000000000000000") continue;
    if (!sym) continue;
    if (!updated[addr] || updated[addr] !== sym) {
      updated[addr] = sym;
    }
  }
  console.log(updated);

  await setCache(KEY, updated, null);
}
const adapter = Object.values(allChains).reduce((acc: any, chain: string) => {
  acc[layerZeroChainMapping[chain] || chain?.toLowerCase()] = true;
  return acc;
}, {});
export { adapter };
export default adapter;
