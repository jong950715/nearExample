//https://github.com/ref-finance/ref-contracts/tree/main/ref-exchange/src
const { poolList } = require("./lookupTable");
const { getTokenInfos, getTokenObj } = require("./tokenManager");
const {
  connect,
  keyStores,
  KeyPair,
  Contract,
  WalletAccount,
} = require("near-api-js");

async function swap(account, from, to, fromAmt) {
  const tokenObj = await getTokenObj(account, from);

  const _from = (await getTokenInfos())[from];
  const _to = (await getTokenInfos())[to];

  const decimals = _from["decimals"];

  const poolId = await getPoolId(_from["addr"], _to["addr"]);

  // USDC -> wNEAR 스왑하기
  let _amt = (fromAmt * 10 ** decimals).toString();
  let depositValue = "1"; // 반드시 딱 1 이어야 함.
  let msg = {
    force: 0,
    actions: [
      {
        pool_id: poolId, // pool의 인덱스
        token_in: _from["addr"], // 넣는 토큰 addr
        token_out: _to["addr"], // 받는(나오는) 토큰 addr
        amount_in: _amt, // 넣는 토큰 amt
        min_amount_out: "0", // 최소 받아야할 수량(안되면 거래 취소 시킬 수량)
      },
    ],
  };

  msg = JSON.stringify(msg);

  //   console.log(msg);
  let attachedGAS = "100000000000000"; // 100T
  response = await tokenObj.ft_transfer_call(
    {
      receiver_id: "v2.ref-finance.near", // swap 컨트랙트 addr
      amount: _amt,
      msg,
    },
    attachedGAS,
    depositValue
  );
}
async function getSwapContract(addr) {
  const swapContract = new Contract(
    addr, // the account object that is connecting
    "v2.ref-finance.near",
    {
      viewMethods: ["get_pools", "get_pool"], // view methods do not change state but usually return a value
      changeMethods: [], // change methods modify state
      sender: addr, // account object to initialize and sign transactions.
    }
  );

  return swapContract;
}

let POOL_INFOS = null;
async function getPoolInfos() {
  if (POOL_INFOS != null) {
    return POOL_INFOS;
  }
  const { getDummyAccount } = require("./accountManager");
  const account = await getDummyAccount();

  const swapContract = await getSwapContract(account);

  let res = {};
  for (var _id of poolList) {
    let response = await swapContract.get_pool({ pool_id: _id });
    let _addr0 = response["token_account_ids"][0];
    let _addr1 = response["token_account_ids"][1];

    if (_addr0 > _addr1) {
      tmp = _addr0;
      _addr0 = _addr1;
      _addr1 = tmp;
    }

    if (!(_addr0 in res)) {
      res[_addr0] = {};
    }

    res[_addr0][_addr1] = {
      id: _id,
    };
  }

  POOL_INFOS = res;
  return POOL_INFOS;
}

async function getPoolId(addr1, addr2) {
  poolInfos = await getPoolInfos();

  if (addr1 > addr2) {
    tmp = addr1;
    addr1 = addr2;
    addr2 = tmp;
  }

  return poolInfos[addr1][addr2]["id"];
}

async function main() {
  const { getDummyAccount } = require("./accountManager");
  const account = await getDummyAccount();

  swap(account, "USDC", "wNEAR", 1);
  return;
  let res = await getPoolId(
    "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
    "wrap.near"
  );
  console.log(res);

  res = await getPoolId(
    "wrap.near",
    "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near"
  );
  console.log(res);
}

if (require.main === module) {
  main();
}
