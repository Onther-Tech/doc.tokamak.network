---
id: how-to-open-private-testnet-manually
title: Setup Childchain in Private Testnet
sidebar_label: Setup Childchain
---

## Intro

If you successfully deployed rootchain with [Setup Rootchain](how-to-open-private-testnet-rootchain), let's run childchain at this time.
The childchain is layer-2 blockchain of Tokamak which depends on rootchain. In this section, assumed that you had [Setup Rootchain](how-to-open-private-testnet-rootchain) with in the same machine.

## Setup Operator Node

Make sure that you did [setup Rootchain](how-to-open-private-testnet-rootchain#Setup-rootchain).

> Operator and challenger account to be used in root chain must have enough ether balance.
Note that operator node will run successfully only when challenger account has at least 0.5 ETH.

### 1. Deploy rootchain contract

This section explains about `deploy` command and its parameters for deploying rootChain contract.

`deploy` command has 4 input parameters, `<name of genesis file>`, `<CHAINID>`, `<PRE-ASSET>`, `<EPOCH>`.

- `CHAINID` : Chain id set by opertaor.
- `PRE-ASSET` : Flag to allocate PETH to accounts in child chain at genesis or not.
- `EPOCH` : Length of epoch. If `EPOCH` is `2`, childchain will submit epoch every 2 blocks.

Tokamak Plasma's childchain provides `Stamina`, a fee payment method for childchain. For more details refer to [`Stamina`](https://docs.tokamak.network/docs/en/learn/economics/tx-fee#stamina).

You can change stamina parameters by adding flags as follows. If not using stamina flag, set default parameters.

- `--stamina.operatoramount` : Operator stamina amount at genesis block in ETH (default: 1)
- `--stamina.mindeposit` : Minimum deposit amount in ETH (default: 0.5)
- `--stamina.recoverepochlength` : The length of recovery epoch in block (default: 120960)
- `--stamina.withdrawaldelay` : Withdrawal delay in block (default: 362880)

> In the case of `stamina.withdrawaldelay`, a value of at least two times more than `stamina.recoverepochlength` should be used.

The stamina feature is provided as a pre-compiled contract in childchain. The stamina contract address is `0x000000000000000000000000000000000000dead` in every tokamak plasma childchain.

You can check [this](https://github.com/Onther-Tech/stamina) for more details about the stamina contract.

Create `deploy.operator1.sh` by running following command.

```bash
plasma-evm$ cat > deploy.operator1.sh << "EOF"
#!/bin/bash
OPERATOR_KEY="bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5"
OPERATOR="0x3cd9f729c8d882b851f8c70fb36d22b391a288cd"

DATADIR=.pls.staking/operator1

ROOTCHAIN_IP=127.0.0.1

# Deploy contracts at rootchain
echo "Deploy rootchain contract and others"
make geth && build/bin/geth \
    --nousb \
    --datadir $DATADIR \
    --rootchain.url "ws://$ROOTCHAIN_IP:8546" \
    --unlock $OPERATOR \
    --password pwd.pass \
    --rootchain.sender $OPERATOR \
    --stamina.operatoramount 1 \
    --stamina.mindeposit 0.5 \
    --stamina.recoverepochlength 120960 \
    --stamina.withdrawaldelay 362880 \
    deploy "./genesis-operator1.json" 102 true 2

# you can checkout "$geth deploy --help" for more information
EOF
```


You can run `deploy.operator1.sh` script as following command.

```sh
plasma-evm$ bash deploy.operator1.sh
```

`genesis-operator1.json` gerenated from the script will be located in `plasma-evm` directory.

### 2. Initialize

You must initialize chain data before running operator node.

`genesis-operator1.json` is located in current path(i.e `~/plasma-evm/genesis-operator1.json`).

Run following command to initialize chain data.

```bash
plasma-evm$ build/bin/geth --nousb init \
            --datadir .pls.staking/operator1 \
            --rootchain.url ws://localhost:8546 \
            genesis-operator1.json
```

### 3. Set manager contract

After [2. Initialize](#2-initialize) for childchain, The Operator should register an address of the rootchain contract to stake manager contract.

After setting up the operator plasma chain, operator must register a rootchain contract address to the stake manager contract.

Using `setManagers` sub-command of `manage-staking`, set the stake contract addresses to run operator's plasma chain.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking setManagers manager.json  \
            --datadir ./.pls.staking/operator1
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Set address                              name=TON addr=0x3A220f351252089D385b29beca14e27F204c296A
INFO [01-01|00:00:00.000] Set address                              name=WTON addr=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf
INFO [01-01|00:00:00.000] Set address                              name=DepositManager addr=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d
INFO [01-01|00:00:00.000] Set address                              name=RootChainRegistry addr=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44
INFO [01-01|00:00:00.000] Set address                              name=SeigManager       addr=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Set address                              name=PowerTON          addr=0xBcDfc870Ea0C6463C6EBb2B2217a4b32B93BCFB7
```

Check if the information of stake contract address is included in the operator chaindata with `getManagers` sub-command of `manage-staking`.

```bash
plasma-evm $ build/bin/geth --nousb \
              manage-staking getManagers \
              --datadir ./.pls.staking/operator1
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Smartcard socket not found, disabling    err="stat /run/pcscd/pcscd.comm: no such file or directory"
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/manager/geth/stakingdata cache=16.00MiB handles=16
{
  "TON": "0x3a220f351252089d385b29beca14e27f204c296a",
  "WTON": "0xdb7d6ab1f17c6b31909ae466702703daef9269cf",
  "DepositManager": "0x880ec53af800b5cd051531672ef4fc4de233bd5d",
  "RootChainRegistry": "0x537e697c7ab75a26f9ecf0ce810e3154dfcaaf44",
  "SeigManager": "0x3dc2cd8f2e345951508427872d8ac9f635fbe0ec",
  "PowerTON": "0x82567a6f6e3abe246f62350322a07af7f413cfe6"
}
```

### 4. Register rootchain contract

Register the rootchain address of operator plasma chain to the stake manager contract in order to receive seigniorage.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking register \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

If rootchain address is successfully registered, you will see the following message.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Registered SeigManager to RootChain      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=b546d3…fe55ed
INFO [01-01|00:00:00.000] Registered RootChain to SeigManager      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=6904c9…bc07a5
```

### 5. Run Operator node

Run operator node with following command.

```bash
plasma-evm$ build/bin/geth \
    --nousb \
    --datadir ./.pls.staking/operator1 \
    --syncmode='full' \
    --networkid 102 \
    --rootchain.url ws://127.0.0.1:8546 \
    --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
    --port 30306 \
    --nat extip:::1 \
    --maxpeers 50 \
    --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
    --password pwd.pass \
    --nodekeyhex e854e2f029be6364f0f961bd7571fd4431f99355b51ab79d23c56506f5f1a7c3 \
    --mine \
    --miner.gastarget 7500000 \
    --miner.gaslimit 10000000
```

## Setup User Node

This guide describes how to run user node without setting challenger account.

> You can add challenger flag to run challneger node. Note that account balance of challenger must be more than 0.5ETH.

### 1. Initialize

Insert URL of RootChain on which `RootChain Contract` was deployed, as parameter of `--rootchain.url` flag.

Use the address of RootChain set in [here](how-to-open-private-testnet-rootchain#setup-rootchain) as `--rootchain.url`.

```bash
plasma-evm$ build/bin/geth --nousb init \
            --datadir ./.pls.staking/usernode \
            --rootchain.url ws://localhost:8546 \
            genesis-operator1.json
```

> Use same `genesis-operator1.json` file as in [Setup Operator Node - 2. Initialize](how-to-open-private-testnet-manually#2-initialize).

### 2. Running User Node

You must [Setup User Node - 1. Initialize](how-to-open-private-testnet-rootchain#1-initialize) before running user node. It will use same `datadir` as in the initialization.

Run user node with following command. If you want to run challenger, add `--rootchain.challenger 0x0...` to the command.

```bash
plasma-evm$ build/bin/geth \
    --nousb \
    --datadir ./.pls.staking/usernode \
    --syncmode='full' \
    --networkid 102 \
    --rootchain.url ws://localhost:8546 \
    --rpc \
    --rpcaddr '0.0.0.0' \
    --rpcport 8547 \
    --rpcapi eth,net,debug \
    --rpccorsdomain '*' \
    --rpcvhosts=localhost \
    --ws \
    --wsorigins '*' \
    --wsaddr '0.0.0.0' \
    --wsport 8548 \
    --bootnodes "enode://4966a7e4621c2c0b1b1b3295b4a35ccc4224ba1d529bf5aa2323e4650f6075bd5eb6618372b2579965819347307f1f97315ce91b09ca342d60c2e98ad88db9f3@127.0.0.1:30306" \
    --port 30307 \
    --nat extip:::1 \
    --maxpeers 50
```

> You must set `syncmode` to `full` or `archive` in order to synchronize with operator node.

## Next

Try to send a simple transaction using JSON-RPC protocol to the usernode which setup in the previous step. If no transaction, The childchain, tokamak plasma, does not generate block due to [Unique structure of the Tokamak network](https://docs.tokamak.network/docs/en/learn/advanced/plasma-evm-architecture)

Also, try to deploy [requestable contract](https://docs.tokamak.network/docs/en/learn/advanced/examples-and-best-practices#requestablesimpletoken) to both the rootchain and the childchain, and send some transaction with [Enter and Exit](https://docs.tokamak.network/docs/en/learn/basic/enter-and-exit). these process will help to understand a powerful interoperability of Tokamak network.

<!--## Architecture Diagram ![Architecture after setup childchain](assets/guides_private_testnet_manually.png)-->