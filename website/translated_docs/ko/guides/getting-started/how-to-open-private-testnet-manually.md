---
id: how-to-open-private-testnet-manually
title: 프라이빗 테스트넷 자식 체인 설정
sidebar_label: 자식체인 설정
---

루트체인이 구동되고 있는 환경에서 자식 체인을 실행해야 하므로, [루트체인 설정](how-to-open-private-testnet-rootchain#루트-체인-설정)을 먼저 진행한다.

## 오퍼레이터 노드 설정
[루트체인 설정](how-to-open-private-testnet-rootchain#%EB%B6%80%EB%AA%A8-%EC%B2%B4%EC%9D%B8-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0) 수행하였음을 전제로 한다.

> 루트체인(rootchain)에서 사용할 오퍼레이터(Operator)와 챌린저(Challenger) 계정에 이더 잔고(Balance)가 있어야 한다.
특히, 챌린저 계정에 최소 0.5 ETH 이상이 있어야 오퍼레이터 노드가 정상적으로 실행된다.

### 1. 저장소 다운로드 및 컴파일

소스파일을 다운로드 받은 후 실행가능한 `geth` 파일을 컴파일 한다.

```bash
$ git clone https://github.com/onther-tech/plasma-evm
$ cd plasma-evm
plasma-evm$ make geth
```

### 2. 루트체인 컨트랙트 배포

루트체인 컨트랙트 배포 커맨드인 `deploy`에 대한 설명이다.

`deploy` 커맨드의 입력인자는 <출력할 genesis 파일 이름>, <체인아이디(CHAINID)>, <프리 에셋(PRE-ASSET)>, <에폭(EPOCH)>.

`CHAINID` : 오퍼레이터가 임의로 정할 수 있는 체인 고유의 숫자.

`PRE-ASSET` : `genesis` 파일에 미리 PETH를 부여할지에 대한 여부. `true` 경우 자식체인 계정들에 PETH 잔고가 생성됨.

`EPOCH` : 루트체인에 커밋할 자식체인의 블록갯수.
예) `4096` 설정하는 경우, 자식체인 4096블록 마다 루트체인에 1회 커밋 트랜잭션을 전송.

아래 커맨드로 `deploy.local.sh` 스크립트 파일을 생성한다.
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

생성된 `deploy.local.sh` 스크립트는 아래 명령어로 실행한다.

```sh
plasma-evm$ bash deploy.local.sh
```

스크립트를 통해 생성한 `genesis.json` 파일은 `plasma-evm` 디렉토리 내에 위치한다.

### 3. 초기화

오퍼레이터 노드 실행전에 체인 데이터를 초기화 해야한다.

기본 설정값인 `genesis.json` 파일이 실행경로에 위치하고 있으므로 genesis 파일 경로를 지정할 필요 없다.

아래 명령어를 통해 체인데이터를 초기화한다.

```bash

plasma-evm$ build/bin/geth init \
            --datadir ./chaindata-oper \
            --rootchain.url ws://localhost:8546 \
            genesis.json
```

### 4. 오퍼레이터 계정 키스토어 생성

오퍼레이터 노드는 자식체인 블록 정보를 루트체인에 커밋 해야 하므로, 트랜잭션 생성에 오퍼레이터의 비밀키가 필요하다.

따라서, 오퍼레이터 키를 담고 있는 키스토어 파일을 초기화한 `datadir`내에 위치시켜야 한다.

`Plasma-evm`의 `geth account` 커맨드는 비밀키(private key)만으로 키스토어 파일을 생성할 수 있다.

> 초기화와 동일한 `datadir` 위치를 사용한다.

```bash
# Generate Operator Keyfile
plasma-evm$ build/bin/geth account importKey b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 --datadir pls.data
INFO [08-27|16:14:38.878] Bumping default cache on mainnet         provided=1024 updated=4096
INFO [08-27|16:14:38.879] Maximum peer count                       ETH=50 LES=0 total=50
INFO [08-27|16:14:38.905] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
Your new account is locked with a password. Please give a password. Do not forget this password.
Passphrase:
Repeat passphrase:
```

### 5. 오퍼레이터 노드 실행

만약, 오퍼레이터 키스토어 파일에 암호가 걸려 있는경우 `signer.pass` 파일 내부에 패스워드를 기록해주어야 한다. 암호가 없는 경우 `signer.pass` 는 아무런 내용이 없는 빈파일을 생성한다.

아래 커맨드를 통해서 `signer.pass` 파일을 생성 한다.

```bash
plasma-evm$ echo "<Passphrase for operator keystore file>" > signer.pass
```

아래 명령어를 통해서 오퍼레이터 노드를 실행한다.

```bash
plasma-evm$ build/bin/geth \
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

위 `bootnodes` 플래그에 사용되는 `enode://...` 주소는 [사용자 노드 설정 - 2. `bootkey` 생성](how-to-open-private-testnet-manually#2-bootkey-생성)의 결과와 같다.

## 사용자 노드 설정

챌린저 계정 설정 없이 사용자 노드 실행이 가능하므로, 이 가이드에서는 챌린저 계정 없이 사용자 노드를 실행한다.

> 챌린저 플래그에 계정을 추가 하는 경우 챌린저 역할을 수행하는 노드가 될 수 있다. 챌린저 계정은 최소한 요구되는 이더리움 잔고(기본값 0.5 ETH) 이상 되어야 하며, 이보다 낮은 경우 첼린저 플래그를 사용한 사용자 노드는 실행 되지 않는다.

### 1. 초기화

`--rootchain.url` 플래그 입력 인자로 루트체인 컨트랙트가 배포된 루트체인 접속 주소(URL)를 입력한다.

[루트 체인 설정](how-to-open-private-testnet-rootchain#루트-체인-설정) 통해 실행중인 루트체인 접속 주소를 사용한다.

```bash
plasma-evm$ build/bin/geth init \
            --datadir ./chaindata-user \
            --rootchain.url ws://localhost:8546 \
            genesis.json
```
> [오퍼레이터 설정 - 3. 초기화](how-to-open-private-testnet-manually#3-초기화)에서 사용한 `genesis.json` 파일을 사용한다.

### 2. `bootkey` 생성

오퍼레이터 노드에서 미리 지정한 enode 주소를 사용하도록 `boot.key` 파일을 생성한다.

```bash
plasma-evm$ echo "e854e2f029be6364f0f961bd7571fd4431f99355b51ab79d23c56506f5f1a7c3" > boot.key
```

### 3. 사용자 노드 실행

[사용자 노드 설정 - 1. 초기화](how-to-open-private-testnet-manually#1-초기화) 과정을 반드시 진행해야 한다. 초기화와 동일한 `datadir`을 사용한다.

만약, 챌린저 역할도 수행하고자 한다면 `--rootchain.challenger 0x0...` 을 입력인자로 추가해 실행한다.

```bash
plasma-evm$ build/bin/geth \
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

> `syncmode`는 `full` 또는 `archive`를 입력해야 오퍼레이터 노드와 동기화 된다.

### 설정 완료 후 구조도

![자식 체인 설정 완료 후 개요도](assets/guides_private_testnet_manually.png)