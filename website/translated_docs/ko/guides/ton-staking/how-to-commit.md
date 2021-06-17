---
id: how-to-commit
title: Commit to Roochain
sidebar_label: How to Commit
---

이 문서는 `Staking-script`를 이용해 오퍼레이터를 운영하는 방법을 담고 있다.

해당 스크립트에서 제공하는 기능은 `commit`, `stake`, `unstake`, `restake`, `withdrawal` 이 있다 

> 이 과정을 수행하기 위해서는 스태이킹을 진행중인 오퍼레이터를 소유하고 있어야 한다.



## 스크립트 준비

### 소스코드 다운로드 및 패키지 설치

아래 명령어를 이용해 소스코드를 복제하고 패키지들을 설치한다.

```bash
$ git clone https://github.com/Onther-Tech/staking-script.git
$ cd staking-script && npm install
```

패키지 설치를 마치면 이제 다음 단계를 진행하면 된다.

## 컨트랙트 주소 수정
> 해당 문서에서는 Rinkeby를 기준으로 설명 할 것이다. 만약 메인넷에서 진행한다고 한다면 네트워크를 메인넷으로 설정하면 된다.

커밋을 위해서는 해당 오퍼레이터가 배포한 컨트랙트의 주소가 필요하다.
아래 명령어를 이용해 `config.js` 파일을 수정하도록 한다.

```bash
$ vi config.js
```
`config.js`의 내용은 다음과 같다.

```javascript
const config = {
  'mainnet': {
    'network': '1',
    'contractAddress': {
      'rootchain': '',
      'managers': {
        'DepositManager': '',
        'TON': '',
        'WTON': '',
      },
    },
  },
  'rinkeby': {
    'network': '4',
    'contractAddress': {
      'rootchain': '0xfe40ecbd972675d3d6766d94d04373bf9d8896b6',
      'managers': {
        "TON":"0x3e136394a481f8c9595d63a1fa70d25c7f388c2c",
        "WTON":"0x36bba598ca0b329eb4162ba011086d09111b4702",
        "DepositManager":"0x95ff08f500ecb391778a3096ec767bdb18e17cf6",
        "RootChainRegistry":"0x8dc9d372ebd9ed0d8f991226eaaf331ad11dbb4d",
        "SeigManager":"0x32ccc91e3dd884090a580f45172c62393bd858c5",
        "PowerTON":"0x4cc9b4cf3a4a6f8e7cadf8fcd442873c3f71ab73"
      },
    },
  },
};

exports.getConfig = function () {
  
  return config.rinkeby;
}
```

여기서 각 컨트랙트의 주소를 해당 오퍼레이터가 배포한 주소에 맞게 변경해야 한다. 여기서는 `rinkeby`를 기준으로 설명이 되어있지만 메인넷을 이용하고 싶은 경우 `config.rinkeby`를 `config.mainnet`으로 변경해야 한다.


## Infura 준비

커밋을 위한 `RPC Privider URL`은 `Infura` 에서 제공하고 있는 `Rinkeby Testnet` 노드의 주소를 사용한다.
접속 가능한 `Rinkeby Testnet` 노드가 없는 경우, [퍼블릭 테스트넷 연결 준비](how-to-connect-public-testnet-prepare)에 ["Rinkeby 루트체인 접속 주소 생성"](how-to-connect-public-testnet-prepare#rinkeby-루트체인-접속-주소-생성)를 수행하여 접속가능한 주소를 얻는다.

## 사용방법

이제 해당 스크립트를 사용하기 위한 모든 준비가 완료됐다. 다음과 같은 양식을 입력하여 수행하면 된다.

```bash
$ node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f <function name> -p <parameter>
```

### 파라미터
`Staking script`에서 제공하고 있는 파라미터들은 다음과 같다.

```
-f, --function-name [value], required. function to call
-i, --network-id [value], required for infura. ethereum network id. 1 for mainsale, 3 for rinkeby.
-p, --parameters [value]>, `arguments for function split by comma. default ${ defaultParameters }`, parseParams
-l, --provider-url [url], `web3 provider url. default ${ defaultProviderUrl }`
-L, --gas-limit [value], `gas limit for transaction. default ${ defaultGasLimit }`
-P, --gas-price [value], `gas price for transaction. default ${ defaultGasPrice }`
-N, --nonce [value], `nonce for transaction. default ${ defaultNonce }`
-v, --verbose, show debug logging
-k, --pk [value], required. transaction sender.
```
그리고 기본 파라미터는 아래와 같다.

```javascript
const defaultProviderUrl = "http://localhost:8545";
const defaultWeiAmount = 0;
const defaultGasLimit = 4500000;
const defaultGasPrice = 20e9;
const defaultNonce = null;
```


`Staking-script`에서 지원하는 함수들은 다음과 같다.

### Commit
```
node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f commit
```
### Stake
> ex. 1 TON 스테이킹 하기

1 TON을 스테이킹하기 위해서는 파라미터에 1e18에 해당하는 값을 넣어주어야 한다.

```
node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f approveAndCall -p 1000000000000000000
```

### Unstake
1 TON 언스테이킹 하기
> 언스테이킹은 ray를 단위로 사용하기 때문에 1 TON을 언스테이킹하기 위해서는 1e18이 아니라 1e27을 파라미터로 입력 해주어야 한다.

```
node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f requestWithdrawal -p 1000000000000000000000000000
```

### Restake
언스테이킹을 했던 TON을 다시 스테이킹하려면, 이 함수를 호출해야 한다.
```
node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f redepositMulti
```

### Withdrawal
언스테이킹한 TON을 인출하려면 이 함수를 호출하면 된다.
```
node app.js --provider-url https://rinkeby.infura.io/v3/*** -k <privateKey> -f processRequests
```


각 함수가 성공적으로 실행되면 다음과 같은 형식의 로그가 출력될 것이다.

```text
{"tx":"0xca6b29f1f64239c0072ecd2db3bbcedef58259bc2694de8e1a75e9fec501ade0","receipt":{"blockHash":"0xbe2c1990f5efee0f18c56f16a32d375f01ca016d8acb1b2c40f5dbf6532dc815","blockNumber":6871009,"contractAddress":null,"cumulativeGasUsed":705612,"from":"0xf30eadcdc68f9551fe943a685c23fa07fde4b417","gasUsed":396475,
...
```