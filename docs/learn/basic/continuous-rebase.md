---
id: learn_basic_what-continuous-rebase
title: Data Availability : Continuous Rebase
sidebar_label: Data Availability : Continuous Rebase
---

## 리베이스의 의미
리베이스(rebase)란 플라즈마 블록의 기록을 특정한 시점을 기준으로 되돌리거나 바꾸는 것을 뜻한다. 깃(GIT) 시스템의 리베이스로부터 파생되었다.

## 데이터 가용성과 리베이스
토카막 플라즈마는 블록이 확정 되기까지 일정한 시간동안 데이터 가용성 여부를 확인할 수 있는 시간 버퍼를 두고 있으며, 이 기간 동안 유저들이 만들어낸 어떠한 탈출 요청(exit transaction)도 오퍼레이터는 모두 반영해야 하는 프로토콜상의 의무가 있다. 받아들여진 탈출 요청이 반영된 블록 이후의 블록(미확정 블록)의 내용은 탈출 요청이 반영된 블록을 기준으로 리베이스된다. 지속적 리베이스 모델은 유저들에게 항상 일정한 기간을 두고 항상 탈출할 수 있는 수단을 가지게 함으로써 데이터 불가용 상황을 극복한다.

## 사이클
![continuous rebase](assets/learn_basic_continuous-rebase.png)

1. **Pre-commit**: 오퍼레이터가 플라즈마 체인의 블록을 마이닝한 후 각 블록의 트랜잭션 루트(txRoot)를 제출한다.
2. **DA check**: 사용자가 Pre-commit 과정의 DA check, 문제시 탈출 요청(Escape Request) 트랜잭션 제출한다.
3. **Commit**: Process Escape, 리베이스(Rebase) 과정 수행한다.

    1. **Process Escape**: 1,2 에서 제출된 탈출 요청(Escape Request)을 포함한 탈출 블록(Escape Block) 마이닝 후 제출한다.

    2. **Rebase**: 탈출 블록(Escape Block)을 기준으로 Pre-commit된 블록을 리베이스(Rebase)한다.

4. **Challenge**: Commit 된 블록에 대한 챌린지 제출한다.

## 확정 시간과 유저 경험
유저들이 만들어낸 트랜잭션은 DA check, commit, challege 기간을 거쳐야지만 확정(finalize)된다. 따라서 트랜잭션을 발생시킨 후 해당 트랜잭션이 확정되기까지 일정한 기간을 기다려야 한다. 이는 마치 비트코인을 쓰는 사용자가 안정적인 트랜잭션 확정을 위해 적어도 6컨펌(약 60분)을 기다려야 하는 것과 비슷하다.

하지만 모든 거래가 필요로 하는 안정성 수준이 같은 것은 아니다. 금액이 충분히 작다면 높은 수준의 거래 안정성이 요구되지 않다. 단적인 예로, 비트코인으로 소액을 결제하는 시스템은 6컨펌이 아닌 1컨펌 혹은 극소액 거래의 경우 0컨펌을 기준으로 삼기도 한다. 토카막 네트워크의 경우도 높은 수준의 안정성을 요하는 고액 거래를 다루는 Dapp의 경우는 DA check ~ Challenge의 과정을 모두 기다리는것이 바람직하지만, 소액거래의 경우 pre-commit과 동시에 이 트랜잭션을 인정해주는 모델도 가능하다.

## 참고자료
- [(영상)Data availability solution in plasma for Global State:Continuous Rebase-Aiden Park(박정원)](https://youtu.be/kRfgM4crCk0)
