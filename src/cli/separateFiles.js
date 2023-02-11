const axios = require("axios");
const retry = require("async-retry");
const { writeFileSync } = require("fs");

async function main(){
    const recordedBlocks = (
        await retry(
          async (_bail) =>
            await axios.get("https://llama-bridges-data.s3.eu-central-1.amazonaws.com/recordedBlocks.json")
        )
      ).data;
    const names = new Set(Object.keys(recordedBlocks).map(k=>k.split(":")[0]))
    for(const name of names){
        const data = Object.fromEntries(Object.entries(recordedBlocks).filter(([k])=>k.startsWith(name)))
        writeFileSync(`blocks-${name}.json`, JSON.stringify(data))
    }
}
main()