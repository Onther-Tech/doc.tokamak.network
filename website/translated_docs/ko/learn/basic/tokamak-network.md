---
id: tokamak-network
title: Tokamak Network
sidebar_label: Tokamak Network
---

## 토카막 네트워크란?

토카막 네트워크(Tokamak Network)는 현재 구동되고 있는 이더리움 블록체인에 연결된 레이어2 블록체인을 손쉽게 만들어 낼 수 있는 프로토콜이다. 이를 통해 루트체인(root chain)으로 사용되는 이더리움의 확장성을 높여 기존보다 더 다양한 탈중앙화 어플리케이션(DApp)을 개발할 수 있는 환경을 구축 할 수 있다.

<iframe width="560" height="315" src="https://www.youtube.com/embed/ynX6aC1nC8M" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<!-- ![Tokamak Network Basic Architecture](assets/learn_basic_tokamak-architecture.png) -->


## 롤업이란?

롤업은 플라즈마의 단점을 극복한 레이어2 솔루션으로, 플라즈마와 유사한 방식으로 구성되지만 다른 검증 방식을 갖는다. 롤업은 사용자들의 트랜잭션을 레이어2에서 처리하면서, 모든 트랜잭션의 정보를 레이어1에 기록하여 검증에 필요한 정보가 누락되는 것을 방지한다. 따라서 플라즈마보다 비교적 확장성은 떨어질 수 있으나 레이어1과 동일한 수준의 안전성을 보장할 수 있으며, 레이어2의 동작 방식과 트랜잭션의 검증 방식에 따라 여러 종류의 롤업이 존재한다.

## 롤업과 토카막 네트워크

토카막 네트워크는 레이어2 솔루션을 누구나 쉽게 만들 수 있고 사용할 수 있는 On-Demand 솔루션으로써, DApp의 사용성을 높일 수 있도록 레이어2 솔루션을 제공한다. DApp 개발자는 토카막 네트워크에서 제공하는 레이어2 솔루션을 직접 배포하고 운영하거나, 이미 배포된 레이어2에 스마트 컨트랙트를 배포하여 사용할 수 있다.

## 사용자 측면에서

토카막 네트워크 레이어2 솔루션은 사용자 측면에서 더 빠른 트랜잭션 처리와 더 낮은 트랜잭션 수수료를 경험하게 한다. 이더리움 메인넷과 동일한 방법으로 레이어2의 DApp을 사용하면서, 더 향상된 기능을 사용할 수 있게 한다.

## DApp 개발자 측면에서

토카막 옵티미즘 롤업은 스마트 컨트랙트를 지원하는 레이어2 솔루션으로써, DApp 개발자는 이더리움 메인넷과 동일한 방법으로 레이어2의 스마트 컨트랙트를 개발하고 배포할 수 있다.

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
