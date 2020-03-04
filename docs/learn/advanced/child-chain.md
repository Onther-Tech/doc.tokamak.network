---
id: child-chain
title: Child Chain
sidebar_label: Child Chain
---

## Operator, User, and Challenger

### Operator
**Operators** run the child chain. Operators aggregate user's transactions in blocks, and submit them to the RootChain contract. Anyone can be an operator, and the number of operators in the child chain is configurable.

### User
**Users** use child chain operated by the operator and move assets and state between the root and child chain. 

Users can run their own nodes to monitor the operations of the child chain, and when they notice attacks, they can escape or become a challenger to protect their assets.


### Challenger
**Challengers** can correct the operator or user's actions through challenges if they have violated a predefined rule. 

There are no requirements to become a challenger, which means that anyone can be a challenger.



## Block and Epoch
There are three types of blocks in the child chain.

- **Non-Request Block(NRB)**
- **Request Block(RB)**
- **Escape Block(EB)**

**Non-request blocks** are the same as normal blocks. It includes transactions of users. 

**Request block** is a block that includes only requests. Enter and exit requests are processed in RB. 

**Escape blocks** are mined only under special conditions. Continuous rebase provides a period of time for users to check data availability and escape from the child chain. When users submit an escape request to the RootChain contract, escape blocks are mined.

**Epoch** is a period that contains several blocks. Depending on the type of the block, there are three types of epochs:
- **Non-Request Epoch (NRE)*
- **Request Epoch (RE)*
- **Escape Epoch (EE))**

**Length** of epoch means the number of blocks included in it. The length of non-request epoch does not change because it is a pre-defined constant. The number of blocks included in request and escape epoch may vary depending on the number of requests submitted by users, thus the length of both epochs is variable.

However, the genesis block is the 0th non-request epoch, and the length of the epoch is always 1.


## Block Submission
Operators run the child chain and submit blocks to the RootChain contract. The RootChain contract assigns the types of epochs to submit and implements the transactions and requests in the following order.

1. NRE#1 is placed after NRE#0.
2. After NRE#N, RE#(N+1) is always placed. Similarly, after RE#N, NRE#(N+1) is placed.
3. Requests generated when current epoch is NRE#N or RE#(N+1), are applied in RE#(N+3). If they are not generated, the length of the RE becomes 0.

In summary, the base rule is to place non-request epoch after a request epoch, and request epoch after non-request epoch. Requests are not immediately included in the next request epoch, but will be included in the request epoch following the next request epoch.

![simple rootchain](assets/learn_advanced_simple_rootchain.png)

As described in the figure above, the state of RootChain contract changes regularly to `AcceptNRB` and `AcceptRB` to receive two types of blocks. In `AcceptNRB`, only non-request blocks can be submitted, and request blocks can be submitted only to `AcceptRB`. The operator must submit blocks according to the state of the RootChain contract. The figure shows how the state of RootChain contract changes. 

When submitting blocks, operators must include three merkle roots which are `stateRoot`, `transactionsRoot`, `receiptsRoot.` However, under certain conditions, they can submit only `transactionsRoot.` Details will be described in the continuous rebase section.


## Request and Request Transaction

### Request
Request is a request that users sumbit to RootChain contract in order to transfer assets or states between root and child chain. There are 4 types of request:

- Enter request: request to transfer assets or state from root to child chain
- Exit request: request to transfer assets or state from child to root chain
- Escape request: request to escape from child chain, this is used in data unavailability
- Undo request: request to undo old enter requests in data unavailability

Enter and exit requests are included in the request block, escape and undo requests are included in the escape block.

Request consists of the following 4 parameters.

- `requestor`: account that generated the request
- `to`: an address of requestable contract deployed on root chain
- `trieKey`: identifier of request
- `trieValue`: value of request


### Request Transaction
Requests are implemented in the form of request transactions on the child chain. Request transaction consists of the following 5 parameters.

- `sender`: null address(NA)
- `to`: an address of requestable contract deployed on child chain
- `value`: 0
- `function signature`: a specific function signature of requestable contract
- `parameters`: parameters for calling functions of contract

Null address has no private key and the address is 0x00, meaning that anyone can be mine the block that includes requests.

All requests are submitted to the RootChain contract, so the users can submit the request and mine the blocks themselves even after the operator stops the operation of the child chain.

### Requestable Contract
Requestable contract is a contract that can execute the requests and is deployed to the root and child chain. The requestable contract should implement the following interface to apply all requests.


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

### Apply Enter Request
RootChain contract applies enter requests to the requestable contract deployed on each chain in the following order:

![apply enter](assets/learn_advanced_enter.png)

1. The user sends a transaction calling RootChain.startEnter() to RootChain contract.
2. RootChain contract applies enter request to requestable contract in the root chain. Enter request will not be generated if the transaction is reverted in this process.
3. If step 2 has been processed successfully, the RootChain contract records enter request.
4. In request epoch, operator mines request block including request transaction.
5. Request transaction changes the state of the child chain according to enter request.



### Apply Exit Request
RootChain contract applies exit request to the requestable contract deployed on each chain in the following order:

![apply exit](assets/learn_advanced_exit.png)

1. User sends transaction calling RootChain.startExit() to RootChain contract.
2. Unlike enter request, exit request is immediately recorded and included in the request block in the form of request transaction.
3. After the challenge period of the request block is finished, challenge period of the exit request begins. If the request transaction in step 2 is reverted, anyone can execute exit challenge by calling RootChain.challengeExit() function.
4. After challenge in step 3, exit request is finalized by calling RootChain.finalizeRequest(). Through this request, the exit request is deployed on the root chain through the requestable contract.

The key is that enter request is applied to the root chain first and then to the child chain, and exit request is applied to child chain and then on the root chain only when the request is valid.


### Apply Escape and Undo Request
Escape and undo request are executed same as the exit request, but request transactions are included in escape block, not the request block. Check more details on continuous rebase section.

![request and challenge](assets/learn_advanced_request_and_challenge.png)


## Challenge
Challengers can challenge child chains to enforce correct operation. There are 3 types of challenges:

### Null Address Challenge
Null address challenge is a challenge submitted when non-request blocks contain transactions with null address as `sender`. Such transactions mean that it was meant for request transactions, and they must not be included in a non-request block.

Challenger can prove that the non-request block committed to the RootChain contract includes a request transaction through merkle proofs.


### Exit Challenge
Exit challenge is a challenge submitted if an exit or escape request is not appropriate. An incorrect exit or escape request transaction is reverted in the child chain, in which case the request should also be deleted from the RootChain contract.

Challengers prove that the request transaction is reverted in child chain through merkle proof.  However, in order to proceed with the exit challenge, exit or escape request must be finalized. Otherwise, an operator can attack the protocol and the request transaction that should not be reverted may be reverted.


### Computation Challenge
Computation challenge is a challenge submitted when an operator does not execute the transactions correctly in all types of blocks.

When operators submit invalid `stateRoot`, it may be challenged via Truebit-like verification game with `blockData`, `preStateRoot`, `postStateRoot`.

![verification game](assets/learn_advanced_verification_game.png)


### Verification Game
Verification game proposed by Truebit is comparing actual output with the expected output after executing only one opcode. Plasma EVM verifies computation using [solEVM](https://github.com/Onther-Tech/solEVM), a smart contract that runs an EVM inside the EVM that has been implemented by Ohalo Limited and Parsec Labs.


## Stamina
**Stamina** is used to for **delegatee** to charge gas to **delegator** in transaction execution model of child chain. In short, delegatee pays gas as stamina for delegator. Stamina can be obtained by depositing state balance in stamina contract. An account that deposited stamina is called **depositor account**.

Stamina balance of delegatee is deducted after paying gas for delegator. The deducted stamina is recoverd after a certain period of time. The time period is called **recovery epoch**, and after the period, same amount of stamina as the total amount deposited in the account is recovered.


### Set Delegator
Delegatee can set delegator. On the contrary, delegator cannot set delegatee. Delegatee also can set multiple delegators. When delegatee set delegator, both are paired as stamina pair or fee-delegate pair. Delegatee calls `setDelegator()` in stamina contract to set delegator.


### Deposit and Withdraw Stamina
To generate stamina, you must deposit TONs by calling the `deposit()` in `Stamina Contract`. The account on which the TON is deposited is paid a stamina of the amount deposited.

To withdraw stamina, call `requestWithdrawal()` and `withdraw()` in `Stamina Contract`. All stamina will burn and same amount of TON will be withdrawn.

Process of withdrawing stamina consists of two stages([Favor pull over push payments](https://consensys.github.io/smart-contract-best-practices/recommendations/#favor-pull-over-push-for-external-calls)).

1. call `requestWithdrawal()`: stamina balance of account decreases by withdrawn amount.
2. call `withdraw()`: the same amount as decreased in `requestWithdrawal()` will be withdrawn to the account.


### Refund and Recovery
In Ethereum, the remaining gas after transaction execution is refunded to transactor. Similarly, the remaining stamina after the execution generated is refunded.

`subtractStamina()` function in `Stamina Contract` deducts stamina, and `addStamina()` refunds stamina. Both functions can only be called by the null-address.

The stamina used is recharged after recovery epoch. Stamina recovery is performed automatically when the stamina is refunded. In the process of refunding the stamina, the stamina will be restored again after checking whether the recovery epoch has elapsed. The amount of stamina recovered shall not exceed the total amount deposited.

### Normal Execution
Normal execution is same as the execution process of Ethereum, it proceeds as follows.

1. Read account balance of transactor.
2. Check that upfront cost is payable.
3. Deduct the upfront cost
4. Execute VM
5. Refund remaining gas


### Delegated Execution
Delegated execution proceeds as follows.

1. Check if transactor has stamina pair with delegatee account.
- If paired with delegatee account
    2. Check that gas-upfront cost is payable by delegatee.
    3. Deduct same amount of stamina as the gas-upfront cost from delegatee.
    4. Deduct value-upfront cost from transactor balance.
    5. Execute VM
    6. Refund same amount of stamina as refunded gas to delegatee.
    

- If paired with delegatee account
    2. [Normal execution](child-chain#normal-execution)


## References
- [Plasma EVM](https://github.com/Onther-Tech/papers/blob/master/docs/tech-paper.pdf)
- [Economic Description of Tokamak Network and its Ecosystem - Kevin Jeong](https://youtu.be/gW7FCiBgBI4)
