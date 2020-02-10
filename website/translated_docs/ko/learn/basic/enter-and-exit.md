---
id: enter-and-exit
title: 상호운용성: 진입 & 퇴장
sidebar_label: 상호운용성: 진입 & 퇴장
---

## 요청 트랜잭션
요청(request)이란 루트체인(root chain)과 자식체인(child chain) 간의 자산이나 데이터의 이전에 관한 트랜잭션을 의미한다. 각각의 요청 트랜잭션은 그 목적에 따라 진입(enter) / 퇴장(exit) 등이 있다.

## 진입 요청
진입은 루트체인인 이더리움에서 자식체인으로 자산이나 데이터를 이전하는 행위를 의미한다. ERC20 토큰을 예로 들면, 이더리움에서 유통되고 있는 토큰을 자식체인으로 옮기는 것이다. 더불어 토큰이 자식체인으로 진입 하기 위해선 토큰 자체가 요청가능한(Requestable)형태로 구성 되어야 한다.

![etner process](assets/learn_basic_enter.png)

루트체인인 이더리움에서 발행된 토큰이 자식체인으로 진입하는 절차는 다음과 같다.

1. 이더리움에서 유통되고 있는 기존의 토큰을 요청가능한(Requestable) 토큰으로 변경한다.
2. 요청가능한 토큰으로 변경된 자신의 토큰을 이용해 자식체인으로 진입 하겠다는 요청 트랜잭션을 전송한다.
3. 해당 요청이 처리되면 루트체인에 있던 사용자의 자산이 루트체인에서 자식체인으로 이동 되며, 루트체인인 이더리움 체인의 자산이 감소하고 자식체인인 플라즈마 체인의 자산이 증가한다.


## 퇴장 요청
퇴장은 자식체인에서 루트체인으로 자산이나 데이터를 이동하는 행위를 의미한다. 어떠한 ERC20 토큰이 플라즈마 체인에 있을 경우, 퇴장이란 자식체인에 있는 토큰을 루트체인인 이더리움으로 이전하는 것을 의미한다.

![exit process](assets/learn_basic_exit.png)

자식체인에서 루트체인인 이더리움 체인으로 토큰이 움직이는 절차는 다음과 같다.

1. 자식체인에 있는 요청가능한 토큰을 루트체인으로 이전 하겠다는 퇴장 요청을 담은 트랜잭션을 전송한다.
2. 해당 요청이 처리되면 자식체인에 있던 요청가능한 토큰이 루트체인으로 이전 되며, 자식체인의 자산이 감소하고 루트체인의 자산이 증가한다.
3. 마지막으로, 요청가능한 토큰을 다시 ERC20 토큰으로 변경하면 퇴장 절차가 마무리된다.

## 참고자료
- [Plasma EVM(국문)](https://onther-tech.github.io/papers/tech-paper-kr.pdf)
- [(영상)The Meaning of Requestable Smart Contract - 정순형(Kevin)](https://youtu.be/WQb008UBhiU)
- [(영상)How to enter and exit in Tokamak network - Thomas Shin(신건우)](https://youtu.be/Zv-Pr3Lx6n4)
- [(영상)누구나 쉽게 이해하는 PLASMA EVM](https://youtu.be/qWovBjf5wXI)
