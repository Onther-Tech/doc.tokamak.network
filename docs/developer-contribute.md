---
id: developer-contribute
title: Plasma-evm 기여자 메뉴얼
sidebar_label: 기여자 메뉴얼
---
# plasma-evm 개발자 - 기여자용

Tags: plasma-evm
Urgent?: Y
Writers: Aiden Park, Carl Park

@Aiden Park 디자인 철학 , plasma evm 구조 설명

@Carl Park 클라이언트 / 컨트랙트 구조 설명

---

# 기여자용: 깊은 설명

문서 목적 설명

- 

이더리움 스마트 컨트랙트 개발 관련 툴 참조

- solidity / remix / truffle / ...?

# aiden part

## Design Rationale

### 디자인 원칙(Design principle)

**확장성(Scalability)**

- 하나의 체인 혹은 여러개의 샤드체인으로 분할된 루트체인에 수천, 수만개의 Dapp이 몰리는 것을 플라즈마 체인으로 옮겨 확장성 개선
- 많은 수의 Layer-N 플라즈마 체인들을 통해 잠재적으로 확장성 문제 원천 해결

**튜링 완전성(Turing Completeness)**

- (연산에 필요한 수수료(가스)에 대한 내용을 예외로 하고) 실제 일반 컴퓨터가 할 수 있는 것들을 수행할 수 있음
- 플라즈마 체인은 어떠한 일반적인 프로그램이든 동일하게 모델링할 수 있음

**강제 실행(Enforced  Execution)**

- 오직 루트체인에 의해 실행이 강제되어야 함, 이는 플라즈마의 특성(Property)
- 루트체인의 Safety와 Liveness가 지켜지는 한 항상 플라즈마 체인의 실행 및 asset security 보장은 올바르게 강제됨

- [ ]  *기존에 이미 운영되는 Dapp들의 효율적인 Migration 가능* — 이 관점에서 올바른 용어?

**호환성(Compatibility)**

- 기존 루트체인 (개발)환경과 동일한 환경
- 기존 개발자 및 개발툴 등을 적극 활용, 필요치 않은 새로운 자원 활용 X
- 기존에 이미 운영되는 Dapp들의 효율적인 Migration 가능

### Why Plasma

- No consensus - consensus에 대한 고민이 필요 없음
    - double spending & DA in plasma chain 이슈
- ~~소정의 Security Deposit만 있으면~~ 쉽게 새로운 체인 확장 가능
- 이러한 점들로 인해 확장성 문제를 근본적으로 해결 가능

### Why Truebit-like Verification Game

- 연산을 검증하기 위한 비용을 최소화 할 수 있음(하나의 Opcode 실행)
- Non-interactive한 방법들(zkp)은 Proving 연산 비용 측면에서 Practical 하지 않음

### Why Continuous Rebase

- Generalized Plasma의 DA문제를 근본적으로 해결 가능
- 플라즈마 체인의 Finality를 지연시키는 문제점이 있긴 함~~, 그럼에도 불구하고 장점?~~
- // 또 다른 이유? cbc — not economic model
    - kind of conditional state —

## Plasma EVM Architecture

<!insert_figure eth2.0 architecture-like figure> (tree처럼: rootchain / plasmachain / user / dapp)

- [ ]  Stamina 깊은 설명, 매뉴얼 ref

## Root chain

### `RootChain` contract

- 플라즈마 체인 관리 및 상태 강제
- 사용자들이 Enter, Exit을 신청하는 창구
- 플라즈마 체인에서 발생한 문제를 해결?하는 창구

### Consensus

- 플라즈마 체인의 Security와 Liveness는 루트체인의 컨센서스에 의존
- 루트체인 컨센서스의 Safety와 Liveness가 유지되는 한 플라즈마 체인은 항상 올바르게 상태가 강제될 수 있음

## Plasma chain

### Operator, User, Challenger

- 오퍼레이터: 플라즈마 체인 운영, 블록 커밋 ~~TODO: Security deposit(할 수 있다)~~
- 사용자: 플라즈마 체인 사용, Enter&Exit하는 주체
- 챌린저: 챌린저라는 별도의 역할이 존재하는 것은 X, 누구나 챌린저가 될 수 있음. 사전에 규정된 규칙에 어긋나는 행위가 발견될 경우 챌린저는 챌린지를 신청할 수 있음

### Blocks(+Epochs)

- Non-Request Block(NRB): 일반 블록
- Request Block(RB): Request(!insert_link Request and Request Transaction)들을 처리하는 블록, Enter & Exit이 처리된다.
- Escape Block(EB): Escape Request(!insert_link Escape Request)를 처리하는 블록

### Commitment(Submission)

- 오퍼레이터의 블록 제출 과정
- 블록 제출 시 파라미터

### Request and Request Transaction

- Request 정의: 루트체인-플라즈마 체인 간의 상태 이동 요청
- Enter/Exit Request:
- Request transaction

### Requestable Contract

- Requestable Contract 정의
- Requestable Interface
    - exit enter undo escape

### Challenge

- Truebit-like verification game
    - solevm
- Interactive하게 챌린저와 오퍼레이터가 게임
- 최종적으로 하나의 opcode를 실행하여 승패결정
- 챌린지 성공시 해당 블록을 포함한 이후의 모든 블록이 Revert

## Continuous Rebase

- Continuous Rebase모델에 대한 간단한 설명

### Data availability

- Data availability 및 DA 문제에 대한 정의(!insert_link data availability note by vbuterin)
- 왜 Generalized Plasma에서 해결하기 어려운지(!insert_link why EVM on Plasma hard, ethresear.ch post)

### Rebase

- Rebase 개념에 대한 설명
- 어떻게 Rebase를 통해 Data availability 문제를 해결 가능한지
    - Escape Request
        - Exit request와 구조적으로 동일, 제출되는 시기가 다름

### Cycles and Stages

- Pre-commit
- DA-check
- Commit
- Challenge

<!insert_figure cycles and stages>

### Finalize

- No Challenge in Challenge stage → Finalize

### Halting Condition

- Pre-commit
- Commit
- Shutdown

### Overlap of Cycles

- 여러개의 사이클이 겹쳐질 경우

<!insert_figure overlap of cycle>

# carl part

## Plasma EVM Smart Contracts

### 컨트랙트 다이어그램

deploy script 기준 컨트랙트 다이어그램 작성

### 사용된 컨트랙트 리스트 및 설명

- `RootChainBase`
- `*Handler`
- `RootChain`
- `EtherToken`

### 컨트랙트 상태 컨트랙트 (`RootChainStorage`)

`RootChainStorage` 컨트랙트 설명

- 상속 순서 설명 ~ ref solidity inheritance
- 

주요 상태 변수 설명

- `address public epochHandler`
- `address public submitHandler`
- `address public etherToken`

### 컨트랙트 상속 구조?

- `EpochHandler is RootChainStorage, RootChainEvent`
- `SubmitHandler is RootChainStorage, RootChainEvent, RootChainBase`
- `RootChain is RootChainStorage, RootChainEvent, RootChainBase, MapperRole, SubmitterRole`

### 컨트랙트 참조 구조

`EpochHandler` / `SubmitHandler` 역할 설명

- `RootChainBase` → `*Handler` 연결 방식
- EpochHandler functions
    - bytes4 constant PREPARE_TO_SUTMIBT_ORB_SIG = ...
    bytes4 constant PREPARE_TO_SUTMIBT_NRB_SIG = ...
    bytes4 constant PREPARE_TO_SUTMIBT_URB_SIG = ...
    bytes4 constant PREPARE_ORE_AFTER_URE_SIG = ...
    bytes4 constant PREPARE_NRE_AFTER_URE_SIG = ...

- SubmitHandler functions
    - bytes4 constant SUBMIT_NRE_SIG = ...
    bytes4 constant SUBMIT_ORB_SIG = ...
    bytes4 constant SUBMIT_URB_SIG = ...

- 왜 쪼갤 수 밖에 없는가 ? 컨트랙 사이즈가 커서

`~~EpochHandler` —> 소스코드에서 설명~~

- `~~prepareORE()`, `prepareNRE()` 함수 역할~~
- ~~전체 로직 설명~~

## `~~RootChain` contract (explained?)~~

~~소스코드 레퍼런스~~

### ~~블록 제출 함수: submitNRE / submitORB~~

- ~~블록 / 에퍽 제출 과정 설명~~
    - ~~submitHandler 연결~~
    - ~~Data.sol 의 자료구조?~~
- 

### ~~요청 제출 함수~~

- ~~: startEnter / startExit, TODO: startUndo / startEscape~~
- ~~요청 제출 과정 설명~~
    - ?

### ~~block & request finalize 과정~~

- ~~finalizeBlock()....~~
- ~~exit challenge 과정~~
- 

## CC ~ client?

- TODO: computation challenger client 개발ㅔㅐ
    - 

## Requestable Contract Examples and Best Practices — [기존 문서](https://plasma-evm.readthedocs.io/en/latest/requestable-contract-examples.html) 설명

### Counter

- BaseCounter
- SimpleCounter
- FreezableCounter
- TrackableCounter

### Token

- RequestableSimpleToken
- RequestableERC20
- RequestableERC20Wrapper

### Requestable Multisig — 발표 자료 참고

### Requestable CryptoKitties

approach 설명

- 

---

## 클라이언트 구현 설명??

go-ethereum 관계 / ~~변경된 패키지 요약~~

`miner` package: fakePoW쓴다

### 추가된 파라미터 설명

    PLASMA EVM - DEVELOPMENT MODE OPTIONS:
      --dev               Ephemeral proof-of-authority network with a pre-funded developer account, mining enabled
      --dev.period value  Block period to use in developer mode (0 = mine only if transaction pending) (default: 0)
      --dev.key value     Comma seperated developer account key as hex(for dev)
    
    PLASMA EVM - OPERATOR OPTIONS:
      --operator value           Plasma operator address as hex. The account should be unlock by using --unlock
      --operator.key value       Plasma operator key as hex(for dev)
      --operator.minether value  Plasma operator minimum balance (default = 0.5 ether) (default: "0.5")
      --miner.recommit value     Time interval to recreate the block being mined (default: 3s)
    
    PLASMA EVM - ROOTCHAIN TRANSACTION MANAGER OPTIONS:
      --tx.gasprice "0"                Gas price for transaction (default = 10 Gwei)
      --tx.mingasprice "1000000000"    Minimum gas price for submitting a block (default = 1 Gwei)
      --tx.maxgasprice "100000000000"  Maximum gas price for submitting a block (default = 100 Gwei)
      --tx.interval value              Pending interval time after submitting a block (default = 10s). If block submit transaction is not mined in 2 intervals, gas price will be adjusted. See https://golang.org/pkg/time/#ParseDuration (default: 10s)
    
    PLASMA EVM - STAMINA OPTIONS:
      --stamina.mindeposit "500000000000000000"  MinDeposit variable state of stamina contract
      --stamina.recoverepochlength "10080"       RecoverEpochLength variable state of stamina contract
      --stamina.withdrawaldelay "30240"          WithdrawalDelay variable state of stamina contract
    
    PLASMA EVM - CHALLENGER OPTIONS:
      --rootchain.challenger value  Address of challenger account
    
    PLASMA EVM - ROOTCHAIN CONTRACT OPTIONS:
      --rootchain.url value       JSONRPC endpoint of rootchain provider. If URL is empty, ignore the provider.
      --rootchain.contract value  Address of the RootChain contract

- [ ]  TODO: package diff 다이어그램 하나 그려두기

### `pls` package (기존 `eth` package)

`RootChainManager`

- 루트체인 JSONRPC를 통해 `RootChain` 컨트랙트의 정보 읽고 플라즈마 체인 업데이트
- ORB, NRB 등 마이닝 담당 (`RootChain` 컨트랙트 기반)
- 자동으로 루트체인 트랜잭션 제출
    - `submitORB`
    - `submitNRE`
    - `challengeExit`
    - ....

### `tx` package

`TransactionManager`

- 루트체인으로 보낼 트랜잭션의 nonce, gasPrice 등을 조정
- 단, tx를 보낼 어카운트가 unlock 되어있어야 함
- 루트체인에 마이닝 되지 않은 트랜잭션 재전송
- 루트체인에 re-org로 제거된 트랜잭션 재전송
- leveldb로 대충 만듬 —> 개선해야함
- 

—> plasma-evm의 패키지 자세한 내용은 godoc 으로 빼면 좋을 것 같은데..
