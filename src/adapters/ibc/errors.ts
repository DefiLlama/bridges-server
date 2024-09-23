class LatestBlockNotFoundError extends Error {
    constructor(zoneId: string) {
        super(`Latest block not found for ${zoneId}`);
    }
}