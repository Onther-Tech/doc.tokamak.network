---
id: challenge
title: Challenge
sidebar_label: Challenge
---

Since all child chains of Tokamak Network follow the Plasma protocol, challenges can resolve any problems occurred on-chain except for data unavailability issues. Challenge is an important factor in ensuring the security of the chain. However, challenges cannot prevent malicious actions beforehand but can only resolve them afterward. That is why it is crucial to have a watchtower monitoring the chains for bad actors.

Of course, all users who enter the child chain have incentives to keep an eye out to protect their assets. However, considering costs, it could be very difficult for individual users to monitor the chain constantly. Therefore, to alleviate these issues, providing cryptoeconomic incentives to challengers must be considered. Tokamak Network addresses this problem by enforcing TON stakes, slashing, and challenge rewards.


## Staking
Operators who run child chains connected to Tokamak Network must stake more than $D_{min}$. Sum of operator's self-staked TON and delegated TON is the total staked amount, $d^{o}$ in the operator's account. $d^{o}$ is the total reward given to the challenger if the challenge is proven true. Users using child chains also must deposit $ED$ when exiting the chain. This will be used as a reward for the exit challenge if the user have requested an invalid exit.

Also, challengers must deposit $CD$ to challenge others. If the challenger loses the challenge, $CD$ can be offered as a reward to the one who has been challenged.


#### Notation
- $d^{o}$ : Total amount of TON staked in the operator account
- $ED$ : Exit deposit
- $CD$ : Challenge deposit


## Slashing and Distribution
Slashing and distribution of challenge rewards are as follows. First, if the challenge to the operator is proven true, all $d^{o}$ will be slashed, a portion of $d^{o}$ will be given as a reward to the challenger, and the rest of the remaining $d^{o}$ will be burnt. If the exit challenge is proven true for a user, all $ED$ will be given as a reward to the challenger. However, in all cases, where the challenger is wrong, $CD$ will be given as a reward to the one who has been challenged. This will encourage challengers to make sure the challenge is valid and challenges will be submitted only if there is an actual problem.
