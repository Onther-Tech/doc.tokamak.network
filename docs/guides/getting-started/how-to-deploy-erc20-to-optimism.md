---
id: how-to-deploy-erc20-to-optimism
title: How to deploy ERC20 to Optimistic Rollup
sidebar_label: Deploy ERC20 to Optimistic Rollup
---

The documentation included the deployment of the ERC20 Contract to the Tokamak Optimistic Rollup, which was performed in Ubuntu 16.04. The Tokamak Optimism TestNet uses Linkybee.

There are three contracts that need to be deployed, one from Layer 1(`L1_ERC20`, `L1_ERC20Gateway`) to two and one from Layer 2(`L2_ERC20`) and in case of `L1_ERC20`, existing contracts can be used.

> Rollup uses ethers.js instead of web3.js and hardhat instead of truffle. ethers.js and hardhat have many advantages compared to web3 and truffle, so they have been used in many smart contract projects recently.

## Set Contract and service

## Download source code and Install Package

Copy the source code, install the packages, and compile the contract using the command below.

```bash
$ git clone https://github.com/Onther-Tech/l1-l2-deposit-withdrawal.git
$ cd l1-l2-deposit-withdrawal && yarn && yarn compile
```

If the package is installed, you can proceed to the next step.


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

For 'l1RpcProvider', you can enter the Rinkeby rpc address and enter the private key of the account that will be used to distribute contracts into 'key'. The account must have a Rinkeby ether.

The contract can then be deployed via the code below. Contracts that will be deployed are ERC20(`L1_ERC20` and `L2_ERC20`) contracts that will be deployed to each layer and `L1_ERC20 Gateway` contracts that will support movement between layers of corresponding ERC20.

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

When the deployment is terminated normally, the following results can be confirmed.

```bash
Deploying L1 ERC20...
Deploying L2 ERC20...
Deploying L1 ERC20 Gateway...
Initializing L2 ERC20...
```

- [Optimism Monorepo](https://github.com/ethereum-optimism/optimism)
- [Onther-Tech/l1-l2-deposit-withdrawal](https://github.com/Onther-Tech/l1-l2-deposit-withdrawal)
- [Onther Blog](https://medium.com/onther-tech/%EC%98%B5%ED%8B%B0%EB%AF%B8%EC%8A%A4%ED%8B%B1-%EB%A1%A4%EC%97%85%EC%97%90%EC%84%9C-erc20-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-bc774f94d8b3)