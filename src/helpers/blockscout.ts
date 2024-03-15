const axios = require("axios");

const endpoints = {
    manta: "https://pacific-explorer.manta.network/api/v2",
    // mantle: "https://pacific-explorer.manta.network/api/v2",
    rootstock: "",
} as { [chain: string]: string };