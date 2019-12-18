---
id: learn_basic_enter-and-exit
title: Interoperability : Enter & Exit
sidebar_label: Interoperability : Enter & Exit
---

## 요청 트랜잭션(request transaction)
요청(request)이란 베이스 체인인 이더리움과 플라즈마 체인간의 자산이나 데이터의 이전에 관한 트랜잭션을 의미한다. 각각의 요청 트랜잭션은 그 목적에 따라 진입(enter)/퇴장(exit)/탈출(escape)/무효(undo) 이 네가지 형태로 이루어져있다.

## 진입 요청(Enter Request)
진입은 베이스 체인인 이더리움에서 플라즈마 체인으로 자산이나 데이터를 이전하는 행위를 의미한다. ERC20 토큰을 예로 들면, 이더리움에서 유통되고 있는 토큰을 플라즈마 체인으로 옮기는 것을 의미한다. 더불어 토큰이 플라즈마 체인으로 진입 하기 위해선 토큰 자체가 요청 가능한(requestable)형태로 구성 되어야 한다.

![etner process](assets/learn_basic_enter.png)

이더리움 블록체인에서 발행된 토큰이 플라즈마 체인으로 진입하는 절차는 다음과 같다.

1. 이더리움에서 유통되고 있는 기존의 토큰을 요청가능한(Requestable) 토큰으로 변경한다.
2. 요청가능한 토큰으로 변경된 자신의 토큰을 이용해 플라즈마 체인으로 진입 하겠다는 요청 트랜잭션을 전송한다.
3. 해당 요청이 처리되면 베이스 체인에 있던 사용자의 자산이 플라즈마 체인으로 이동 되며, 이더리움 체인의 자산이 감소하고 플라즈마 체인의 자산이 증가한다.


## 퇴장 요청(Exit Request)
퇴장은 플라즈마 체인에서 베이스 체인으로 자산이나 데이터를 이동하는 행위를 의미한다. 어떠한 ERC20 토큰이 플라즈마 체인에 있을 경우, 퇴장이란 진입과 반대로 플라즈마 체인에 있는 토큰을 베이스 체인인 이더리움으로 이전하는 것을 의미한다.

![exit process](assets/learn_basic_exit.png)

플라즈마 체인에서 이더리움 체인으로 토큰이 움직이는 절차는 다음과 같다.

1. 플라즈마 체인에 있는 요청가능한 토큰을 이더리움 체인으로 이전 하겠다는 퇴장 요청을 담은 트랜잭션을 전송한다.
2. 해당 요청이 처리되면 플라즈마 체인에 있던 요청가능한 토큰이 이더리움 체인으로 이전 되며, 플라즈마 체인의 자산이 감소하고 이더리움 체인의 자산이 증가한다.
3. 마지막으로, 요청가능한 토큰을 다시 ERC20 토큰으로 변경하면 퇴장 절차가 마무리된다.

## 참고자료
- [Plasma EVM(국문)](https://onther-tech.github.io/papers/tech-paper-kr.pdf)
- [(영상)The Meaning of Requestable Smart Contract - 정순형(Kevin)](https://youtu.be/WQb008UBhiU)
- [(영상)How to enter and exit in Tokamak network - Thomas Shin(신건우)](https://youtu.be/Zv-Pr3Lx6n4)
- [(영상)누구나 쉽게 이해하는 PLASMA EVM](https://youtu.be/qWovBjf5wXI)
