---
id: tokamak-network
title: Tokamak Network
sidebar_label: Tokamak Network
---

## 토카막 네트워크란?

토카막 네트워크(Tokamak Network)는 현재 구동되고 있는 이더리움 블록체인에 연결된 플라즈마 블록체인을 손쉽게 만들어 낼 수 있는 프로토콜이다. 이를 통해 루트체인(root chain)으로 사용되는 이더리움의 확장성을 높여 기존보다 더 다양한 탈중앙화 어플리케이션(DApp)을 개발할 수 있는 환경을 구축 할 수 있다.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ynX6aC1nC8M" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<!-- ![Tokamak Network Basic Architecture](assets/learn_basic_tokamak-architecture.png) -->


## 플라즈마란?

이더리움 재단의 조셉푼과 비탈릭 부테린에 의해서 제안된 [플라즈마(Plasma)](https://www.plasma.io/plasma.pdf)는 이더리움의 확장성 문제 해결을 위한 솔루션이다. 자식체인(child chain)은 블록의 요약본을 주기적으로 루트체인인 이더리움 메인체인에 제출하고, 이렇게 제출된 요약 증거를 바탕으로 플라즈마 블록에 문제가 생겼을 때 검증과정을 통해 이를 바로잡을 수 있다.

![What is Plasma](assets/learn_basic_what-is-plasma.png)

## 플라즈마EVM과 토카막 네트워크
[플라즈마EVM](https://onther-tech.github.io/papers/tech-paper-kr.pdf)은 2018년 온더에서 제안한 튜링 완전한 플라즈마를 구동하기 위한 아키텍처로, 토카막 네트워크의 핵심 엔진으로 사용된다. 플라즈마 EVM은 플라즈마 블록의 머클 루트(merkle root) 및 상태 루트(state root)를 주기적으로 루트체인에 제출하고, 트루빗 방식의 검증게임(Truebit-like-verification)을 통해 이중지불을 방지하며, Continuous Rebase를 통해 데이터 가용성 문제를 해결한다.

## 참고자료
- [토카막 네트워크란 무엇인가요?(영상, 국문자막)](https://www.youtube.com/watch?v=ynX6aC1nC8M)
- [토카막 네트워크 : 튜링 완전하고 확장성 높은 플라즈마 블록체인 빌딩 프로토콜](https://onther-tech.github.io/papers/white-paper-kr.pdf)
- [Plasma EVM(국문)](https://onther-tech.github.io/papers/tech-paper-kr.pdf)
- [Plasma: Scalable Autonomous Smart Contracts](https://www.plasma.io/plasma.pdf)
