---
id: how-to-set-operator
title: How to Set Operator
sidebar_label: How to Set Operator
---

The document includes the process of registering the operator on a staking dashboard, starting with the deployment of smart contracts needed to operate the operator.

> Because it consumes a significant amount of ETH when steaming directly, it is recommended to use the `delegate` on the [Dashboard](https://staking.tokamak.network) unless it is intended for special purposes.

Contracts that need to be deployed to set up operators are `SubmitHandler`, `EpochHandler`, and `Layer 2` contracts.
The ETH required for the deployment of the corresponding contract is consumed by about 0.1 ETH on a gas price basis of 10 gwei.

The guide was performed on Mac OS and Linux 16.04.

## Set Operator

### TON Contract Information

'TON' token and steak manager contract addresses are as follows.

**Contract Information**

    TON: 0x2be5e8c109e2197d077d13a82daead6a9b3433c5
    WTON: 0xc4A11aaf6ea915Ed7Ac194161d2fC9384F15bff2 
    Layer2Registry: 0x0b3E174A2170083e770D5d4Cf56774D221b7063e
    DepositManager: "0x56E465f654393fa48f007Ed7346105c7195CEe43"
    SeigManager: "e0x710936500aC59e8551331871Cbad3D33d5e0D909"
    PowerTON: "0xd86d8950A4144D8a258930F6DD5f90CCE249E1CF"

It can be checked through [Dashboard API] (https://dashboard-api.tokamak.network/managers).

### 소스코드 다운로드 및 패키지 설치

```bash
$ git clone https://github.com/Onther-Tech/plasma-evm-contracts.git
$ cd plasma-evm-contracts && npm install
$ git submodule update --init --recursive
```
Once the package has been installed, you can proceed to the next step.

The versions of Truffle, Node.js, and Web3.js used in the script are as follows:

```bash
Truffle v5.1.42 (core: 5.1.42)
Solidity - 0.5.12 (solc-js)
Node v13.8.0
Web3.js v1.2.1
```

### Ethereum Mainnet Access Endpoint

The Ethereum mainnet access endpoint is required to deploy the operator. Although there are many ways, it is easy to use node addresses provided through 'Infura'. It secures address that can be accessed through 'Infura'.

If you don't have an 'Infura' account, you can get a access endpoint (URL) through [infura.io] (https://infura.io/)) membership.

When joining the site is completed, click `CREATE NEW PROJECT` of `Dashboard` to create a project.

Next, `ENDPOINTS` address that combines `PROJECT ID` is used as below.

`https://mainnet.infura.io/v3/[ProjectID] `

![Infura node ID](assets/guides_create-infura-node.png)
ex) `https://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194`

If you have an Ethereum node that you operate, you can use that node's access address instead of the `Infura` address.

### Deploy Operator

Operator deployment is carried out using truffle. If truffle is not installed, install it using npm.

```bash
$ npm install -g truffle
```

Once the truffle has been installed, you can now start deploying the operator. The deployment requires the Ethereum mainnet access address mentioned above and the private key of the account to be an operator.

It is recommended that you check the gas price through [Eth Gas Station](https://ethgasstation.info/) before contract deployment. Check the gas cost and adjust the gas cost in `truffle-config.js`.

```javascript
46  mainnet: {
47    provider: () => new PrivateKeyProvider(process.env.MAINNET_PRIVATE_KEY, process.env.MAINNET_PROVIDER_URL),
48    network_id: 1, // eslint-disable-line camelcase
49    gasPrice: <adjust gas price>,
50    skipDryRun: true,
51  },
```

If your private key is ready, you can now start deploying it.
Contract deployment order is followed by `EpochHandler`, `SubmitHandler`, and `Layer 2`.

First of all, it is going to deploy `EpochHandler` contract.

```bash
plasam-evm-contracts $ MAINNET_PRIVATE_KEY=<operator's private key> \        
                       MAINNET_PROVIDER_URL=https://mainnet.infura.io/v3/<use-your-own-infura-project-id> \
                       SET_OPERATOR=true epoch=true truffle migrate --network mainnet
```

Next, it is going to deploy `SubmitHandler` contract.
```bash
plasam-evm-contracts $ MAINNET_PRIVATE_KEY=<operator's private key> \        
                       MAINNET_PROVIDER_URL=https://mainnet.infura.io/v3/<use-your-own-infura-project-id> \
                       SET_OPERATOR=true submit=true truffle migrate --network mainnet
```


The last turn is deploy `Layer2` contract.
```bash
plasam-evm-contracts $ MAINNET_PRIVATE_KEY=<operator's private key> \        
                       MAINNET_PROVIDER_URL=https://mainnet.infura.io/v3/<use-your-own-infura-project-id> \
                       SET_OPERATOR=true l2=true truffle migrate --network mainnet
```
Address of `EpochHandler` contract is required for deployment of 'SubmitHandler' contract, address of `SubmitHandler` and `EpochHandler` contract is required for deployment of `Layer2` contract, and contract addresses are stored in `l2.json` file for deployment of each contract. If an error occurs during contract deployment, there may be a problem that all contents of `l2.json` disappear. If so, you can check the contract address that is printed during deployment and input it into `l2.json` in the following format.

```json
{"EpochHandler":"0xaeb25ad2512c237820A7d2094194E1e46c279bDf","SubmitHandler":"0xb40faB9d05c9494abefEB502d71482Eb191fc629","Layer2":"0x5564AD50B6Ef6270DDb11bA5030AE86A9D562390"}
```
### Set Operator

If contract deployment is successfully finished, you can set `Layer2` and register to `Layer2Registry` by using command below. 

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

To execute these two commands, `Layer2`, `SeigManager`, and `Layer2Registry` contract addresses are needed. Before performing this, check `l2.json` and `deployed.json` to make sure that both contract addresses are entered correctly. `Layer2` contract address is the contract address deployed at the above stage. The contract address for `SeigManager` contract address is `0x710936500aC59e8551331871Cbad3D33d5e0D909`, `Layer2Registry` contract address is `0x0b3E174A2170083e770D5d4Cf56774D221b7063e`.

## Registry Operator

The last step in registering an operator is to register with a dashboard.

Some parameters are required to register with the dashboard and are as follows:

```bash
operator_name: operator's name
chainid: chain id, It must not be duplicated
website: operator's website address
description: description about operator
layer2: deployed layer2 contract address
```

The commands for registering an operator are as follows.
```bash
plasma-evm-contracts $ REGISTER=true chainid=<operator's chain id> \
                       layer2=<layer2-contract-address> \
                       website="<website address>" \
                       description="<description about operator>" \
                       operator_name="<operator's name>" \
                       truffle migrate --network mainnet
```

If `chain id` is duplicated, there will be an error called `duplicate chain id`. In that case, change `chain id` and register again.

If all of the process are sucessfully finished, you can check your operator in the [Staking Dahsboard](https://staking.tokamak.network).