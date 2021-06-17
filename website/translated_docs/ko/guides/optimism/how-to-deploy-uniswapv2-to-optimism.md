---
id: how-to-deploy-uniswapv2-to-optimism
title: How to deploy Uniswap V2 to Optimistic Rollup
sidebar_label: Deploy Uniswap V2 to Optimistic Rollup
---

해당 문서는 토카막 옵티미스틱 롤업에 스마트 컨트랙트를 배포하는 과정을 담고 있다. 테스트는 mac os 에서 수행 되었으며 토카막 옵티미즘 테스트 넷은 링키비를 사용하고 있다.

## Porting Process

기존 솔리디티 프로젝트를 OVM에서 동작하도록 만들기 위해 필요한 수정 사항은 크게 세 가지가 있다.

1. `Tooling updates`: OVM은 현재 Waffle V3 를 통해 동작하고 있다. 구 버전의 Waffle을 사용하고 있다면 이를 V3로 업그레이드 해줘야하고, 다른 프레임워크를 사용하고 있다면 마이그레이션 작업이 필요하다.
2. `Test suite updates`: 도구에 대한 업데이트 외에도, 일부 테스트 코드는 EVM과 OVM의 차이를 감안하여 수정해야 하고, 로컬 OVM 노드에서 실행을 지원해야 한다.
3. `Contract and compiler modification`: EVM과 OVM의 차이로 인해 솔리디티 컨트랙트나 컴파일러 설정을 변경해줘야 하는 경우도 있다.

위 작업에 대한 자세한 절차는 [온더 블로그](https://medium.com/onther-tech/porting-solidity-contracts-to-optimism-a-guide-using-uniswap-v2-29b85be668d1)를 통해 확인할 수 있다.

## 컨트랙트와 서비스 설정

### 소스코드 다운로드 및 패키지 설치

아래 명령어를 이용해 소스코드를 복제하고 패키지들을 설치한 후 컨트랙트를 컴파일한다.

```bash
$ git clone https://github.com/Onther-Tech/Uniswap-v2-core-optimism.git
$ cd Uniswap-v2-core-optimism && yarn && yarn compile:ovm
```

패키지 설치와 컴파일을 마치면 다음 단계로 넘어가면 된다.

```javascript
const ethers = require('ethers')
const { getContractFactory } = require('@eth-optimism/contracts')

const factory = (name, ovm = false) => {
  const artifact = require(`./build/${name}.json`)
  return new ethers.ContractFactory(artifact.abi, artifact.bytecode)
}

// const factory__L2_UniswapV2ERC20 = factory('UniswapV2ERC20', true)
const factory__L2_UniswapV2Factory = factory('UniswapV2Factory', true)
const factory__L2_UniswapV2Pair = factory('UniswapV2Pair', true)

async function main() {
  // L2 messenger address is always the same.
  const l2MessengerAddress = '0x4200000000000000000000000000000000000007'
  const l2RpcProvider = new ethers.providers.JsonRpcProvider('https://testnet1.optimism.tokamak.network')

  const key = '<private key>'
  const l2Wallet = new ethers.Wallet(key, l2RpcProvider)

  console.log('Deploying L2 UniswapV2Factory...')
  const L2_UniswapV2Factory = await factory__L2_UniswapV2Factory.connect(l2Wallet).deploy(
    l2MessengerAddress,
  )
  const l2FactoryHash = await L2_UniswapV2Factory.deployTransaction.wait()
  console.log('L2UniswapV2Factory Contract address: ', l2FactoryHash.contractAddress);

  console.log('Deploying L2 UniswapV2Pair...')
  const L2_UniswapV2Pair = await factory__L2_UniswapV2Pair.connect(l2Wallet).deploy(
  )
  const l2PairHash = await L2_UniswapV2Pair.deployTransaction.wait();
  console.log('L2UniswapV2Pair Contract address: ', l2PairHash.contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
```

`<private key>` 에 배포에 사용할 계정의 개인키를 입력하고 난 뒤 다음 명령어를 이용해 배포 스크립트를 실행하면 된다.

```bash
$ node deploy_script.js
```

배포가 정상적으로 되었다면 아래와 같은 결과를 확인할 수 있다.
```
Deploying L2 UniswapV2Factory...
L2UniswapV2Factory Contract address: 0x70e0bA845a1A0F2DA3359C97E0285013525FFC49
Deploying L2 UniswapV2Pair...
L2UniswapV2Pair Contract address: 0x4826533B4897376654Bb4d4AD88B7faFD0C98528
```

