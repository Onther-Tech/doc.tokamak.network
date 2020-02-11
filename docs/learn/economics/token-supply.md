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
3. The unissued amount in #2 will be used as prize money for the PowerTON game (check details in [PowerTON])

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

1. The larger the staked amount of TON, the more the commit reward.
2. The longer the duration of staked TON, the more the commit reward.

One of the key criteria for distributing reward in most blockchains using staking model is the count of performed validation tasks. However, for Tokamak Network, the number of commits similar to mining (validation) is not considered as a critical criterion. The reason is because it is not easy to determine whether commits are an act of contributing to the network due to the nature of Plasma. For example, it is challenging to measure contribution with only the number of commits since meaningless empty blocks can be submitted solely to get commit reward. Also, few commits that actually contribute to the network can be more meaningful than lots of commits. For this reason, **'Number of commits'** is not considered in the distribution criteria of the commit reward.

### Distribution of Commit Reward
Based on the two distribution principles, a formula of $s_{y}$ can be derived. The amount of commit reward the staker can get from $k$ to $t$ is calculated as follows.

$s_{k,t}^{staker} = \sum_{i=k}^{t}\cfrac{d_{i}^{staker}}{ts_{i}}*S_{b}$

#### Notation
* $s_{k,t}^{staker}$ : Commit reward of staker from $k$ to $t$
* $d_{t}^{staker}$ : Total amount of TON staked to staker account at $t$


### Example
The following is a simple example of commit reward simulation.

| Parameters | Value |
|:----------:|:-----:|
|    $IS$    | 10000 |
|  $S_{y}$   | 2000  |
|  $N_{y}$   |   5   |
|  $S_{b}$   |  400  |



| Time(t) | Stake | Unstake | $d_{t}^{Alice}$ | $ts_{t}$ | $s_{t}^{Alice}$ |
|:-------:|:-----:|:-------:|:---------------:|:--------:|:---------------:|
|    0    | 1000  |         |        0        |  10000 |0                |
|    1    |       |         |      1000       |  10000 |40=1000/10000*400|
|    2    |       |         |      1000     |  10040 |39.8=1000/10040*400|
|    3    |       |   500   |      1000     |10079.8|39.7=1000/10079.8*400|
|    4    |       |         |       500       |  10119   |19.8=500/10119*400 |
|    5    |       |         |       500       |  10139   |19.7=500/10139*400 |
