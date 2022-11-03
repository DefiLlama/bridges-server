import bridgeNetworks from "./bridgeNetworkData"


export const importBridgeNetwork = (bridgeDbName?: string, bridgeNetworkId?: number) => {
    if (bridgeDbName) {
    return bridgeNetworks.filter((bridgeNetwork) => bridgeNetwork.bridgeDbName === bridgeDbName)[0];
    }
    if (bridgeNetworkId) {
        return bridgeNetworks.filter((bridgeNetwork) => bridgeNetwork.id === bridgeNetworkId)[0];
    }
    return null
}
