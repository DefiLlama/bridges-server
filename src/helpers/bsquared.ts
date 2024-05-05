export const checkBsquaredRpc = () => {
    if (!process.env.BSQUARED_RPC) {
        process.env.BSQUARED_RPC = "https://rpc.bsquared.network";
    }
};
