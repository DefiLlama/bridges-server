
import { insertConfigEntriesForAdapter } from "./adapter";
import adapters from "../adapters";
import { isAsyncAdapter } from "../utils/adapter";

async function insertConfigRows(bridgeDbName: string) {
    let adapter = adapters[bridgeDbName];
    adapter = isAsyncAdapter(adapter) ? await adapter.build() : adapter;
    await insertConfigEntriesForAdapter(adapter, bridgeDbName)
}

insertConfigRows("allbridge")
