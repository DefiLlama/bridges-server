import { ethers } from "ethers";
import { Chain } from "@defillama/sdk/build/general";
import { axelarGatewayAddresses, squidRouterAddresses, coralAddress } from "./constants";
import { getTxDataFromEVMEventLogs } from "../../helpers/processTransactions";
import { constructGatewayDepositParams, constructGatewayWithdrawalParams, constructCoralDepositParams, constructCoralWithdrawalParams } from "./index";

async function testTransaction(chain: string, blockNumber: number, description: string) {
    console.log(`\nTesting ${description} at block ${blockNumber} on ${chain}...`);
    
    // Test Gateway events
    console.log("\nTesting Gateway events...");
    const gatewayParams = [
        constructGatewayDepositParams([], chain),
        constructGatewayWithdrawalParams([], chain)
    ].map(params => ({...params, target: axelarGatewayAddresses[chain]}));

    const gatewayTxs = await getTxDataFromEVMEventLogs(
        "squid",
        chain as Chain,
        blockNumber,
        blockNumber,
        gatewayParams
    );
    
    // Test Coral events
    console.log("\nTesting Coral events...");
    const coralParams = [
        constructCoralDepositParams(chain),
        constructCoralWithdrawalParams(chain)
    ];

    const coralTxs = await getTxDataFromEVMEventLogs(
        "squid",
        chain as Chain,
        blockNumber,
        blockNumber,
        coralParams
    );

    return {
        gateway: gatewayTxs || [],
        coral: coralTxs || []
    };
}

async function testAdapter() {
    try {
        // Test Base withdrawal
        const baseResults = await testTransaction("base", 22583300, "withdrawal transaction");
        console.log("\nBase results:");
        console.log("Gateway transactions:", baseResults.gateway.length);
        console.log("Coral transactions:", baseResults.coral.length);
        if (baseResults.gateway.length > 0) console.log("Gateway transaction:", baseResults.gateway[0]);
        if (baseResults.coral.length > 0) console.log("Coral transaction:", baseResults.coral[0]);

        // Test Arbitrum deposit
        const arbitrumResults = await testTransaction("arbitrum", 275845658, "deposit transaction");
        console.log("\nArbitrum results:");
        console.log("Gateway transactions:", arbitrumResults.gateway.length);
        console.log("Coral transactions:", arbitrumResults.coral.length);
        if (arbitrumResults.gateway.length > 0) console.log("Gateway transaction:", arbitrumResults.gateway[0]);
        if (arbitrumResults.coral.length > 0) console.log("Coral transaction:", arbitrumResults.coral[0]);

    } catch (error) {
        console.error("Error in test:", error);
    }
}

console.log("Test starting...");
testAdapter()
    .then(() => console.log("\nTest completed"))
    .catch(console.error);