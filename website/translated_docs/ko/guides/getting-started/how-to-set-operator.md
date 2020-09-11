---
id: how-to-set-operator
title: How to Set Operator
sidebar_label: How to Set Operator
---

이 문서는 오퍼레이터를 세팅하고 스테이킹 대시보드에 등록하는 과정에 대한 설명을 담고 있다.

해당 스크립트는 기능은 오퍼레이터에 운영에 필요한 스마트 컨트랙트 배포부터 스테이킹 대시보드에 해당 오퍼레이터를 등록하는 과정을 담고 있다.

> 스테이킹을 직접하는 경우 상당량의 ETH를 소모하기 때문에, 특별한 목적이 아니라면 [Dashboard](https://staking.tokamak.network)의 delegate사용을 권장한다.

오퍼레이터 세팅을 위해 배포해야하는 컨트랙트는 `SubmitHandler`, `EpochHandler`, `Layer2` 컨트랙트이다.
해당 컨트랙트 배포에 필요한 ETH는 가스 가격 10 gwei 기준으로 약 0.1 ETH 정도 소요된다.

## 오퍼레이터 준비

### MTON 컨트랙트 정보

`MTON` 토큰 및 스테이크 매니저 컨트랙트 주소는 다음과 같다.

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

개인키가 준비되었다면 이제 배포를 시작하면 된다.

```bash
plasam-evm-contracts $ MAINNET_PRIVATE_KEY=<operator's private key> \        
                       MAINNET_PROVIDER_URL=https://mainnet.infura.io/v3/<use-your-own-infura-project-id> \
                       SET_OPERATOR=true truffle migrate --network mainnet
```
컨트랙트 배포 순서는 `EpochHandler`, `SubmitHandler`, `Layer2` 컨트랙트 순으로 이루어 진다.

컨트랙트가 배포되던 중 아래와 같은 에러가 발생할 수 있다.

```bash
  Replacing 'Layer2'
   ------------------
   > transaction hash:    0x4d8f5c50b44390f817b7a29daa929c638c9a8794f8778b3c0336a31cf7c3f201

Error:  *** Deployment Failed ***

"Layer2" received a generic error from Geth that
can be caused by hitting revert in a contract constructor or running out of gas.
   * gas required exceeds allowance (6721975) or always failing transaction.
   * Try: + using the '--dry-run' option to reproduce this failure with clearer errors.
          + verifying that your gas is adequate for this deployment.
```
그럴 경우 아래 와 같이 `EpochHandler`와 `SubmitHandler`의 컨트랙트 주소를 확인한다.

```bash
  Replacing 'EpochHandler'
   ------------------------
   > transaction hash:    0xf04a1f976e92a60b2f10e61161b1d39c697d344b1a1c8ea0aea9c9f275ae3962
   > Blocks: 1            Seconds: 17
   > contract address:    0x8049Fc527c6193C533dbb5F32c0b141f3219e394
   > block number:        7176803
   > block timestamp:     1599808036
   > account:             0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39
   > balance:             10.933293175498842592
   > gas used:            2262572 (0x22862c)
   > gas price:           5 gwei
   > value sent:          0 ETH
   > total cost:          0.01131286 ETH


   Replacing 'SubmitHandler'
   -------------------------
   > transaction hash:    0x6d60f6c4251f596c7d0bb1b9dbcf86a92c29666a7a0dcd86c286d6d4c40046c7
   > Blocks: 0            Seconds: 9
   > contract address:    0x2C60d0f259cA25Ac1dE8ff82480EcdBC0ac1148c
   > block number:        7176804
   > block timestamp:     1599808051
   > account:             0xDf08F82De32B8d460adbE8D72043E3a7e25A3B39
   > balance:             10.923717815498842592
   > gas used:            1915072 (0x1d38c0)
   > gas price:           5 gwei
   > value sent:          0 ETH
   > total cost:          0.00957536 ETH
```

그 다음 아래 코드를 참조해 `migrate/3_deploy_rootchain.js`의 코드를 변경해준다.

```javascript
module.exports = async function (deployer, network) {
  // skip production network
  if (process.env.SET_OPERATOR) {
    let layer2;
    let epochHandler;
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    console.log(data);

    await deployer.deploy(EpochHandler)
      .then((_epochHandler) => { epochHandler = _epochHandler; })
      .then(() => deployer.deploy(
        SubmitHandler,
        epochHandler.address,
      )).then((submitHandler) => deployer.deploy(
        Layer2,
        epochHandler.address,
        submitHandler.address,
        etherToken,
        development,
        NRBEpochLength,
        statesRoot,
        transactionsRoot,
        receiptsRoot))
      .then(async () => { layer2 = await Layer2.deployed(); })
      .then(() => layer2.setSeigManager(data.SeigManager))
      .catch(e => { throw e; });

    // await layer2.setSeigManager(data.SeigManager);
    const registry = await Layer2Registry.at(data.Layer2Registry);

    console.log('register and deploy...');
    await registry.registerAndDeployCoinage(layer2.address, data.SeigManager);
  }
};
```

위와 같은 코드를 아래와 같이 변경해주면 된다.

```javascript
module.exports = async function (deployer, network) {
  // skip production network
  if (process.env.SET_OPERATOR) {
    let layer2;
    let epochHandler;
    const data = JSON.parse(fs.readFileSync('deployed.json').toString());
    console.log(data);

    await deployer.deploy(
        Layer2,
        <epochHandler.address> // 배포된 EpochHandler의 컨트랙트 주소
        <submitHandler.address> // 배포된 SubmitHandler의 컨트랙트 주소
        etherToken,
        development,
        NRBEpochLength,
        statesRoot,
        transactionsRoot,
        receiptsRoot))
      .then(async () => { layer2 = await Layer2.deployed(); })
      .then(() => layer2.setSeigManager(data.SeigManager))
      .catch(e => { throw e; });

    const registry = await Layer2Registry.at(data.Layer2Registry);

    // register root chain and deploy coinage
    console.log('register and deploy...');
    await registry.registerAndDeployCoinage(layer2.address, data.SeigManager);
  }
};
```
`Layer2` 컨트랙트가 무사히 배포되었다면 컨트랙트 주소를 기억해 두고 있어야 한다.

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
REGISTER=true chainid=<operator's chain id> layer2=<layer2-contract-address> website="<website address>" description="<description about operator>" operator_name="<operator's name>" truffle migrate --network mainnet
```

만약 `chain id`가 중복된다면 `Duplicate chain id` 라는 에러가 뜰 것이다. 그럴 경우 `chain id`를 변경하여 다시 등록하면 된다.