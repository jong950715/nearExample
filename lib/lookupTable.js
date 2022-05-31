const fs = require("fs");
const {
  connect,
  keyStores,
  KeyPair,
  Contract,
  WalletAccount,
} = require("near-api-js");

/*
Lookup으로 관리하기 vs 매번 query하기 (e.g. decimals)
*/

const FILE_NAME = "./lib/lookupTable.json";
const LOADED_FILE = JSON.parse(fs.readFileSync(FILE_NAME, "utf8"));

const tokenAddrList = LOADED_FILE["tokenAddrList"];
const poolList = LOADED_FILE["poolList"];

exports.tokenAddrList = tokenAddrList;
exports.poolList = poolList;
