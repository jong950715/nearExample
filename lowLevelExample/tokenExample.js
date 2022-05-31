const {
  connect,
  keyStores,
  KeyPair,
  Contract,
  WalletAccount,
} = require("near-api-js");
const { parseSeedPhrase } = require("near-seed-phrase");
// import { getAccountObjBySeedPhrase } from "./walletExample.js";
const { getAccountObjBySeedPhrase } = require("./walletExample");

// async function getPrivateKeyFromSeedPhrase(seedPhrase, accountId) {
//   let res = parseSeedPhrase(seedPhrase);
//   const privateKey = res.secretKey;
//   const keyStore = new keyStores.InMemoryKeyStore();
//   const keyPair = KeyPair.fromString(privateKey);
//   await keyStore.setKey("mainnet", accountId, keyPair); // 실질적으로 async함수 아님.

//   const mainnetConfig = {
//     networkId: "mainnet",
//     keyStore: keyStore,
//     nodeUrl: "https://rpc.mainnet.near.org",
//     walletUrl: "https://wallet.mainnet.near.org",
//     helperUrl: "https://helper.mainnet.near.org",
//     explorerUrl: "https://explorer.mainnet.near.org",
//   };

//   const near = await connect(mainnetConfig);
//   const account = await near.account(accountId);

//   return account;
// }

const main = async () => {
  let privateKey =
    "5s9TkEbZQKgmyGnWRy6xTDQM243heLpyix9eJ1mSmxjKNMp9ULSYfNi8ysSCmneKM9dsywmcC5yCmse4epQbkX4g";
  let seedPhrase =
    "inside symptom egg victory very boy brand edit armor grit turkey rotate";

  const account = await getAccountObjBySeedPhrase(seedPhrase, "dora2.near");

  //잔고 확인하기
  let response = await account.getAccountBalance();
  console.log("\n##잔고 표시##");
  console.log(response);

  //컨트랙트 접근하기
  const usdcContractAddress =
    "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near";
  const usdcContract = new Contract(
    account, // the account object that is connecting
    usdcContractAddress,
    {
      viewMethods: [
        "ft_total_supply",
        "ft_balance_of",
        "ft_metadata",
        "storage_balance_of",
        "storage_balance_bounds",
      ], // view methods do not change state but usually return a value
      changeMethods: ["ft_transfer", "storage_deposit"], // change methods modify state
      sender: account, // account object to initialize and sign transactions.
    }
  );

  //총 공급량 조회 해보기
  response = await usdcContract.ft_total_supply();
  console.log("\n## USDC 총 공급량 ##");
  console.log(response);

  return;
  //특정 유저의 USDC 잔고 확인해보기
  response = await usdcContract.ft_balance_of({ account_id: "dora2.near" });
  console.log("\n## dora2.near의 USDC 잔고 ##");
  console.log(response);

  /*
  참고:
  balance값은 decimals 만큼 10진수 자릿수가 뻥튀기 되어있는 값이다.
  가령 decimals가 6이고, balance가 1000000 (0이 6개)라고 해보자.
  그럼 이 유저의 잔고는 1000000가 아니라 1USDC이다.
  즉 balance/(10**decimals)를 해야 진짜 잔고 이다.
   */

  // metadata에 접근해서 decimals 확인하기
  response = await usdcContract.ft_metadata();
  console.log("\n## USDC의 metadata의 decimals ##");
  console.log(response.decimals);
  const decimals = response.decimals;

  /*
  배경설명
  near에서는 storage사용에 대해서 near를 staking해야한다.
  가령 위의 ft_balance_of는 누가 토큰을 얼마나 가지고 있는지
  에 대해 저장된 storage에서 query해오는 것이다.

  이런 값들을 저장하기 위해서 near staking이 필요하다.
  그래서 near를 staking하지 않은 유저는 토큰을 받는 것 조차 불가능하다.

  backend -> user 에게 보낼때는 체크 해야 하지만,
  client -> tracer에게 보낼때는 체크할 필요 없다.
   */

  // recipient에게 amtUSDC를 전송하는 예제
  const recipient = "dora4.near";
  const amt = 0.1;

  //staking 되어있는지 확인
  response = await usdcContract.storage_balance_of({
    account_id: recipient,
  });
  console.log("\n## dora4의 near staking 확인 ##");
  console.log(response);

  let staked = 0;
  if (response == null) {
    staked = 0;
  } else {
    staked = response.total;
  }

  //staking을 얼마나 요구하는지 확인
  response = await usdcContract.storage_balance_bounds();
  console.log("\n## USDC의 near staking 요구량 확인 ##");
  console.log(response);
  const minStaking = response.min;

  //staking해주기
  needToStake = (parseInt(minStaking) - parseInt(staked)).toString();
  let attachedGAS = "30000000000000"; // typical 30T
  if (needToStake > 0) {
    response = await usdcContract.storage_deposit(
      {
        account_id: recipient,
      },
      attachedGAS,
      needToStake
    );
    console.log("\n## USDC에 near staking 하기 ##");
    console.log(response);
  }
  // 스토리지 생성 완료

  // USDC 전송하기
  let _amt = (amt * 10 ** decimals).toString();
  let depositValue = "1"; // 반드시 딱 1 이어야 함.

  response = await usdcContract.ft_transfer(
    {
      amount: _amt,
      receiver_id: recipient,
      //   memo: null,
    },
    attachedGAS,
    depositValue
  );
  console.log("## USDC 송금 테스트 ##");
  console.log(response);

  /*
  InMemorySigner
  tx전파와 tx사인을 나눌 수 있음. POC 필요.
  https://docs.near.org/docs/tutorials/front-end/naj-examples#offline-transaction-signing-in-3-steps
   */
};

if (require.main === module) {
  main();
}
