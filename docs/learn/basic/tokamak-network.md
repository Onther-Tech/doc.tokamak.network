---
id: tokamak-network
title: Tokamak Network
sidebar_label: Tokamak Network
---

## What is Tokamak Network?

Tokamak Network is a protocol that enables frictionless deployment of plasma chains on Ethereum. The protocol will help build an environment where more robust DApps can be developed by improving the scalability of Ethereum, which is used as the root chain.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ynX6aC1nC8M" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<!-- ![Tokamak Network Basic Architecture](assets/learn_basic_tokamak-architecture.png) -->


## What is Plasma?

[Plasma](https://www.plasma.io/plasma.pdf), proposed by Joseph Poon and Vitalik Buterin from Ethereum Foundation, is a scalability solution for Ethereum. In plasma, child chains periodically commit the root of the block to the root chain, Ethereum. Invalid plasma blocks can be corrected by verifying the root data on the root chain.

![What is Plasma](assets/learn_basic_what-is-plasma.png)


## Plasma EVM and Tokamak Network

[PlasmaEVM](https://onther-tech.github.io/papers/tech-paper-kr.pdf) is an architecture run a turing-complete plasma proposed by Onther in 2018, which is also used as a critical engine for the Tokamak network. Plasma EVM periodically submits the merkle root and state root of the plasma block to the root chain, prevents double spending through a truebit-like-verification game, and resolves data availability problems through continuous rebase.


## References
- [What is Tokamak Network? (Video)](https://www.youtube.com/watch?v=ynX6aC1nC8M)
- [Plasma EVM](https://github.com/Onther-Tech/papers/blob/master/docs/tech-paper.pdf)
- [Plasma: Scalable Autonomous Smart Contracts](https://www.plasma.io/plasma.pdf)
