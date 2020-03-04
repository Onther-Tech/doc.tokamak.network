---
id: continuous-rebase
title: Continuous Rebase
sidebar_label: Continuous Rebase
---

Continuous rebase allows users to periodically submit escape requests and always ensures safe exits from the child chain even in data unavailability situation by rebasing the child chain. 

## Rebase
Rebase(named after git's rebase) is re-mining blocks based on another block. In other words, transactions are re-executed based on other parent block. Even after rebase, `trasactionsRoot` of block remains to be unchanged. However,`stateRoot` and `receiptsRoot` can be changed because the specific results of each transaction may vary.

Rebased epoch and blocks are denoted as follow:

- **Rebased Request Epoch; RE'**
- **Rebased Non-Request Epoch; NRE'**
- **Rebased Non-Request Block; NRB'**
- **Rebased Request Block; RB'**


## Cycle and Stage
Cycle is an entire operational period of the Plasma EVM. Cycle consists of a total of four stages. The stages in order are pre-commit, DA-check, commit, and challenge.

![cycle and stage](assets/learn_advanced_cycle.png)


### Pre-commit
Pre-commit is a preliminary submission step, and the operator mines and submits `transactionsRoot` of blocks to the root chain. However, for request block, since `transactionsRoot` is determined by the RootChain contract, it is not necessary to submit the merkle root again to root chain. The operator also propagates those blocks to users at the same time. If the operator sends incorrect block data at the pre-commit stage, or if the entire block data is not fully available, users must submit an escape request in DA-check stage. 

The reason why only `transactionsRoot` is submitted to the root chain is because `stateRoot` and `receiptsRoot` are determined after rebase. In addition, the reason why the operator must submit the `transactionsRoot` is because users can find out the correct `stateRoot` of the block if they know which transactions are included in that block. Thus, users who receive block data that matches `transactionsRoot` submitted to RootChain contract, can challenge even if the operator withheld the data and submitted the wrong `stateRoot`.


![pre commit](assets/learn_advanced_pre_commit.png)


### DA-check
DA-check is a stage in which users check data availability in pre-commit. If they find any problems, users must escape from that chain to protect their assets. If they entered within the same cycle, they must also submit an undo request to cancel old enter requests. In addition, they must cancel old exit requests to prevent double exit.

![da check](assets/learn_advanced_da_check.png)


### Commit
Commit is the stage in which the operator submits an escape block to apply all requests submitted in the DA-check stage, rebasing all the blocks submitted based on the last block of pre-cycle. All types of **roots** are submitted in this process.

![commit](assets/learn_advanced_commit.png)


### Challenge
In challenge stage, users can submit challenges if the blocks submitted in the commit stage are invalid. However, exit challenge cannot be submitted in this stage.

If the submitted number of challenges is large, the other challenges will be cancelled as soon as one challenger wins. In addition, if the challenger wins, all subsequent blocks including the cycle will be cancelled, and that cycle will go back to the DA-check stage.

![challenge](assets/learn_advanced_challenge.png)


### Finalize
If there are no successful challenges, the corresponding cycle will be finalized, and all blocks submitted in commit will be finalized simultaneously. 

### Stage Length
Stage length is the number of epoch that needs to be processed in pre-commit and commit stage. It is determined by the operator when the RootChain contract is deployed.

- `Pre-commit length = Number of non-request epoch * 2`
- `Commit length = Number of non-request epoch * 2 + 1 (One additional epoch is escape epoch)`


### Stage Period
Stage period is the time allocated for each stage. Pre-commit period and commit period are the criteria for fulfilling halting condition to be covered below. DA-check period and challenge period is simply the time to process each stage.


## Halting Condition
Halting condition is triggered if the operator does not properly perform the prescribed procedures of each stage of the cycle for any reason. When halting conditions are triggered, child chains will shutdown.

### Halting Condition In Pre-commit
When the operator fails to submit all epochs of pre-commit length within the pre-commit period, the halting condition is triggered.

### Halting Condition In Commit
When the operator fails to submit all epochs of commit length within the pre-commit period, the halting condition is triggered. This will suspend the progress of all subsequent cycles, including the corresponding cycle. If the escape block has not yet been submitted, anyone can submit it. After submission, the suspended cycle can be resumed. 


### Shutdown
Shutdown is a plasma chain closing procedure. When shutdown begins, no further cycle in the chain can proceed. When in shutdown, only the following cycle will be repeated: Submit escape request based on last finalized cycle - Submit escape block - Challenge, to ensure that all users can safely exit from the chain.



### Cycle Diagram
The operating process of one cycle is presented below.

![rootchain](assets/learn_advanced_rootchain.png)


## Overlap of Cycle
What we have discussed so far is the operational process of only one cycle. But multiple cycles can also be overlapped.

![overlap cycle](assets/learn_advanced_overlap_cycle.png)

When several Cycles are overlapped, the pre-commit of the following cycle can begin regardless of whether challenge of the previous cycle is complete or not.

In order for cycles to be overlapped, the following conditions must be met:

1.  As soon as pre-commit of the current cycle is complete, the pre-commit of the next cycle must begin.
2. As soon as pre-commit of the current cycle is complete, DA-check of the current cycle must start.
3. The commit of the current cycle can start only after completing commit of the previous cycle.

This will allow child chains to continue to operate without stopping as it is rebased while executing escape requests periodically.

## References
- [Plasma EVM](https://onther-tech.github.io/papers/tech-paper.pdf)
