import fetch from "node-fetch";
import retry from "async-retry";

export const getItsTokens = () =>
  retry(() =>
    fetch("https://api.axelarscan.io/api/getITSAssets", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then((res) => res.json())
  );


  //  TODO
  // custom tokens dont seem to be getting queried for example token from this tx
  // https://axelarscan.io/gmp/0x83d2af2f18c63349d755ce2f3fd3ff4a7990ebd0e61458200f60504e198c843d