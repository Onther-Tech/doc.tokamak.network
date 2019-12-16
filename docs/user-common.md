---
id: user-common
title: Plasma 일반인 개념
sidebar_label: 일반 사용자 설명
---

# plasma-evm 일반인 간략 개념

Tags: plasma-evm
Urgent?: Y
Writers: Jason Hwang, Aiden Park

- **간략한 개념 설명**
    - plasma-evm as L-2 solution (다른 L-2 솔류션 비교)
    - enter / exit / ~~escape / undo~~ (뒤 두개는 TODO) (v)
        - ~~for what RootChain contract is~~

    - Account system in plasma chain
    - continuous rebase (v)
    - stamina 설명 (v)
        - stamina usecases


# 토카막 네트워크(Tokamak Network)

 토카막 네트워크가 제공하고자 하는 것은 다양한 튜링 완전(Turing-Complete)한 플라즈마 블록체인을
손쉽게 만들어 낼 수 있는 프로토콜이다. 토카막 네트워크는 “임의의 상태”를 각각 다르게 변화시키기 위한
규칙을 루트체인(Root chain)에 별도로 정의하여 플라즈마 체인의 “올바른 상태 변화" 기준을 마련
한다. 이는 확장된 상태 변화 시스템(레이어2)으로 플라즈마 블록체인의 활용 범위를 넓힌다. 따라서
토카막 네트워크는 이더리움 탈중앙화 어플리케이션(Decentralized Application; DApp)이 겪고 있는
확장성 문제를 해결할 수 있을 뿐만 아니라, 이더리움의 성능과 기능적 제약으로 인해 구현되지 못한
어플리케이션을 손쉽게 만들 수 있는 환경을 제공할 것이다.

- [ ]  dapp chain 용어? — 여러 dapp chain을 열고, TON을 enter해서 (P)ETH로 쓴다
- [ ]  *이더리움의 성능과 기능적 제약으로 인해 구현되지 못한 어플리케이션을 손쉽게 만들 수 있는 환경을 제공할 것*이다. —> 풀어 설명

# What is Plasma? — 플라즈마란 무엇인가

- [ ]  root chian ~ plasma chain 관계 다이어그램 (+RootChain contract, plasma block, ehtereum block)

이더리움 재단의 조셉푼과 비탈릭 부테린에 의해서 제안된 플라즈마(링크)는 이더리움의 확장성 문제 해
결을 위한 모델이다. 플라즈마는 블록체인의 요약본을 주기적으로 이더리움 메인 체인에
제출하고, 이렇게 제출된 요약 증거를 바탕으로 플라즈마 블록에 문제가 생겼을 때 검증과정을 통해
이를 바로잡을 수 있다. 비탈릭이 직접 제안한 MVP, Cash 등의 초기 플라즈마 연구는 토큰 등의
단순전송과 이에 대한 검증에 초점이 맞춰져 있었으나 이후 플라즈마 Leap, EVM 등 일반
상태를 다루는 방향으로 발전 및 개선되고 있다.

# Plasma vs Sidechain

[Untitled](https://www.notion.so/0e1c92553eb6447e9b0844eead63757b)

# Another Layer 2 Solution

- [ ]  ~~ 뭘 넣은건데 vvvvvvvv  참조할거다

[https://www.notion.so/onther/Plasma-vs-optimistic-zk-Roll-up-5017e5f6044d45b49157d8351c27de88](https://www.notion.so/onther/Plasma-vs-optimistic-zk-Roll-up-5017e5f6044d45b49157d8351c27de88)

# Requestable Contract

- [ ]  Enter / Exit 개념 구분 설명 및 그림 추가
- [ ]  순서: request → enter / exit → requestable contract

- [ ]  vv 더 풀어쓰기?
e.g. 요청이란 양 체인간 데이터(혹은 자산)의 (이동)요청이다.

 **Request**는 사용자가 `~~RootChain` 컨트랙트에~~ 플라즈마 체인으로 Enter/Exit을 하겠다는 요청을 담은 트랜잭션을 의미한다. `RootChain` 컨트랙트에 Request를 하려면 목적에 맞는 Enter/Exit 로직이 구현된 컨트랙트를 이용해야 하는데, 이에 대한 규칙을 정의한 컨트랙트를 Requestable 컨트랙트라고 한다. ~~Requestable 컨트랙트의 특정 함수를 호출 함으로써 루트 체인과 자식 체인에서 Request를 반영할 수 있다.~~ 각 컨트랙트 별로 Requestable 인터페이스를 개별적으로 구현하여야 한다. 예를들어 다양한 종류의 ERC20 토큰을 플라즈마 체인으로 Enter 하고자 한다면 각 토큰별로 Requestable 컨트랙트를 배포해야 하며 Requestable 컨트랙트에 대한 예시는 [여기서](https://github.com/Onther-Tech/requestable-erc20-wrapper-token/blob/2d87d558e64257b94242b254c46581499cd3f777/contracts/RequestableERC20Wrapper.sol) 확인할 수 있다..

 오퍼레이터는 RootChain 컨트랙트가 Request를 생성할 수 있도록 각 체인의 Requestable 컨트랙트의 주소를 사전에 연결해야 한다. 단, 각 체인의 Requestable 컨트랙트는 반드시 동일한 codeHash를 가져야 하며, 이는 두 컨트랙트가 같은 Storage 레이아웃을 갖는다는 것을 의미한다.

## Request and Request Transaction

- [ ]  개발자 - 기여자 파트로

~~Request는 다음 4개의 파라미터로 구성된다.~~

- **~~requestor**: Request를 생성한 어카운트~~
- **~~to**: 루트 체인에 배포된 Requestable contract의 주소~~
- **~~trieKey**: Request의 식별자~~
- **~~trieValue**: Request의 값~~

~~Request 트랜잭션은 Request 블록에 포함되고 누구나 해당 블록을 마이닝 할 수 있어야 하기에 Null Address를 Transactor로 하여 생성된다. Null Address(NA)는 비밀키가 없으며 주소가 0x00다. Request transaction은 다음 5개의 파라미터로 구성된다.~~

- **~~sender**: Null Address~~
- **~~to**: 자식 체인에 배포된 Requestable 컨트랙트의 주소~~
- **~~value**: 0~~
- **~~function signature:** Requestable 함수를 호출하기 위한 function signature~~
- **~~parameters:** Requestable 함수를 호출하기 위한 파라미터~~

 ~~진입(Enter)이란 앞서 스마트 컨트랙트에 정의한 변수의 상태 변화 규칙에 모순되지 않는 방식으로 해당 변수를 루트체인에서 플라즈마 체인으로 옮기는 것을 뜻하고, 탈출(Exit)이란 그 반대의 상황을 뜻한다. 이더리움 시스템에 참여하는 참가자들이 만들어 낸 무한대에 가까운 상태 변수(State Variable)와 그 변경 요청(Apply Request Function)을 양 체인에 반영(Reflect)하기 위해서는 목적하는 변수에 맞는 진입(Enter)과 탈출(Exit)에 대한 로직이 구현되어 있는 컨트랙트를 요청가능 컨트랙트(Requestable Contract)라 하며 아래와 같은 인터페이스를 구현한다.~~ 

 ~~Requestable 컨트랙트에서 Request를 통해 변경이 가능한 변수는 요청 가능(Requestable)한 변수이다. 단, Requestable 컨트랙트의 모든 변수가 요청 가능(Requestable)일 필요는 없다. Request와 관련된 기능이 필요 없는 변수도 있고, 특정 변수에 대한 Request 권한을 사용자 별로 구분해야 하는 경우도 고려해야 하기 때문이다. 예를 들어, 누구나 타인의 토큰 밸런스에 대해 Request가 가능하다면 이는 바람직하지 않을 것이다. 따라서  trieKey를 이용하여 특정 변수에 대한 Request 권한을 확인 할 수 있게한다.~~

# Enter TON to Tokamak Plasma Chain

- [ ]  all requestable contracts
- [ ]  TON -enter→PETH
- [ ]  root chain ~ plasma chain 관계를 그림에 포함
- [ ]  stamina 언급 ~ ref
- [ ]  

  현재는 플라즈마 체인으로의 Enter/Exit은 ~~ERC20 토큰만 가능~~하다. 이더리움 메인체인의 ERC20 토큰은 플라즈마 체인에 Enter 할 경우 플라즈마 체인의 ERC20 토큰인 ~~PERC20~~ 토큰이 된다. 하지만 TON은 토카막 플라즈마 체인에 Enter 할 경우 플라즈마 체인의 고유 화폐(Native currency)인 PETH가 된다. 즉, TON은 이더리움 메인 체인에서는 ERC20 토큰이지만, 토카막 플라즈마 체인 내에서는 이더와 같이 활용된다.

**구조**

- TON 용처 설명
    - staking ref
    - stamina ref
- ENTER / EXIT
    - TON 및 requestable contract enter / exit 과정
- Stamina
    - 자세한 설명
    - enter / exit

## Entering Process

 플라즈마 체인을 이용하기 위해 진입하는 절차는 다음과 같다. 모든 토큰은 Requestable 한 형태로 wrapping 되었고 플라즈마 체인에도 동일한 토큰 컨트랙트가 배포되고 메인체인의 토큰과 플라즈마 체인의 토큰이 RootChain 컨트랙트에 의해 매핑 된 상태라고 가정한다. 

![plasma%20evm/Untitled.png](plasma%20evm/Untitled.png)

1. 이더리움 체인에 배포된 RootChain 컨트랙트에 Enter Request를 한다. 이때 RootChain 컨트랙트의 주소, Enter할 토큰의 StorageKey, 그리고 Enter할 토큰의 수량을 입력해주어야 한다.
2. 모든 값들이 올바르게 입력된다면 RootChain 컨트랙트가 Alice의 Enter Request를 반영한다.
3. 플라즈마 체인에서 RootChain 컨트랙트에서 발생한 Enter 이벤트를 읽어온다.
4. 플라즈마 체인에 배포된 ERC20 토큰이 발행되어 플라즈마 체인 내에 있는 계정에 Enter 한 양만큼 반영된다.  

위와 같은 과정이 모두 완료되면 플라즈마 체인으로 엔터한 자산이 플라즈마 체인에 반영되어 보유한 자산을 플라즈마 체인에서 사용할 수 있다.

## How to Exit?

Exit은 플라즈마 체인에 있는 자산을 다시 메인체인인 이더리움으로 옮기는 과정을 의미한다.

![plasma%20evm/Untitled%201.png](plasma%20evm/Untitled%201.png)

1. 먼저 Alice는 메인체인에 있는 RootChain 컨트랙트에 해당 플라즈마 체인에서 Exit하겠다는 요청을 보낸다.
2. 플라즈마 체인에서 Exit 이벤트를 읽는다
3. 플라즈마 체인에서 Exit 이벤트가 반영되어 플라즈마 체인에 있는 자산이 소각된다.
4. 그 다음 메인체인인 이더리움에서 플라즈마 체인에서 Exit 한 자산이 반영된다.

Exit 과정을 거치면 플라즈마 체인에서 사용하고 있던 자산을 메인체인으로 옮겨서 사용할 수 있다.

## Transaction Type of Tokamak

[Untitled](https://www.notion.so/5221a297db204db9b687029ca37973a5)

# Stamina

Tokamak Network의 사용자는 톤(TON)을 예치해 플라즈마 체인에서 일정한 기간동안, 일정한 양의 트랜잭션을 일으킬 수 있는 권리인 “스태미나”를 만들 수 있다. 이더리움에서 트랜잭션을 전송하면 해당 계정의 소량의 이더를 가스비로 차감하는 것과 달리 Tokamak Network에서 스태미나를 이용하여 트랜잭션을 전송할 경우 갖고 있는 자산 대신 스태미나를 소모하여 트랜잭션을 전송할 수 있다. 또한 스태미나는 일정 기간이 지나면 회복되기 때문에 사용자들은 자산이 없는 상태에서도 트랜잭션을 보낼 수 있다.
스태미나는 일정한 기간이 지나면 재생된다. 이러한 방식의 수수료 차감 정책은 마치 사용자가
일정한 기간 동안 플라즈마 블록 체인을 사용할 수 있는 “대역폭(Bandwidth)”을 임차하는 것과 같으며,
임차비용은 해당 기간동안 스태미나 사용을 위해 예치한 톤(TON)의 시간 기회비용으로 볼 수 있다.
톤(TON)을 통해 만들어진 스태미나는 이를 거치한 사용자 본인의 계정 뿐만아니라, 다른 계정으로
빌려주는 것 또한 가능하다. 이렇게 만들어진 위임자-수임자 관계의 계정을 스태미나 쌍(Stamina Pair)
이라 칭한다.

---

# Stamina

`스태미나(Stamina)`는 위임계정(delegator)이 본 트랜잭션 실행 모델을 구동시킬 때 필요한 가스비를 수임계정(delegatee)에게 청구할 때 사용된다. 즉 위임계정(delegator)의 가스비를 수임계정(delegatee)이 스태미나(Stamina)의 형태로 구매하여 위임계정의 가스비 부담을 대신하게 된다. 스태미나는 스태미나 컨트랙트(Stamina contract)에 계정 잔액(state balance)을 예치(deposit)함으로써 얻을 수 있는데, 수임계정의 스태미나를 예치(deposit)한 계정을 `예치 계정(depositor account)`이라 부른다.

수임계정의 스태미나는 위임계정의 가스비를 구매 하면서 차감된다. 차감된 스태미나는 영원히 사라지는 것이 아니라 일정 기간이 지나면 회복(recover)되는데, 이를 PoC1에서는 `스태미나 회복(stamina recover)`이라 부른다. 스태미나가 회복 되기 위해서는 일정 기간이 필요한데, 이 기간을 `회복 기간(RECOVER EPOCH LENGTH)`이라 부르고, 다음 기간(EPOCH)에서 수임계정에 총 예치된 양만큼의 스태미나가 새롭게 충전된다.

### **스태미나 컨트랙트**

스태미나 컨트랙트는 수수료 위임 모델에 있어서 중요한 컨트랙트다. 스태미나 컨트랙트는 다음 기능을 제공한다.

1. 위임계정(delegator) 지정
2. 스태미나 증감(increase/decrease)
3. 스태미나 환불/차감/회복(refund/subtract/recover)

### **위임계정 지정**

수임 계정(delegatee)은 위임 계정(delegator)을 지정할 수 있다. 오직 수임 계정(delegatee)만 위임 계정(delegator)을 지정할 수 있으며, 이 반대로 위임계정(delegator)은 수임 계정(delegatee)을 지정할 수 없다. 더해서 수임 계정(delegatee)은 여럿의 위임 계정(delegator)을 지정할 수 있다.

수임계정이 위임계정을 지정하게 되면 쌍(pair)이 형성되는데 이를 `스태미나 쌍(stamina pair)` 또는 `수수료 위임 쌍(fee-delegate pair)`이라 부른다. 수임계정(delegatee)는 위임계정(delegator)을 지정하기 위해서 스테미나 컨트랙트의 `setDelegator()` 함수를 호출한다.

### **스테미나 증감(increase/decrease)**

 수임계정은 위임계정의 가스비를 구매하기 위해서 스태미나가 필요하다. 수임계정은 가지고 있는 스태미나의 양만큼 위임계정의 가스비를 대신 부담할 수 있다. 수임계정의 스태미나 소모량은 위임계정의 수 또는 트랜잭션 가스비와 비례할 가능성이 높다. 따라서 예치계정은 위임계정의 수와 트랜잭션 가스비에 맞게 수임계정의 스태미나를 늘리거나 줄일 것이다.

스태미나를 늘리기 위해서 예치계정(depositor)은 스태미나 컨트랙트의 `deposit()` 함수를 호출해야 한다. 예치계정은 예치(deposit)할 만큼의 계정잔액을 예치하고 수임계정은 예치한 만큼의 계정 잔액(state balance)을 추가적인 스태미나로 보유하게 된다.

이와 반대로 수임계정의 스태미나를 출금(withdraw) 받기 위해서는 스태미나 컨트랙트의 `withdraw()` 함수(더 정확하게는 `requestWithdrawl()`, `withdraw()` 함수)를 사용한다. 이 때 스태미나는 줄어들고 줄어든 스태미나만큼 수임계정에게 계정 잔액이 출금(withdraw)된다.

수임계정이 스태미나를 출금(withdraw)하기 위해서 두 단계([Favor pull over push payments](https://consensys.github.io/smart-contract-best-practices/recommendations/#favor-pull-over-push-for-external-calls))를 거친다.

1. `requestWithdrawl()` 함수 호출: 먼저 예치계정(depositor)의 컨트랙트의 `requestWithdrawal()` 함수를 호출한다. 이를 호출하게 되면 수임 계정의 스태미나는 요청한 양만큼 차감되고 이에 대한 기록은 스태미나 컨트랙트에 남게 된다.
2. `withdraw()` 함수 호출: 예치계정은 `withdraw()` 함수를 호출하여 `requestWithdrawl()` 함수를 통해 기록된 정보를 이용해 차감한 스태미나만큼 계정 잔액을 채운다.

### **스테미나 차감/환불/회복(subtract/refund/recover)**

 이더리움에서는 트랜잭션을 처리하기 위해서 거래 생성자(transactor)의 잔액(Balance)으로 트랜잭션의 가스비를 구매하고 구매한 가스비로 트랜잭션을 처리 후에 남은 가스비는 다시 거래 생성자(transactor)에게 계정 잔액(ETH)을 되돌려준다. 이와 마찬가지로 스태미나 또한, 위임계정이 생성한 트랜잭션의 가스 예산(gas-upfront cost)만큼 스태미나를 차감한 후에 수행 후 남은 스태미나를 환불(refund)해준다. 스태미나의 차감은 스태미나 컨트랙트의 `subtractStamina()` 함수를 호출 함으로써 이루어진다.

`subtractStamina()` 함수는 onlyChain modifier를 가진다. 이 onlyChain modifier를 가지는 함수는 NULL_ADDRESS만이 직접 호출할 수 있고 다른 계정에서는 직접 호출할 수 없다.

스태미나로 가스비를 구매하여 트랜잭션을 처리한 후 남은 가스비는 수임계정에게 환불(refund)된다. 이 또한 널-계정(NULL_ADDRESS)이 스태미나 컨트랙트 함수를 호출 함으로써 이루어지는데 `addStamina()` 함수를 호출하게 된다. `addStamina()` 함수 안에는 회복량(recoverery amount)을 확인하는 로직도 포함되어 있다.

 수임계정(delegatee)의 스태미나는 위임계정(delegator)의 가스비를 구매 하면서 결국 고갈될 것이다. 하지만 고갈된 스태미나는 다음 회복 기간(EPOCH)에 새로 충전된다. 즉 수임계정은 가지고 있는 스태미나를 다 사용해도 다음 회복기간(EPOCH)에서 새로 스태미나가 충전되기 때문에 스태미나를 재 사용할 수 있다. 스태미나 회복은 스태미나가 환불될 때 자동으로 수행된다. 스태미나를 환불하는 과정에서 회복 기간이 돌아왔는지(RECOVER EPOCH LENGTH) 체크한 후 해당될 경우 스태미나를 다시 회복 해준다. 회복되는 스태미나의 양은 수임자가 예치한 계정잔액의 총량과 같다.

- [ ]  delegator - delegatee 관계 + tx.sender, fee 지불자 관계

### 스태미나 위임 형태

depositor = delegator = delegatee — self-deposit & self-delegation

depositor = delegator → delegatee — self-deposit & delegate to other

depositor → delegator → delegatee — deposit to other & delegate to other

depositor → delegator = delegatee — deposit to other & self-delegation

- [ ]  개조식으로 재구성

 스태미나를 위임하는 형태는 세 가지가 있다.

첫 번째는 depositor, 수임 계정, 위임 계정이 모두 같은 경우이다. 이 경우는 특정 계정이 자기 자신을 수임 계정으로 삼아 본인 계정에 스태미나를 예치하고 

### **비위임 실행(normal execution)**

비위임 실행은 기존의 이더리움 체인에서의 트랜잭션 처리 과정과 같으며, 다음의 절차를 거친다.

1. 트랜잭션 실행자(transactor)의 잔액을 조회 : 트랜잭션을 생성한 계정의 잔액을 state.balance에서 불러온다.
2. 트랜잭션 지불 예산(upfront cost) 감당 가능여부를 판단
3. 지불 예산(upfront cost) 차감
4. 가상머신실행
5. 환불 가스(refunded gas) 지급

### **위임 실행(delegated execution)**

위임실행의 경우 다음의 과정을 거친다.

- 트랜잭션 생성 계정(transactor)이 위임할 수 있는 수임계정이 존재하는지 확인한다(위임계정이 스태미나 쌍에 포함되어 있는지 여부를 확인한다.)
    1. (수임계정이 있을 경우)
        1. 수임계정의 가스 예산(gas-upfront cost) 감당 가능 여부를 판단
        2. 수임계정에게서 가스예산에 해당하는 스테미나를 차감
        3. 트랜잭션 생성 계정의 잔액에서 금액 예산(value-upfront cost)을 차감
        4. 가상머신 실행
        5. 환불 가스(refunded gas)만큼의 스태미나를 수임계정에게 환불
    2. (수임계정이 없을 경우)
        1. 비위임 실행(2.2.2 상술)

### **기존 이더리움의 실행모델과 비교**

[Untitled](https://www.notion.so/fcf8d5b09a034daa90f859c332068252)

# Continuous Rebase

- [ ]  named after "git rebase" + 다른 현실적인 비유?

Continuous Rebase 모델은 플라즈마 체인의 정상적인 작동과정에 **Rebase**를 포함시킨다. 따라서 지속적이고 주기적인 Rebase를 통해 사용자들의 **Escape Request**를 반영할 수 있게 한다.

이를 통해 사용자들은 DA문제가 있을 경우 Escape Request를 제출하여 안전하게 탈출할 수 있다. 또한 제출된 블록이 올바르지 않을 경우 Computation Challenge를 통해 해당 블록들이 Finalize 되는 것을 막을 수 있다.

## What is Escape Request?

플라즈마 체인의 Data availability에 문제가 생겼을 경우에 사용자가 제출하는 긴급탈출 요청

*구조적으로 Exit Request와 동일하다. 

- [ ]  exit 과 차이 / 공통점

## What is Undo Request?

undo의 목적: enter request를 막는다

## What is Rebase?

Rebase는 기존에 루트체인에 제출한 블록을 다른 블록을 기준으로 다시 마이닝 하는 것

pre-commit → commit 으로 변경되는 점 기술

## Cycle of Continuous Rebase

![plasma%20evm/Untitled%202.png](plasma%20evm/Untitled%202.png)

1. **Pre-commit**: 오퍼레이터가 플라즈마 체인의 블록을 마이닝한 후 각 블록의 txRoot 제출
2. **DA check**: 사용자가 Pre-commit 과정의 DA check, 문제시 Escape Request 제출
3. **Commit**: Process Escape, Rebase의 과정을 수행

    3-1. **Process Escape**: 1,2 에서 제출된 Escape Request를 포함한 Escape Block 마이닝 후 제출

    3-2. **Rebase**: Escape Block을 기준으로 Pre-commit된 블록 Rebase

4. **Challenge**: Commit 된 블록에 대한 챌린지 제출

### ~~Pre-commit~~

 ~~NRB와 ORB가 생성된 후 사용자들에게 전파되는 단계이며 이때 txRoot가 루트체인에 제출된다. Pre-commit 에서 제출된 블록들은 rebase로 인해 stateRoot와 receiptRoot가 변경될 수 있기 때문에 포함되지 않으며, 해당 블록에 포함될 트랜잭션들에 대해 알고 있다면 stateRoot와 receiptRoot는 연산할 수 있기 때문에 사용자들은 Commit 단계에서 오퍼레이터가 데이터를 숨기고 잘못된 stateRoot를 제출하더라도 이를 알아차리고 Challenge를 할 수 있다.~~

### ~~DA check~~

 ~~사용자가 Pre-commit 단계에서 DA 문제가 없는지 확인하는 단계이다. 이때 문제가 발견된다면 Escape Request를 제출하여 안전하게 탈출할 수 있다. 이 단계의 목적은 DA 문제에 대한 인지 및 대처할 수 있는 시간을 사용자들에게 주는 것에 있으며, 만약 Escape Request를 제출하려 한다면 Pre-commit 단계에서 제출된 Exit Request나 Enter Request가 없어야 한다. 만약 Pre-commit 단계에서 제출한 Enter Request나 Exit Requset가 있다면, Enter Request의 경우 Undo Request를 제출해서 Enter를 취소해야 하며, Exit Request는 취소해야 한다. Escape Request 이후에 같은 해당 사용자의 Exit Request가 실행된다면 해당 Request는 revert될것이고 비정상적인 Exit으로 판단되어 Exit Request의 대상이 될 수 있다.~~

### ~~Commit~~

 ~~Commit은 두 종류의 행위(?)가 이루어 지는 단계이다. 첫 번째는 오퍼레이터가 Pre-commit과 DA-check에서 제출된 Escape Request와 Undo Request를 반영하는 Escape block(EB)를 제출한다. 이 과정에서   Escape Request를 제출한 사용자들은 안전하게 플라즈마 체인에서 탈출하고, Undo Request를 제출한 사용자들은 루트체인에서 수행한 Enter를 취소할 수 있다. 두 번째는 EB를 바탕으로 Pre-commit 단계에서 제출된 모든 블록들을 Rebase하는 것이다. Rebase가 끝난 후에는 Pre-commit된 블록의 stateRoot와 receiptRoot를 제출한다. 만약 해당 Cycle에서 제출된 Escape Request가 없다면, EB 제출과 Rebase는 생략된다.~~

### ~~Challenge~~

 ~~Commit 단계에서 제출된 블록이 유효하지 않을 수 도 있다. 그럴 때 사용자들에게 최후의 수단으로 Challenge를 할 수 있는 기회가 주어진다. 이때 제출 가능한 Challege는 Null Address Challenge, Computation Challenge이다. 한 Challenger가 승리하면 다른 Challenge는 취소되며, 해당 Cycle은 DA check 단계로 되돌아간다.~~

### ~~Finalize~~

~~Challenge까지 무사히 완료되었다면, 해당 Cycle은 Finalize되며, Commit 단계에서 제출된 모든 블록이 동시에 Finalize된다.~~
