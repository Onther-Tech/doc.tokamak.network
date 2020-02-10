---
id: child-chain
title: 자식체인
sidebar_label: 자식체인
---

## 오퍼레이터, 사용자, 챌린저

### 오퍼레이터
**오퍼레이터(Operator)**는 자식체인을 운영하는 주체이다. 사용자들의 트랜잭션들을 블록 단위로 모아 실행하며, 이러한 블록들을 루트체인 컨트랙트에 제출한다. 오퍼레이터는 누구나 될 수 있으며, 하나의 자식체인에서 단일 혹은 다수의 오퍼레이터 모두 구성 가능하다. 

### 사용자
**사용자(User)**는 오퍼레이터가 운영하는 자식체인을 사용하는 주체이며, 루트체인과 자식체인간에 자산과 상태를 이동시키는 주체이다. 사용자는 직접 노드를 운영하여 오퍼레이터의 자식체인 운영을 감시할 수 있으며, 문제가 발견될 경우 해당 자식체인에서 탈출하거나 챌린저가 되어 자산 안전성을 보장받을 수 있다.

### 챌린저
**챌린저(Challenger)**는 사전에 정의된 규칙에 어긋나는 행동을 오퍼레이터나 사용자가 범했을 경우 챌린지를 신청하여 이를 바로잡는 역할을 수행한다. 챌린저가 되기 위한 조건은 별도로 존재하지 않으며, 누구나 챌린저가 될 수 있다.


## 블록과 에폭
자식체인의 블록은 세가지 종류의 블록으로 구성된다.

- **비요청블록(Non-Request Block; NRB)**
- **요청블록(Request Block; RB)**
- **탈출블록(Escape Block; EB)**

**비요청블록**은 기존의 일반적인 블록과 동일하다. 사용자들의 일반적인 트랜잭션들을 포함한다. 

**요청블록**은 말 그대로 오직 [요청](child-chain#요청)만을 처리하는 블록이다. Enter 및 Exit 요청들이 처리된다. 

**탈출블록**은 매우 특수한 상황에서만 생성되는 블록이다. [Continuous Rebase](continuous-rebase)의 경우 사용자들이 데이터 가용성을 확인하여 문제가 있을 경우 주기적으로 자식체인으로부터 탈출할 수 있는 기간을 제공하는데, 만약 이 때 사용자들이 탈출 요청(escape request)을 루트체인 컨트랙트에 제출하게 되면 탈출 블록이 생성되게 된다.

**에폭(epoch)**은 여러개의 블록을 포함하는 하나의 주기이다. 에폭도 포함되는 블록의 종류에 따라 다음과 같이 3가지 종류의 에폭으로 구성된다.

- **에폭비요청에폭(Non-Request Epoch; NRE)**
- **요청에폭(Request Epoch; RE)**
- **탈출에폭(Escape Epoch; EE))**

**에폭의 길이(length)**는 해당 에폭에 포함된 블록의 수를 의미하며, 비요청에폭의 길이는 사전에 상수로 정의되기 때문에 변경되지 않는다. 요청에폭과 탈출에폭의 경우 사용자들의 제출한 요청 수에 따라 에폭에 포함되는 블록의 수가 달라질 수 있으므로 그 길이는 가변적인 변수가 된다. 

단, 제네시스(genesis) 블록은 0번째 비요청에폭이며, 해당 에폭의 길이는 항상 1이다.


## 블록 제출
오퍼레이터는 자식체인을 운영하며 블록을 루트체인 컨트랙트에 제출하게 된다. 이 때 루트체인 컨트랙트는 다음과 같이 오퍼레이터가 어느 종류의 에폭을 제출해야 하는지 지정하여 자식체인의 트랜잭션과 루트체인 컨트랙트에 제출된 요청들을 반영하게 된다.

- NRE#0 이후에 NRE#1이 위치한다.
- NRE#N 이후에는 항상 RE#N+1 이 위치한다. 마찬가지로 RE#N 이후엔 NRE#N+1이 위치한다.
- 현재 에폭이 NRE#N 혹은 RE#N+1 일 때 제출된 요청은 RE#N+3에 반영된다. 만약 요청이 존재하지 않는다면 해당 RE의 길이는 0이다.

요약하자면 비요청에폭 이후에는 요청에폭, 요청에폭 이후에는 비요청에폭이 오는 것이 기본적인 규칙이며, 요청은 바로 즉시 다음 요청 에폭에 포함되는 것이 아니라 그 다음 요청 에폭에 포함된다는 것이다.

![simple rootchain](assets/learn_advanced_simple_rootchain.png)

루트체인 컨트랙트는 위 그림과 같이 두 종료의 블록을 제출 받기 위해 주기적으로 `AcceptNRB`, `AcceptRB` 상태로 변경된다. `AcceptNRB`는 오직 비요청블록만 제출될 수 있는 상태를 의미하며, `AcceptRB`는 요청블록만 제출될 수 있는 상태를 의미한다. 오퍼레이터는 이렇게 루트체인 컨트랙트의 상태에 따라 요청블록 혹은 비요청블록을 제출해야 한다. 여기서 유의해야 할 점은 설명의 편의를 위해 [Continuous Rebase](continuous-rebase)에서 다루는 탈출 블록을 포함하지 않고 있다는 것이다.

오퍼레이터는 블록을 제출할 때 세 종류의 머클루트(merkle root)값인 `stateRoot`, `transactionsRoot`, `receiptsRoot`를 제출한다. 단, `transactionsRoot`만 제출하는 것이 가능한 상황도 있는데, 자세한 내용은 [Continuous Rebase](continuous-rebase)에서 다룬다.


## 요청과 요청 트랜잭션


### 요청
**요청(request)**는 사용자가 루트체인과 자식체인간에 자산 혹은 상태를 이동하기 위해 루트체인 컨트랙트에 제출하는 요청이다. 요청은 다음과 같은 4가지 종류로 나누어진다.

- 진입요청(enter request): 루트체인에서 자식체인으로 자산이나 상태를 이동시키는 요청이다.
- 퇴장요청(exit request): 자식체인에서 루트체인으로 자산이나 상태를 이동시키는 요청이다.
- 탈출요청(escape request): 자식체인에서 루트체인으로 자산과 상태를 탈출시키고자 하는 요청이다. 데이터 가용성 문제가 발생되었을 경우 사용된다.
- 무효요청(undo request): 데이터 가용성 문제가 발생했을 때, 이미 제출한 진입 요청을무효로 하기 위해 사용되는 요청이다.

이 때, 진입요청과 탈출요청은 요청블록에 포함되고, 탈출요청과 무효요청은 탈출블록에 포함된다.

모든 요청은 다음과 같은 파라미터로 구성된다.

- `requestor`: 요청을 제출한 어카운트
- `to`: 루트체인에 배포된 요청가능한 컨트랙트의 주소
- `trieKey`: 요청의 식별자
- `trieValue`: 요청의 값


### 요청 트랜잭션
요청은 자식체인에서 **요청 트랜잭션(request transaction)**의 형태로 반영된다. 요청 트랜잭션은 다음과 같이 구성된다.

- `sender`: 널-계정(NULL_ADDRESS)
- `to`: 자식 체인에 배포된 요청가능한 컨트랙트의 주소
- `value`: 0
- `function signature`: 요청가능한 컨트랙트의 함수를 호출하기 위한 function signature
- `parameters`: 요청가능한 컨트랙트의 함수를 호출하기 위한 파라미터

이 때 널-계정(NULL_ADDRESS)은 비밀키가 없으며 `0x00`을 주소로 갖는 어카운트를 의미한다. 이는 요청이 포함된 블록은 누구나 마이닝할 수 있음을 의미한다. 요청들은 모두 루트체인 컨트랙트에 제출되므로 오퍼레이터가 더 이상 자식체인을 운영하지 않더라도 사용자들은 요청을 제출하고 이를 직접 마이닝할 수 있다.

### 요청가능한 컨트랙트
**요청가능한 컨트랙트(requestable contract)**는 말 그대로 요청을 반영할 수 있는 컨트랙트로, 루트체인과 자식체인에 동일하게 배포된다. 요청가능한 컨트랙트는 다음과 같은 인터페이스가 구현하여 모든 요청들을 반영할 수 있어야 한다. 

```solidity
interface Requestable {
  function applyEnter(bool isRootChain,uint256 requestId,address requestor,bytes32 trieKey,bytes trieValue)
    external returns (bool success);

  function applyExit(bool isRootChain,uint256 requestId,address requestor,bytes32 trieKey,bytes trieValue)
    external returns (bool success);

  function applyEscape(bool isRootChain,uint256 requestId,address requestor,bytes32 trieKey,bytes trieValue)
    external returns (bool success);

  function applyUndo(bool isRootChain,uint256 requestId,address requestor,bytes32 trieKey,bytes trieValue)
    external returns (bool success);
}
```


### 진입요청 반영
루트체인 컨트랙트는 다음과 같은 순서로 진입 요청을 각 체인에 배포된 요청가능한 컨트랙트에 반영한다.

![apply enter](assets/learn_advanced_enter.png)

1. 사용자는 루트체인 컨트랙트에 `RootChain.startEnter()`를 호출하는 트랜잭션을 전송한다.
2. 루트체인 컨트랙트는 진입요청을 루트체인의 요청가능한 컨트랙트에 반영한다. 만약 이 과정에서 트랜잭션이 실패(reverted)된다면 진입요청은 생성되지 않는다.
3. 2가 올바르게 진행되었다면, 루트체인 컨트랙트는 새로운 진입요청이 생성되었음을 기록한다.
4. 요청에폭에서 오퍼레이터는 여러개의 요청 트랜잭션들을 포함하는 요청 블록을 마이닝한다.
5. 3에서 생성된 진입요청이 반영된 요청 트랜잭션이 자식체인의 요청가능한 컨트랙트에 반영된다.



### 퇴장요청 반영
루트체인 컨트랙트는 다음과 같은 순서로 퇴장 요청을 각 체인에 배포된 요청가능한 컨트랙트에 반영한다.

![apply exit](assets/learn_advanced_exit.png)

1. 사용자는 루트체인 컨트랙트로 `RootChain.startExit()`를 호출하는 트랜잭션을 전송한다.
2. 진입요청과는 다르게 퇴장요청은 루트체인 컨트랙트에 즉각적으로 기록되고 요청 트랜잭션의 형태로 요청블록에 포함된다.
3. 요청블록에에 대한 챌린지 기간이 종료된 이후 해당 퇴장요청에 대한 챌린지 기간이 시작된다. 만약 2의 요청 트랜잭션의 실행이 실패했다면 챌린저는 이에 대해 `RootChain.challengeExit()` 함수를 통해 [챌린지](#challenge)할 수 있다.
4. 만약 3에서 챌린지 기간이 챌린지 없이 종료되었다면 사용자는 `RootChain.finalizeRequest()`를 호출하여 퇴장요청을 완결(finalize)하게 된다. 이를 통해 퇴장요청은 루트체인에 배포된 요청가능한 컨트랙트에 반영된다.

핵심은 진입요청의 경우 먼저 루트체인에서 반영한 후에 자식체인에 반영하는 것이고, 퇴장요청의 경우 먼저 자식체인에서 반영하고 문제가 없을 경우에만 루트체인에 반영한다는 것이다.

### 탈출 및 무효 요청 반영
탈출요청과 무효요청은 퇴장요청과 동일한 방식으로 처리되지만, 요청 트랜잭션들이 요청 블록이 아닌 탈출 블록에서 처리된다는 점에서 차이가 있다. 자세한 내용은 [Continuous Rebase](continuous-rebase)를 참고하라.



![request and challenge](assets/learn_advanced_request_and_challenge.png)



## 챌린지
챌린저는 자식체인에 문제가 발생했을 경우 챌린지를 신청하여 자식체인의 정상적인 운영을 강제할 수 있다. 챌린저가 신청할 수 있는 챌린지의 종류는 총 세가지로 다음과 같이 구성된다.

### 널-계정 챌린지
널-계정 챌린지(NULL_ADDRESS challenge)는 비요청블록에 NULL-ADDRESS가 `sender`인 트랜잭션이 포함되었을 경우 제출하는 챌린지이다. 이러한 트랜잭션은 요청 트랜잭션을 의미하므로 요청블록이나 탈출블록이 아닌 비요청블록에 포함되어서는 안된다. 

챌린저는 루트체인 컨트랙트에 제출된 비요청블록의 `transactionsRoot`에 요청 트랜잭션이 포함되었음을 머클증명(merkle proof)를 통해 증명하게 된다.

### 퇴장 챌린지
퇴장 챌린지(exit challenge)는 퇴장요청이나 탈출요청이 올바르지 않을 경우 제출하는 챌린지아다. 올바르지 않은 퇴장 혹은 탈출 요청은 자식체인에서 실행이 취소되는데, 이 경우 해당 요청들은 루트체인 컨트랙트에서 삭제되어 루트체인에 반영되지 않아야 한다. 

챌린저는 실행결과가 취소된 요청 트랜잭션을 머클 증명을 통해 증명한다. 단, 퇴장 챌린지를 진행하기 위해서는 대상 퇴장요청이나 탈출요청이 반드시 확정되어야만 한다. 그렇지 않을 경우 오퍼레이터의 공격행위로 인해 실제로는 취소되지 않아야 할 요청 트랜잭션이 취소된 것으로 잘못 실행될 수 있기 때문이다.

### 연산 챌린지
연산 챌린지(computation challenge)는 오퍼레이터가 제출한 모든 종류의 블록에 대해 트랜잭션이 올바르게 실행되지 않았을 경우 제출하는 챌린지이다. 오퍼레이터가 잘못된 `stateRoot`를 제출하면, `blockData`, `preStateRoot`, `postStateRoot`를 바탕으로 truebit 방식의 검증 게임(verification game)과 같은 방법을 통해 챌린지 될 수 있다.

![verification game](assets/learn_advanced_verification_game.png)

### 검증게임
truebit이 제안한 검증게임(verification game)의 마지막 단계는 이더리움에서 연산을 한 번 수행하고 실제 output과 예상 output을 비교하는 방법을 사용한다. Plasma EVM은 Ohalo Limited와 Parsec Labs에서 구현해 왔던 EVM 내부에서 EVM을 실행하는 스마트 컨트랙트인 [solEVM](https://github.com/Onther-Tech/solEVM)을 사용하여 연산 결과를 검증한다.


## 스태미나

**스태미나(Stamina)**는 자식체인에서 **위임계정(delegator)**이 본 트랜잭션 실행 모델을 구동시킬 때 필요한 가스비를 **수임계정(delegatee)**에게 청구할 때 사용된다. 즉 위임계정(delegator)의 가스비를 수임계정(delegatee)이 스태미나(Stamina)의 형태로 구매하여 위임계정의 가스비 부담을 대신하게 된다. 스태미나는 스태미나 컨트랙트(Stamina contract)에 계정 잔액(state balance)을 예치(deposit)함으로써 얻을 수 있는데, 수임계정의 스태미나를 예치한 계정을 **예치 계정(depositor account)**이라 부른다.

수임계정의 스태미나는 위임계정의 가스비를 구매 하면서 차감된다. 차감된 스태미나는 영원히 사라지는 것이 아니라 일정 기간이 지나면 **회복(recover)**된다. 스태미나가 회복 되기 위해서는 일정 기간이 필요한데, 이 기간을 **회복 기간(RECOVERY LENGTH)**이라 부르고, 다음 기간에서 수임계정에 총 예치된 양만큼의 스태미나가 새롭게 충전된다.

### 위임계정 지정

수임 계정(delegatee)은 위임 계정(delegator)을 지정할 수 있다. 오직 수임 계정(delegatee)만 위임 계정(delegator)을 지정할 수 있으며, 이 반대로 위임계정(delegator)은 수임 계정(delegatee)을 지정할 수 없다. 더해서 수임 계정(delegatee)은 여럿의 위임 계정(delegator)을 지정할 수 있다.

수임계정이 위임계정을 지정하게 되면 **쌍(pair)**이 형성되는데 이를 **스태미나 쌍(stamina pair)** 또는 **수수료 위임 쌍(fee-delegate pair)**이라 부른다. 수임계정(delegatee)는 위임계정(delegator)을 지정하기 위해서 스테미나 컨트랙트의 `setDelegator()` 함수를 호출한다.

### **스테미나 증감**

수임계정은 위임계정의 가스비를 구매하기 위해서 스태미나가 필요하다. 수임계정은 가지고 있는 스태미나의 양만큼 위임계정의 가스비를 대신 부담할 수 있다. 수임계정의 스태미나 소모량은 위임계정의 수 또는 트랜잭션 가스비와 비례할 가능성이 높다. 따라서 예치계정은 위임계정의 수와 트랜잭션 가스비에 맞게 수임계정의 스태미나를 늘리거나 줄일 것이다.

스태미나를 늘리기 위해서 예치계정(depositor)은 스태미나 컨트랙트의 `deposit()` 함수를 호출해야 한다. 예치계정은 예치할 만큼의 계정잔액을 예치하고 수임계정은 예치한 만큼의 계정 잔액(state balance)을 추가적인 스태미나로 보유하게 된다.

이와 반대로 수임계정의 스태미나를 출금(withdraw) 받기 위해서는 스태미나 컨트랙트의 `withdraw()` 함수(더 정확하게는 `requestWithdrawl()`, `withdraw()` 함수)를 사용한다. 이 때 스태미나는 줄어들고 줄어든 스태미나만큼 수임계정에게 계정 잔액이 출금된다.

수임계정이 스태미나를 출금하기 위해서 두 단계([Favor pull over push payments](https://consensys.github.io/smart-contract-best-practices/recommendations/#favor-pull-over-push-for-external-calls))를 거친다.

1. `requestWithdrawl()` 함수 호출: 먼저 예치계정(depositor)의 컨트랙트의 `requestWithdrawal()` 함수를 호출한다. 이를 호출하게 되면 수임 계정의 스태미나는 요청한 양만큼 차감되고 이에 대한 기록은 스태미나 컨트랙트에 남게 된다.
2. `withdraw()` 함수 호출: 예치계정은 `withdraw()` 함수를 호출하여 `requestWithdrawl()` 함수를 통해 기록된 정보를 이용해 차감한 스태미나만큼 계정 잔액을 채운다.

### 스테미나 차감/환불/회복

이더리움에서는 트랜잭션을 처리하기 위해서 거래 생성자(transactor)의 잔액으로 트랜잭션의 가스비를 구매하고 구매한 가스비로 트랜잭션을 처리 후에 남은 가스비는 다시 거래 생성자에게 계정 잔액(ETH)을 되돌려준다. 이와 마찬가지로 스태미나 또한, 위임계정이 생성한 트랜잭션의 가스 예산(gas-upfront cost)만큼 스태미나를 차감한 후에 수행 후 남은 스태미나를 환불(refund)해준다. 스태미나의 차감은 스태미나 컨트랙트의 `subtractStamina()` 함수를 호출 함으로써 이루어진다.

`subtractStamina()` 함수는 *onlyChain modifier*를 가진다. 이 *onlyChain modifier*를 가지는 함수는 널-계정만이 직접 호출할 수 있고 다른 계정에서는 직접 호출할 수 없다.

스태미나로 가스비를 구매하여 트랜잭션을 처리한 후 남은 가스비는 수임계정에게 환불(refund)된다. 이 또한 널-계정이 스태미나 컨트랙트 함수를 호출 함으로써 이루어지는데 `addStamina()` 함수를 호출하게 된다. `addStamina()` 함수 안에는 회복량을 확인하는 로직도 포함되어 있다.

수임계정(delegatee)의 스태미나는 위임계정(delegator)의 가스비를 구매 하면서 결국 고갈될 것이다. 하지만 고갈된 스태미나는 다음 회복 기간에 새로 충전된다. 즉 수임계정은 가지고 있는 스태미나를 다 사용해도 다음 회복기간에서 새로 스태미나가 충전되기 때문에 스태미나를 재사용할 수 있다. 스태미나 회복은 스태미나가 환불될 때 자동으로 수행된다. 스태미나를 환불하는 과정에서 회복 기간이 돌아왔는지 체크한 후 해당될 경우 스태미나를 다시 회복 해준다. 회복되는 스태미나의 양은 수임자가 예치한 계정잔액의 총량과 같다.


### 비위임 실행
비위임 실행(normal execution)은 기존의 이더리움 체인에서의 트랜잭션 처리 과정과 같으며, 다음의 절차를 대로 실행된다.

1. 트랜잭션 실행자의 잔액을 조회 : 트랜잭션을 생성한 계정의 잔액을 `state.balance`에서 불러온다.
2. 트랜잭션 지불 예산(upfront cost) 감당 가능여부를 판단
3. 지불 예산(upfront cost) 차감
4. 가상머신실행
5. 환불 가스(refunded gas) 지급

### 위임 실행
위임실행(delegated execution)의 경우 다음의 과정을 거친다.

트랜잭션 생성 계정(transactor)이 위임할 수 있는 수임계정이 존재하는지 확인한다(위임계정이 스태미나 쌍에 포함되어 있는지 여부를 확인한다.)
  - 수임계정이 있을 경우
    1. 수임계정의 가스 예산(gas-upfront cost) 감당 가능 여부를 판단
    2. 수임계정에게서 가스예산에 해당하는 스테미나를 차감
    3. 트랜잭션 생성 계정의 잔액에서 금액 예산(value-upfront cost)을 차감
    4. 가상머신 실행
    5. 환불 가스(refunded gas)만큼의 스태미나를 수임계정에게 환불
  - 수임계정이 없을 경우
    1. [비위임 실행](child-chain#비위임-실행)


## 참고자료
- [Plasma EVM(국문)](https://onther-tech.github.io/papers/tech-paper-kr.pdf)
- [Economic Description of Tokamak Network and its Ecosystem - Kevin Jeong(정순형, 철학자)](https://youtu.be/gW7FCiBgBI4)