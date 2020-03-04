---
id: examples-and-best-practices
title: Examples and Best Practices of Requestable Contract
sidebar_label: Examples and Best Practices
---

> This document describes contract implementation without continuous rebase which is currently work in progress.

## Counter
Let's start from a simple counter contract that only increases numbers. We are going to add a requestable function to this simple `BaseCounter`, and improve the issues gradually. 

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
For making this requestable, we can define state variable 'n' to be increased or decreased by enter or exit requests. It will work like below.

![SimpleCounter](assets/learn_advanced_examples_SimpleCounter.png)

Yellow box means that the counter() has increased `n` by 1, and red box is `n` changed by enter request, the green box is `n` changed by exit request.


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

`SimpleCounter` increases or decreases `n` according to requests. The counter has to check both contracts on root and child chain in order to get total counts. However, the counter in which `n` decreases may not be desirable. We can improve it by adding counter only on either chain, which is `FreezableCounter`.



### FreezableCounter
In `FreezableCounter`, counter on child chain is frozen at default. When an enter request is generated, it freezes the counter in the root chain. After the request is applied in child chain, the counter in the child chain will be unfreezed. This will not allow `n` to decrease.

![FreezableCounter](assets/learn_advanced_examples_FreezableCounter.png)

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

However, because of challenge period of exit request, both counters remain frozen until end of the period. In addition, since either counter must be frozen, the drawback is that only special accounts can make requests. Therefore, to prevent this, we need to keep track of "how much `n` is changed by requests" by managing new state variable.


### TrackableCounter
`TrackableCounter` has new variable `requestableN` for checking whether enter or exit can be delivered or not. `counter()` now increases `n` and `requestableN` at the same time, and decreases `requestableN` on root chain in enters(or on child chain in exit). When request for `counter` is applied to the root or child chain, it increases `n` on the chain. 



<!-- 상태 변수를 1개 더 사용하고 컨트랙트 구현에 다소 복잡해지는 것과 `n`이 감소하는 경우는 상충(trade-off) 합니다. -->

![TrackableCounter](assets/learn_advanced_examples_TrackableCounter.png)


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
For ERC20 token contract, there are two possible ways to implement `balances[holder]`, [SimpleCounter] and [FreezableCounter]. `SimpleCounter` allows token issued in child chain to be exited to parent chain at all times, but `FreezableCounter` should always lock the amount of token exited in the root chain. In this document, we only describe `SimpleCounter`.


### RequestableSimpleToken
([github](https://github.com/Onther-Tech/requestable-simple-token/blob/master/contracts/RequestableSimpleToken.sol))

`RequestableSimpleToken` is a contract where the `owner` can issue new tokens and token holders can send tokens to others or generate requests.

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

You can check requestable token contract based on OpenZeppelin and ds-token in following links.

- [RequestableERC20WrapperToken](https://github.com/Onther-Tech/requestable-erc20-wrapper-token/blob/master/contracts/RequestableERC20Wrapper.sol)
- [requestable-ds-wrapper-token](https://github.com/Onther-Tech/requestable-ds-wrapper-token)



### Requestable CryptoKitties

> You can check the detalis of this part [here](https://medium.com/onther-tech/cryptokitties-in-plasma-574159c581dc).

![RequestableCryptoKitties](assets/learn_advanced_examples_RequestableCryptoKitties.png)

[CryptoKitties](https://github.com/cryptocopycats/awesome-cryptokitties)에서 실제로 배포되는 컨트랙트는 `KittyCore`, `SaleClockAuction`, `SiringClockAuction`으로 ERC721 토큰으로서의 기능은 `KittyCore`가 담당한다.

The contracts deployed for [CryptoKitties](https://github.com/cryptocopycats/awesome-cryptokitties) are `KittyCore`, `SaleClockAuction`, `SiringClockAuction`, and `KittyCore`. `KittyCore` manages functions related to ERC721.

Requests for state variables of CryptoKitties can be defined as follows:

- `KittyAccessControll.paused`: only enter by anyone
- `KittyAccessControll.ceoAddress`: only enter by anyone
- `KittyAccessControll.cfoAddress`: only enter by anyone
- `KittyAccessControll.cooAddress`: only enter by anyone
- `KittyBreeding.autoBirthFee`: only enter by anyone

Variables above may be enforced to move to one direction by allowing only enter from root to child chain.

- `KittyBase.kitties`: enter or exit by anyone
- `KittyBase.kittyIndexToOwner`: enter and exit by kitty owner

It allows for anyone to request for `kitties`, and only owner of kitty can request one's kitty in the `kitties`.

- `KittyBase.kittyIndexToApproved`: non-requestable.
- `KittyBase.ownershipTokenCount`: non-requestable.
- `KittyBase.sireAllowedToAddress`: non-requestable

Variables above will be deleted when ownership is changed in `transfer()`, and they are not requestable.

- `KittyBreeding.pregnantKitties`: Pregenent Kitty Ownership Request.

It increases or decreases when transferring ownership of pregnant kitty.


- `KittyBase.saleAuction`: non-requestable. set by CEO
- `KittyBase.siringAuction`: non-requestable. set by CEO
- `KittyBreeding.geneScience`: non-requestable. set by CEO
- `KittyCore.newContractAddress`: non-requestable. set by CEO

External contract addresses, set by only CEO, is not requestable.

- `KittyMinting.promoCreatedCount`: only enter by anyone
- `KittyMinting.gen0CreatedCount`: only enter by anyone

The above two variables are simple constants, and anyone can request them.



## RequestableMultisig

> This example is not for production use.

([github](https://github.com/Onther-Tech/requestable-multisig))

`RequestableMultisig` is requetable version of [MultiSigWallet](https://github.com/gnosis/MultiSigWallet/blob/master/contracts/MultiSigWallet.sol).

`RequestableMultisig` manages transaction data sent from multisig contract with struct `Transaction` and variable `transactions`. Signatures of the transaction are collected in variable `confirmations`, and it will run when `confirmations` >  `_required`. You can run again in an error; e.g out of gas, and if it is executed successfully, the result of the transaction will be applied to variable `executed`. Requests of `RequestableMultisig` are as follows:


### 1. `transactions`
This request simply keeps data of both chain identical, and `trieValue` of the request is transaction data, RLP encoded. Transaction data is registered and confirmed in `submitTransaction`, and this request records only data without confirmation. Only `owner` can call this request.

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
Transactions executed in one chain must not be re-excuted in another chain. Requests to `executed` prevent re-execution of the transaction.


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
"Request for new `confirmations`" corresponding to `confirmTransaction` is request to apply new confirmation of `owner` to another chain. For non-executed transactions, this will prevent execution of the transaction from confirmation as in the request for `executed`.


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

"Request for deleted `confirmations`" corresponding to function `revokeConfirmation` functions as the opposite.



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

> It is not necessary to seperate "request for new variable `confirmations`" and "request for deleted `confirmations`" with different `trieKey`. You can merge both requests into one, and use `trieValue` as `RLP.encode(transactionId, isNew)`.


### 4. New / Removed `owners`
Request for new `owner` or deleted `owner`.

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