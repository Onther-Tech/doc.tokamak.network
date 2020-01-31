---
id: tx-fee
title: 트랜잭션 수수료 정책
sidebar_label: 트랜잭션 수수료 정책
---


## 기존 트랜잭션 수수료 정책의 문제

이더리움을 포함한 기존 블록체인의 트랜잭션 수수료 모델에는 다음과 같은 문제점들이 존재한다.

1. 트랜잭션 수수료의 존재 자체에서 기인하는 엔드 유저의 사용성 저하
2. 최고가 경매(First-Price Auction) 방식으로 인한 트랜잭션 수수료의 높은 변동성


첫번째 문제점을 해결하기 위해서는 트랜잭션 수수료 자체를 제거하거나 혹은 존재는 하지만 사용자들에게 실질적으로 인지되지 않는 상태로 만들어야 한다. 하지만, 불특정 다수가 공유자원을 이용하는 블록체인의 특성상 수수료 자체를 제거하는 것은 서비스 거부 공격(Denial of Service Attack)에 매우 취약해질 수 있기 때문에 매우 위험하다. 따라서 현실적인 대안은 수수료 자체는 유지하되 사용자 입장에서 수수료 사용의 편의성을 높여 마치 서비스 이용간 수수료가 존재하지 않는 것처럼 인지하게 만드는 것이다. 토카막 네트워크는 이러한 방법으로 제3자에게 수수료를 위임할 수 있는 스태미나(Stamina)를 트랜잭션 수수료로 사용할 수 있다.

두번째 문제점을 해결하기 위해 토카막 네트워크는 수수료의 높은 변동성을 통제하는 고정 수수료 모델을 사용한다.

## 스태미나
스태미나는 토카막 네트워크에 소속된 자식체인에서 일정 트랜잭션을 발생시킬 수 있는 권리로서, 이더리움의 가스와 그 역할이 유사하다. 하지만 스태미나는 제3자가 이를 대신 납부해줄 수 있으며, 사용 후에도 일정 기간이 지나면 다시 회복된다는 측면에서 본질적으로 가스와 차이가 있다. 또한 스태미나는 자식체인을 운영하는 오퍼레이터에게 지불되는 것이 아니기 때문에 기존의 가스와 달리 오퍼레이터에게 어떠한 경제적 이익도 발생시키지 않는다.


### 예치와 인출
스태미나를 사용하는 가장 쉬운 방법은 TON을 예치하는 것이다. 예치한 TON의 양에 따라 스태미나가 생성되고, 이를 위임하여 사용할 수 있다. 스태미나를 더 이상 사용하지 않을 경우 다시 TON을 인출할 수 있다. 단, 이미 사용되고 있는 스태미나 생성을 위해 예치된 TON에 대해서는 인출할 수 없다. 다만, 예외적으로 자식체인에서 공격행위가 감지된 경우 인출할 수 있으나 이는 탈출 요청을 통해 이뤄지게 되므로, 해당 TON은 재사용에 일정 기간 제약이 주어지게 된다.


### 위임
스태미나를 트랜잭션 수수료로 사용하기 위해서는 위임이라는 절차가 필요하다. 위임은 수임자(Delegateee)가 위임계정 지정(set delegator)을 하여 이뤄지며, 지정한 이후에는 위임자(Delegator) 계정을 대신해서 일정 금액의 수수료를 스태미나로 지불하게 된다. 여기서 중요한 점은 위임자가 수임자를 지정하는 것이 아니라 수임자가 위임자를 지정한다는 점이다. 수임자는 위임계정 지정을 한 것과 같이 위임계정 해제 또한 가능하다.

![stamina delegation](assets/learn_economics_stamina_delegation.png)

### 회복
스태미나는 이더리움의 가스와 달리 사용 이후에도 일정 시간이 지나면 다시 회복(recovery)된다. 회복이 되는 주기는 $E_{r}$로, 해당 주기가 지나면 기존에 생성된 스태미나의 양만큼 완전히 충전된다. 이 때 $E_{r}$의 길이에 따라 자식체인의 네트워크 안정성이 영향을 받을 수 있으므로, 오퍼레이터는 지나치게 짧거나 긴 시간이 되지 않도록 변수 결정에 신중을 기해야 한다.

## 고정 수수료
토카막 네트워크의 모든 자식체인에서 트랜잭션 수수료는 고정된다. 고정된 가스 가격은 최소 가스 가격(Minimum Gas Price; $MGP$)이라 칭한다. $MGP$는 말 그대로 최소로 지불해야 할 트랜잭션 수수료 가격을 의미하기 때문에 사용자들은 $MGP$를 초과하는 수수료를 지불할 이유가 없다. 단, $MGP$ 또한 $E_{r}$와 같이 지나치게 낮을(높을) 경우 문제가 발생할 수 있으므로, 해당 자식체인의 거버넌스를 통해 이는 변경될 수 있다.

$MGP$를 통해 트랜잭션 수수료로 지불되는 스태미나의 양을 다음과 같이 계산할 수 있다.

$Stamina= GasLimit * MGP$

이는 기존의 이더리움에서 트랜잭션 수수료를 계산하는 방식과 동일하다. GasLimit은 기존과 동일하고 GasPrice만이 고정된 수치인 $MGP$로 변경되었다.


## 참고자료
- [EVM Compatible Transaction Fee(GAS) Delegated Execution Architecture for Plasma Chain](https://ethresear.ch/t/evm-compatible-transaction-fee-gas-delegated-execution-architecture-for-plasma-chain/3106)
- [Token Velocity Problem](https://www.coindesk.com/blockchain-token-velocity-problem)
- [Fixed Fee virsus unit pricing for information goods](http://www.dtc.umn.edu/~odlyzko/doc/price.war.pdf)
- [Microeconomic Analysis of Gas Price Mechanism and Migitation](https://hackmd.io/oe-bT8GcRvCc7vBgeOJyLw?both)
- [Ethereum Gas Price Analysis](https://medium.com/onther-tech/ethereum-gas-price-analysis-b70080e2e0d7)
