---
id: plasma-evm-architecture
title: Plasma EVM Architecture
sidebar_label: Plasma EVM Architecture
---

The key components that form Plasma EVM are **root chain** and several **child chains** connected to it. 

Child chains are operated by **operator**. Operators mine blocks of child chain that include user's transactions and submit the blocks to **RootChain Contract** on the root chain. RootChain contract manages and enforces the correct state of child chain. The operator runs child chain based on the RootChain contract. Users can submit multiple kinds of requests to RootChain contract to move assets and states between root and child chain. 

If the operator or user has done something wrong during this process, the challenger can correct the state and enforce it through challenges. In addition, in data unavailability situations, users can periodically submit escape requests to exit from the child chain. 

Since Plasma EVM client is based on the Ethereum client, all components are identical to Ethereum except that the RootChain contract enforces the order or type of block mining. Therefore, the data structure of blocks, transactions, accounts, etc. is identical to Ethereum. 

However, this is because the root chain is Ethereum, and **does not mean that the child chain has to be the same structure as Ethereum.**



## References
- [Plasma EVM](https://github.com/Onther-Tech/papers/blob/master/docs/tech-paper.pdf)


