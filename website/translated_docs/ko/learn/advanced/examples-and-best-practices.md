---
id: examples-and-best-practices
title: Examples and Best Practices of Requestable Contract
sidebar_label: Examples and Best Practices
---

> Continuous Rebase는 아직 개발중으로 본 문서에서는 해당 기능이 빠진 컨트랙트 구현을 다루고 있다.

## Counter
단순히 숫자가 증가만 하는 카운터 컨트랙트를 먼저 살펴보자. 이 문서는 우선 기본적인 기능을 하는 `BaseCounter` 컨트랙트부터 요청 가능한(Requestable) 기능을 추가하고, 각 예시에서 발생하는 문제점들을 점차 개선하는 방식으로 서술되어 있다.

### BaseCounter
```solidity
pragma solidity ^0.4.24;


contract BaseCounter {
  uint n;

  event Counted(uint _n);

  function count() external {
    n++;
    emit Counted(n);
  }

  function getCount() external view returns (uint) {
    return n;
  }
}
```

### SimpleCounter

먼저 가장 간단하게 Requestable을 고려한다면 상태 변수 `n`을 enter 혹은 exit 요청에 따라 증감시킬 수 있다. 컨트랙트는 아래와 같은 방식으로 동작한다.

![](https://i.imgur.com/GQaEylR.png)

<!-- A yellow box means that the counter() has increased the status variable n by 1, a red box means entering the request changes n, and a green box means exiting the request changes n. -->

*노란색 네모*는 `counter()` 함수로 `n`이 1씩 증가하는 것, *빨간색 네모*는 enter 요청으로 변경된 `n`의 값을, *초록색 네모*는 exit 요청으로 변경된 `n`의 값을 가리킨다.


```solidity
pragma solidity ^0.4.24;

import {SimpleDecode} from "../lib/SimpleDecode.sol";
import {RequestableI} from "../lib/RequestableI.sol";
import {BaseCounter} from "./BaseCounter.sol";
import {SafeMath} from "openzeppelin-solidity/contracts/math/SafeMath.sol";


/// @notice A request can decrease `n`. But, is it right to decrease the count?
contract SimpleCounter is BaseCounter, RequestableI {
  // SimpleDecode library to decode trieValue.
  using SimpleDecode for bytes;
  using SafeMath for *;

  // trie key for state variable `n`.
  bytes32 constant public TRIE_KEY_N = 0x00;

  // address of RootChain contract.
  address public rootchain;

  mapping (uint => bool) appliedRequests;

  constructor(address _rootchain) {
    rootchain = _rootchain;
  }

  function applyRequestInRootChain(
    bool isExit,
    uint256 requestId,
    address requestor,
    bytes32 trieKey,
    bytes trieValue
  ) external returns (bool success) {
    require(!appliedRequests[requestId]);
    require(msg.sender == rootchain);

    // only accept request for `n`.
    require(trieKey == TRIE_KEY_N);

    if (isExit) {
      n = n.add(trieValue.toUint());
    } else {
      n = n.sub(trieValue.toUint());
    }

    appliedRequests[requestId] = true;
  }

  function applyRequestInChildChain(
    bool isExit,
    uint256 requestId,
    address requestor,
    bytes32 trieKey,
    bytes trieValue
  ) external returns (bool success) {
    require(!appliedRequests[requestId]);
    require(msg.sender == address(0));

    // only accept request for `n`.
    require(trieKey == TRIE_KEY_N);

    if (isExit) {
      n = n.sub(trieValue.toUint());
    } else {
      n = n.add(trieValue.toUint());
    }

    appliedRequests[requestId] = true;
  }
}
```

<!-- However, SimpleCounter may decrease with variable n due to enter and exit. If this is not desired, you can implement counter contract as below. -->

`SimpleCounter`는 `n`을 각 요청에 따라 증감시킨다. 이 경우 총 카운터를 계산하기 위하여 양 체인의 두 컨트랙트를 모두 참조해야 한다. 또한 `n`이 감소하는 카운터가 바람직한지 고려해야한다. 이 두가지를 활용하면 한 쪽 체인에서만 카운터를 동작시키는 것이 가능하다.

### FreezableCounter

<!-- Enter and exit can be applied after freezing the contracts in each chain. FreezableCounter can be avoided if the number decreases through the request method after freezing. -->

자식 체인에서는 기본적으로 카운터가 멈춰있는 상태로 시작한다. 루트 체인에서 enter 요청이 생성될 경우 루트 체인의 카운터가 동작을 멈추고 요청이 반영된 순간 자식 체인의 카운터가 동작한다. exit 요청의 경우 자식 체인의 카운터를 멈추고 부모 체인의 카운터를 동작시킨다. 이를 통해 `n`이 감소하는 것을 막을 수 있다.

![](https://i.imgur.com/IDHhZRs.png)

```solidity
pragma solidity ^0.4.24;

...


/// @notice Both contract may be frozen at the same time. Is it right?
contract FreezableCounter is BaseCounter, RequestableI {
  ...

  // freeze counter before make request.
  bool public frozen;

  constructor(address _rootchain) {
    rootchain = _rootchain;

    // Counter in child chain is frozen at first.
    if (_rootchain == address(0)) {
      frozen = true;
    }
  }

  function freeze() external returns (bool success) {
    frozen = true;
    return true;
  }

  function applyRequestInRootChain(
    bool isExit,
    uint256 requestId,
    address requestor,
    bytes32 trieKey,
    bytes trieValue
  ) external returns (bool success) {
    ...
    require(frozen);

    ...

    if (isExit) {
      frozen = false;
      n = trieValue.toUint();
    } else {
      require(n == trieValue.toUint());
    }

    ...
  }

  function applyRequestInChildChain(
    bool isExit,
    uint256 requestId,
    address requestor,
    bytes32 trieKey,
    bytes trieValue
  ) external returns (bool success) {
    ...
    require(frozen);

    ...

    if (isExit) {
      require(n == trieValue.toUint());
    } else {
      n = trieValue.toUint();
      frozen = false;
    }

    ...
  }
}
```

<!-- However, the challenge period exists until exit is applied in root chain, for this freeze counter, all counters in each chain are frozen before the end of this challenge period. The enter is relatively short, but both are frozen. Therefore, to prevent this, the state variable used for enter and the state variable used for exit must be different. -->

이 구현체의 경우 가장 큰 문제는 exit 요청이 부모 체인에 반영될 때 블록과 요청에 대햔 챌린지 기간을 가진다는 점이다. 따라서 exit 요청이 finalize되기 전에는 양 체인의 모든 카운터가 멈춰있는 상태가 된다. 또한 한 체인의 동작을 멈출 수 밖에 없기에 `FreezableCounter`에 대해 enter 혹은 exit 요청을 보내는 것은 특정 어카운트만 수행할 수 있도록 권한을 주어야 하는 단점이 있다. 이를 방지하기 위하여 "요청으로 인해 `n`이 얼마나 변경 되었는가"를 별도의 상태 변수로 관리해야 한다.


### TrackableCounter

<!-- TrackableCounter checks whether enter and exit is possible through a separate state variable requestableN in enter in the root chain and exit in child chain, reduces the value, and increases n in exit in the root chain and enter in the child chain. Both operations can prevent the reduction of n and apply only the correct enter and exit. -->

`TrackableCounter`는 다른 체인에 값을 전달할 수 있는가를 별도의 상태변수 `requestableN`을 통해 관리한다. `counter()`는 기존의 `n`과 `requestableN`를 동시에 증가시키며, 부모 체인에서의 enter(혹은 자식 체인에서의 exit)의 경우 해당 체인에서는 `requestableN`만 감소시킨다. 또한 이 요청이 다른 체인에 적용될 때는 `n`만 증가시킨다. 부모 체인에서의 exit(혹은 자식 체인에서의 enter)의 경우는 이를 반대로 수행한다.

<!-- 상태 변수를 1개 더 사용하고 컨트랙트 구현에 다소 복잡해지는 것과 `n`이 감소하는 경우는 상충(trade-off) 합니다. -->

![](https://i.imgur.com/CZ6DnAG.png)


```solidity
pragma solidity ^0.4.24;

...

contract TrackableCounter is BaseCounter, RequestableI {
  ...

  // previous count before enter request in root chain and exit request in child chain.
  uint public requestableN;

  ...

  /// @dev override BaseCounter.count function.
  function count() external {
    requestableN++;
    n++;
    emit Counted(n);
  }

  function applyRequestInRootChain(
    bool isExit,
    uint256 requestId,
    address requestor,
    bytes32 trieKey,
    bytes trieValue
  ) external returns (bool success) {
    ...

    uint _n = trieValue.toUint()
    if (isExit) {
      n = n.add(_n);
    } else {
      requestableN = requestableN.sub(_n);
    }

    ...
  }

  function applyRequestInChildChain(
    bool isExit,
    uint256 requestId,
    address requestor,
    bytes32 trieKey,
    bytes trieValue
  ) external returns (bool success) {
    ...

    if (isExit) {
      requestableN = requestableN.sub(_n);
    } else {
      n = n.add(_n);
    }

    ...
  }
}
```

## Token

ERC20 토큰 컨트랙트의 경우 `balances[holder]` 변수에 대하여 [SimpleCounter](#simplecounter)와 [FreezableCounter](#freezablecounter) 방식 두 가지로 작성할 수 있다. `SimpleCounter` 방식은 자식 체인에서 발행된 토큰은 언제나 부모 체인으로 exit 될 수 있지만, `FreezableCounter` 방식은 언제나 exit 되는 토큰의 수량만큼 부모 체인에서 묶여있어야 한다. 본 문서에선 `SimpleCounter` 방식만을 다루고 있다.

### RequestableSimpleToken
([github](https://github.com/Onther-Tech/requestable-simple-token/blob/master/contracts/RequestableSimpleToken.sol))

`RequestableSimpleToken`는 `owner`가 토큰을 발행하고 일반 토큰 홀더가 자신의 토큰을 다른이에게 전송하거나 요청을 생성할 수 있는 컨트랙트다.

```solidity
contract RequestableSimpleToken is Ownable, RequestableI {
  using SafeMath for *;

  // `owner` is stored at bytes32(0).
  // address owner; from Ownable

  // `totalSupply` is stored at bytes32(1).
  uint public totalSupply;

  // `balances[addr]` is stored at keccak256(bytes32(addr), bytes32(2)).
  mapping(address => uint) public balances;

  // requests
  mapping(uint => bool) appliedRequests;

  bytes32 constant public KEY_OWNER         = 0x0000000000000000000000000000000000000000000000000000000000000000;
  bytes32 constant public KEY_TOTAL_SUPPLY  = 0x0000000000000000000000000000000000000000000000000000000000000001;
  bytes32 constant public PERFIX_BALANCES   = 0x0000000000000000000000000000000000000000000000000000000000000002;

  /* Events */
  event Transfer(address _from, address _to, uint _value);
  event Mint(address _to, uint _value);
  event Requested(bool _isExit, address _requestor, bytes32 _trieKey, bytes _trieValue);

  function transfer(address _to, uint _value) public {
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);

    emit Transfer(msg.sender, _to, _value);
  }

  function mint(address _to, uint _value) public onlyOwner {
    totalSupply = totalSupply.add(_value);
    balances[_to] = balances[_to].add(_value);

    emit Mint(_to, _value);
    emit Transfer(address(0), _to, _value);
  }

  // User can get the trie key of one's balance and make an enter request directly.
  function getBalanceTrieKey(address who) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(bytes32(bytes20(who)), PERFIX_BALANCES));
  }

  function applyRequestInRootChain(
    bool isExit,
    uint256 requestId,
    address requestor,
    bytes32 trieKey,
    bytes calldata trieValue
  ) external returns (bool success) {
    // TODO: adpot RootChain
    // require(msg.sender == address(rootchain));

    require(!appliedRequests[requestId]);

    if (isExit) {
      if (KEY_OWNER == trieKey) {
        // only owner (in child chain) can exit `owner` variable.
        // but it is checked in applyRequestInChildChain and exitChallenge.

        // set requestor as owner in root chain.
        _transferOwnership(requestor);
      } else if (KEY_TOTAL_SUPPLY == trieKey) {
        // no one can exit `totalSupply` variable.
        // but do nothing to return true.
      } else if (getBalanceTrieKey(requestor) == trieKey) {
        // this checks trie key equals to `balances[requestor]`.
        // only token holder can exit one's token.
        // exiting means moving tokens from child chain to root chain.
        balances[requestor] += decodeTrieValue(trieValue);
      } else {
        // cannot exit other variables.
        // but do nothing to return true.
      }
    } else {
      // apply enter
      if (KEY_OWNER == trieKey) {
        // only owner (in root chain) can enter `owner` variable.
        require(owner() == requestor);
        // do nothing in root chain
      } else if (KEY_TOTAL_SUPPLY == trieKey) {
        // no one can enter `totalSupply` variable.
        revert();
      } else if (getBalanceTrieKey(requestor) == trieKey) {
        // this checks trie key equals to `balances[requestor]`.
        // only token holder can enter one's token.
        // entering means moving tokens from root chain to child chain.
        require(balances[requestor] >= decodeTrieValue(trieValue));
        balances[requestor] -= decodeTrieValue(trieValue);
      } else {
        // cannot apply request on other variables.
        revert();
      }
    }

    appliedRequests[requestId] = true;

    emit Requested(isExit, requestor, trieKey, trieValue);

    // TODO: adpot RootChain
    // setRequestApplied(requestId);
    return true;
  }

  // this is only called by NULL_ADDRESS in child chain
  // when i) exitRequest is initialized by startExit() or
  //     ii) enterRequest is initialized
  function applyRequestInChildChain(
    bool isExit,
    uint256 requestId,
    address requestor,
    bytes32 trieKey,
    bytes calldata trieValue
  ) external returns (bool success) {
    // TODO: adpot child chain
    // require(msg.sender == NULL_ADDRESS);
    require(!appliedRequests[requestId]);

    if (isExit) {
      if (KEY_OWNER == trieKey) {
        // only owner (in child chain) can exit `owner` variable.
        require(owner() == requestor);

        // do nothing when exit `owner` in child chain
      } else if (KEY_TOTAL_SUPPLY == trieKey) {
        // no one can exit `totalSupply` variable.
        revert();
      } else if (getBalanceTrieKey(requestor) == trieKey) {
        // this checks trie key equals to `balances[tokenHolder]`.
        // only token holder can exit one's token.
        // exiting means moving tokens from child chain to root chain.

        // revert provides a proof for `exitChallenge`.
        require(balances[requestor] >= decodeTrieValue(trieValue));

        balances[requestor] -= decodeTrieValue(trieValue);
      } else { // cannot exit other variables.
        revert();
      }
    } else { // apply enter
      if (KEY_OWNER == trieKey) {
        // only owner (in root chain) can make enterRequest of `owner` variable.
        // but it is checked in applyRequestInRootChain.

        _transferOwnership(requestor);
      } else if (KEY_TOTAL_SUPPLY == trieKey) {
        // no one can enter `totalSupply` variable.
      } else if (getBalanceTrieKey(requestor) == trieKey) {
        // this checks trie key equals to `balances[tokenHolder]`.
        // only token holder can enter one's token.
        // entering means moving tokens from root chain to child chain.
        balances[requestor] += decodeTrieValue(trieValue);
      } else {
        // cannot apply request on other variables.
        revert();
      }
    }

    appliedRequests[requestId] = true;

    emit Requested(isExit, requestor, trieKey, trieValue);
    return true;
  }

  function decodeTrieValue(bytes memory trieValue) public pure returns (uint v) {
    require(trieValue.length == 0x20);

    assembly {
       v := mload(add(trieValue, 0x20))
    }
  }
}
```

OpenZeppelin과 ds-token 기반의 requestable 토큰 컨트랙트는 다음에서 확인할 수 있다.
- [RequestableERC20WrapperToken](https://github.com/Onther-Tech/requestable-erc20-wrapper-token/blob/master/contracts/RequestableERC20Wrapper.sol)
- [requestable-ds-wrapper-token](https://github.com/Onther-Tech/requestable-ds-wrapper-token)



### Requestable CryptoKitties

> 이 항목에 대한 자세한 설명은 [여기](https://medium.com/onther-tech/cryptokitties-in-plasma-574159c581dc)서 확인할 수 있다.

![](https://miro.medium.com/max/570/1*8GIz9Ovmdq-bQRMjQDkrIw.png)

[CryptoKitties](https://github.com/cryptocopycats/awesome-cryptokitties)에서 실제로 배포되는 컨트랙트는 `KittyCore`, `SaleClockAuction`, `SiringClockAuction`으로 ERC721 토큰으로서의 기능은 `KittyCore`가 담당한다.

CryptoKitties의 상태변수에 대한 요청은 다음과 같은 방식으로 정리할 수 있다.

- `KittyAccessControll.paused`: only enter by anyone
- `KittyAccessControll.ceoAddress`: only enter by anyone
- `KittyAccessControll.cfoAddress`: only enter by anyone
- `KittyAccessControll.cooAddress`: only enter by anyone
- `KittyBreeding.autoBirthFee`: only enter by anyone

위 변수들은 루트체인에서 자식체인으로 enter 만 허용함으로서 권한을 일방향으로 강제할 수 있다.

- `KittyBase.kitties`: enter or exit by anyone
- `KittyBase.kittyIndexToOwner`: enter and exit by kitty owner

개별 키티의 데이터를 가지고있는 kitties 변수는 누구나 request할 수 있도록 허용하며, 해당 키티의 소유자만이 소유권에 대한 request를 만들 수 있어야 한다.

- `KittyBase.kittyIndexToApproved`: non-requestable.
- `KittyBase.ownershipTokenCount`: non-requestable.
- `KittyBase.sireAllowedToAddress`: non-requestable

위 변수들은 transfer() 함수에서 소유권의 이전과 함께 삭제되는 값들이다. 직접적인 request 대상이 되지 않는다.

- `KittyBreeding.pregnantKitties`: Pregenent Kitty Ownership Request enter / exit 시 증감

임신한 키티의 소유권을 다른 체인으로 이동시킬 때 증감시킨다.

- `KittyBase.saleAuction`: non-requestable. set by CEO
- `KittyBase.siringAuction`: non-requestable. set by CEO
- `KittyBreeding.geneScience`: non-requestable. set by CEO
- `KittyCore.newContractAddress`: non-requestable. set by CEO

외부 컨트랙트의 주소들은 오직 CEO만 설정 가능하기에 requestable 하지 않다.

- `KittyMinting.promoCreatedCount`: only enter by anyone
- `KittyMinting.gen0CreatedCount`: only enter by anyone

위 두 값들은 단순한 상수로 누구나 requestable 해야 한다.


## RequestableMultisig

> 이 예제를 실제 환경에서 사용하기 위해서는 추가적인 테스트가 필요하다.

([github](https://github.com/Onther-Tech/requestable-multisig))

 `RequestableMultisig`는 [MultiSigWallet](https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol)를 requestable하게 변경한 컨트랙트다.

 `RequestableMultisig`는 멀티 시그 컨트랙트가 보낼 트랜잭션 데이터를 `Transaction` 구조체와 `transactions` 변수로 관리한다. 그리고 해당 트랜잭션에 대한 서명을 `confirmations` 변수로 수집한 후 이것이 정족수(`_required`)를 넘으면 실행된다. out-of-gas와 같은 에러가 발생할 경우 다시 실행이 가능하며, 올바르기 실행된 경우 `executed` 변수에 결과를 반영한다. `RequestableMultisig`의 요청은 다음으로 나누어진다.

 ### 1. `transactions`

`trieValue`는 RLP 인코딩된 Transaction 데이터이고, 이 요청은 단순하게 양 체인간의 데이터를 동일하게 유지하는 기능을 한다. `submitTransaction` 함수가 트랜잭션 데이터를 등록하고 confirm을 하는데, 이 요청은 confirm 과정을 제외하고 순수하게 데이터만 등록한다. 다만 이에 대한 호출은 `owner`만이 할 수 있다.

```solidity
_handleTransaction(isRootChain, isExit, toTransaction(trieValue));

function _handleTransaction(bool isRootChain, bool isExit, Transaction memory transaction) internal {
  bytes32 transactionId = hash(transaction);

  // transaction check
  //                          isRootChain == true       isRootChain == false
  //                       +--------------------------------------------------
  //     enter request     |  must be added         |  must not be added
  //     exit request      |  must not be added     |  must be added

  if (isRootChain && !isExit || !isRootChain && isExit) {
    require(transactions[transactionId].added);
  } else {
    require(!transactions[transactionId].added);
    addTransaction(transaction.destination, transaction.value, transaction.data);
  }
}
```

### 2. `executed`

한 쪽 체인에서 실행된 트랜잭션은 다른 체인에서 동일하게 실행되어선 안된다. `executed` 변수에 대한 요청은 실행된 트랜잭션에 대해 중복으로 처리되는 것을 방지한다.

```solidity
_handleExecuted(isExit, trieValue.toBytes32());

function _handleExecuted(bool isExit, bytes32 transactionId)
  internal
{
  // short circuit if transaction is already executed for exit request.
  require(!isExit || !executed[transactionId]);
  executed[transactionId] = true;
  emit ExecutionAdded(transactionId);
}
```

### 3. New / Revoked `confirmations`
`confirmTransaction` 함수에 대응하는 "새로운 `confirmations` 변수에 대한 요청"은 `owner`의 새로운 confirm을 다른 체인에 반영하는 요청이다. 이는 실행되지 않은 트랜잭션에 대해서 `executed`에 대한 요청과 마찬가지로 confirm을 통한 트랜잭션의 실행을 방지한다.

```solidity
_handleNewConfirmation(isRootChain, isExit, requestor, trieValue.toBytes32());

function _handleNewConfirmation(
  bool isRootChain,
  bool isExit,
  address requestor,
  bytes32 transactionId
)
  internal
  notExecuted(transactionId)
{
  // check ownership for exit request.
  require(!isExit || isOwner[requestor]);

  // confirmation check
  //                          isRootChain == true       isRootChain == false
  //                       +--------------------------------------------------
  //     enter request     |  must be confirmed      |  must not be confirmed
  //     exit request      |  must not be confirmed  |  must be confirmed
  if (isRootChain && !isExit || !isRootChain && isExit) {
    require(confirmations[transactionId][requestor]);
    confirmations[transactionId][requestor] = false;
  } else {
    require(!confirmations[transactionId][requestor]);
    confirmations[transactionId][requestor] = true;
    emit Confirmation(requestor, transactionId);
  }
}
```

`revokeConfirmation` 함수에 대응하는 "제거된 `confirmations` 변수에 대한 요청"은 이전과 반대의 기능을 한다.

```solidity
_handleRevokedConfirmation(isRootChain, isExit, requestor, trieValue.toBytes32());

function _handleRevokedConfirmation(
  bool isRootChain,
  bool isExit,
  address requestor,
  bytes32 transactionId
)
  internal
  notExecuted(transactionId)
{
  // check ownership for exit request.
  require(!isExit || isOwner[requestor]);

  // confirmation check
  //                          isRootChain == true       isRootChain == false
  //                       +--------------------------------------------------
  //     enter request     |  must be not confirmed  |  must be confirmed
  //     exit request      |  must be confirmed      |  must not be confirmed
  if (isRootChain && !isExit || !isRootChain && isExit) {
    require(!confirmations[transactionId][requestor]);
  } else {
    require(confirmations[transactionId][requestor]);
    confirmations[transactionId][requestor] = false;
    emit Revocation(requestor, transactionId);
  }
}
```

> "새로운 `confirmations` 변수에 대한 요청"과 제거된 `confirmations` 변수에 대한 요청은 별도의 `trieKey`로 반드시 구분지을 필요는 없다. 두 개의 요청을 하나의 요청으로 축소시키고, `trieValue`를 `RLP.encode(transactionId, isNew)`와 같은 방식으로 사용할 수 도 있다.

### 4. New / Removed `owners`

새로운 `owner` 혹은 제거된 `owner`에 대한 요청.

```solidity
  function _handleNewOwner(bool isRootChain, bool isExit, address owner) internal {
    if (isRootChain && !isExit || !isRootChain && isExit) {
      require(isOwner[owner]);
    } else {
      this.addOwner(owner);
    }
  }

  function _handleRemovedOwner(bool isRootChain, bool isExit, address owner) internal {
    if (isRootChain && !isExit || !isRootChain && isExit) {
      require(!isOwner[owner]);
    } else {
      this.removeOwner(owner);
    }
  }
```
