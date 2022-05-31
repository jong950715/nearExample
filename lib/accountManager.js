const { connect, keyStores, KeyPair } = require("near-api-js");
const { parseSeedPhrase } = require("near-seed-phrase");

async function getDummyAccount() {
  //for test
  let seedPhrase =
    "inside symptom egg victory very boy brand edit armor grit turkey rotate";
  const account = await getAccountObjBySeedPhrase(seedPhrase, "dora2.near");

  return account;
}
async function getAccountObjBySeedPhrase(seedPhrase, accountId) {
  const privateKey = getPrivateKeyFromSeedPhrase(seedPhrase);
  return getAccountObjByPrivateKey(privateKey, accountId);
}

async function getAccountObjByPrivateKey(privateKey, accountId) {
  const near = await getNearObjByPrivateKey(privateKey, accountId);
  const account = await near.account(accountId);
  return account;
}

async function getNearObjByPrivateKey(privateKey, accountId) {
  const keyStore = await getKeyStoreByPrivateKey(privateKey, accountId);
  const mainnetConfig = {
    networkId: "mainnet",
    keyStore: keyStore,
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://wallet.mainnet.near.org",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://explorer.mainnet.near.org",
  };

  const near = await connect(mainnetConfig);

  return near;
}

async function getKeyStoreByPrivateKey(privateKey, accountId) {
  const keyStore = new keyStores.InMemoryKeyStore();
  const keyPair = KeyPair.fromString(privateKey);
  await keyStore.setKey("mainnet", accountId, keyPair); // 실질적으로 async함수 아님.

  return keyStore;
}

function getPrivateKeyFromSeedPhrase(seedPhrase) {
  let res = parseSeedPhrase(seedPhrase);

  return res.secretKey;
}

exports.getAccountObjBySeedPhrase = getAccountObjBySeedPhrase;
exports.getDummyAccount = getDummyAccount;
