개발하시는데 필요할 예제들, 내용들 정리해놓았습니다.  
dora2.near에 약간의 near와 usdc 넣어놓았는데, 테스트하시는데 자유롭게 이용하셔도 됩니다.

> dora2 : inside symptom egg victory very boy brand edit armor grit turkey rotate  
> dora3 : stone team heavy scheme dove gym despair expand recipe alley climb promote  
> dora4 : camera legend quiz work disorder alien mistake law clump peasant acquire immense

<br><br>

## Account 접근

1. Account에 seed phrase로 접근하는 방법
2. Account에 private로 접근하는 방법

에 대한 예제는 lowLevelExample/walletExample.js를 참고해주세요.

<br><br>

## 컨트랙트(토큰)와 상호작용하기

NEAR코인과 달리 토큰(TRC, LAND, USDC등)은 컨트랙트로 관리됩니다.  
예를 들어, 특정 account의 잔고는 아래와 같은 key-value store를 통해 관리됩니다.

```rust
pub accounts: LookupMap<AccountId, Balance>
```

그래서 토큰을 보내기 위해서는 컨트랙트에 transfer라는 함수를 호출해야 합니다.  
이 과정은 URL에 API를 호출하는 것과 크게 다르지 않습니다.  
그저 토큰 컨트랙트 주소(URL)에 ABI(API)를 호출할 뿐 입니다.

이와 관련된 예제는 lowLevelExample/tokenExample.js를 참고해주세요.

<br><br>

## RPC노드란?

RPC는 Remote Procedure Call의 줄임말 입니다.

쉽게 표현하자면, 직접 블록체인 네트워크 노드를 운영하는 것에는 큰 어려움이 따르니, 블록체인 네트워크 노드를 운영하는 주체가 API를 열어서 client와 블록체인 네트워크 사이에서 중계의 역할을 해주는 노드를 의미합니다.

그래서 우리는 RPC노드와 API로 상호작용함으로써 블록체인에 간접적으로 접근하게 됩니다. 이하는 RPC노드와 관련된 내용 입니다.

<br><br>

## Tx전송 Async vs Await

[async, await차이 참고]("https://docs.near.org/docs/api/rpc/transactions#send-transaction-async")  
async는 그냥 tx을 보내는 것이고,  
await은 tx의 결과를 response해줍니다. (10초 timeout)  
백엔드에서 await을 쓰고자 리서치 하였습니다.

Contract 클래스를 쭉 따라가다 보면 아래와 같은 흐름으로 API를 호출합니다.<br>

> 1.  Contract.\_changeMethod()<br>
> 2.  Account.functionCall()<br>
> 3.  Account.functionCallV2()<br>
> 4.  Account.signAndSendTransaction()<br>
> 5.  Account.signAndSendTransactionV2()<br>
> 6.  JsonRpcProvider.sendTransaction()<br>
> 7.  JsonRpcProvider.sendTransaction()<br>
> 8.  JsonRpcProvider.sendJsonRpc(**'broadcast_tx_commit'**, )<br>

확인결과 기본적으로 broadcast_tx_commit(await) api를 호출합니다.

<br><br>

## Timeout시 Response

json-rpc-provider.js의 sendJsonRpc 함수(303줄)를 참고해주세요.  
try-catch의 336줄 참고해주세요.

null을 return하는 것 같습니다.

<br><br>

## RPC노드에 tx query polling 하기.

lowLevelExample/queryTxExample.js를 참고해주세요.

<br><br>

## 라이브러리

좀 더 쉬운 사용을 위해 라이브러리화 하였습니다.  
JS를 써본적이 없어서 모듈화나 코드최적화가 전혀 되어있지 않습니다.  
이 점 유의해서 봐주세요.  
lib/\* 참고해주세요.

<br><br><br>

[참고자료1 js]("https://docs.near.org/docs/develop/front-end/near-api-js")  
[참고자료2 rpc]("https://docs.near.org/docs/api/rpc")
