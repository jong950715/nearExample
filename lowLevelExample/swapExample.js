const { Contract } = require("near-api-js");
const { getAccountObjBySeedPhrase } = require("./walletExample");

const main = async () => {
  let seedPhrase =
    "inside symptom egg victory very boy brand edit armor grit turkey rotate";
  const account = await getAccountObjBySeedPhrase(seedPhrase, "dora2.near");

  //컨트랙트 접근하기

  response = await usdcContract.ft_metadata();
  console.log("\n## USDC의 metadata의 decimals ##");
  console.log(response.decimals);
  const decimals = response.decimals;

  // USDC -> wNEAR 스왑하기
  const amt = 1;
  let _amt = (amt * 10 ** decimals).toString();
  let depositValue = "1"; // 반드시 딱 1 이어야 함.

  let msg = {};
  msg["force"] = 0;
  msg["actions"] = [
    {
      pool_id: 3, // pool의 인덱스
      token_in: "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near", // 넣는 토큰 addr
      token_out: "wrap.near", // 받는(나오는) 토큰 addr
      amount_in: _amt, // 넣는 토큰 amt
      min_amount_out: "0", // 최소 받아야할 수량(안되면 거래 취소 시킬 수량)
    },
  ];

  msg = JSON.stringify(msg);

  //   console.log(msg);
  let attachedGAS = "50000000000000"; // 50T
  response = await usdcContract.ft_transfer_call(
    {
      receiver_id: "v2.ref-finance.near", // swap 컨트랙트 addr
      amount: _amt,
      msg,
    },
    attachedGAS,
    depositValue
  );
  console.log("## USDC -> wNear 스왑 테스트 ##");
  console.log(response);
};

function getTokenObj(name) {
  const tokenContractAddress =
    "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near";
  const tokenContract = new Contract(
    account, // the account object that is connecting
    tokenContractAddress,
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

if (require.main === module) {
  main();
}
