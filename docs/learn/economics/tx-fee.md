---
id: tx-fee
title: Transaction Fee
sidebar_label: Transaction Fee
---

## Traditional Transaction Fee Issues
Transaction fee model of traditional blockchain including Ethereum has following issues.

1. Transaction fees itself hinders user experience
2. High volatility of transaction fees due to first-price auction

To address the first problem, transaction fees need to be eliminated or changed to be more user-friendly. However, getting rid of the fee is highly risky because it can become vulnerable to denial of service attack. The realistic alternative is increasing the convenience of using fees, making it as if there were no fees between service use. In Tokamak Network, Stamina can be used as a form of transaction fee to delegate them to third parties

To address the second problem, Tokamak Network implements a fixed fee model that reduces volatility.

## Stamina
Stamina is the right to generate transactions on child chains of Tokamak Network, similar to gas on Ethereum. However, stamina is essentially different from gas in that third parties can pay on behalf of you and is restored after a certain period. Furthermore, stamina does not give any economic benefit to the operators.


### Deposit and Withdraw
The easiest way to use stamina is to deposit TON. Stamina is created according to the amount of TON deposited and can be delegated to other users. TON can be withdrawn if the stamina is no longer in use. You cannot withdraw TONs deposited if the stamina is not fully recovered. But, if the child chain goes byzantine, users can withdraw their assets through escape requset and the withdrawn TON are locked up for a certain period of time.

### Charging Stamina
To use stamina as transaction fee, users must charge stamina first. Users can request activation to the charger, and once it is activated, chargers will pay a certain amount of transaction fee in stamina. The charger can activate or deactivate stamina regardless of user's intention at any time.

### Recovery
Stamina recovers after a certain period of time. Epoch(cycle) of recovery is $E_{r}$, and stamina is fully recovered to the initial charged amount once the epoch is over. Since the length of $E_{r}$ can affect the network stability, the operator should be cautious in finding the optimal $E_{r}$ of the child chain.

## Fixed Fee
Transaction fees are fixed on all child chains in the Tokamak Network. Fixed fee prices are referred to as minimum gas price $MGP$. Because $MGP$ means the minimum required fee for the transaction to go through, users have no reason to pay more than the $MGP$. However, there are possibilities that $MGP$ can cause problems if they are too low(or high) as the case of $E_{r}$, it is adjustable through the governance of child chain.

The amount of stamina paid in transaction fees with $MGP$ can be calculated as follows:

$Stamina= GasLimit * MGP$

This is the same as the way transaction fees are calculated in Ethereum. GasLimit is the same as before and only the GasPrice has changed to a fixed figure of $MGP$.


## References
- [EVM Compatible Transaction Fee(GAS) Delegated Execution Architecture for Plasma Chain](https://ethresear.ch/t/evm-compatible-transaction-fee-gas-delegated-execution-architecture-for-plasma-chain/3106)
- [Token Velocity Problem](https://www.coindesk.com/blockchain-token-velocity-problem)
- [Fixed Fee virsus unit pricing for information goods](http://www.dtc.umn.edu/~odlyzko/doc/price.war.pdf)
- [Microeconomic Analysis of Gas Price Mechanism and Migitation](https://hackmd.io/oe-bT8GcRvCc7vBgeOJyLw?both)
- [Ethereum Gas Price Analysis](https://medium.com/onther-tech/ethereum-gas-price-analysis-b70080e2e0d7)
