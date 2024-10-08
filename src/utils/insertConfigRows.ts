
import { insertConfigEntriesForAdapter } from "./adapter";
import adapters from "../adapters";

async function insertConfigRows(bridgeDbName: string) {
    const adapter = await adapters[bridgeDbName];
    await insertConfigEntriesForAdapter(adapter, bridgeDbName)
}

insertConfigRows("allbridge")
