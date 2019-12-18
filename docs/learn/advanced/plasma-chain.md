---
id: plasma-chain
title: Plasma Chain
sidebar_label: Plasma Chain
---

## Operator, User, Challenger

### Operator
오퍼레이터(Operator)는 플라즈마 체인을 운영하는 주체이다. 사용자들의 (요청) 트랜잭션들을 블록 단위로 모아 실행하며, 이러한 블록들을 루트체인 컨트랙트에 제출한다. 오퍼레이터는 누구나 될 수 있으며, 하나의 플라즈마 체인에서 단일 혹은 다수의 오퍼레이터 모두 구성 가능하다. 

### User
사용자(User)는 오퍼레이터가 운영하는 플라즈마 체인을 사용하는 주체이며, 루트체인과 플라즈마 체인간에 자산과 상태를 이동시키는 주체이다. 사용자는 직접 노드를 운영하여 오퍼레이터의 플라즈마 체인 운영을 감시할 수 있으며, 문제가 발견될 경우 해당 플라즈마 체인에서 탈출하거나 챌린저가 되어 자산 안전성을 보장받을 수 있다.


### Challenger
챌린저(Challenger)는 사전에 정의된 규칙에 어긋나는 행동을 오퍼레이터나 사용자가 범했을 경우 챌린지를 신청하여 이를 바로잡는 역할을 수행한다. 챌린저가 되기 위한 조건은 별도로 존재하지 않으며, 누구나 챌린저가 될 수 있다.



## Blocks and Epoch
플라즈마 체인의 블록은 세가지 종류의 블록으로 구성된다.

- 비요청블록(Non-Request Block; NRB)
- 요청블록(Request Block; RB): Request(!insert_link Request and Request Transaction)들을 처리하는 블록, Enter & Exit이 처리된다.
- 탈출블록(Escape Block; EB): Escape Request(!insert_link Escape Request)를 처리하는 블록

비요청블록은 기존의 일반적인 블록과 동일하다. 사용자들의 일반적인 트랜잭션들을 포함한다. 

요청블록은 말 그대로 오직 요청(!insert_link Request and Request Transaction)만을 처리하는 블록이다. Enter 및 Exit 요청들이 처리된다. 

탈출블록은 매우 특수한 상황에서만 생성되는 블록이다. Continuous Rebase(TODO: Link)의 경우 사용자들이 데이터 가용성을 확인하여 문제가 있을 경우 주기적으로 플라즈마 체인으로부터 탈출할 수 있는 기간을 제공하는데, 만약 이 때 사용자들이 탈출 요청을 루트체인 컨트랙트에 제출하게 되면 탈출 블록이 생성되게 된다.

에폭(Epoch)은 여러개의 블록을 포함하는 하나의 주기이다. 에폭도 블록의 종류에 따라 비요청에폭(Non-Request Epoch; NRE), 요청에폭(Request Epoch; RE), 탈출에폭(Escape Epoch; EE))으로 구분된다. 

에폭의 길이(Length)는 해당 에폭에 포함된 블록의 수를 의미하며, 비요청에폭의 길이는 사전에 상수로 정의되기 때문에 변경되지 않는다. 요청에폭과 탈출에폭의 경우 사용자들의 제출한 요청 수에 따라 에폭에 포함되는 블록의 수가 달라질 수 있으므로 그 길이는 가변적인 변수가 된다. 

단, 제네시스(Genesis) 블록은 0번째 비요청에폭이며, 해당 에폭의 길이는 항상 1이다.


## Block Commitment(Submission)
오퍼레이터는 플라즈마 체인을 운영하며 블록을 루트체인 컨트랙트에 제출하게 된다. 이 때 루트체인 컨트랙트는 다음과 같이 오퍼레이터가 어느 종류의 에폭을 제출해야 하는지 지정하여 플라즈마 체인의 트랜잭션과 루트체인 컨트랙트에 제출된 요청들을 반영하게 된다.

- NRE#0 이후에 NRE#1이 위치한다.
- NRE#N 이후에는 항상 RE#N+1 이 위치한다. 마찬가지로 RE#N 이후엔 NRE#N+1이 위치한다.
- 현재 에폭이 NRE#N 혹은 RE#N+1 일 때 제출된 요청은 RE#N+3에 반영된다. 만약 요청이 존재하지 않는다면 해당 RE의 길이는 0이다.

요약하자면 비요청에폭 이후에는 요청에폭, 요청에폭 이후에는 비요청에폭이 오는 것이 기본적인 규칙이며, 요청은 바로 즉시 다음 요청 에폭에 포함되는 것이 아니라 그 다음 요청 에폭에 포함된다는 것이다.

(TODO: Simple Rootchain 삽입)

루트체인 컨트랙트는 위 그림과 같이 두 종료의 블록을 제출 받기 위해 주기적으로 Accept NRB, Accept RB 상태로 변경된다. Accept NRB는 오직 비요청블록만 제출될 수 있는 상태를 의미하며, Accept RB는 요청블록만 제출될 수 있는 상태를 의미한다. 오퍼레이터는 이렇게 루트체인 컨트랙트의 상태에 따라 요청블록 혹은 비요청블록을 제출해야 한다. 여기서 유의해야 할 점은 설명의 편의를 위해 Continuous Rebase(TODO: Link)에서 다루는 탈출 블록을 포함하지 않고 있다는 것이다.

오퍼레이터는 블록을 제출할 때 세 종류의 머클루트(Merkle Root)값인 stateRoot, transactionsRoot, receiptsRoot를 제출한다. 단, transactionsRoot만 제출하는 것이 가능한 상황도 있는데, 자세한 내용은 Continuous Rebase(TODO: Link)에서 다룬다.


## Request and Request Transaction


### Request
요청(Request)는 사용자가 루트체인과 플라즈마 체인간에 자산 혹은 상태를 이동하기 위해 루트체인 컨트랙트에 제출하는 요청이다. 요청은 다음과 같은 4가지 종류로 나누어진다.

- 진입요청(Enter Request): 루트체인에서 플라즈마 체인으로 자산이나 상태를 이동시키는 요청이다.
- 퇴장요청(Exit Request): 플라즈마체인에서 루트체인으로 자신이나 상태를 이동시키는 요청이다.
- 탈출요청(Escape Request): 플라즈마체인에서 루트체인으로 자신과 상태를 탈출시키고자 하는 요청이다. 데이터 가용성 문제가 발생되었을 경우 사용된다.
- 무효요청(Undo Request): 데이터 가용성 문제가 발생했을 때, 진입 요청을 무효로 하기 위해 사용되는 요청이다.

이 때, 진입요청과 탈출요청은 요청블록에 포함되고, 탈출요청과 무효요청은 탈출블록에 포함된다.

모든 요청은 다음과 같은 파라미터로 구성된다.

- requestor: 요청을 제출한 어카운트
- to: 루트체인에 배포된 요청가능한 컨트랙트(Reqeustable contract)(TODO: Link)의 주소
- trieKey: 요청의 식별자
- trieValue: 요청의 값

emph{Request}은 사용자가 \emph{RootChain contract}에 트랜잭션을 보냄으로써 생성된다. \emph{Enter request}와 \emph{Exit request}은 \emph{RB}에 포함되며, \emph{Escape request}과 \emph{Undo request}은 \emph{EB}에 포함된다. \emph{Enter request}은 루트 체인에서 먼저 상태를 변경하고 \emph{Request} 트랜잭션(\emph{Request transaction})의 형태로 블록에 포함된다. \emph{Exit}, \emph{Escape}, 그리고 \emph{Undo request}의 경우 \emph{Request} 트랜잭션의 형태로 블록에 포함된 이후 루트 체인에서 반영된다. 만약 해당 \emph{Request} 트랜잭션이 실패(Reverted)되었다면 \emph{Exit Challenge}를 통해 루트 체인에서 반영되는 것을 방지할 수 있다.

\emph{Request}을 반영할 수 있는 컨트랙트는 \emph{Requestable} 하며, \emph{Requestable} 컨트랙트의 특정 함수를 호출함으로써 루트 체인과 자식 체인에서 \emph{Request}을 반영할 수 있다. 각 컨트랙트 별로 \emph{Requestable} 인터페이스를 개별적으로 구현하여 이더리움이 지향하는 General-purpose computing platform 을 플라즈마화(Plasmafy) 할 수 있다.

오퍼레이터는 \emph{RootChain contract}가 \emph{Request}을 생성할 수 있도록 각 체인의 \emph{Requestable} 컨트랙트의 주소를 사전에 연결해야한다. 단, 각 체인의 \emph{Requestable} 컨트랙트는 반드시 동일한 \emph{codeHash} 가져야 하며, 이는 두 컨트랙트가 같은 Storage 레이아웃을 갖는다는 것을 의미한다.


### Request Transaction
요청은 플라즈마 체인에서 요청 트랜잭션(Request Transaction)의 형태로 반영된다. 요청 트랜잭션은 다음과 같이 구성된다.

- sender: Null Address
- to: 자식 체인에 배포된 요청가능한 컨트랙트의 주소
- value: 0
- function signature: 요청가능한 컨트랙트의 함수를 호출하기 위한 function signature
- parameters: 요청가능한 컨트랙트의 함수를 호출하기 위한 파라미터

이 때 Null Addresss는 비밀키가 없으며 0x00을 주소로 갖는 어카운트를 의미한다. 이는 요청이 포함된 블록은 누구나 마이닝할 수 있음을 의미한다. 요청들은 모두 루트체인 컨트랙트에 제출되므로 오퍼레이터가 더 이상 플라즈마 체인을 운영하지 않더라도 사용자들은 요청을 제출하고 이를 직접 마이닝할 수 있다.

### Requestable Contract
요청가능한 컨트랙트(Requestable Contract)는 말 그대로 요청을 반영할 수 있는 컨트랙트이다. 요청가능한 컨트랙트는 다음과 같은 인터페이스가 구현하여 모든 요청들을 반영할 수 있어야 한다.

(TODO: 코드 포맷으로 변경)
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


### Apply Enter Request
루트체인 컨트랙트는 다음과 같은 순서로 진입 요청을 각 체인에 배포된 요청가능한 컨트랙트에 반영한다.

(TODO: insert enter figure)

1. 사용자는 루트체인 컨트랙트에 RootChain.startEnter()를 호출하는 트랜잭션을 전송한다.
2. 루트체인 컨트랙트는 진입요청을 루트체인의 요청가능한 컨트랙트에 반영한다. 만약 이 과정에서 트랜잭션이 실패(reverted)된다면 진입요청은 생성되지 않는다.
3. 2가 올바르게 진행되었다면, 루트체인 컨트랙트는 새로운 진입요청이 생성되었음을 기록한다.
4. 요청에폭에서 오퍼레이터는 여러개의 요청 트랜잭션들을 포함하는 요청 블록을 마이닝한다.
5. 3에서 생성된 진입요청이 반영된 요청 트랜잭션이 플라즈마 체인의 요청가능한 컨트랙트에 반영된다.



### Apply Exit Request
루트체인 컨트랙트는 다음과 같은 순서로 퇴장 요청을 각 체인에 배포된 요청가능한 컨트랙트에 반영한다.

(TODO: insert exit figure)

1. 사용자는 루트체인 컨트랙트로 RootChain.startExit()를 호출하는 트랜잭션을 전송한다.
2. 진입요청과는 다르게 퇴장요청은 루트체인 컨트랙트에 즉각적으로 기록되고 요청 트랜잭션의 형태로 요청블록에 포함된다.
3. 요청블록에에 대한 챌린지 기간이 종료된 이후 해당 퇴장요청에 대한 챌린지 기간이 시작된다. 만약 2의 요청 트랜잭션의 실행이 실패했다면 챌린저는 이에 대해 RootChain.challengeExit() 함수를 통해 챌린지(TODO: Link)할 수 있다.
4. 만약 3에서 챌린지 기간이 챌린지 없이 종료되었다면 사용자는 RootChain.finalizeRequest()를 호출하여 퇴장요청을 완결(Finalize)하게 된다.\emph{Exit request}는 \emph{Finalize}된다. 이를 통해 퇴장요청은 루트체인에 배포된 요청가능한 컨트랙트에 요청을 반영하게 된다.

핵심은 진입요청의 경우 먼저 루트체인에서 반영한 후에 플라즈마 체인에 반영하는 것이고, 퇴장요청의 경우 먼저 플라즈마 체인에서 반영하고 문제가 없을 경우에만 루트체인에 반영한다는 것이다.

### Apply Escape and Undo Request
탈출요청과 무효요청은 퇴장요청과 동일한 방식으로 처리되지만, 요청 트랜잭션들이 요청 블록이 아닌 탈출 블록에서 처리된다는 점에서 차이가 있다.


## Stamina
- [ ]  Stamina 깊은 설명, 매뉴얼 ref

## Challenge
챌린저는 플라즈마 체인에 문제가 발생했을 경우 챌린지를 신청하여 플라즈마 체인의 정상적인 운영을 강제할 수 있다. 챌린저가 신청할 수 있는 챌린지의 종류는 총 세가지로 다음과 같이 구성된다.

### Null Address Challenge
널 계정 챌린지(Null Address Challenge)는 비요청블록에 Null Address가 Sender인 트랜잭션이 포함되었을 경우 제출하는 챌린지이다. 이러한 트랜잭션은 요청 트랜잭션을 의미하므로 요청블록이나 탈출블록이 아닌 비요청블록에 포함되어서는 안된다. 

챌린저는 루트체인 컨트랙트에 제출된 비요청블록의 transactionsRoot에 요청 트랜잭션이 포함되었음을 머클 증명(Merkle Proof)를 통해 증명하게 된다.

### Exit Challenge
퇴장 챌린지(Exit Challenge)는 퇴장요청이나 탈출요청이 올바르지 않을 경우 제출하는 챌린지아다. 올바르지 않은 퇴장 혹은 탈출 요청은 플라즈마 체인에서 실행이 취소되는데, 이 경우 해당 요청들은 루트체인 컨트랙트에서 삭제되어 루트체인에 반영되지 않아야 한다. 

챌린저는 실행결과가 취소된 요청 트랜잭션을 머클 증명을 통해 증명한다. 단, 퇴장 챌린지를 진행하기 위해서는 대상 퇴장요청이나 탈출요청이 반드시 확정되어야만 한다. 그렇지 않을 경우 오퍼레이터의 공격행위로 인해 실제로는 취소되지 않아야 할 요청 트랜잭션이 취소된 것으로 잘못 실행될 수 있기 때문이다.

### Computation Challenge
연산 챌린지(Computation Challenge)는 오퍼레이터가 제출한 모든 종류의 블록에 대해 트랜잭션이 올바르게 실행되지 않았을 경우 제출하는 챌린지이다. 오퍼레이터가 잘못된 stateRoot를 제출하면, blockData, preStateRoot, postStateRoot를 바탕으로 TrueBit-like Verification Game을 통해 챌린지 될 수 있다.


preState = commitedStateRoots[i-1]
postState = commitedStateRoots[i] = STF_{block}(preState, Block_i)

RootChain contract에서 STF_{block}를 실행한 output과 이미 제출된 output을 비교하여 블록의 상태 전이가 올바르게 이루어졌는지 검증할 수 있다.


### Verification Game
TrueBit은 outsource된 연산을 검증하기 위한 방법으로 Verification game을 제안했다. 그러나 TrueBit이 제안한 게임의 마지막 단계는 이더리움에서 연산을 한 번 수행하고 실제 output과 예상 output을 비교하는 방법을 사용한다. 우리는 Ohalo Limited와 Parsec Labs에서 구현해 왔던 EVM 내부에서 EVM을 실행하는 스마트 컨트랙트인 solEVM~\ref{ref:solevm}을 사용하여 연산 결과를 검증하고자 한다. 단, \href{https://hackmd.io/s/SkxNKAXU7}{수수료 위임 체인}을 사용하려면 수수료 위임 트랜잭션 실행 모델이 solEVM에 반영되어야 한다.

