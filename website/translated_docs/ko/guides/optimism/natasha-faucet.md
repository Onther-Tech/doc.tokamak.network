---
id: natasha-faucet
title: Natasha faucet
sidebar_label: Natasha faucet
---

나타샤 옵티미즘에서는 레이어2에서 발생하는 수수료를 이더가 아닌 ERC20 토큰으로 지불합니다. 이 문서에서는 테스트넷을 사용하기 위해서 수수료 토큰을 L1에서 얻고 L2로 이동하는 방법을 설명합니다.

## 설치

기능을 포함하고있는 저장소를 아래와 같이 받아와 설치합니다.

```bash
git clone https://github.com/Onther-Tech/natasha-faucet-example.git
cd natasha-faucet-example
yarn install
```

## 설정

`.env.example`파일을 `.env`파일로 복사하고, 아래와 같이 필요한 정보를 입력합니다.

* RINKEBY_NODE_WEB3_URL: Rinkeby RPC Endpoint 주소를 입력합니다(Infura 등을 사용).
* PRIVATE_KEY: 토큰을 가져올 이더리움 주소에 해당하는 개인키를 입력합니다.

## 실행

아래와 같이 스크립트 파일을 실행합니다. 스크립트의 트랜잭션들이 처리되면 레이어1과 레이어2에 수수료로 사용할 토큰을 받을 수 있습니다.

```bash
yarn faucet
```
