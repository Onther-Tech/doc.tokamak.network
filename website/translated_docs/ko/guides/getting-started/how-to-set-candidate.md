---
id: how-to-set-candidate
title: How to Set Candidate
sidebar_label: How to Set Candidate
---

해당 문서는 Tokamak DAO Governance의 후보자가 되기 위한 스마트 컨트랙트 배포 및 설정 방법에 대한 내용을 담고 있다.

Candidate로 등록이 되어 있어야 Tokamak DAO Governance 위원회의 멤버가 될 수 있다. 따라서, 위원회의 멤버가 되고자 한다면 해당 문서에서 안내하는 방법을 통해 Candidate 등록을 해야 한다.

Candidate가 되는 방법은 두 가지가 있다. 첫 번째 방법은 EOA를 이용한 방법이고, 두 번째 방법은 Tokamak Network의 `Layer2` 컨트랙트를 이용한 방법이다.

해당 가이드는 Mac OS와 Linux 16.04에서 수행되었다.

## 준비

## 소스코드 다운로드 및 패키지 설치

우선, github을 통해서 `Tokamak DAO Contract`를 다운로드 받고 패키치 설치를 해야 한다.

```bash
$ git clone https://github.com/Onther-Tech/tokamak-dao-contracts.git
$ cd tokamak-dao-contracts
$ git submodule update --init --recursive
$ npm install
```
패키지 설치가 완료되었다면 다음 단계를 진행하면 된다.

컨트랙트 컴파일 및 배포에는 truffle을 사용한다. truffle이 설치되지 않았다면 아래 명령어를 통해 설치해 준다.

```bash
$ npm install -g truffle
```

해당 스크립트에서 사용한 Truffle, Node.js, Web3.js의 버전은 다음과 같다.

```bash
Truffle v5.1.42 (core: 5.1.42)
Solidity - 0.5.12 (solc-js)
Node v13.8.0
Web3.js v1.2.1
```

### 이더리움 메인넷 접속 주소

Candidate가 되기위해 컨트랙트를 배포하기 위해서는 이더리움 메인넷 접속 주소가 필요하다. 여러 방법이 있지만, `Infura`를 통해 제공되는 노드 주소를 사용하는것이 간편하다. `Infura`를 통해 접속 가능한 주소를 확보한다.

만약, `Infura` 계정이 없다면 [infura.io](https://infura.io/) 회원가입을 통해 접속 주소(URL)를 얻을 수 있다.

사이트 가입이 완료된 경우, `Dashboard`의 `"CREATE NEW PROJECT"` 를 클릭하여 프로젝트를 생성한다.

그 다음, 아래와 같이 `PROJECT ID`가 조합된 `ENDPOINTS` 주소를 사용한다.

`https://mainnet.infura.io/v3/[ProjectID] `

![Infura node ID](assets/guides_create-infura-node.png)

예) `https://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194`

만약 자신이 운영하고 있는 이더리움 노드가 있다면, 해당 노드의 접속 주소를 `Infura` 주소 대신 사용할 수 있다.

## EOA를 이용한 Candidate 생성

배포하기 전에 [Eth Gas Station](https://ethgasstation.info/)을 통해 가스비를 확인하는 것이 좋다. 가스비를 확인하고 그에 맞게 `truffle-config.js` 에서 가스비를 조정해주면 된다.

```javascript
46  mainnet: {
47    provider: () => new PrivateKeyProvider(process.env.MAINNET_PRIVATE_KEY, process.env.MAINNET_PROVIDER_URL),
48    network_id: 1, // eslint-disable-line camelcase
49    gasPrice: <adjust gas price>,
50    skipDryRun: true,
51  },
```

이제 이더리움 개인키와 이더리움 메인넷 접속 주소가 준비되면 Candidate를 생성할 수 있다.

```bash
tokamak-dao-contracts $ bash deploy/deploy.sh <mainnet-provider-url> deploy-candidate <private-key> <candidate-name>
```

<candidate-name> 은 다른 Candidate와 구분을 쉽게 하기위해 입력하는 Candidate의 이름을 의미한다.

## Layer2를 이용한 Candidate 등록

Candidate를 등록하는 두 번째 방법은 기존에 배포된 Layer2 컨트랙트를 Candidate로 등록하는 것이다. 방법은 아래와 같다.

```bash
tokamak-dao-contracts $ bash deploy/deploy.sh <mainnet-provider-url> <private-key> register-layer2 <candidate-name> <layer2-contract>
```

Layer2를 Candidate로 등록하기 위해서는 인자로 배포된 Layer2 컨트랙트의 주소가 추가로 필요하다.

## 결과

모든 과정이 성공적으로 완료되면 [Tokamak DAO](https://dao.tokamak.network)에 접속하여 등록한 Candidate를 확인할 수 있다.
