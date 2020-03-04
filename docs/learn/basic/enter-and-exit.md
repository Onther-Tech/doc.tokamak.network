---
id: enter-and-exit
title: Interoperability - Enter & Exit
sidebar_label: Interoperability
---

## Request Transaction

Request refers to transaction that transfers assets or data between root chain and child chain. Types of request transaction are enter/exit, etc.


## Enter Request

Enter refers to the transfer of assets or data from the root chain to child chain. For example, ERC20 tokens come into the child chain from Ethereum through enter requests. Tokens should be in requestable forms to enter into the child chain.

![etner process](assets/learn_basic_enter.png)

Procedure for the token issued in the root chain to enter the child chain is as follows:

1. Convert token in Ethereum to a requestable token.
2. Send a request transaction to enter the child chain using requestable token.
3. When the request is processed, the token in the root chain are moved from the root chain to the child chain. The balance of the token in the root chain decreases, and the balance of token in the child chain increases.


## Exit Request

Exit refers to moving an asset or data from child to root chain. For ERC20 token, exit means to transfer tokens from child chain to root chain.


![exit process](assets/learn_basic_exit.png)

Procedure for moving tokens from child chain to root chain is as follows:

1. Send a transaction that includes an exit request to transfer the requestable token in the child chain to root chain.
2. When the request is processed, the requestable token in the child chain is transferred to root chain. The balance in the root chain increases, and it decreases in the child chain.
3. Finally, convert the requestable token back to an ERC20 token.


## References
- [Plasma EVM](https://github.com/Onther-Tech/papers/blob/master/docs/tech-paper.pdf)