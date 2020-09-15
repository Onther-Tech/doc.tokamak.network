---
id: how-to-set-operator
title: How to Set Operator
sidebar_label: How to Set Operator
---

The document includes the process of registering the operator on a staking dashboard, starting with the distribution of smart contracts needed to operate the operator.

> Because it consumes a significant amount of ETH when steaming directly, it is recommended to use the `delegate` on the Dashboard](https://staking.tokamak.network) unless it is intended for special purposes.

Contracts that need to be distributed to set up operators are `SubmitHandler`, `EpochHandler`, and `Layer 2` contracts.
The ETH required for the deployment of the corresponding contract is consumed by about 0.1 ETH on a gas price basis of 10 gwei.

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

Once the truffle has been installed, you can now start deploying the operator. The distribution requires the Ethereum mainnet access address mentioned above and the private key of the account to be an operator.

If your private key is ready, you can now start distributing it.

```bash
plasam-evm-contracts $ MAINNET_PRIVATE_KEY=<operator's private key> \        
                       MAINNET_PROVIDER_URL=https://mainnet.infura.io/v3/<use-your-own-infura-project-id> \
                       SET_OPERATOR=true truffle migrate --network mainnet
```
Contract deployment order is followed by `EpochHandler`, `SubmitHandler`, and `Layer 2`.

The following error may occur during the deployment of the contract.

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
In this case, the contract addresses of `EpochHandler` and `SubmitHandler` are checked as shown below.

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

Next, change the code of `migrate/3_deploy_rootchain.js` by referring to the code below.

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

You can change the code as below.

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
If `Layer2` contract is deployed safely, remember the contract address.

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