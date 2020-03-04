---
id: how-to-open-private-testnet-manually
title: Setup Childchain in Private Testnet
sidebar_label: Setup Childchain
---

자식 체인을 설정하려면 로컬 환경에서 루트체인이 실행되고 있는 환경에서 진행해야 하므로, <br> 루트체인이 실행중이지 않고 있다면 [루트체인 설정](how-to-open-private-testnet-rootchain#%EB%B6%80%EB%AA%A8-%EC%B2%B4%EC%9D%B8-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0)를 먼저 진행한다.

## 오퍼레이터 노드 설정하기
[루트체인 설정](how-to-open-private-testnet-rootchain#%EB%B6%80%EB%AA%A8-%EC%B2%B4%EC%9D%B8-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0) 수행하였음을 전재로 한다.

만약, 루트체인으로 ganache 테스트체인을 사용하고 싶은경우 ganache에서 생성된 계정을 오퍼레이터와 챌린저로 사용하여야 한다.

루트체인에 오퍼레이터 계정 잔고가 충분해야 한다.

### 1. 저장소 다운로드 및 컴파일하기

소스파일을 다운로드 받은 후 실행가능한 파일을 컴파일 한다.

```bash
$ git clone https://github.com/onther-tech/plasma-evm
$ cd plasma-evm
plasma-evm$ make geth
```

### 2. 루트체인 컨트렉트 배포하기

`deploy` 커맨드의 입력인자는 <출력할 genesis 파일 이름>, <체인아이디(CHAINID)>, <프리 에셋(PRE-ASSET)>, <에폭(EPOCH)> 이다.

`CHAINID` : 오퍼레이터가 임의로 정할 수 있는 체인 고유의 숫자다.

`PRE-ASSET` : `genesis` 파일에 미리 PETH를 부여할지에 대한 여부를 나타낸다. `true`인 경우 자식체인내 오퍼레이터 계정에 PETH 잔고가 생성된다.

`EPOCH` : 루트체인에 커밋할 자식체인의 블록갯수를 나타낸다. 예를 들어 이 값을 4096으로 설정할 경우 자식체인은 4096블록 마다 루트체인에 1회 트랜잭션을 전송한다.

```sh
#!/usr/bin/env bash

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
make geth && build/bin/geth \
    --rootchain.url "ws://$ROOTCHAIN_IP:8546" \
    --operator.key $OPERATOR_KEY \
    --datadir $DATADIR \
    deploy "./genesis.json" 16 true 4096

# deploy params : chainID, isInitialAsset, Epochlength
# you can checkout "$geth deploy --help" for more information
```

### 3. 초기화 하기

`deploy` 커맨드를 통해 생성한 `genesis.json` 파일은 `plasma-evm` 디렉토리 내에 위치하고 있으므로 특별히 `genesis.json` 파일경로를 지정할 필요가 없다.

```bash
plasama-evm$ geth init
```

### 4. 오퍼레이터 계정 키스토어 생성하기

오퍼레이터 노드는 루트체인에 자식체인 블록 정보를 트랜잭션을 통해 전달(=커밋)해야 하므로, 초기화한 `datadir`내에 키스토어(keystore)파일을 생성한다.

`Plasma-evm`의 `geth account` 커맨드는 비밀키(private key)만으로 키스토어파일을 생성할 수 있다.

```bash
# Generate Operator Keyfile
plasma-evm$ build/bin/geth account importKey b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 --datadir ./chaindata
INFO [08-27|16:14:38.878] Bumping default cache on mainnet         provided=1024 updated=4096
INFO [08-27|16:14:38.879] Maximum peer count                       ETH=50 LES=0 total=50
INFO [08-27|16:14:38.905] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
Your new account is locked with a password. Please give a password. Do not forget this password.
Passphrase:
Repeat passphrase:
```

### 5. 오퍼레이터 노드 실행하기

만약, 오퍼레이터 키스토어 파일에 암호가 걸려 있는경우 `signer.pass` 파일 내부에 패스워드를 기록해주어야 한다. 암호가 없는 경우 `signer.pass` 는 아무런 내용이 없는 빈파일을 생성한다.

아래 커맨드를 통해서 `signer.pass` 파일을 생성해 준다(이때 `"` 는 제외 한다).

```bash
plasma-evm$ echo > "<Passphrase for operator keystore file>" > signer.pass
```

오퍼레이터 노드 실행시 앞으로 설정해 줄 사용자노드(Usernode)의 `enode` 주소를 먼저 설정해 주도록 한다. (아래 `bootnodes` 플래그에 사용되는 주소는 [사용자 노드 생성하기](how-to-open-private-testnet-manually#%EC%82%AC%EC%9A%A9%EC%9E%90-%EB%85%B8%EB%93%9C-%EC%84%A4%EC%A0%95%ED%95%98%EA%B8%B0) 의 [`bootkey` 생성하기](how-to-open-private-testnet-manually#3-bootkey-%EC%83%9D%EC%84%B1%ED%95%98%EA%B8%B0) 를 통해 생성되는 주소와 같다.)
```bash
plasma-evm$ build/bin/geth \
    --datadir ./chaindata \
    --syncmode="full" \
    --networkid 16 \
    --rootchain.url ws://localhost:8546 \
    --operator 0x71562b71999873DB5b286dF957af199Ec94617F7 \
    --port 30306 \
    --nat extip:::1 \
    --maxpeers 50 \
    --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
    --password signer.pass \
    --bootnodes "enode://4966a7e4621c2c0b1b1b3295b4a35ccc4224ba1d529bf5aa2323e4650f6075bd5eb6618372b2579965819347307f1f97315ce91b09ca342d60c2e98ad88db9f3@127.0.0.1:30307"
    --mine \
    --miner.gastarget 7500000 \
    --miner.gaslimit 10000000
```

## 사용자 노드 설정하기

사용자 노드는 챌린저 계정을 플래그에 추가 하는 경우 챌린저 역할을 수행하는 노드가 될 수 있다. <br>챌린저 계정 없이도 사용자 노드 실행이 가능하므로, 이 가이드에서는 챌린저 추가 없이 실행한다.

> 챌린저 계정은 최소한 요구되는 이더리움 잔고(기본값 0.5 ETH) 이상 되어야 설정 가능하며, 루트체인에 챌린저 계정 잔고 확인시 기준 잔고보다 낮은경우 사용자 노드 실행이 되지 않는다.

### 1. 초기화 하기

`--rootchain.url` 플래그 입력 인자로 루트체인 컨트렉트가 배포된 루트체인 접속 주소(URL)를 입력한다.<br>
여기서는 [부모 체인 설정하기](how-to-open-private-testnet-rootchain#2-%EC%8B%A4%ED%96%89-%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%ED%99%95%EC%9D%B8) 를 통해 실행하고 있는 루트체인의 접속 주소를 사용한다.

```bash
plasma-evm$ build/bin/geth init \
            --datadir ./chaindata \
            --rootchain.url ws://localhost:8546 \
            genesis.json
```
> 오퍼레이터 [노드 초기화시](how-to-open-private-testnet-manually#2-%EC%B4%88%EA%B8%B0%ED%99%94-%ED%95%98%EA%B8%B0) 사용한 `genesis.json` 파일을 사용한다.

### 2. `bootkey` 생성하기

오퍼레이터 노드에서 실행시 미리 지정한 enode 주소를 생성할 수 있도록 `boot.key`파일을 미리 생성해 둔다.

```bash
plasma-evm$ echo "e854e2f029be6364f0f961bd7571fd4431f99355b51ab79d23c56506f5f1a7c3" > boot.key
```

### 3. 사용자 노드 실행하기

초기화 과정에서 반드시 실행해야 하며, 동일한 datadir를 사용해야 한다.

만약, 챌린저 역할도 수행하고자 한다면 `--rootchain.challenger 0x0...` 을 입력인자로 추가해 실행한다.<br>
(아래 커맨드 예시는 챌린저 역할을 수행하지 않는 경우를 나타낸다.)

```bash
plasma-evm$ build/bin/geth \
    --datadir ./chaindata \
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

> `syncmode`는 `full` 또는 `archive`를 입력해야 오퍼레이터 노드와 싱크가 된다.

### 설정 완료 후 구조도

![자식 체인 설정 완료 후 개요도](assets/guides_private_testnet_manually.png)
