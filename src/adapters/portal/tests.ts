import * as ethers from "ethers";
import adapter from ".";
import { EventData } from "../../utils/types";

const assertEqual = (expected: EventData, actual: EventData) => {
  for (const [key, expectedValue] of Object.entries(expected)) {
    // @ts-ignore
    const actualValue = actual[key];
    if (key === "amount" ? !(expectedValue as ethers.BigNumber).eq(actualValue) : expectedValue !== actualValue) {
      throw new Error(`${key}: expected ${expectedValue}, actual ${actualValue}`);
    }
  }
};

const getEvent = async (blockNumber: number, chain: string = "ethereum") => {
  const events = await adapter[chain](blockNumber, blockNumber + 1);
  if (events.length === 0) {
    throw new Error("no events found");
  }
  if (events.length > 1) {
    throw new Error("found more than one event");
  }
  return events[0];
};

const testNoEventsFound = async () => {
  const blockNumber = 18114747;
  const events = await adapter.ethereum(blockNumber, blockNumber + 1);
  if (events.length !== 0) {
    throw new Error("events should be empty");
  }
};

const testWrapAndTransferEth = async () => {
  // https://etherscan.io/tx/0x167803810b9274b3c35594a8a50928115141c7cbcc3f973d338ef71e1022729c
  const blockNumber = 18114746;
  const event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x167803810b9274b3c35594a8a50928115141c7cbcc3f973d338ef71e1022729c",
      from: "0x15E9dffFeC3f4E8cFC1b7C5770aa38709a712A3c",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      amount: ethers.BigNumber.from("1963000000000000000"),
      isDeposit: true,
    },
    event
  );
};

const testWrapAndTransferEthWithPayload = async () => {
  // https://etherscan.io/tx/0x632164812557f703f93c83bdc6ed4086583a505b8815f7db87b65473f6fccbfe
  let blockNumber = 18112187;
  let event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x632164812557f703f93c83bdc6ed4086583a505b8815f7db87b65473f6fccbfe",
      from: "0xc2A08ff99DF2dD45cA5cF5bc6636954f33294830",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      amount: ethers.BigNumber.from("30000000000000000"),
      isDeposit: true,
    },
    event
  );

  // https://etherscan.io/tx/0xd22e5849c63b4e17ec48aefbdbb4a659a6a516fa73f603c6791ec4780e23782e
  // relayer contract interaction
  blockNumber = 18093452;
  event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0xd22e5849c63b4e17ec48aefbdbb4a659a6a516fa73f603c6791ec4780e23782e",
      from: "0x072AFd05d41A2a9Ca0fa1755d7B79f861eDb04F3",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      amount: ethers.BigNumber.from("3600000000000000000"),
      isDeposit: true,
    },
    event
  );
};

const testTransferTokens = async () => {
  // https://etherscan.io/tx/0x45fb798f33f3501f43af1d9c312710bc102aa110d732a1ef3491b9f2d1ff8c82
  // native tokens
  let blockNumber = 18113848;
  let event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x45fb798f33f3501f43af1d9c312710bc102aa110d732a1ef3491b9f2d1ff8c82",
      from: "0xba4eeD5A9E6Acb87e298F6F11e278404f8da28df",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      amount: ethers.BigNumber.from("5000000000"),
      isDeposit: true,
    },
    event
  );
  // https://etherscan.io/tx/0x98ca80f521957c47dc70565c2760e2696edef9fc7e1c78b5a1ed39e4beabece9
  // wrapped tokens
  blockNumber = 18128505;
  event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x98ca80f521957c47dc70565c2760e2696edef9fc7e1c78b5a1ed39e4beabece9",
      from: "0xC8d5CF84E1aA38fFa9E5E532fc97b2F6e1C4740c",
      to: "0x0000000000000000000000000000000000000000",
      token: "0xE28027c99C7746fFb56B0113e5d9708aC86fAE8f",
      amount: ethers.BigNumber.from("1428672071062310"),
      isDeposit: true,
    },
    event
  );
};

const testTransferTokensWithPayload = async () => {
  // https://etherscan.io/tx/0xd32b1318b064b4859d2260ebcf116cc1c8687af374e43a83b52d7e059c8a76fb
  let blockNumber = 18115838;
  let event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0xd32b1318b064b4859d2260ebcf116cc1c8687af374e43a83b52d7e059c8a76fb",
      from: "0x6a0Ff6be57DdAbF9F5248a13d3D52e377E310c5d",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      amount: ethers.BigNumber.from("10000"),
      isDeposit: true,
    },
    event
  );

  // https://etherscan.io/tx/0x14aaac892b3d9cf9d95b1542861ce753213d1b602d4dadfd642687fad6226cdd
  // relayer contract interaction
  blockNumber = 18099846;
  event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x14aaac892b3d9cf9d95b1542861ce753213d1b602d4dadfd642687fad6226cdd",
      from: "0xdC382CDF2a25790F535a518EC26958c227e9DCF2",
      to: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      amount: ethers.BigNumber.from("9468893553"),
      isDeposit: true,
    },
    event
  );
};

const testCompleteTransferAndUnwrapEth = async () => {
  // https://etherscan.io/tx/0x6821ce4eca16b4a4ed7ae04bbf30e2e81efae48dc09b362c592e5e3d0fb42580
  const blockNumber = 18115758;
  const event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x6821ce4eca16b4a4ed7ae04bbf30e2e81efae48dc09b362c592e5e3d0fb42580",
      from: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      to: "0x8655F051512899Af8614275e8E31f260eA276267",
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      amount: ethers.BigNumber.from("788573490000000000"),
      isDeposit: false,
    },
    event
  );
};

const testCompleteTransferAndUnwrapEthWithPayload = async () => {
  // https://etherscan.io/tx/0x6821ce4eca16b4a4ed7ae04bbf30e2e81efae48dc09b362c592e5e3d0fb42580
  const blockNumber = 18115758;
  const event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x6821ce4eca16b4a4ed7ae04bbf30e2e81efae48dc09b362c592e5e3d0fb42580",
      from: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      to: "0x8655F051512899Af8614275e8E31f260eA276267",
      token: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      amount: ethers.BigNumber.from("788573490000000000"),
      isDeposit: false,
    },
    event
  );
};

const testCompleteTransfer = async () => {
  // https://etherscan.io/tx/0x75e84975dde7458034da40a3ab56984c85724b5418cc46d98c92f55d124321f5
  // wrapped tokens
  let blockNumber = 18115863;
  let event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x75e84975dde7458034da40a3ab56984c85724b5418cc46d98c92f55d124321f5",
      from: "0x0000000000000000000000000000000000000000",
      to: "0xe69c250a7D8a2e92b0f1fc3FB29FC64188aA1765",
      token: "0x41f7B8b9b897276b7AAE926a9016935280b44E97",
      amount: ethers.BigNumber.from("59522773"),
      isDeposit: false,
    },
    event
  );

  // https://etherscan.io/tx/0x9fe8bf8ae01790317b92d7bfdb11e735d3db95322129b23f15e1c7f286b8d26a
  // native tokens
  blockNumber = 18136907;
  event = await getEvent(blockNumber);
  assertEqual(
    {
      blockNumber,
      txHash: "0x9fe8bf8ae01790317b92d7bfdb11e735d3db95322129b23f15e1c7f286b8d26a",
      from: "0x3ee18B2214AFF97000D974cf647E7C347E8fa585",
      to: "0x7B7B957c284C2C227C980d6E2F804311947b84d0",
      token: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      amount: ethers.BigNumber.from("1000000000"),
      isDeposit: false,
    },
    event
  );
};

// TODO: Add test when token bridge has `TransferRedeemed` event
// const testCompleteTransferWithPayload = async () => {
//   // https://etherscan.io/tx/0x0d9693d30aad7ec1e990c7f288869204c28e0ca1e0f202163e5ce6c048e3be2d
//   // relayer contract interaction
//   const blockNumber = 18114479;
//   const event = await getEvent(blockNumber);
//   assertEqual(
//     {
//       blockNumber,
//       txHash: "0x0d9693d30aad7ec1e990c7f288869204c28e0ca1e0f202163e5ce6c048e3be2d",
//       from: "0xCafd2f0A35A4459fA40C0517e17e6fA2939441CA",
//       to: "0xc4834d405fE6c3389c050eA058395F764435e852",
//       token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
//       amount: ethers.BigNumber.from("33000000000"),
//       isDeposit: false,
//     },
//     event
//   );
// };

const testAvalanche = async () => {
  let blockNumber;
  let event;
  // https://snowtrace.io/tx/0x71f0028aacdb112eebfed0c45430aeb7ca7229da747c529f5a3cc59feb2e92c7
  // deposit native tokens
  blockNumber = 35173920;
  event = await getEvent(blockNumber, "avalanche");
  assertEqual(
    {
      blockNumber,
      txHash: "0x71f0028aacdb112eebfed0c45430aeb7ca7229da747c529f5a3cc59feb2e92c7",
      from: "0xd493066498aCe409059fDA4c1bCD2E73D8cffE01",
      to: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
      token: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      amount: ethers.BigNumber.from("10000000000000000"),
      isDeposit: true,
    },
    event
  );

  // https://snowtrace.io/tx/0x3841246c0c1f4aa9190cdacddcd3eac6d8bf10562fc2e2b4615484e0694394e6
  // deposit wrapped tokens
  blockNumber = 35174152;
  event = await getEvent(blockNumber, "avalanche");
  assertEqual(
    {
      blockNumber,
      txHash: "0x3841246c0c1f4aa9190cdacddcd3eac6d8bf10562fc2e2b4615484e0694394e6",
      from: "0x31eeE3D36b30E26e733B9e11f112c2cb87AbF618",
      to: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
      token: "0xDfDA518A1612030536bD77Fd67eAcbe90dDC52Ab",
      amount: ethers.BigNumber.from("14000000000000000000"),
      isDeposit: false,
    },
    event
  );

  // https://snowtrace.io/tx/0xead88482980ba53f92d8cc0d498555e57f540c2324efb17ba12210e2ce9b20b3
  // withdraw native tokens
  blockNumber = 35149845;
  event = await getEvent(blockNumber, "avalanche");
  assertEqual(
    {
      blockNumber,
      txHash: "0xead88482980ba53f92d8cc0d498555e57f540c2324efb17ba12210e2ce9b20b3",
      from: "0x0e082F06FF657D94310cB8cE8B0D9a04541d8052",
      to: "0xDc8632F46B9b767B2e5ddF8052e2db0cbb66A27f",
      token: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      amount: ethers.BigNumber.from("6200806850000000000"),
      isDeposit: false,
    },
    event
  );

  // https://snowtrace.io/tx/0x6e39e433bc5c52f15eda43d88d31532ce5c26ad78b592b313892898ce8e22427
  // withdraw wrapped tokens
  blockNumber = 35214701;
  event = await getEvent(blockNumber, "avalanche");
  assertEqual(
    {
      blockNumber,
      txHash: "0x6e39e433bc5c52f15eda43d88d31532ce5c26ad78b592b313892898ce8e22427",
      from: "0x0000000000000000000000000000000000000000",
      to: "0x301371F30d45127E08d0BbE83b870D042089d3e8",
      token: "0x0950Fc1AD509358dAeaD5eB8020a3c7d8b43b9DA",
      amount: ethers.BigNumber.from("7000011"),
      isDeposit: false,
    },
    event
  );
};

const testOptimism = async () => {
  // https://optimistic.etherscan.io/tx/0x1254fa3ef00ccb593fa2e2917e13d06c1b0fb40683102cb1a1951c021d2fa64c
  // deposit native
  let blockNumber = 109289047;
  let event = await getEvent(blockNumber, "optimism");
  assertEqual(
    {
      blockNumber,
      txHash: "0x1254fa3ef00ccb593fa2e2917e13d06c1b0fb40683102cb1a1951c021d2fa64c",
      from: "0xEC3c8F8582AD5CA88e072F6c8cB2FE1BaAeDA4D0",
      to: "0x1D68124e65faFC907325e3EDbF8c4d84499DAa8b",
      token: "0x8B21e9b7dAF2c4325bf3D18c1BeB79A347fE902A",
      amount: ethers.BigNumber.from("42270000000000000000"),
      isDeposit: true,
    },
    event
  );

  // https://optimistic.etherscan.io/tx/0x0aceb4cdce1024236a0cce3ea7632dd26317fec421a3b6ca6baf398c46da79b2
  // deposit wrapped
  blockNumber = 109586447;
  event = await getEvent(blockNumber, "optimism");
  assertEqual(
    {
      blockNumber,
      txHash: "0x0aceb4cdce1024236a0cce3ea7632dd26317fec421a3b6ca6baf398c46da79b2",
      from: "0xbC631Fe26bF28fCcb65f72914cEE92fCEbfBdc23",
      to: "0x0000000000000000000000000000000000000000",
      token: "0xb4B9EEa94D20E8623CC2fb85661E7C94505D3490",
      amount: ethers.BigNumber.from("225000"),
      isDeposit: true,
    },
    event
  );

  // https://optimistic.etherscan.io/tx/0x63f5e45adc5c8f31b192fe2f4435283f5c0cb9b3e01c89c37739a8ca030b81f6#eventlog
  // withdraw native
  blockNumber = 109293169;
  event = await getEvent(blockNumber, "optimism");
  assertEqual(
    {
      blockNumber,
      txHash: "0x63f5e45adc5c8f31b192fe2f4435283f5c0cb9b3e01c89c37739a8ca030b81f6",
      from: "0x1D68124e65faFC907325e3EDbF8c4d84499DAa8b",
      to: "0x822dB2cE4ACEa6744eCe2F1856d103a244B6Ce07",
      token: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      amount: ethers.BigNumber.from("490760019"),
      isDeposit: false,
    },
    event
  );

  // https://optimistic.etherscan.io/tx/0x1eb1c5d1be5d110fc8a171ddaed8a2daf87a267dda38464555244d871affcf88
  // withdraw wrapped
  blockNumber = 109297842;
  event = await getEvent(blockNumber, "optimism");
  assertEqual(
    {
      blockNumber,
      txHash: "0x1eb1c5d1be5d110fc8a171ddaed8a2daf87a267dda38464555244d871affcf88",
      from: "0x0000000000000000000000000000000000000000",
      to: "0x9631288F4050F7CFbf77B77f8540DeCF6cfC7012",
      token: "0x8418C1d909842f458c9394886b83F19d62bF1A0D",
      amount: ethers.BigNumber.from("10000000000000000"),
      isDeposit: false,
    },
    event
  );
};

const testKlaytn = async () => {
  // https://scope.klaytn.com/tx/0xc93f8881c85c552043a7ceaccdf628b5375edf6c6d494c1fe004c692546b096f?tabId=eventLog
  // wrap and transfer
  let blockNumber = 132658037;
  let event = await getEvent(blockNumber, "klaytn");
  assertEqual(
    {
      blockNumber,
      txHash: "0xc93f8881c85c552043a7ceaccdf628b5375edf6c6d494c1fe004c692546b096f",
      from: "0xD23b97041B323176C8b595c85b9851b91922e2a9",
      to: "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
      token: "0xe4f05A66Ec68B54A58B17c22107b02e0232cC817",
      amount: ethers.BigNumber.from("100000000000000000"),
      isDeposit: true,
    },
    event
  );

  // https://scope.klaytn.com/tx/0x392082d7ba1d55529d572ce6c378f851ae85dac13531153ca919adbc6cde4095?tabId=eventLog
  // deposit native
  // approval after transfer event case
  blockNumber = 132737520;
  event = await getEvent(blockNumber, "klaytn");
  assertEqual(
    {
      blockNumber,
      txHash: "0x392082d7ba1d55529d572ce6c378f851ae85dac13531153ca919adbc6cde4095",
      from: "0x2558963300Eb939F5b0d96eF9a4377d2bEF553a6",
      to: "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
      token: "0xCd670d77f3dCAB82d43DFf9BD2C4b87339FB3560",
      amount: ethers.BigNumber.from("20788608176160000000000"),
      isDeposit: true,
    },
    event
  );

  // Not supported
  ////https://scope.klaytn.com/tx/0xcd3f53ae2ee584361f5636810af4e1e5984772c867ee6254319038ac2ebf1943?tabId=tokenTransfer
  //// withdraw wrapped
  //const blockNumber = 132617076;
  //const event = await getEvent(blockNumber, "klaytn");
  //assertEqual(
  //  {
  //    blockNumber,
  //    txHash: "0xcd3f53ae2ee584361f5636810af4e1e5984772c867ee6254319038ac2ebf1943",
  //    from: "0xb763e8b9208a5a0bef08f200cfc76c0d03e7a5a1",
  //    to: "0x5b08ac39EAED75c0439FC750d9FE7E1F9dD0193F",
  //    token: "0x608792deb376cce1c9fa4d0e6b7b44f507cffa6a",
  //    amount: ethers.BigNumber.from("101706297"),
  //    isDeposit: false,
  //  },
  //  event
  //);
};

const testSui = async () => {
  // const events = await adapter["sui"](14_992_284, 16_081_978)
  // console.log(events.length)

  // complete_transfer_with_payload (wrapped)
  // https://suiexplorer.com/txblock/GWgFCab4BqtxXV2mFvMdM5deAkpKUPSqapT1AreoBh4Y
  let checkpoint = 15736900;
  let event = await getEvent(checkpoint, "sui");
  assertEqual(
    {
      blockNumber: checkpoint,
      txHash: "GWgFCab4BqtxXV2mFvMdM5deAkpKUPSqapT1AreoBh4Y",
      from: ethers.constants.AddressZero,
      to: "0xc4c610707eab9b222996b075f7d07c7d9b07766ab7bcafef621fd53bbf089f4e",
      token: "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
      amount: ethers.BigNumber.from("34389000000"),
      isDeposit: false,
    },
    event
  );

  // complete_transfer (native)
  // https://suiexplorer.com/txblock/2XrjjNwGXPzEDdHztJ7kG6E9wijiWK8sfQczhoT1V38Q
  checkpoint = 16007453;
  event = await getEvent(checkpoint, "sui");
  assertEqual(
    {
      blockNumber: checkpoint,
      txHash: "2XrjjNwGXPzEDdHztJ7kG6E9wijiWK8sfQczhoT1V38Q",
      from: "0xc57508ee0d4595e5a8728974a4a93a787d38f339757230d441e895422c07aba9",
      to: "0xd5c67d73166147f6fec91717187651966cc15c5caec2462dbbe380f44b21e87f",
      token: "0x2::sui::SUI",
      amount: ethers.BigNumber.from("10000000"),
      isDeposit: false,
    },
    event
  );

  // transfer_tokens_with_payload (wrapped - not sent to origin chain)
  // https://suiexplorer.com/txblock/EqSqsc9pbo6hRgAhUyjn3nsKU51k6kEHd1v4DVBdvkyz
  checkpoint = 15827121;
  event = await getEvent(checkpoint, "sui");
  assertEqual(
    {
      blockNumber: checkpoint,
      txHash: "EqSqsc9pbo6hRgAhUyjn3nsKU51k6kEHd1v4DVBdvkyz",
      from: "0x161a9493ce468ee0fe56be02fe086eb47b650f76cbc8f7030a8f9b2bbcc7f3ac",
      to: "0xc57508ee0d4595e5a8728974a4a93a787d38f339757230d441e895422c07aba9",
      token: "0xaf8cd5edc19c4512f4259f0bee101a40d41ebed738ade5874359610ef8eeced5::coin::COIN",
      amount: ethers.BigNumber.from("1000000"),
      isDeposit: false,
    },
    event
  );

  // transfer_tokens (wrapped - sent to origin chain)
  // https://suiexplorer.com/txblock/2Dc96jf7PSJeA9kcLxUyTZMsSwsEtTDMrYdabqDpuZAS
  checkpoint = 16005422;
  event = await getEvent(checkpoint, "sui");
  assertEqual(
    {
      blockNumber: checkpoint,
      txHash: "2Dc96jf7PSJeA9kcLxUyTZMsSwsEtTDMrYdabqDpuZAS",
      from: "0xd5c67d73166147f6fec91717187651966cc15c5caec2462dbbe380f44b21e87f",
      to: ethers.constants.AddressZero,
      token: "0xb7844e289a8410e50fb3ca48d69eb9cf29e27d223ef90353fe1bd8e27ff8f3f8::coin::COIN",
      amount: ethers.BigNumber.from("1000000"),
      isDeposit: false,
    },
    event
  );

  // transfer_tokens (native)
  // https://suiexplorer.com/txblock/9ePHxgVdKFoYGnE4nMg3bxiShmYq9yuYKdENEtwDKVwm
  checkpoint = 15991909;
  event = await getEvent(checkpoint, "sui");
  assertEqual(
    {
      blockNumber: checkpoint,
      txHash: "9ePHxgVdKFoYGnE4nMg3bxiShmYq9yuYKdENEtwDKVwm",
      from: "0xbda9efe864e492f5921f30287a10f60287eafdcc82f259a39bb2335fb069a948",
      to: "0xc57508ee0d4595e5a8728974a4a93a787d38f339757230d441e895422c07aba9",
      token: "0x2::sui::SUI",
      amount: ethers.BigNumber.from("2100000000"),
      isDeposit: true,
    },
    event
  );

  console.log("sui tests passed");
};

const sleep = async (ms: number) => await new Promise((resolve) => setTimeout(resolve, ms));

const testSolana = async () => {
  // CompleteNative
  // https://explorer.solana.com/tx/3pEZohiewvkQXxqTGiADrqJjQRJLz3twAtntsmktRSbHkUxXswCkM3XrKEzGaTNxF1jDeK6p726jVheRZJUmrJ1T
  let blockNumber = 220570267;
  let event = await getEvent(blockNumber, "solana");
  assertEqual(
    {
      blockNumber,
      txHash: "3pEZohiewvkQXxqTGiADrqJjQRJLz3twAtntsmktRSbHkUxXswCkM3XrKEzGaTNxF1jDeK6p726jVheRZJUmrJ1T",
      from: "2nQNF8F9LLWMqdjymiLK2u8HoHMvYa4orCXsp3w65fQ2",
      to: "FyUckyjFpEmrG8LiCbQSdwaYYQEytE9VTt2rc4VoRzRK",
      token: "So11111111111111111111111111111111111111112",
      amount: ethers.BigNumber.from("100000"),
      isDeposit: false,
    },
    event
  );
  // sleep so we don't get rate limited
  sleep(5000);

  // CompleteWrapped
  // https://explorer.solana.com/tx/8po9N198xBQUspS1jjgSw96ubNNwhEoCggXiutWcPRmshZUpfwcAoe3gFUzS57WiSfcDsFhaL63LhMZCw89Fymg
  blockNumber = 220548178;
  event = await getEvent(blockNumber, "solana");
  assertEqual(
    {
      blockNumber,
      txHash: "8po9N198xBQUspS1jjgSw96ubNNwhEoCggXiutWcPRmshZUpfwcAoe3gFUzS57WiSfcDsFhaL63LhMZCw89Fymg",
      from: ethers.constants.AddressZero,
      to: "FYoCmjuGAWm9SmkCRfnCEigMP5TPidMrpLzoSgV6xBBa",
      token: "A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM",
      amount: ethers.BigNumber.from("50647953"),
      isDeposit: false,
    },
    event
  );
  sleep(5000);

  // TransferWrapped - target chain != origin chain
  // https://explorer.solana.com/tx/28TbBAgVVwTo6bGCUU6hS4bjCgNREAWMuax6B8nwCA4uT6L1CUhwT65bnMb2Eort7JMXQxGoGNNsK1H6eGQThces
  blockNumber = 220563907;
  event = await getEvent(blockNumber, "solana");
  assertEqual(
    {
      blockNumber,
      txHash: "28TbBAgVVwTo6bGCUU6hS4bjCgNREAWMuax6B8nwCA4uT6L1CUhwT65bnMb2Eort7JMXQxGoGNNsK1H6eGQThces",
      from: "8LS9m7c9SfPFdbnv6jHs5RYWXqzVkxLDcLJNG6j1ntUQ",
      to: "wormDTUJ6AWPNvk59vGQbDvGJmqbDTdgWgAqcLBCgUb",
      token: "A9mUU4qviSctJVPJdBJWkb28deg915LYJKrzQ19ji3FM",
      amount: ethers.BigNumber.from("2109000000"),
      isDeposit: false,
    },
    event
  );
  sleep(5000);

  // TransferNative - WSOL
  // https://explorer.solana.com/tx/61nqe3nxkJ3zCbRuKZ9xAtxb1Rbyc8uBWJbRPVigeUjA7A7dbfATdu4BanP9RniHNNqnUWj2JV6tVnQm28DArU27 (WSOL)
  blockNumber = 219412303;
  event = await getEvent(blockNumber, "solana");
  assertEqual(
    {
      blockNumber,
      txHash: "61nqe3nxkJ3zCbRuKZ9xAtxb1Rbyc8uBWJbRPVigeUjA7A7dbfATdu4BanP9RniHNNqnUWj2JV6tVnQm28DArU27",
      from: "7suUQ9d7jPLCXj9H8472APFbXphC59xoXGnf2AofD7bX",
      to: "2nQNF8F9LLWMqdjymiLK2u8HoHMvYa4orCXsp3w65fQ2",
      token: "So11111111111111111111111111111111111111112",
      amount: ethers.BigNumber.from("100000000"),
      isDeposit: true,
    },
    event
  );
  sleep(5000);

  // CompleteNativeWithPayload
  // https://explorer.solana.com/tx/2i5UpmfW748CxHvYvW6udWwg68C4NhfqGQXNjB8JkwraHtXckP8Xst3AY55YPv4qdjEeKKxY67Gsw2tqM7jLZ9gT
  blockNumber = 218544281;
  event = await getEvent(blockNumber, "solana");
  assertEqual(
    {
      blockNumber,
      txHash: "2i5UpmfW748CxHvYvW6udWwg68C4NhfqGQXNjB8JkwraHtXckP8Xst3AY55YPv4qdjEeKKxY67Gsw2tqM7jLZ9gT",
      from: "2nQNF8F9LLWMqdjymiLK2u8HoHMvYa4orCXsp3w65fQ2",
      to: "DrJjs6ziLYc9En8tq912mwdt5F5gRo9uRkWJRNEG9hDt",
      token: "So11111111111111111111111111111111111111112",
      amount: ethers.BigNumber.from("70000000"),
      isDeposit: false,
    },
    event
  );
  sleep(5000);

  // CompleteWrappedWithPayload
  // https://explorer.solana.com/tx/297Jkp5AJbSFFCw38VvSeYY9kGZLJvWrBsjvaS8kfPdLbqsDUbvdRs3TWjfJV9dwjiU7VA115oWrq2xcKwMTd8SV
  blockNumber = 220139975;
  event = await getEvent(blockNumber, "solana");
  assertEqual(
    {
      blockNumber,
      txHash: "297Jkp5AJbSFFCw38VvSeYY9kGZLJvWrBsjvaS8kfPdLbqsDUbvdRs3TWjfJV9dwjiU7VA115oWrq2xcKwMTd8SV",
      from: ethers.constants.AddressZero,
      to: "Bqun5jc7m16uqVTtJf8sMzJ6qPRc3kjidBKGcUNfxAJy",
      token: "G1vJEgzepqhnVu35BN4jrkv3wVwkujYWFFCxhbEZ1CZr",
      amount: ethers.BigNumber.from("250000000"),
      isDeposit: false,
    },
    event
  );
  sleep(5000);

  // TransferWrappedWithPayload
  // https://explorer.solana.com/tx/2KMyCkFr2v6dxik8V7QR6ny1oJKY7bs2AZqTTXTpwV32aAhBCZC4i5nnXzHaRPaV25JC8BSwwv8t3QPsNUPbugde
  blockNumber = 220549172;
  event = await getEvent(blockNumber, "solana");
  assertEqual(
    {
      blockNumber,
      txHash: "2KMyCkFr2v6dxik8V7QR6ny1oJKY7bs2AZqTTXTpwV32aAhBCZC4i5nnXzHaRPaV25JC8BSwwv8t3QPsNUPbugde",
      from: "4RrFMkY3A5zWdizT61Px222qmSTJqnVszDeBZZNSoAH6",
      to: ethers.constants.AddressZero,
      token: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
      amount: ethers.BigNumber.from("77898286"),
      isDeposit: false,
    },
    event
  );
  sleep(5000);

  // TransferNativeWithPayload
  // https://explorer.solana.com/tx/2x1HP58teKmEYEZNTvQ9wnQEB3XLA8cD5phAqzuQKd6YHzdhkuMo16za6EQKsrB6a2G3s3QhxRh52qnhcFeT34xK
  blockNumber = 219917822;
  event = await getEvent(blockNumber, "solana");
  assertEqual(
    {
      blockNumber,
      txHash: "2x1HP58teKmEYEZNTvQ9wnQEB3XLA8cD5phAqzuQKd6YHzdhkuMo16za6EQKsrB6a2G3s3QhxRh52qnhcFeT34xK",
      from: "DrJjs6ziLYc9En8tq912mwdt5F5gRo9uRkWJRNEG9hDt",
      to: "2nQNF8F9LLWMqdjymiLK2u8HoHMvYa4orCXsp3w65fQ2",
      token: "So11111111111111111111111111111111111111112",
      amount: ethers.BigNumber.from("58000000"),
      isDeposit: true,
    },
    event
  );
  sleep(5000);
};

(async () => {
  await Promise.all([
    testNoEventsFound(),
    testWrapAndTransferEth(),
    testWrapAndTransferEthWithPayload(),
    testTransferTokens(),
    testTransferTokensWithPayload(),
    testCompleteTransferAndUnwrapEth(),
    testCompleteTransferAndUnwrapEthWithPayload(),
    testCompleteTransfer(),
    // testCompleteTransferWithPayload(),
    testAvalanche(),
    testOptimism(),
    testKlaytn(),
    // testSui(),
    // testSolana(),
  ]);
})();
