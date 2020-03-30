---
id: how-to-open-private-testnet-manually
title: Setup Childchain in Private Testnet
sidebar_label: Setup Childchain
---

루트체인이 구동되고 있는 환경에서 자식 체인을 실행해야 하므로, [루트체인 설정](how-to-open-private-testnet-rootchain#루트-체인-설정)을 먼저 진행한다.

## 오퍼레이터1 노드 설정
[루트체인 설정](how-to-open-private-testnet-rootchain#%EB%B6%80%EB%AA%A8-%EC%B2%B4%EC%9D%B8-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0) 수행하였음을 전제로 한다.

> 루트체인(rootchain)에서 사용할 오퍼레이터(Operator)와 챌린저(Challenger) 계정에 이더 잔고(Balance)가 있어야 한다.
특히, 챌린저 계정에 최소 0.5 ETH 이상이 있어야 오퍼레이터 노드가 정상적으로 실행된다.

### 1. 루트체인 컨트랙트 배포

루트체인 컨트랙트 배포 커맨드인 `deploy`에 대한 설명이다.

`deploy` 커맨드의 입력인자는 <출력할 genesis 파일 이름>, <체인아이디(CHAINID)>, <프리 에셋(PRE-ASSET)>, <에폭(EPOCH)>.

`CHAINID` : 오퍼레이터가 임의로 정할 수 있는 체인 고유의 숫자.

`PRE-ASSET` : `genesis` 파일에 미리 PETH를 부여할지에 대한 여부. `true` 경우 자식체인 계정들에 PETH 잔고가 생성됨.

`EPOCH` : 루트체인에 커밋할 자식체인의 블록갯수.
예) `2` 설정하는 경우, 자식체인 2개 블록 마다 루트체인에 1회 커밋 트랜잭션을 전송.

아래 커맨드로 `deploy.local.sh` 스크립트 파일을 생성한다.

```sh
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
    deploy "./genesis-operator1.json" 102 true 2

# you can checkout "$geth deploy --help" for more information
EOF
```

생성된 `deploy.operator1.sh` 스크립트는 아래 명령어로 실행한다.

```sh
plasma-evm$ bash deploy.operator1.sh
```

스크립트를 통해 생성한 `genesis-operator1.json` 파일은 `plasma-evm` 디렉토리 내에 위치한다.

### 2. 초기화

오퍼레이터 노드 실행전에 체인 데이터를 초기화 해야한다.

아래 명령어를 통해 체인데이터를 초기화한다.

```bash
plasma-evm$ build/bin/geth --nousb init \
            --datadir .pls.staking/operator1 \
            --rootchain.url ws://localhost:8546 \
            genesis-operator1.json
```

### 3. 매니저 컨트랙트 설정

오퍼레이터 체인 시작을 위해 [초기화](#2-초기화) 이후, 스테이크 메니저 컨트랙트에 각 오퍼레이터의 루트체인 컨트랙트 주소를 등록 해야 한다.

아래 `manage-staking`의 하위 명령어인 `setManagers` 사용하여 오퍼레이터1의 플라즈마 체인 운영에 필요한 스테이크 컨트랙트 주소를 설정한다.

```bash
plasma-evm $ build/bin/geth --nousb \
            manage-staking setManagers manager.json  \
            --datadir ./.pls.staking/operator1
```

`manage-staking` 의 하위 명령어인 `getManagers` 를 실행하여 오퍼레이터1 체인데이터에 스테이크 컨트랙트 정보가 등록되어 있는지 확인한다.

```bash
plasma-evm $ build/bin/geth --nousb \
            manage-staking getManagers \
            --datadir ./.pls.staking/operator1
INFO [03-30|07:16:23.130] Maximum peer count                       ETH=50 LES=0 total=50
INFO [03-30|07:16:23.131] Smartcard socket not found, disabling    err="stat /run/pcscd/pcscd.comm: no such file or directory"
INFO [03-30|07:16:23.132] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [03-30|07:16:23.132] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/manager/geth/stakingdata cache=16.00MiB handles=16
{
  "TON": "0x3a220f351252089d385b29beca14e27f204c296a",
  "WTON": "0xdb7d6ab1f17c6b31909ae466702703daef9269cf",
  "DepositManager": "0x880ec53af800b5cd051531672ef4fc4de233bd5d",
  "RootChainRegistry": "0x537e697c7ab75a26f9ecf0ce810e3154dfcaaf44",
  "SeigManager": "0x3dc2cd8f2e345951508427872d8ac9f635fbe0ec",
  "PowerTON": "0x82567a6f6e3abe246f62350322a07af7f413cfe6"
}
```

### 4. 루트체인 등록

오퍼레이터1 이 설정한 플라즈마 체인의 루트체인 주소를 스테이크 매니저 컨트랙트에 등록하여 스테이크 시뇨리지를 받을 수 있게 한다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking register \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

오퍼레이터1 의 루트체인 컨트랙트가 정상적으로 등록되면 아래와 같이 출력된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Registered SeigManager to RootChain      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=b546d3…fe55ed
INFO [01-01|00:00:00.000] Registered RootChain to SeigManager      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=6904c9…bc07a5
```

### 5. 노드 실행

아래 명령어를 통해서 오퍼레이터 노드를 실행한다.

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

## 사용자 노드 설정

챌린저 계정 설정 없이 사용자 노드 실행이 가능하므로, 이 가이드에서는 챌린저 계정 없이 사용자 노드를 실행한다.

> 챌린저 플래그에 계정을 추가 하는 경우 챌린저 역할을 수행하는 노드가 될 수 있다. 챌린저 계정은 최소한 요구되는 이더리움 잔고(기본값 0.5 ETH) 이상 되어야 하며, 이보다 낮은 경우 첼린저 플래그를 사용한 사용자 노드는 실행 되지 않는다.

### 1. 초기화

`--rootchain.url` 플래그 입력 인자로 루트체인 컨트랙트가 배포된 루트체인 접속 주소(URL)를 입력한다.

[루트 체인 설정](how-to-open-private-testnet-rootchain#루트-체인-설정) 통해 실행중인 루트체인 접속 주소를 사용한다.

```bash
plasma-evm$ build/bin/geth --nousb init \
            --datadir ./.pls.staking/usernode \
            --rootchain.url ws://localhost:8546 \
            genesis-operator1.json
```

> [오퍼레이터 설정 - 2. 초기화](how-to-open-private-testnet-manually#2-초기화)에서 사용한 `genesis-operator1.json` 파일을 사용한다.

### 2. 사용자 노드 실행

[사용자 노드 설정 - 1. 초기화](how-to-open-private-testnet-manually#1-초기화) 과정을 반드시 진행해야 한다. 초기화와 동일한 `datadir`을 사용한다.

만약, 챌린저 역할도 수행하고자 한다면 `--rootchain.challenger 0x0...` 을 입력인자로 추가해 실행한다.

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

> `syncmode`는 `full` 또는 `archive`를 입력해야 오퍼레이터 노드와 동기화 된다.

<!--### 설정 완료 후 구조도![자식 체인 설정 완료 후 개요도](assets/guides_private_testnet_manually.png)-->
