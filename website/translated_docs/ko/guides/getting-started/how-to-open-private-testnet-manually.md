---
id: how-to-open-private-testnet-manually
title: Setup Childchain in Private Testnet
sidebar_label: Setup Childchain
---

## 들어가기

[루트체인 설정하기](how-to-open-private-testnet-rootchain)를 통해서 성공적으로 루트체인을 배포했다면, 이번에는 자식체인을 구동시켜보자. 자식체인이란 루트체인에 의존하는 토카막의 레이어2 블록체인을 뜻한다. 더불어 이 과정은 [루트체인 설정하기](how-to-open-private-testnet-rootchain)를 동일한 머신에서 수행 했음을 가정하고 있다.

## 오퍼레이터 노드 설정

> 이 테스트 과정에서 이용되는 오퍼레이터(Operator)와 챌린저(Challenger) 계정은, 루트체인(rootchain)에 충분한 ETH 잔고(Balance)가 있어야 한다. 만약 여러분이 앞서 진행된 <루트체인 설정하기> 과정을 문제없이 통과했다면 이미 각 계정에 이미 충분한 ETH 잔고가 있을 것이다.

### 1. 루트체인 컨트랙트 배포

루트체인 컨트랙트(RootChain Contract)는 자식체인에서 루트체인으로 진행되는 플라즈마 블록에 관한 커밋을 관리한다.

루트체인 컨트랙트 배포를 위해서는 `deploy`를 활용한다.

`deploy` 커맨드는 입력인자로 <출력할 genesis 파일 이름>, <체인아이디(CHAINID)>, <프리 에셋(PRE-ASSET)>, <에폭(EPOCH)>을 받는다. 각 인자의 대한 설명은 다음과 같다.

- `CHAINID` : 오퍼레이터가 임의로 정할 수 있는 체인 고유의 숫자.
- `PRE-ASSET` : `genesis` 파일에 미리 PETH를 부여할지에 대한 여부. `true` 경우 자식체인 계정들에 PETH 잔고가 생성된다. 테스트 환경에서는 이 값을 true로 두는 것이 좋다.
- `EPOCH` : 루트체인에 커밋할 자식체인의 블록 단위. 예를들어 `2`로 설정하는 경우, 자식체인 2개 블록 마다 루트체인에 1회 커밋 트랜잭션을 전송한다.

토카막 플라즈마는 자식체인의 수수료 지불 수단인 `스태미나(Stamina)` 기능을 제공한다. 자세한 사항은 [스태미나](https://docs.tokamak.network/docs/ko/learn/economics/tx-fee#스태미나) 참고한다.

다음과 같은 플래그를 추가하여 스태미나 기본 설정값을 변경 할 수 있다. 스태미나 플래그를 사용하지 않는경우 기본값이 선택된다.

- `--stamina.operatoramount` : 제네시스 블록에서 오퍼레이터가 가지는 스태미나의 양. (기본값 : 1)
- `--stamina.mindeposit` : 스태미나로 전환 가능한 최소 ETH 수량. (기본값 : 0.5)
- `--stamina.recoverepochlength` : 스태미나 회복 블록 주기. (기본값 : 120960)
- `--stamina.withdrawaldelay` : ETH 출금 요청에 대한 지연 블록. (기본값 : 362880)

> `stamina.withdrawaldelay` 의 경우 `stamina.recoverepochlength` 의 최소 두배이상의 값을 사용하여야 한다.

스태미나 기능은 자식체인의 프리컴파일(Pre-compile)된 컨트랙트로 제공된다. 모든 토카막 자식체인의 스태미나 컨트렉트 주소는 `0x000000000000000000000000000000000000dead` 로 고정되어 있다.

스태미나 컨트렉트에 대한 자세한 사항은 깃허브 저장소 [stamina](https://github.com/Onther-Tech/stamina)를 참고한다.

아래 커맨드로 간단한 스크립트 파일(`deploy.operator1.sh`)을 만들어 루트체인 컨트랙트를 배포해보자.

```sh
plasma-evm$ cat > deploy.operator1.sh << "EOF"
#!/bin/bash
OPERATOR_KEY="bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5"
OPERATOR="0x5e3230019fed7ab462e3ac277e7709b9b2716b4f"

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

생성된 `deploy.operator.sh` 스크립트를 아래 명령어로 실행한다.

```sh
plasma-evm$ bash deploy.operator1.sh
```

스크립트 실행 이후 생성된 `genesis-operator1.json` 파일은 `plasma-evm` 디렉토리 내에 위치하게 된다(plasma-evm디렉토리에서 스크립트를 실행한 경우).

### 2. 초기화

오퍼레이터 노드 실행전에 체인 데이터를 초기화 작업이 선행되어야 한다.

아래 명령어를 통해 체인데이터를 초기화시킨다.

```bash
plasma-evm$ build/bin/geth --nousb init \
            --datadir .pls.staking/operator1 \
            --rootchain.url ws://localhost:8546 \
            genesis-operator1.json
```

### 3. 매니저 컨트랙트 설정

초기화를 진행한 이후, 루트체인 설정 과정에서 추출했던 매니저 컨트랙트 정보들을 자식체인 노드에 등록해준다.

아래 `manage-staking`의 하위 명령인 `setManagers` 사용하여 오퍼레이터의 플라즈마 체인 운영에 필요한 스테이크 컨트랙트 주소들을 잡아준다.

```bash
plasma-evm $ build/bin/geth --nousb \
            manage-staking setManagers manager.json  \
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

`manage-staking`의 하위 명령어인 `getManagers`를 실행하여 오퍼레이터 체인데이터에 앞서 잡아준 스테이크 컨트랙트 주소들이 등록되어 있는지 확인한다.

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

### 4. 루트체인 등록

`manage-staking`-`register` 명령을 통해 배포된 루트체인 컨트랙트가 스테이크 컨트랙트를 통해 시뇨리지를 받을 수 있도록 등록 작업을 진행한다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking register \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x5e3230019fed7ab462e3ac277e7709b9b2716b4f \
            --password pwd.pass \
            --rootchain.sender 0x5e3230019fed7ab462e3ac277e7709b9b2716b4f
```

오퍼레이터의 루트체인 컨트랙트가 스테이크 컨트랙트에 정상적으로 등록되면 아래와 같은 로그가 출력된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x5E3230019fEd7aB462e3AC277E7709B9b2716b4F
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Registered SeigManager to RootChain      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=b546d3…fe55ed
INFO [01-01|00:00:00.000] Registered RootChain to SeigManager      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=6904c9…bc07a5
```

### 5. 노드 실행

이제 아래 명령어를 통해서 오퍼레이터 노드를 실행한다(드디어 노드를 올릴 수 있게 되었다!).

```bash
plasma-evm$ build/bin/geth \
    --nousb \
    --datadir ./.pls.staking/operator1 \
    --syncmode='full' \
    --networkid 102 \
    --rootchain.url ws://127.0.0.1:8546 \
    --operator 0x5e3230019fed7ab462e3ac277e7709b9b2716b4f \
    --port 30306 \
    --nat extip:::1 \
    --maxpeers 50 \
    --unlock 0x5e3230019fed7ab462e3ac277e7709b9b2716b4f \
    --password pwd.pass \
    --nodekeyhex e854e2f029be6364f0f961bd7571fd4431f99355b51ab79d23c56506f5f1a7c3 \
    --mine \
    --miner.gastarget 7500000 \
    --miner.gaslimit 10000000
```

## 사용자 노드 설정

사용자 노드는 챌린저 계정 설정 없이 실행 가능하다.

> 챌린저 플래그에 계정을 추가 하는 경우 이 노드는 챌린저 역할을 수행하는 사용자 노드가 될 수 있다. 다만 이때 사용될 챌린저 계정은 최소한 요구되는 이더리움 잔고(기본값 0.5 ETH)를 필요로 하며, 이보다 낮은 경우 챌린저 플래그를 사용한 사용자 노드는 실행 되지 않는다.

### 1. 초기화

`--rootchain.url` 플래그 입력 인자로 루트체인 컨트랙트가 배포된 루트체인 접속 주소(URL)를 입력한다.

[루트 체인 설정](how-to-open-private-testnet-rootchain#루트-체인-설정)을 통해 실행중인 루트체인 접속 주소를 사용한다.

```bash
plasma-evm$ build/bin/geth --nousb init \
            --datadir ./.pls.staking/usernode \
            --rootchain.url ws://localhost:8546 \
            genesis-operator1.json
```

> [오퍼레이터 설정 - 2. 초기화](how-to-open-private-testnet-manually#2-초기화)에서 사용한 `genesis-operator1.json` 파일을 사용한다.

### 2. 사용자 노드 실행

[사용자 노드 설정 - 1. 초기화](how-to-open-private-testnet-manually#1-초기화) 과정을 반드시 진행해야 한다. 초기화와 동일한 `datadir`을 사용한다.

만약, 챌린저 역할도 수행하고자 한다면 `--rootchain.challenger 0x0...` 을 입력인자로 추가할 수 있다.

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

## 마무리하며

여러분은 [루트체인 설정하기](how-to-open-private-testnet-rootchain)와 이어진 자식체인 설정하기 과정을 통해 루트체인으로 사용되는 1개의 프라이빗 블록체인과, 여기에 종속된 1개의 오퍼레이터 노드, 그리고 이 오퍼레이터 노드와 연결된 1개의 유저노드를 구동시켰다. 이제 이렇게 만들어진 사용자 노드(혹은 오퍼레이터 노드)에 JSON-RPC 통신을 이용해 간단한 트랜잭션을 날려보자. 토카막 플라즈마의 경우 트랜잭션이 없다면 블록이 생기지 않는데, 이는 [토카막 네트워크의 독특한 구조](https://docs.tokamak.network/docs/ko/learn/advanced/plasma-evm-architecture)에서 기인한다. 익숙해졌다면, 간단한 [요청가능한 토큰 컨트랙트](https://docs.tokamak.network/docs/ko/learn/advanced/examples-and-best-practices#requestablesimpletoken)를 루트체인과 자식체인 모두에 배포하고 [진입과 탈출](https://docs.tokamak.network/docs/ko/learn/basic/enter-and-exit) 트랜잭션을 이용해 루트체인과 자식체인간에 교환되는 토큰을 만들어보자. 이 모든 과정은 토카막 네트워크의 강력한 상호운용성(interoperability)을 이해하는데 큰 도움을 줄 것이다.

<!--### 설정 완료 후 구조도![자식 체인 설정 완료 후 개요도](assets/guides_private_testnet_manually.png)-->
