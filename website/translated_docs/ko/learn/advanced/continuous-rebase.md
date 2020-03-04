---
id: continuous-rebase
title: Continuous Rebase
sidebar_label: Continuous Rebase
---

Continuous Rebase는 주기적으로 사용자들의 탈출요청을 받아 자식체인을 리베이스(rebase)하여 **데이터 가용성 문제**가 발생했을 경우 사용자들이 항상 **안전하게 탈출**할 수 있도록 한다. 


## 리베이스
**리베이스(rebase)**는 루트체인에 제출한 블록을 다른 블록 기준으로 다시 마이닝하는 것으로, Git의 rebase에서 이름을 빌려왔다. 리베이스는 기존의 블록에 포함된 트랜잭션들을 다른 부모블록을 기준으로 재연산하기 때문에 리베이스 이전과 이후의 `trasactionsRoot`는 서로 일치하지만 `stateRoot`와 `receiptsRoot`는 일치하지 않을 수 있다.

리베이스된 에폭과 블록들은 다음과 같이 나타낸다.

- **리베이스된 요청에폭(Rebased Request Epoch; RE')**
- **리베이스된 비요청에폭(Rebased Non-Request Epoch; NRE')**
- **리베이스된 비요청블록(Rebased Non-Request Block; NRB')**
- **리베이스된 요청블록(Rebased Request Block; RB')**


## 사이클과 단계
Plasma EVM은 **사이클(cycle)**이라는 하나의 큰 주기를 기준으로 작동된다. 하나의 사이클은 총 4개의 **단계(stage)**로 구성되며, 각 딘계는 Pre-commit, DA-check, Commit, Challenge이다.

![cycle and stage](assets/learn_advanced_cycle.png)


### Pre-commit
Pre-commmit은 일종의 예비 제출 단계로, 오퍼레이터는 블록 마이닝하여 블록들의 `transactionsRoot`만을 루트체인에 제출한다. 단, 요청블록의 경우 모든 트랜잭션 데이터가 루트체인 컨트랙트에 이미 존재하므로, `transactionsRoot`를 별도로 제출하지 않아도 된다. 사용자에게 이 단계에서 오퍼레이터는 해당 블록들에 포함된 트랜잭션 데이터들을 사용자에게 전파하게 된다. 만약 사용자들이 이 단계에서 트랜잭션 데이터를 제대로 전파받지 못했을 경우 다음 단계인 DA-check에서 탈출 요청을 제출해야 한다. 

`transactionsRoot`만을 루트체인에 제출하는 이유는 `stateRoot`와 `receiptsRoot`가 리베이스 이후에 최종적으로 결정되기 때문이다. 반면 `transactionsRoot`를 제출해야 하는 이유는 해당 블록에 포함된 트랜잭션들이 무엇인지 알 수 있다면 해당 블록의 올바른 `stateRoot`도 알 수 있기 때문이다. 따라서 오퍼레이터에게서 루트체인 컨트랙트에 제출된 `transactionRoot`와 일치하는 블록 데이터를 전송받은 사용자는 이후 Commit단계에서 오퍼레이터가 데이터를 숨기고 잘못된 `stateRoot`를 제출하더라도 챌린지 할 수 있다.

![pre commit](assets/learn_advanced_pre_commit.png)


### DA-check
DA-check는 사용자가 Pre-commit 단계에서 오퍼레이터가 전송한 블록 **데이터의 가용성**과 트랜잭션의 데이터 크기를 확인하고 문제가 없는지 점검하는 단계이다. 만약 점검 과정에서 문제가 있는 상황이라면, 사용자는 스스로를 보호하기 위하여 **탈출요청**을 제출하여 자식체인에 존재하는 모든 자산과 상태를 탈출시켜야 한다.

만약 해당 사이클에서 진입을 하였다면 탈출요청과 더불어 이러한 진입을 취소하기 위한 **무효요청**을 제출하여 진입이 반영되는 것을 무효화해야 한다. 또한 기존에 퇴장을 신청한 경우도 이중으로 퇴장이 되는 것을 방지하기 위해 취소해야 한다.


![da check](assets/learn_advanced_da_check.png)


### Commit
Commit은 오퍼레이터가 이전 사이클의 **마지막 블록**에 DA-check에서 제출된 모든 요청들을 반영한 후 Pre-commit에서 제출한 블록들을 **리베이스**하는 과정이다. 이 과정에서 블록들의 **모든 루트**들이 제출된다.

![commit](assets/learn_advanced_commit.png)


### Challenge
Challenge단계에서 사용자들은 Commit 단계에서 제출된 블록이 유효하지 않을 경우, 이에 대해 챌린지를 진행할 수 있다. 단, 이 때 탈출 챌린지는 신청할 수 없다.

제출된 챌린지가 다수일 경우 챌린저가 승리하는 순간 다른 챌린지는 취소된다. 또한 챌린저가 승리한 경우 해당 사이클의 Commit된 블록을 포함한 이후의 모든 블록들이 취소되며, DA Check단계로 되돌아간다. 

![challenge](assets/learn_advanced_challenge.png)


### 완결
Challenge단계에서 어떠한 챌린지도 성공하지 못했다면, 해당 사이클은 완결(finalize)되며, Commit단계에서 제출된 모든 블록들은 동시에 완결된다.

### 단계 길이
**단계 길이(stage length)**는 Pre-commit과 Commit에서 처리되어야 하는 에폭의 수를 의미하며 다음과 같이 구성되며, 모두 루트체인 컨트랙트 배포시 오퍼레이터에 의해 결정된다.

- `Pre-commit length = 비요청에폭의 수 * 2`
- `Commit length = 는 비요청에폭의 수 * 2 + 1 (추가된 하나의 에폭은 탈출에폭을 의미한다)`

### 단계 시간
**단계 시간(stage period)**는 각 단계에 할당된 시간을 의미한다. Pre-commit 단계 시간과 Commit 단계 시간은 중단 조건의 기준이되고, DA-check와 Challenge 단계 시간은 단순히 각 단계를 수행할 수 있는 기간을 의미한다.


## 중단 조건
어떠한 이유로든 오퍼레이터가 정해진 절차를 제대로 수행하지 않을 경우 **중단 조건(halting condition)**이 충족될 수 있다. 중단 조건이 충족되는 경우 해당 자식 체인은 폐쇄된다.

### Pre-commit단계의 중단 조건
오퍼레이터가 Pre-commit 단계 시간 이내에 Pre-commit 단계 길이의 에폭을 모두 제출하지 못할 경우 중단 조건이 충족된다.

### Commit단계의 중단 조건
오퍼레이터가 Commit 단계 시간 동안 Commit 단계 길이의 에폭을 모두 제출하지 못할 경우 중단 조건이 충족된다. 이 경우 해당 사이클을 포함한 이후의 모든 진행이 일시 중단된다. 만약 중단된 시점에 탈출블록이 제출되지 않은 상태라면 누구나 이를 제출할 수 있고, 해당 블록이 제출되면 일시 중단된 사이클이 재개된다.

### 폐쇄
**폐쇄(shutdown)**는 말 그대로 자식체인을 폐쇄하는 절차이다. 자식체인이 폐쇄되면 더 이상 해당 체인의 추가적인 사이클은 진행될 수 없다. 오직 마지막으로 완결된 블록을 기준으로 탈출요청 제출 - 탈출블록 제출 - 챌린지를 반복한다.


### 전체 사이클 동작과정
지금까지 살펴본 하나의 사이클의 동작과정은 다음 그림과 같이 나타낼 수 있다.

![rootchain](assets/learn_advanced_rootchain.png)


## 사이클 중첩
지금까지 논의한 것은 하나의 사이클의 동작 과정이었다. 하지만 **여러개의 사이클이 중첩되**어 동시에 동작하는 것 또한 가능하다.

![overlap cycle](assets/learn_advanced_overlap_cycle.png)

두개의 사이클이 맞물릴 경우 이전 사이클의 Challenge단계의 완료 여부와 관계 없이 다음 사이클의 Pre-commit 단계가 시작될 수 있다.

이처럼 여러개의 사이클이 맞물려 진행되기 위해서는 다음과 같은 조건이 충족되어야 한다.

1. **현재 사이클의 Pre-commit이 완료되는 즉시 다음 사이클의 Pre-commit이 시작된다.**
2. **현재 사이클의 Pre-commit이 완료되는 즉시 현재 사이클의 DA-check가 시작된다.**
3. **현재 사이클의 Commit은 이전 사이클의 Commit 완료 이후에 시작될 수 있다.**

이를 통해 주기적으로 사용자들의 탈출요청을 반영하여 리베이스를 진행하면서 체인의 진행을 멈추지 않고 계속해서 동작할 수 있게 된다.

## 참고자료
- [Plasma EVM(국문)](https://onther-tech.github.io/papers/tech-paper-kr.pdf)