## Portal bridge adapter

### Methodology

The Portal bridge adapter returns `EventData` for transactions in which a token was locked, unlocked, minted, or burned. In the burn and mint case, the `to` and `from` addresses will be set to the Ethereum zero-address. This is so wormhole-wrapped assets aren't included in the volume calculation (where the zero-address gets filtered out). However, when a wormhole-wrapped asset is burned and not transferred to its origin chain, the `to` address is set to the token bridge address so it's included in the volume calculation. This is because wormhole-wrapped assets are never double wrapped and is consistent with DefiLlama's methodology of not double-counting transfers.