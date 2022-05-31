//https://github.com/near/near-sdk-rs/tree/master/near-contract-standards/src/fungible_token
const { tokenAddrList } = require("./lookupTable");
const {
  connect,
  keyStores,
  KeyPair,
  Contract,
  WalletAccount,
} = require("near-api-js");

async function getTokenObj(account, symbolOrAddr) {
  const infos = await getTokenInfos();
  if (symbolOrAddr in infos) {
    return _getTokenObj(account, infos[symbolOrAddr]["addr"]);
  } else {
    return _getTokenObj(account, symbolOrAddr);
  }
}

function _getTokenObj(account, tokenAddr) {
  const tokenContract = new Contract(
    account, // the account object that is connecting
    tokenAddr,
    {
      viewMethods: [
        "ft_total_supply",
        "ft_balance_of",
        "ft_metadata",
        "storage_balance_of",
        "storage_balance_bounds",
      ], // view methods do not change state but usually return a value
      changeMethods: ["ft_transfer", "storage_deposit", "ft_transfer_call"], // change methods modify state
      sender: account, // account object to initialize and sign transactions.
    }
  );

  return tokenContract;
}

let TOKEN_INFOS = null;
async function getTokenInfos() {
  if (TOKEN_INFOS != null) {
    return TOKEN_INFOS;
  }

  const { getDummyAccount } = require("./accountManager");
  const account = await getDummyAccount();

  let res = {};
  for (const addr of tokenAddrList) {
    tokenContract = _getTokenObj(account, addr);
    response = await tokenContract.ft_metadata();
    res[response["symbol"]] = {
      symbol: response["symbol"],
      decimals: response["decimals"],
      addr: addr,
    };
  }

  TOKEN_INFOS = res;

  return TOKEN_INFOS;
}

const main = async () => {
  const { getDummyAccount } = require("./accountManager");
  const account = await getDummyAccount();

  console.log(tokenAddrList);

  console.log(await getTokenInfos());

  token = await getTokenObj(account, "USDC");
  console.log(await token.ft_total_supply());
};

if (require.main === module) {
  main();
}

exports.getTokenObj = getTokenObj;
exports.getTokenInfos = getTokenInfos;
