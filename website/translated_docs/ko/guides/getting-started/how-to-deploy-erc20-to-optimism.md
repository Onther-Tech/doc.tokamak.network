---
id: how-to-deploy-erc20-to-optimism
title: How to deploy ERC20 to Optimistic Rollup
sidebar_label: Deploy ERC20 to Optimistic Rollup
---

해당 문서는 토카막 옵티미스틱 롤업에 ERC20 컨트랙트를 배포하는 과정을 담고 있으며 우분투 16.04에서 수행 되었다. 토카막 옵티미즘 테스트넷은 링키비를 사용한다.

배포해야 하는 컨트랙트는 레이어1에서 두개(`L1_ERC20`, `L1_ERC20Gateway`), 레이어2에서 한개(`L2_ERC20`)해서 총 3개이며 `L1_ERC20`과 같은 경우는 기존에 배포되어 있는 ERC20 컨트랙트가 있다면 기존 컨트랙트를 사용해도 된다.

> 롤업에서는 web3.js 대신 ethers.js를, truffle 대신 hardhat을 사용하고 있다. ethers.js와 hardhat 등은 web3와 truffle 등과 비교했을 때 여러 장점들이 있어 최근 많은 스마트 컨트랙트 프로젝트에서 사용하고 있다.

## 컨트랙트와 서비스 설정

### 소스코드 다운로드 및 패키지 설치

아래 명령어를 이용해 소스코드를 복제하고 패키지들을 설치한 후 컨트랙트를 컴파일한다.

```bash
$ git clone https://github.com/Onther-Tech/l1-l2-deposit-withdrawal.git
$ cd l1-l2-deposit-withdrawal && yarn && yarn compile
```

패키지 설치를 마치면 다음 단계를 진행하면 된다.


```javascript
const ethers = require('ethers')
const { Watcher } = require('@eth-optimism/watcher')
const { getContractFactory } = require('@eth-optimism/contracts')

// Set up some contract factories. You can ignore this stuff. 
const factory = (name, ovm = false) => {
  const artifact = require(`./artifacts${ovm ? '-ovm' : ''}/contracts/${name}.sol/${name}.json`)
  return new ethers.ContractFactory(artifact.abi, artifact.bytecode)
}   
const factory__L1_ERC20 = factory('ERC20')
const factory__L2_ERC20 = factory('L2DepositedERC20', true)
const factory__L1_ERC20Gateway = getContractFactory('OVM_L1ERC20Gateway')

async function main() {
  // Set up our RPC provider connections.
  const l1RpcProvider = new ethers.providers.JsonRpcProvider('<rinkeby rpc address>')
  const l2RpcProvider = new ethers.providers.JsonRpcProvider('https://testnet1.optimism.tokamak.network')

  // Set up our wallets (using a default private key with 10k ETH allocated to it).
  // Need two wallets objects, one for interacting with L1 and one for interacting with L2.
  // Both will use the same private key.
  const key = '<private key>'
  const l1Wallet = new ethers.Wallet(key, l1RpcProvider)
  const l2Wallet = new ethers.Wallet(key, l2RpcProvider)

  // L1 messenger address depends on the deployment, this is default for our testnet1
  const l1MessengerAddress = '0xaFD9bB316D38aBB0400a53963A9324AB26eda97C' 
  // L2 messenger address is always the same.
  const l2MessengerAddress = '0x4200000000000000000000000000000000000007'
```

`l1RpcProvider`에는 링키비 rpc주소를 입력하면되며, 컨트랙트 배포에 사용할 계정의 개인키를 `key`에 입력하면 된다. 해당 계정에는 링키비용 이더가 있어야 한다.

그 다음 아래 코드를 통해 컨트랙트를 배포하면 된다. 배포되는 컨트랙트는 각 레이어에 배포되는 ERC20 컨트랙트(`L1_ERC20`, `L2_ERC20`)와 해당 ERC20의 레이어 간 이동을 지원하는 `L1_ERC20Gateway` 컨트랙트이다.

```javascript
 // Deploy an ERC20 token on L1.
  console.log('Deploying L1 ERC20...')
  const L1_ERC20 = await factory__L1_ERC20.connect(l1Wallet).deploy(
    1234, //initialSupply
    'L1 ERC20', //name
  )
  await L1_ERC20.deployTransaction.wait()

  // Deploy the paired ERC20 token to L2.
  console.log('Deploying L2 ERC20...')
  const L2_ERC20 = await factory__L2_ERC20.connect(l2Wallet).deploy(
    l2MessengerAddress,
    'L2 ERC20', //name
    {
      gasPrice: 0
    }
  )
  await L2_ERC20.deployTransaction.wait()

  // Create a gateway that connects the two contracts.
  console.log('Deploying L1 ERC20 Gateway...')
  const L1_ERC20Gateway = await factory__L1_ERC20Gateway.connect(l1Wallet).deploy(
    L1_ERC20.address,
    L2_ERC20.address,
    l1MessengerAddress
  )
  await L1_ERC20Gateway.deployTransaction.wait()

  // Make the L2 ERC20 aware of the gateway contract.
  console.log('Initializing L2 ERC20...')
  const tx0 = await L2_ERC20.init(
    L1_ERC20Gateway.address,
    {
      gasPrice: 0
    }
  )
  await tx0.wait()
  ```

배포가 정상적으로 종료되면 아래와 같은 결과를 확인할 수 있다.

```bash
Deploying L1 ERC20...
Deploying L2 ERC20...
Deploying L1 ERC20 Gateway...
Initializing L2 ERC20...
```

