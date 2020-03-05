---
id: how-to-open-private-testnet-manually
title: Setup Childchain in Private Testnet
sidebar_label: Setup Childchain
---

## Setup Operator Node

Make sure that you did [setup Rootchain](how-to-open-private-testnet-rootchain#Setup-rootchain).

> Operator and challenger account to be used in root chain must have enough ether balance.
Note that operator node will run successfully only when challenger account has at least 0.5 ETH.

### 1. Download and Compile Repository

Download source file and then compile `geth`.

```bash
$ git clone https://github.com/onther-tech/plasma-evm
$ cd plasma-evm
plasma-evm$ make geth
```

### 2. Deploy RootChain Contract

This section explains about `deploy` command and its parameters for deploying rootChain contract.

`deploy` : It has 4 parameters, `name of genesis file`, `CHAINID`, `PRE-ASSET`, `EPOCH`.

`CHAINID` : Chain id set by opertaor.

`PRE-ASSET` : Flag to allocate PETH to accounts in child chain at genesis or not.

`EPOCH` : Length of epoch.
Ex) If `EPOCH` is `4096`, it will submit epoch every 4096 blocks.

Create `deploy.local.sh` by running following command.

```sh
plasma-evm$ cat > deploy.local.sh << EOF
#!/bin/bash

OPERATOR_KEY="b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291"
KEY2="78ae75d1cd5960d87e76a69760cb451a58928eee7890780c352186d23094a115"
KEY3="067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc"
KEY4="ae03e057a5b117295db86079ba4c8505df6074cdc54eec62f2050e677e5d4e66"
KEY5="eda4515e1bc6c08e8606b51ffb6ffe70b3fe76781ed49872285e484064e3b634"
CHALLENGER_KEY="78ae75d1cd5960d87e76a69760cb451a58928eee7890780c352186d23094a114"

DATADIR=pls.data
OPERATOR="0x71562b71999873DB5b286dF957af199Ec94617F7"
CHALLENGER="0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8"

ROOTCHAIN_IP=localhost # Onther Ropsten Geth Node IP.

# Deploy contracts at rootchain
echo "Deploy rootchain contract and others"
make geth && build/bin/geth \\
    --rootchain.url "ws://$ROOTCHAIN_IP:8546" \\
    --operator.key $OPERATOR_KEY \\
    --datadir $DATADIR \\
    deploy "./genesis.json" 16 true 4096

# deploy params : chainID, isInitialAsset, Epochlength
# you can checkout "$geth deploy --help" for more information
EOF
```

You can run `deploy.local.sh` by running following command.

```sh
plasma-evm$ bash deploy.local.sh
```

`genesis.json` gerenated from the script will be located in `plasma-evm` directory.

### 3. Initialize

You must initialize chain data before running operator node.

`genesis.json` is located in current path(i.e `~/plasma-evm/genesis.json`).

Run following command to initialize chain data.

```bash

plasma-evm$ build/bin/geth --nousb init \
            --datadir ./chaindata-oper \
            --rootchain.url ws://localhost:8546 \
            genesis.json
```

### 4. Create Keystore of Operator Account.

You need private key of operator account in order to sign transaction for submitting blocks to root chain.

You must locate the keystore to the `datadir` directory.

Command `geth account` allows to create keystore file only with private key hex.

> Use same `datadir` as in the initialzation.

```
# Generate Operator Keyfile
plasma-evm$ build/bin/geth account importKey b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 --datadir ./chaindata-oper
INFO [08-27|16:14:38.878] Bumping default cache on mainnet         provided=1024 updated=4096
INFO [08-27|16:14:38.879] Maximum peer count                       ETH=50 LES=0 total=50
INFO [08-27|16:14:38.905] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
Your new account is locked with a password. Please give a password. Do not forget this password.
Passphrase:
Repeat passphrase:
```

### 5. Run Operator Node

If operator keystore is locked with passphrase, you must write the passphrase in `signer.pass` file. `signer.pass` will be empty if it had no passphrase.

Create `signer.pass` with following command.(without `"`).

```bash
plasma-evm$ echo "<Passphrase for operator keystore file>" > signer.pass
```

Run operator node with following command.

```bash
plasma-evm$ build/bin/geth \
    --nousb \
    --datadir ./chaindata-oper \
    --syncmode="full" \
    --networkid 16 \
    --rootchain.url ws://localhost:8546 \
    --operator 0x71562b71999873DB5b286dF957af199Ec94617F7 \
    --port 30306 \
    --nat extip:::1 \
    --maxpeers 50 \
    --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
    --password signer.pass \
    --bootnodes "enode://4966a7e4621c2c0b1b1b3295b4a35ccc4224ba1d529bf5aa2323e4650f6075bd5eb6618372b2579965819347307f1f97315ce91b09ca342d60c2e98ad88db9f3@127.0.0.1:30307" \
    --mine \
    --miner.gastarget 7500000 \
    --miner.gaslimit 10000000
```

`enode://...` address used in `bootnodes` flag above will be same as result of [Setup User Node - 2. Generate `bootkey`](how-to-open-private-testnet-manually#2-generate-bootkey).

## Setup User Node

This guide describes how to run user node without setting challenger account.

> You can add challenger flag to run challneger node. Note that account balance of challenger must be more than 0.5ETH.

### 1. Initialize

Insert URL of RootChain on which `RootChain Contract` was deployed, as parameter of `--rootchain.url` flag.

Use address of the `RootChain` set in [here](how-to-open-private-testnet-rootchain#Setup-rootchain).

```bash
plasma-evm$ build/bin/geth --nousb init \
            --datadir ./chaindata-user \
            --rootchain.url ws://localhost:8546 \
            genesis.json
```

> Use same `genesis.json` as in [setting up operator node](how-to-open-private-testnet-manually#3-Initialize).


### 2. Generate `bootkey`

Make `boot.key` file for operator node to use designated enode address.

```bash
plasma-evm$ echo "e854e2f029be6364f0f961bd7571fd4431f99355b51ab79d23c56506f5f1a7c3" > boot.key
```

### 3. Run user node

You must [Setup User Node - 1. Initialize](how-to-open-private-testnet-manually##1-initialize) before running user node. It will use same `datadir` as in the initialization.

Run user node with following command. If you want to run challenger, add `--rootchain.challenger 0x0...` to the command.

```bash
plasma-evm$ build/bin/geth \
    --nousb \
    --datadir ./chaindata-user \
    --syncmode="full" \
    --networkid 16 \
    --rootchain.url ws://localhost:8546 \
    --rpc \
    --rpcaddr '0.0.0.0' \
    --rpcport 8547 \
    --rpcapi eth,net,debug \
    --rpccorsdomain "*" \
    --rpcvhosts=localhost \
    --ws \
    --wsorigins '*' \
    --wsaddr '0.0.0.0' \
    --wsport 8548 \
    --nodekey boot.key \
    --port 30307 \
    --nat extip:::1 \
    --maxpeers 50
```

> You must set `syncmode` to `full` or `archive` in order to synchronize with operator node.

<!-- TODO : fix link -->
<!-- ### Architecture Diagram -->

<!-- ![Architecture after setup childchain](assets/guides_private_testnet_manually.png) -->