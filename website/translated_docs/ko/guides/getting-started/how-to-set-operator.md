---
id: how-to-set-operator
title: How to Set Operator
sidebar_label: How to Set Operator
---

해당 문서는 오퍼레이터에 운영에 필요한 스마트 컨트랙트 배포부터 스테이킹 대시보드에 해당 오퍼레이터를 등록하는 과정을 담고 있다.

> 스테이킹을 직접하는 경우 상당량의 ETH를 소모하기 때문에, 특별한 목적이 아니라면 [Dashboard](https://staking.tokamak.network)의 `delegate` 사용을 권장한다.

오퍼레이터 세팅을 위해 배포해야하는 컨트랙트는 `SubmitHandler`, `EpochHandler`, `Layer2` 컨트랙트이다.
해당 컨트랙트 배포에 필요한 ETH는 가스 가격 10 gwei 기준으로 약 0.1 ETH 정도 소모된다.

해당 가이드는 Mac OS와 Linux 16.04에서 수행되었다.

## 오퍼레이터 준비

### TON 컨트랙트 정보

`TON` 토큰 및 스테이크 매니저 컨트랙트 주소는 다음과 같다.

**컨트렉트 정보**

    TON: 0x2be5e8c109e2197d077d13a82daead6a9b3433c5
    WTON: 0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2 
    Layer2Registry: 0x0b3E174A2170083e770D5d4Cf56774D221b7063e
    DepositManager: "0x56E465f654393fa48f007Ed7346105c7195CEe43"
    SeigManager: "e0x710936500aC59e8551331871Cbad3D33d5e0D909"
    PowerTON: "0xd86d8950A4144D8a258930F6DD5f90CCE249E1CF"

해당 정보는 [Dashboard API](https://dashboard-api.tokamak.network/managers)를 통해 확인 할 수 있다.

### 소스코드 다운로드 및 패키지 설치

```bash
$ git clone https://github.com/Onther-Tech/plasma-evm-contracts.git
$ cd plasma-evm-contracts && npm install
$ git submodule update --init --recursive
```
패키지 설치가 완료되었다면 다음 단계를 진행하면 된다.

해당 스크립트에서 사용한 Truffle, Node.js, Web3.js의 버전은 다음과 같다.

```bash
Truffle v5.1.42 (core: 5.1.42)
Solidity - 0.5.12 (solc-js)
Node v13.8.0
Web3.js v1.2.1
```

### 이더리움 메인넷 접속 주소

오퍼레이터를 배포하기 위해서는 이더리움 메인넷 접속 주소가 필요하다. 여러 방법이 있지만, `Infura`를 통해 제공되는 노드 주소를 사용하는것이 간편하다. `Infura`를 통해 접속 가능한 주소를 확보한다.

만약, `Infura` 계정이 없다면 [infura.io](https://infura.io/) 회원가입을 통해 접속 주소(URL)를 얻을 수 있다.

사이트 가입이 완료된 경우, `Dashboard`의 `"CREATE NEW PROJECT"` 를 클릭하여 프로젝트를 생성한다.

그 다음, 아래와 같이 `PROJECT ID`가 조합된 `ENDPOINTS` 주소를 사용한다.

`https://mainnet.infura.io/v3/[ProjectID] `

![Infura node ID](assets/guides_create-infura-node.png)
예) `https://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194`

만약 자신이 운영하고 있는 이더리움 노드가 있다면, 해당 노드의 접속 주소를 `Infura` 주소 대신 사용할 수 있다.

### 오퍼레이터 배포

오퍼레이터 배포는 트러플을 이용하여 진행된다. 트러플이 설치되어 있지 않다면 npm을 이용하여 설치하면 된다.
```bash
$ npm install -g truffle
```

트러플이 설치가 되었다면 이제 오퍼레이터 배포를 시작할 수 있다. 배포를 위해서는 위에서 언급한 이더리움 메인넷 접속 주소와 오퍼레이터가 될 계정의 개인키가 필요하다.

배포하기 전에 [Eth Gas Station](https://ethgasstation.info/)을 통해 가스비를 확인하는 것이 좋다. 가스비를 확인하고 그에 맞게 `truffle-config.js` 에서 가스비를 조정해주면 된다.

```javascript
46  mainnet: {
47    provider: () => new PrivateKeyProvider(process.env.MAINNET_PRIVATE_KEY, process.env.MAINNET_PROVIDER_URL),
48    network_id: 1, // eslint-disable-line camelcase
49    gasPrice: <adjust gas price>,
50    skipDryRun: true,
51  },
```

개인키가 준비되었다면 이제 배포를 시작하면 된다.
컨트랙트 배포 순서는 `EpochHandler`, `SubmitHandler`, `Layer2` 컨트랙트 순으로 이루어 진다.

먼저 `EpochHandler` 컨트랙트를 배포한다.
```bash
plasam-evm-contracts $ MAINNET_PRIVATE_KEY=<operator's private key> \        
                       MAINNET_PROVIDER_URL=https://mainnet.infura.io/v3/<use-your-own-infura-project-id> \
                       SET_OPERATOR=true epoch=true truffle migrate --network mainnet
```

그 다음, `SubmitHandler` 컨트랙트를 배포한다.
```bash
plasam-evm-contracts $ MAINNET_PRIVATE_KEY=<operator's private key> \        
                       MAINNET_PROVIDER_URL=https://mainnet.infura.io/v3/<use-your-own-infura-project-id> \
                       SET_OPERATOR=true submit=true truffle migrate --network mainnet
```


마지막으로 `Layer2` 컨트랙트를 배포한다.
```bash
plasam-evm-contracts $ MAINNET_PRIVATE_KEY=<operator's private key> \        
                       MAINNET_PROVIDER_URL=https://mainnet.infura.io/v3/<use-your-own-infura-project-id> \
                       SET_OPERATOR=true l2=true truffle migrate --network mainnet
```
`SubmitHandler` 컨트랙트 배포에는 `EpochHandler` 컨트랙트의 주소가 필요 하며, `Layer2` 컨트랙트 배포에는 `SubmitHandler`와 `EpochHandler` 컨트랙트의 주소가 필요하며 각 컨트랙트 배포시에 컨트랙트 주소들은 `l2.json` 파일에 저장된다. 만약 컨트랙트 배포 중 에러가 발생한다면 `l2.json`의 내용이 전부 사라지는 문제가 생길 수 있으며, 그럴 경우 배포 시에 출력되는 컨트랙트 주소를 확인여 다시 `l2.json`에 아래와 같은 형식으로 입력해주면 된다.

```json
{"EpochHandler":"0xaeb25ad2512c237820A7d2094194E1e46c279bDf","SubmitHandler":"0xb40faB9d05c9494abefEB502d71482Eb191fc629","Layer2":"0x5564AD50B6Ef6270DDb11bA5030AE86A9D562390"}
```
### 오퍼레이터 세팅

컨트랙트 배포가 완료되었다면 아래 명령어를 통해 `Layer2` 컨트랙트를 세팅하고 `Layer2Registry` 컨트랙트에 등록하면 된다. 

```bash
plasam-evm-contracts $ MAINNET_PRIVATE_KEY=<operator's private key> \        
                       MAINNET_PROVIDER_URL=https://mainnet.infura.io/v3/<use-your-own-infura-project-id> \
                       SET_OPERATOR=true setl2=true truffle migrate --network mainnet
```

```bash
plasam-evm-contracts $ MAINNET_PRIVATE_KEY=<operator's private key> \        
                       MAINNET_PROVIDER_URL=https://mainnet.infura.io/v3/<use-your-own-infura-project-id> \
                       SET_OPERATOR=true registerl2=true truffle migrate --network mainnet
```

위 두 명령어를 실행하기 위해서는 `Layer2`, `SeigManager`, `Layer2Registry` 컨트랙트 주소가 필요하다. 수행하기 전에 `l2.json`과 `deployed.json` 을 확인해서 두 컨트랙트 주소가 올바르게 입력되어 있는지 확인해야 한다. `Layer2` 컨트랙트 주소는 위 단계에서 배포한 컨트랙트 주소이며, `SeigManager` 의 컨트랙트 주소는 `0x710936500aC59e8551331871Cbad3D33d5e0D909` `Layer2Registry` 의 컨트랙트 주소는 `0x0b3E174A2170083e770D5d4Cf56774D221b7063e` 이다.

<!-- 컨트랙트 배포 중 에러가 발생하면 아래와 같은 에러가 발생할 수 있다.

```bash
SyntaxError: Unexpected end of JSON input
    at JSON.parse (<anonymous>)
    at module.exports (/Users/hwangjaeseung/workspace/temp/plasma-evm-contracts/migrations/3_deploy_rootchain.js:24:20)
    at Migration._load (/usr/local/lib/node_modules/truffle/build/webpack:/packages/migrate/Migration.js:54:1)
    at processTicksAndRejections (internal/process/task_queues.js:97:5)
    at Migration.run (/usr/local/lib/node_modules/truffle/build/webpack:/packages/migrate/Migration.js:171:1)
    at Object.runMigrations (/usr/local/lib/node_modules/truffle/build/webpack:/packages/migrate/index.js:150:1)
    at Object.runFrom (/usr/local/lib/node_modules/truffle/build/webpack:/packages/migrate/index.js:110:1)
    at Object.run (/usr/local/lib/node_modules/truffle/build/webpack:/packages/migrate/index.js:87:1)
    at runMigrations (/usr/local/lib/node_modules/truffle/build/webpack:/packages/core/lib/commands/migra
``` -->


## 오퍼레이터 등록

오퍼레이터를 등록하는 마지막 단계는 대시보드에 등록하는 것이다.

대시보드에 등록하기 위해서는 몇 가지 파라미터가 필요하며 다음과 같다.

```bash
operator_name: 오퍼레이터의 이름
chainid: 체인 아이디, 중복되면 안됨
website: 오퍼레이터에 대해 알 수 있는 웹사이트
description: 오퍼레이터에 대한 설명
layer2: 배포한 layer2 컨트랙트의 주소
```

오퍼레이터를 등록하는 명령어는 다음과 같다.
```bash
plasma-evm-contracts $ chainid=<operator's chain id> \
                       layer2=<layer2-contract-address> \
                       website="<website address>" \
                       description="<description about operator>" \
                       operator_name="<operator's name>" \
                       node register.js
```

만약 `chain id`가 중복된다면 `Duplicate chain id` 라는 에러가 뜰 것이다. 그럴 경우 `chain id`를 변경하여 다시 등록하면 된다.

모든 과정이 성공적으로 완료되면 [Staking Dahsboard](https://staking.tokamak.network)에 접속하여 등록한 오퍼레이터를 확인할 수 있다.