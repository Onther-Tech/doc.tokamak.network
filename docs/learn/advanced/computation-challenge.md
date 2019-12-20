---
id: computation-challenge
title: Computation Challenge
sidebar_label: Computation Challenge
---

> Computation Challenge는 현재 개발중으로 검증 게임에 관한 접근 방법만을 추상적으로 설명합니다.

Computation Challenge는 오퍼레이터와 검증자간의 Truebit과 유사한 검증게임을 통해 루트체인에서 승자를 결정합니다. 검증 대상은 블록 혹은 에퍽의 `stateRoot` 계산 결과입니다.

## What is Truebit-like Verification Game
Truebit과 유사한 검증게임은 오프체인에서 일어난 복잡한 연산의 결과를 온체인에서 검증하는 게임입니다. 검증 게임의 참여자는 오프체인 연산 결과를 제출하는 오퍼레이터, 이 연산 결과에 이의를 제기하는 챌린저, 그리고 온체인에서 승자를 결정하는 검증자 컨트랙트입니다. 특정 연산에 대한 검증 게임을 시작할 때, 오퍼레이터와 챌린저는 연산의 인풋들에 대해 같은 값을 가지고 있지만, 연산의 결과는 서로 다르다는 가정을 합니다.

![](https://miro.medium.com/max/3200/0*-hP51DzowPl_NqmG)
*https://medium.com/decipher-media/truebit-681181846d93*

검증 게임은 오프체인 연산을 각 단계로 나누어서 문제가 있는 step을 찾고 검증자 컨트랙트가 해당 step에 대한 연산을 수행하여 오퍼레이터와 챌린저 중에서 승자를 결정합니다.

Computation Challenge는 이러한 검증 게임을 자식 블록 체인의 state transition function을 오프체인 연산으로서 진행합니다.

## What Operator Submits

오퍼레이터는 하나의 블록에 대하여 아래 두 가지 연산 결과를 해시로 제출합니다.

1. **state transition function**: 부모 블록을 기준으로 검증할 블록의 트랜잭션들을 처리하고 블록 보상을 제공하는 것으로 끝나는 연산입니다.
2. **solevm execution state**: 부모 블록을 기준으로 검증할 블록의 트랜잭션들을 **solEVM의 EVMRuntime**을 이용하여 처리한 연산입니다.


에퍽의 경우 에퍽에 포함된 블록들의 두 가지 연산 결과들(해시들)의 바이너리 머클 루트를 제출합니다. 제출하는 연산은 다음과 같습니다.

## Query and Respond

검증 게임의 첫 번째 단계는 검증자가 자신이 알고있는 연산



Epoch to Block
Block to Transaction

## 2. solEVM

