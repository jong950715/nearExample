const { providers } = require("near-api-js");

async function getState(txHash, accountId) {
  const provider = new providers.JsonRpcProvider(
    "https://rpc.mainnet.near.org"
  );
  const result = await provider.txStatusReceipts(txHash, accountId);
  //provider.sendTransactionAsync
  console.log("Result: ", result);
}

const TX_HASH = "F8WbETKhwckHNDwcyeSe7Ms1ctUSzwb9MCXiMFX96DgM";
const ACCOUNT_ID = "sender.near";
getState(TX_HASH, ACCOUNT_ID);
