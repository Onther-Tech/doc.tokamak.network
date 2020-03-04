---
id: design-rationale
title: Design Rationale
sidebar_label: Design Rationale
---

## Enforced Execution
**Enforced execution** is a property of Plasma. Execution of all child chains must be enforced only by the root chain. Thus, as long as the safety and liveness of the root chain are guaranteed, correct execution is always enforced in all child chains and asset security is ensured.

## Scailability
If thousands or tens of thousands of DApps operate on a single root chain or multiple shard chains, they will create numerous transactions, causing scalability issues. Therefore, these DApps should operate on tens of thousands of child chains to prevent a large number of transactions from flocking to a few chains so that ***scalability** problems can be fundamentally addressed.

## Turing Completeness
The child chain must be compatible with all DApps in order to operate them in child chains. That is, all child chains should be **turing complete*** capable of performing all possible data-manipulation rules or operating general programs. However, it is necessary to assume that there is no restriction on the fees (gas) required for computation.

## Compatibility
It is very inefficient for the child chain connected to the root chain to have a different execution and development environment from the root chain. Therefore, it is desirable to ensure maximum **compatibility** by providing an environment as identical as possible to the root chain. This is important from two perspectives, first because developers can use Plasma immediately without learning new environments or tools. Secondly, the migration of the DApps from the root chain can be very efficient.


## Why Plasma
There are several ways to address the scalability issue:
- Improvement of consensus
- On-chain scaling such as sharding
- Interchain
- Layer-2 solutions: Plasma, State Channel, Rollup, etc.

First of all, each method is not in a competitive relationship but is **mutually complementary**. In particular, layer-2 solutions can be used with the other three solutions, maximizing scalability of blockchains regardless of the solutions being already implemented.

This is possible because all layer-2 solutions, including Plasma, **do not require consensus**. Because they can ensure safety as long as the root chain works correctly, many second layers can be implemented to significantly increase scalability. This is a common advantage of all layer-2 solutions.

Among the many different layer-2 solutions, only Plasma has the advantage of **functionality** and **scalability**. State channel is a layer-2 solution optimized for interactions between a small number of users, and there are limitations to be applied for DApps that are used by multiple users simultaneously. In addition, Rollup stores all of the transaction data in the root chain, which essentially limits scalability.

However, for Plasma, implementation can be in the same form as the root chain and can operate DApps that are used simultaneously by many users. Only the merkle root value is stored on the root chain, so it can reach very high scalability. 

Of course, instead of high functionality and scalability, there is a disadvantage that the conditions for ensuring safety are very complex and demanding compared to other layer-2 solutions. However, if the safety issue can be addressed, Plasma is the **most effective layer-2 solution**.


## Why Truebit-like Verification Game
Challenge system for fraud proof is essential to properly enforce the execution of child chains. However, in generalized Plasma, computations executed on child chains are complex, and the cost of verifying them on the root chain is high.

If challenge systems are carried out through verification games like Truebit, we can **minimize verification cost** to the execution of only one opcode.

Non-interactive ways(e.g. zero-knowledge proofs) are not considered because they are not practical in terms of proving cost.

## Why Continuous Rebase

### Data availability
In Plasma, [data unavailability] (https://github.com/ethereum/research/wiki/A-note-on-data-availability-and-erasure-coding)) refers to problems that occur when the operator submits blocks to the root chain but does not propagate them to the user. Data unavailability are fatal in Plasma because there is no way for users to deal with these attacks if an operator goes malicious.

Challenges are necessary to enforce the correct execution of child chain by root chain, and block data is required for challenge. Therefore, unavailable block data means that challenge cannot be done. So all the different Plasma solutions address this by enabling users to **exit** from the child chain, not by challenge.

### Data Unavailability in Generalized Plasma
The problem is that it is [very difficult](https://ethresear.ch/t/why-smart-contracts-are-not-feasible-on-plasma/2598) to enable exit in generalized plasma such as Plasma EVM. In generalized plasma, a single transaction can change all states. That is, because each transaction are not atomic, all states must be considered as **invalid** when data is unavailable. Therefore, after the data becomes unavailable, the safety of assets is not ensured even if users request exits.

To solve this, users should be allowed to escape regardless of the current state of child chain. Continuous rebase periodically allows users to escape based on old valid states, thus **fundamentally resolves data unavailability**. However, this will delay finality of child chain.

## References
- [Plasma whitepaper](https://www.plasma.io/plasma.pdf)
- [ethresear.ch/plasma](https://ethresear.ch/c/plasma)
- [Awesome Layer-2](https://github.com/Awesome-Layer-2/Awesome-Layer-2/blob/master/README.md#tokamak-network)
- [truebit](https://truebit.io/)
- [A note on data availability](https://github.com/ethereum/research/wiki/A-note-on-data-availability-and-erasure-coding)
- [Why smart contracts are not feasible on plasma](https://ethresear.ch/t/why-smart-contracts-are-not-feasible-on-plasma/2598)
- [Why is EVM on Plasma hard](https://medium.com/@kelvinfichter/why-is-evm-on-plasma-hard-bf2d99c48df7)

