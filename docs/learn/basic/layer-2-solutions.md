---
id: layer-2-solutions
title: Comparison with Other Solutions
sidebar_label: Comparison with Other Solutions
---

## Blockchain, Data Availability and Scailability
Data unavailability refers to a situation in which a miner (or block producer) includes a double-spending transaction in a block and does not propagate it to user nodes. Blockchain itself can be deemed as a protocol for solving data availability. In Proof of Work, a typical blockchain consensus algorithm, if the miner does not propagate the blocks, the created block is not recognized as the longest block (unless it occupies 51% hash power). The costs incurred in producing the block will be wasted, thus setting incentives to prevent data from being unavailable.

The issue of data unavailability is highlighted, especially in Plasma, because instead of recording all block data in layer-2,  only the summary, the merkle root, is recorded in the root chain to achieve scalability. The security of assets is threatened if the operator intentionally mines invalid blocks and does not propagate it because we cannot figure out the transaction in a block from a merkle root. To prevent this, each Plasma solutions have a contingency plan for data unavailability issue.

Sidechains prevents unavailability through separate consensus (such as having multiple validators or block producers and creating blocks through two-thirds or more votes), and rollups address data unavailability by putting all the transactions in the root chain. The pros and cons of each scalability solution are clearly divided because they all have different approaches and solutions.

## Plasma vs Rollup vs Sidechain

**Name**|**Plasma**|**Rollup**|**Sidechain**
:-----:|:-----:|:-----:|:-----:
How to guarantee security|Challenge and Exit|Challenge or ZKP|Consensus
Level of Security|Depends on root chain and each user|Depends on root chain and challenger or verifier|Depends on its consensus
Examples|LeapDAO, Plasma Group, Tokamak Network|Optimistic, ZK Rollup|Loom Network, Matic Network, Skale Network

Both sidechain and plasma look similar in that they connect two separate chains. However, while sidechain has its own consensus algorithm, plasma does not need a separate consensus process. Therefore the asset security of sidechain is dependent on its consensus, security of Plasma depends on the security of the root chain. Security is not fully guaranteed in sidechain without sufficient stability, and it could be easily exposed to attacks. On the other hand, it has an independent consensus, so even if other connected chains are attacked, there is no problem as long as its consensus operates reliably. However, security of Plasma is maintained as long as the root chain operates reliably.

Plasma is conceptually more close to a smart contract than an independent blockchain. It periodically commits merkle root of plasma blocks to root chain. If the root is invalid, users can correct it through challenge process.

Rollup shares many base architectures with Plasma. However, the biggest difference is that Plasma records only roots of blocks in the root chain, while Rollup records all transactions in the root chain.


## Comparison with Sidechain

### Skale Network

#### Overview
Skale Network addresses data unavailability of each sidechain through random node selection. Users who deposit a certain amount of Skale tokens in Ethereum have the right to become nodes. These nodes are included in a pool and more than 16 subnodes are randomly selected from the pool as block producers for each sidechain. More than 2/3 of subnodes must agree to create new blocks.

#### Data Availability
Skale Network randomly selects nodes in each sidechain. Through requiring more than 2/3 of signatures of selected nodes, the chain prevents nodes from collating and data unavailability.

#### Interoperability
Every five minutes, a randomly selected agent from subnodes delivers messages between sidechain and root chain, or sidechain and sidechain.

#### Fraud Proof
No fraud proof exists since it ensures security by separate consensus.

#### Comparison with Tokamak Network
The asset security of Skale Network is dependent on recruiting a large number of node pools and random functions that select them, regardless of the security of Ethereum. On the other hand, Tokamak Network is different in that it does not need these nodes and random functions. In terms of interoperability, plasma operators can handle messages in Tokamak Network without third parties such as randomly selected agents. Skale Network prevents double-spending through consensus of selected nodes, while Tokamak Network uses commit-challenge mechanism, with the help of a judge contract in the root chain.


### Matic Network

#### Overview
Those who stake Matic tokens in Ethereum can become a staker. Block producers are elected from stakers. In Matic Network, sidechain blocks have fast production time because there are a small number of block producers.

Matic Network periodically elects producers from stakers, and elected producers generate checkpoints, which is a merkle hash of several Matic blocks, and records them in Ethereum. Checkpoints are finalized after other stakers verify within a certain period of time. Blocks of Matic Network included in the checkpoints are also finalized.

#### Data Availability
The data availability of the Matic Network sidechain is determined by the elected block producer and the checkpoint producer. If they collude and no longer propagate the blocks around, the data becomes unavailable. However, because an attacker takes economic gains (additional tokens) through block production, the gains and losses of data availability attacks will be taken into account.


#### Interoperability
Matic Network ensures interoperability by allowing users to send transactions on both Ethereum and sidechain, respectively. Matic Network deploys Rootchain contract on Ethereum, defines interoperable transactions on the contract, and compares transactions made in the sidechain.

#### Fraud Proof
Fraud proof of Matic Network submitting proof about invalid transaction to Ethereum. The proof includes base transaction, blocks, nonce, receipt, deposit, ERC20 transfer, etc.

#### Comparison with Tokamak Network
Data availability of Matic Network is largely dependent on elected block producers. If sufficient economic benefits are not given to stakers or if invalid block producers are elected, sidechains may immediately fall into an inoperable state. On the other hand, Tokamak Network does not rely on the economic incentives of operators. Regardless of the operators' malicious actions, users are able to exit all assets through continuous rebase before invalid blocks are finalized.

In terms of interoperability, Matic has complex user experience since it requires transactions to be sent to both chains. In Tokamak Network, operators apply those transactions in the child chain so that users do not need to send additional transactions.

For preventing double-spending attacks, Matic and Tokamak Network has the same approach. Both have a certain period of time before finalizing blocks and allow challenges to correct invalid transactions.


### Interoperation Between Tokamak Network and (Matic, Skale) Network
Tokamak Network protocol can be deployed on child chains that have Matic Network or Skale Network as root chain. However, in this case, the security of Tokamak Network will depend on the root chain.



## Comparison with Rollup

### Optimistic Rollup

#### Overview
Aggregator(block producer) of rollup collects and computes transactions to obtain state root, and records all transactions and state root on Ethereum.


#### Data Availability
Because all transactions are uploaded and anyone can be an aggregator, data is always available.

#### Interoperability
Architectures related to interoperability are similar to Plasma, except that all transactions are recorded on Ethereum.

#### Fraud Proof
State roots and transactions recorded on Ethereum can be verified by anyone and will not be finalized until a certain period of time has passed. This prevents double-spending attacks by aggregators or users.

#### Comparison with Tokamak Network
The difference between Optimistic Rollup and Tokamak Network is that in Optimistic Rollup, all transactions are recorded on the root chain, and the aggregator is not pre-determined. Optimistic Rollup prevents data unavailability by uploading all transactions to the root chain. Tokamak Network prevents this by allowing enough time for anyone to escape. If the root chain is capable of containing `n` transactions in a single transaction, Rollup is `n` times scalable. However, the scalability of Rollup is relatively limited compared to Tokamak Network because Tokamak Network is is `n^n` times scalable.


### ZK-Rollup
ZK-Rollup is integrating Rollup with zero-knowledge proof. Aggregator in ZK-Rollup uploads not only transactions and state roots, but also zero-knowledge proof of state transition to root chain. ZK-Rollup does not require additional verification period, so blocks can be quickly finalized.



#### Comparison With Other Plasma Model
All plasma solutions share the same mechanism, which is periodic commitments, a challenge for preventing double-spending attack and punishing attackers.


### Simple Payment : Plasma MVP

#### Data Availability
In Plasma MVP, the solution ensures that the data is available because plasma blocks are not finalized unless users sign a confirm signature validating that the operator committed the blocks correctly. 

### Simple Payment : Plasma Cash

#### Data Availability
When users send transactions, they must include both records of where their tokens were minted and proof that they were not used before. Even if the operator double spends tokens and withhold blocks, the information about invalid transactions has to be made public to exit them.

### Generalized Plasma : Plapps(Predicate)

#### Overview
In Plapps, states are stored as state object, and spending conditions of each object are recorded in the predicate. State transition of the object is verified through the predicate.

#### Data Availability
When the owners of state objects sign transactions, they also include a signature confirming valid state transition.


### Generalized Plasma : Plasma Leap

#### Overview
State is represented as Non-fungible Storage Token(NST) and spending conditions are defined for each NST as state transition.

#### Data Availability
It uses youngest-input priority rather than oldest-output priority so that honest users can exit first when data is unavailable.