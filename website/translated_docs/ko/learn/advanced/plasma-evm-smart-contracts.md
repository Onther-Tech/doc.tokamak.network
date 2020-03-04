---
id: plasma-evm-smart-contracts
title: Plasma EVM Smart Contracts
sidebar_label: Plasma EVM Smart Contracts
---

<!-- TODO: 컨트랙트 함수 부분은 REST API 문서 방식으로? -->

> Continuous Rebase는 아직 개발중으로 본 문서에서는 해당 기능이 빠진 컨트랙트 구현을 다루고 있다.

Plasma EVM에서 사용하는 컨트랙트의 소스코드는 [여기](https://github.com/Onther-Tech/plasma-evm-contracts)에서 확인할 수 있다.

## 컨트랙트 다이어그램

![](https://i.imgur.com/UEngaR2.png)

*네모*는 컨트랙트 구현체, *실선*은 상속 관계, *검은색 점선*은 `CALL`을 통한 참조 관계, *빨간색 점선*은 `DELEGATECALL`을 통한 참조 관계, *파란색 점선*은 라이브러리 참조를 가리킨다. *초록색 네모*는 네트워크에 실제 배포되는 컨트랙트를 의미한다. `RootChain` 컨트랙트의 사이즈가 크기 때문에  `EpochHandler`와 `SubmitHandler`로 로직을 분리하고 `DELEGATECALL`을 통해 로직을 분리한 핸들러 컨트랙트로 연결한다.

이 다이어그램에 나오는 컨트랙트는 다음의 기능을 한다.

## Data
`Data`는 Plasma EVM에서 사용하는 `Epoch`, `PlasmaBlock`, `Request`, `RequestBlock`, `Transaction` 등의 구조체와 관련 로직을 구현한다. 특히 `Request`를 `RequestTransaction`으로 변환하거나 `RequestBlock`의 `transactionsRoot`를 계산하는 등 내부 로직들을 다룬다. `Data`에서 관리하는 상수는 다음과 같다.

- `address public constant NA = address(0)`

  Null Address의 주소. 자식 체인의 요청 트랜잭션을 보내는 이(`msg.sender`)는 항상 `NA`다.

- `uint public constant NA_TX_GAS_PRICE = 1e9`

  자식 체인의 요청 트랜잭션의 gas price(`tx.gasPrice`)는 항상 1 Gwei다.

- `uint public constant NA_TX_GAS_LIMIT = 100000`

  자식 체인의 요청 트랜잭션의 gas limit은 항상 100000이다.

## RootChainStorage
`RootChainStorage`는 상태 변수만을 구현한 컨트랙트다. 중요한 상태 변수는 다음과 같다.

<!-- Name | Type | Description 으로 테이블 만들기? -->

- `address operator`: 자식 체인의 오퍼레이터 계정. 다른 이더리움 계정으로 오퍼레이터 권한을 바꾸거나 블록 제출 권한, 양 체인의 Requestable 컨트랙트 주소 맵핑 권한을 관리한다.
- `address epochHandler`: `DELEGATECALL`을 통해 참조되는 `EpochHandler` 컨트랙트의 주소.
- `address submitHandler`: `DELEGATECALL`을 통해 참조되는 `SubmitHandler` 컨트랙트의 주소.
- `address etherToken`: 자식 체인의 PETH에 대응하는 루트 체인의 *ERC20* 토큰 컨트랙트.
- `mapping (address => address) requestableContracts`: 루트체인과 자식체인에 있는 컨트랙트를 매핑하는 루트체인의 요청가능 변수.
- `uint NRELength`: `RootChain`의 배포시 결정된 `NRE`의 길이.
- `uint currentFork`: 현재 포크 넘버. Continuous Rebase의 싸이클 넘버와 동일하다.
- `Data.Request[] EROs`: 사용자가 생성한 Enter, Exit 요청들의 배열. `n-3`번째 NRE 제출 시 `n`번째 RE에 포함할 `EROs`의 인덱스 범위를 결정한다. 이를통해 `RootChain` 컨트랙트는 자식 체인에 포함할 요청의 범위를 관리한다.
- `Data.RequestBlock[] ORBs`: RE에는 1개 이상의 RB들이 포함될 수 있다. 자식 체인의 gas limit으로 인해 하나의 RB에 포함할 수 있는 요청의 갯수는 제한적이고, 따라서 RB에 포함할 `EROs`의 인덱스 범위와, 이들에 대응하는 요청 트랜잭션들의 `transactionsRoot`를 관리하기 위하여 `ORBs`가 사용된다.
- `uint lastAppliedForkNumber`: 마지막 요청을 반영한 Fork Number.
- `uint lastAppliedEpochNumber`: 마지막 요청을 반영한 Epoch Number.
- `uint lastAppliedBlockNumber`: 마지막 요청을 반영한 Block Number.
- `uint EROIdToFinalize`: 다음으로 반영할 `EROs`의 인덱스.

## RootChainEvent
`RootChainEvent`는 `RootChain`의 이벤트만 구현한 컨트랙트.

## RootChainBase is RootChainStorage, RootChainEvent
`RootChainBase`는 상태 변수와 이벤트를 각각 `RootChainStorage`와 `RootChainEvent`를 통해 상속한다. 또한 `EpochHandler`와 `SubmitHandler`로 `DELEGATECALL`을 실행하는 함수를 구현한다.

`SubmitHandler`
- `submitNRE(uint256,uint256,bytes32,bytes32,bytes32)`: `RootChain`이 호출하는 `NRE` 제출 함수.
- `submitORB(uint256,bytes32,bytes32,bytes32)`: `RootChain`이 호출하는 `RB` 제출 함수.

`EpochHandler`
- `prepareORE()`: `SubmitHandler`가 `NRE`를 제출할 때 다음 `RE`를 준비하기 위해 호출하는 함수.
- `prepareNRE()`: `SubmitHandler`가 마지막 `RB`를 제출할 때 다음 `NRE`를 준비하기 위해 호출하는 함수.


## SubmitHandler is RootChainBase
`SubmitHandler`는 `NRE` 혹은 `RB`등 블록과 에폭을 제출하는 로직을 구현한 컨트랙트다. 다음 에폭으로 넘어가기 위하여 `EpochHandler`을 참조한다. 아래 두 함수는 `Submitter` 역할을 가진 주소만 해당 함수를 호출할 수 있다.

- `submitNRE(uint _pos1, uint _pos2, bytes32 _epochStateRoot, bytes32 _epochTransactionsRoot, bytes32 _epochReceiptsRoot)`

  `pos1`은 "포크 넘버와 에폭 넘버"를 각각 `uint128`로 형변환하여 합친 하나의 `uint256`다. `pos2`도 동일한 방식으로 인코딩된 "에폭의 시작 블록 넘버와 끝 블록 넘버"다. 이 함수는 종료 직전 `epochNumber + 3` 번째 RE를 준비한다.

- `submitORB(uint _pos, bytes32 _statesRoot, bytes32 _transactionsRoot, bytes32 _receiptsRoot)`

  `pos`은 "포크 넘버와 에폭 넘버"를 각각 `uint128`로 형변환하여 합친 하나의 `uint256`이다. `RB` 제출의 경우 `RootChain`이 결정한 `EROs`의 인덱스와 그에 대응하는 요청 트랜잭션들의 머클 루트를 계산한다. 이 계산된 머클 루트와 `_transactionsRoot`이 동일하지 않을 경우 reverted된다.

## EpochHandler is RootChainBase
`EpochHandler`는 `NRE` 혹은 마지막 `RB`를 제출할 경우 그 다음 에폭으로 준비하는 로직을 구현한 컨트랙트. `epochNumber`가 `n`인 `RE`의 경우 `n-3`번 NRE를 제출한 순간 해당 RE에 포함할 `Request`들의 목록을 확정한다.

- `prepareORE()`: `SubmitHandler`가 `NRE`를 제출할 때 호출하는 함수.
- `prepareNRE()`: `SubmitHandler`가 마지막 `RB`를 제출할 때 호출하는 함수.

## RootChain is RootChainBase, MapperRole, SubmitterRole
`RootChain`은 블록 및 에폭 제출, 요청 생성, 챌린지, 블록 finalize 함수 및 컨트랙트 상태를 조회할 getter를 구현한 컨트랙트다. 양 체인의 `RequestableContract`을 연결하는 권한을 관리하기 위하여 `MapperRole`과, 블록 및 에폭을 제출하는 권한을 관리하기 위하여 `SubmitterRole`을 상속한다. `RootChain` 에서만 구현된 중요 함수는 다음과 같다.
- `mapRequestableContractByOperator()`: 양 체인의 requestable contract의 주소를 맵핑하는 함수입. `Mapper` 역할을 가진 주소만 해당 함수를 호출할 수 있다.

- `finalizeBlock()`: 제출된 블록은 finalize하는 함수. 동일한 기능을 하는 내부 함수가 블록 혹은 에폭 제출 시에도 호출된다.

- `finalizeRequest()`: RB가 finalized 되었다면, 해당 블록에 포함된 요청들은 개별적인 챌린지 기간을 가진다. 요청에 대한 챌린지 기간도 무사히 종료되었을 경우 해당 요청은 finalized 될 수 있다. 이 함수를 통해 블록과 요청에 대한 두 챌린지 기간의 종료를 확인하여 Exit 요청이 루트 체인에서 반영되도록 할 수 있다.

- `challengeExit()`: 유효하지 않은 exit 요청에 대한 챌린지를 수행한다. 해당 요청 트랜잭션이 reverted 되었음을 증거로 루트 체인에서 유효성을 확인한다.

- `challengeNullAddress()`: NRB의 트랜잭션들은 항상 일반 트랜잭션이어야 한다. 즉, `NA`가 보낸 요청 트랜잭션들은 `NRB`에 포함될 수 없다. 그러한 유효하지 않은 `NRB`에 대한 챌린지를 관리한다.

- `startExit(address _to, bytes32 _trieKey, bytes _trieValue)`

  Exit 요청을 생성한다. `_to`는 루트 체인의 requestalbe contract의 주소를, `_trieKey`와 `_trieValue`는 요청을 생성할 파라미터.

- `startEnter(address _to, bytes32 _trieKey, bytes _trieValue)`

  Enter 요청을 생성한다. 파라미터는 `startExit`과 동일.
