---
id: token-supply
title: Token Supply and Distribution
sidebar_label: Token Supply and Distribution
---

The total supply of TON is initial issued amount plus additional issued TONs which is commit reward. New TONs are issued every time the operator commits a block, and the amount is determined proportion to the amount and duration of staked TON. 


## Token Supply

### Principles
All policies related to the supply of TON are based on the following principles:

1. A fixed amount is issued every year.
2. The amount of new TONs issued is proportional to the amount of staked TON and its period. If the staked TON is less than the total amount of TON in the chain, or the staking period is shorter than the maximum value, there will be less TONs issued than the amount in #1.
3. The unissued amount in #2 will be used as prize money for the PowerTON game (check details in [PowerTON](./powerton))

### Supply
Initial issued amount is $IS$ and maximum commit reward every year is denoted to $S_{y} = IS*IR_{y}$. However, depending on the amount and duration of the staked TONs, as specified in principle 2, the actual amount issued annually, $s_{y}$, may vary. $s_{y}$ is calculated as follows:

$s_{y} = \sum_{i=1}^{N_{y}}\cfrac{td_{i}}{ts_{i}} * S_{b}$

#### Notation
* $IS$ : Initial issued amount
* $IR_{y}$ : Annual target inflation Rate
* $S_{y} = IS*IR_{y}$ : Annual maximum commit reward
* $s_{y}$ : Annual actual commit reward
* $S_{b}$ : Annual maximum commit reward per block of root chain
* $N_{y}$ : Total number of blocks in root chain for a year
* $ts_{t}$ : Total issued amount in $t$
* $td_{t}$ : Total staked amount in $t$

$s_{y}$ can have a value of $0\leq{s_{y}}\leq{S_{y}}$ depending on the staked amount and its duration. **In accordance with principle 2**, the closer $td_{t}$ is to $ts_{t}$, and the longer it is staked, the closer $s_{y}$ is to $S_{y}$. In the opposite case, $s_{y}$ will be close to zero.

Note that the criterion for calculating duration is not the actual time but the block of the root chain. For example, one year may also be inconsistent with the actual time because it is calculated as the block height.

## Token Distribution

### Principles
$s_{y}$ is distributed according to the following principles:

1. Commit reward will be given to participants who contributed to the Tokamak Network.
2. A typical way to contribute to Tokamak Network is commiting blocks by becoming operator through staking.


### Distribution of Commit Reward
Commit reward is given to those who commit in Tokamak network and are distributed differently depending on their contribution.


