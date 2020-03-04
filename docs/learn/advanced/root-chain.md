---
id: root-chain
title: 루트체인
sidebar_label: 루트체인
---

## RootChain contract
RootChain contract manages the child chain and enforces state. Specifically, RootChain contract enforces type of the next block in the child chain and which request transactions should be included in that block if the type is request or escape block. 


Enforcement here can be implemented through challenge even if the operator does not perform correctly. Therefore, RootChain contract also manages challenges. 

RootChain contract is also a channel that users request to move assets or states between root and child chain. When users submit requests to the RootChain contract, the contract will enforce the requested action on the child chain.


## Consensus
Asset security of the child chain can always be guaranteed as long as the consensus of the root chain maintains safety and liveness. This is because child chains are enforced only by the root chain. 

Thus, assets and states of child chain can be safely protected as long as the root chain functions correctly, even if the operator or other users act maliciously.


## References
- [Plasma EVM](https://github.com/Onther-Tech/papers/blob/master/docs/tech-paper.pdf)
