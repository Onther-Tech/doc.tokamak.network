---
id: how-to-open-private-testnet-rootchain
title: Setup Rootchain in Private Testnet
sidebar_label: Setup Rootchain
---

## 들어가는말

이 과정은 프라이빗 블록체인을 루트체인(rootchain)으로 사용하는 테스트용 레이어2 블록체인의 구축 절차를 담고있다. 루트체인(rootchain)이란 플라즈마 기반의 레이어2 블록체인을 사용하는 토카막 네트워크의 베이스체인(레이어1 체인)을 뜻한다. 자세한 개념은 [플라즈마란 무엇인가](https://docs.tokamak.network/docs/ko/learn/basic/tokamak-network#플라즈마란) 참조.

## 로컬 환경 설정

운영체제는 Ubuntu 18.04 환경을 기준으로 한다.

golang이 구성되어 있지 않은 경우, 아래 과정을 통하여 plasam-evm이 컴파일 가능한 환경을 만든다.

### 시스템 업데이트 및 필수 패키지 설치

아래 명령어로 컴파일 가능한 환경을 만든다.

```shell
~$ sudo apt-get update && sudo apt-get install tar wget make git build-essential -y
```

### golang 환경 설정

다음을 순차적으로 실행하여, go 실행파일을 `/usr/local/`경로 아래 위치시킨다.

```shell
~$ wget https://dl.google.com/go/go1.13.4.linux-amd64.tar.gz
~$ tar -xvf go1.13.4.linux-amd64.tar.gz
~$ sudo mv go /usr/local
```

GOPATH로 사용할 디렉토리를 생성하고, 환경변수를 잡는다.

```bash
~$ export GOROOT=/usr/local/go
~$ mkdir -p $HOME/plasma
~$ export GOPATH=$HOME/plasma
~$ export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
```

부팅시에 위의 환경변수가 자동으로 설정되도록 하려면, `~/.profile` 파일에 환경변수를 등록 해두는 것이 좋다.

```sh
# ~/.profile
....

export GOROOT=/usr/local/go
export GOPATH=$HOME/plasma
export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
```

## 루트 체인 설정

테스트용 루트체인의 경우 실행 스크립트가 이미 내장되어 있는 `onther-tech/go-ethereum`를 사용하는 것이 편리하다.

루트체인(rootchain)에서 사용할 오퍼레이터(Operator)와 챌린저(Challenger)로 사용되는 계정에는 테스트용 이더 잔고(Balance)가 충분해야 한다. 특히, <U>챌린저 계정에는 최소 0.5 ETH가</U> 있어야 오퍼레이터 노드가 정상적으로 실행된다.

만약 테스트용 루트체인의 오퍼레이터 계정에 ETH 잔고가 부족해질 경우 경우, 오퍼레이터가 루트체인에 트랜잭션을 전송 할 수 없으므로 자식체인의 블록 생성이 멈추게 된다.

### 루트체인 소스코드 다운로드

루트체인으로 사용할 `go-ethereum` 소스코드를 다운로드 받는다.

```bash
~$ git clone https://github.com/Onther-Tech/go-ethereum
~$ cd go-ethereum
```

이 문서는 master 브랜치의 [4bf7d7e315e19a2b31683935e866ae952b32ab7d](https://github.com/Onther-Tech/go-ethereum/tree/4bf7d7e315e19a2b31683935e866ae952b32ab7d) 커밋을 기준으로 작성되었다.

아래 명령어를 통해 소스코드 커밋을 맞춘다.

```bash
go-ethereum $ git reset 4f497552092e2d061c8636b58737bc462ba4a3d
```

### 루트체인 실행 스크립트 확인

아래는 `onther-tech/go-ethereum`에 위치하고 있는 `run.rootchain.sh`이다.

```bash
# go-ethereum/run.rootchain.sh
ADDR0="0x71562b71999873DB5b286dF957af199Ec94617F7";
ADDR1="0x3cd9f729c8d882b851f8c70fb36d22b391a288cd";
ADDR2="0x57ab89f4eabdffce316809d790d5c93a49908510";
ADDR3="0x6c278df36922fea54cf6f65f725267e271f60dd9";

KEY0="b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291";
KEY1="bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5";
KEY2="067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc";
KEY3="ae03e057a5b117295db86079ba4c8505df6074cdc54eec62f2050e677e5d4e66";

make geth && build/bin/geth \
  --dev \
  --dev.period 1 \
  --dev.faucetkey "$KEY0,$KEY1,$KEY2,$KEY3" \
  --rpc \
  --rpcport 8545 \
  --rpcapi eth,debug,net \
  --rpcaddr 0.0.0.0 \
  --ws \
  --wsport 8546 \
  --wsaddr 0.0.0.0 \
  --wsapi eth,debug,net \
  --miner.gastarget 7500000 \
  --miner.gasprice "10"
```

위 스크립트로 실행되는 루트체인의 계정들은 다음과 같은 역할에 사용된다.

- ADDR0 : TON 스테이킹 매니저 계정. TON 스테이킹 관련 컨트렉트들을 배포하고 설정.
- ADDR1 : 오퍼레이터1 계정. TON 스테이킹에 참여하면서 자식체인1을 운영.
- ADDR2 : 오퍼레이터2 계정. TON 스테이킹에 참여하면서 자식체인2를 운영.
- ADDR3 : 챌린저 계정. 자식체인 데이터의 유효성을 검증하는 챌린저.

### 루트체인 실행

`go-ethereum`폴더 내에 `run.rootchain.sh` 스크립트를 실행하여 로컬 네트워크에서 동작하는 루트체인을 구동시킨다.

```bash
go-ethereum $ bash run.rootchain.sh
```

## TON 스테이크 컨트랙트 설정

앞서 설정한 프라이빗 테스트 루트체인위에 TON 스테이킹을 테스트 할 수 있는 환경을 구성한다.

이 파트의 대부분은 `plasma-evm`의 `staking`과 `manage-staking`명령어 사용에 관한 것이다. 이 명령어들은 오퍼레이터(Operator)가 운영하는 토카막 플라즈마 노드를 구축하는데 매우 유용하게 쓰일 수 있다.

앞으로 이어질 테스트는 ADDR0가 매니저 컨트랙트를 배포하고, 배포된 스테이크 컨트랙트에 ADDR1과 ADDR2가 각각 운영하는 두 오퍼레이터가 노드를 연결할 것이다.

각 계정의 역할을 정리하면 다음과 같다.

- 매니저(ADDR0) : 테스트로 사용될 TON 토큰 및 스테이킹에 관련한 컨트랙트를 배포하고 관리.
- 오퍼레이터(ADDR1, ADDR2) : 자신의 플라즈마 체인을 운영하면서 TON 토큰을 스테이킹, 언스테이킹.

### 저장소 다운로드 및 컴파일

이 단계는 동작중인 루트체인 노드에 스테이킹 테스트를 위한 컨트렉트를 배포한다.

우선, 아래 명령어를 통해 `plasma-evm` 저장소를 다운로드 한다.

```bash
go-ethereum $ cd ~
$ git clone -b v0.0.0-rc6.0 https://github.com/onther-tech/plasma-evm
$ cd plasma-evm
plasma-evm $
```

이 문서는 master 브랜치의 [v0.0.0-rc6.0 : 16e9e0310fa180a360a870dac88e1c098489826b](https://github.com/Onther-Tech/plasma-evm/tree/16e9e0310fa180a360a870dac88e1c098489826b) 커밋을 기준으로 진행된다.

`Plasma-evm` 의 실행파일인 `geth` 생성을 위해 아래 명령어를 입력한다.

```bash
plasma-evm $ make geth
```

컴파일을 정상적으로 마치면, `plasma-evm/build/bin`위치에 `geth`실행 파일이 생성된다.

### 매니저와 오퍼레이터 계정 입력

아래의 명령은 plasma-evm노드가 사용할 데이터 디렉토리(datadir)에 매니저 계정(ADDR0)을 생성시킨다.

```bash
plasma-evm $ build/bin/geth --nousb account importKey b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 \
            --datadir ./.pls.staking/manager
```

테스트의 편의를 위해 빈 패스워드를 지정한다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
Your new account is locked with a password. Please give a password. Do not forget this password.
Password:
Repeat password:
Address: {71562b71999873db5b286df957af199ec94617f7}
```

아래 명령은, 두 오퍼레이터 계정(ADDR1, ADDR2)을 생성한다.

```bash
plasma-evm $ build/bin/geth --nousb account importKey bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5 \
            --datadir ./.pls.staking/operator1
```

```bash
plasma-evm $ build/bin/geth --nousb account importKey 067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc \
            --datadir ./.pls.staking/operator2
```

아래 명령을 사용하여 위 계정들의 암호를 저장하고 있는 `pwd.pass` 파일을 생성한다. 앞선 과정에서 패스워드를 입력하지 않았기 때문에 공백("")을 pwd.pass파일에 넣는다.

```bash
plasma-evm $ echo "" > pwd.pass
```

### 스테이크 매니저 컨트랙트 배포

`deployManagers`는 `manage-staking`의 하위 명령어로 매니저가 TON 스테이킹에 관한 컨트랙트를 배포 및 관리하기 위해 만들어졌다.

`deployManagers`은 입력 파라미터로 `withdrawalDelay`와 `seigPerBlock` 2개를 받는다.

각 입력 파라미터에 대한 설명은 다음과 같다.

- `withdrawalDelay` : 단위는 루트체인의 블록 갯수다. 스테이킹된 상태(staked status)의 WTON이 출금 요청(`requestWithdrawal` 트랜잭션)을 받게 되면 정해진 `withdrawalDelay`블록 만큼 지연된 이후 언-스테이크 상태(unstaked status)로 바뀐다. 그리고 언-스테이크 상태(unstaked status)가 된 WTON만이 출금되어 실제 TON으로 스왑될 수 있다. 예를 들어 현재 블록 높이가 100이고, `withdrawalDelay`값이 `10`인 경우, 스테이킹된 WTON에 출금 요청(`requestWithdrawal`)을 했다면, 루트체인이 (100 + `withdrawalDelay` = 110)번 높이이 다다른 이후에야 해당 WTON을 출금 및 스왑할 수 있다.

- `seigPerBlock` : 루트체인 1 블록당 발생할 수 있는 시뇨리지 TON. 해당 파라미터에 의해 TON의 연 인플레이션률이 영향을 받게 된다.

```bash
plasma-evm $ make geth && build/bin/geth --nousb manage-staking deployManagers 10 1.5 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7
```

위 명령어를 입력하면 TON 스테이킹에 필요한 모든 컨트랙트가 루트체인에 배포된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Unlocking developer account              address=0x0000000000000000000000000000000000000000
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x71562b71999873DB5b286dF957af199Ec94617F7
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/manager/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] 1. deploy TON contract
INFO [01-01|00:00:00.000] TON deployed                             addr=0x3A220f351252089D385b29beca14e27F204c296A tx=0f9edc…149995
INFO [01-01|00:00:00.000] 2. deploy WTON contract
INFO [01-01|00:00:00.000] WTON deployed                            addr=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf tx=b951fc…ab742c
INFO [01-01|00:00:00.000] 3. deploy RootChainRegistry
INFO [01-01|00:00:00.000] RootChainRegistry deployed               addr=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 tx=1455b1…8db599
INFO [01-01|00:00:00.000] 4. deploy DepositManager
INFO [01-01|00:00:00.000] DepositManager deployed                  addr=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d tx=34f04d…713bee
INFO [01-01|00:00:00.000] 5. deploy SeigManager
INFO [01-01|00:00:00.000] SeigManager deployed                     addr=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=fd415d…bbcb15
INFO [01-01|00:00:00.000] 6. add WTON minter role to SeigManager
INFO [01-01|00:00:00.000] Set WTON minter to SeigManager           tx=4084ca…ec3718
INFO [01-01|00:00:00.000] 7. add TON minter role to WTON
INFO [01-01|00:00:00.000] Set TON minter to WTON                   tx=628885…e96b75
INFO [01-01|00:00:00.000] 8. Setting SeigManager address to target contracts targets="[DepositManager WTON]"
INFO [01-01|00:00:00.000] Set SeigManager to target cotnract       target=DepositManager tx=9435d0…c15c3a
INFO [01-01|00:00:00.000] Set SeigManager to target cotnract       target=WTON           tx=4f26fc…ffacb4
INFO [01-01|00:00:00.000] Staking manager contract deployed        TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
```

### PowerTON 컨트랙트 배포

PowerTON컨트랙트를 배포하면 일정 기간 이내에서 스테이킹을 하던 오퍼레이터 중 일부가 랜덤으로 선발되어, 정해진 시뇨리지 보상보다 큰 시뇨리지(미발행되어 적립된 시뇨리지)를 일시에 받을 수 있게 된다. 다음 명령어을 통해 `PowerTON` 컨트랙트를 배포할 수 있다.

- `dpeloyPowerTON` : 이어지는 파라미터는 파워톤 라운드(Round) 기간을 의미하며, 랜덤 선발은 라운드 단위로 이뤄지게 된다. 여기서는 테스트를 위해 60초로 설정한다.

`PowerTON`에 대한 자세한 내용은 [여기]()를 참고한다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking deployPowerTON 60s \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7
```

### 배포 컨트랙트 정보

앞선 과정을 통해 배포한 모든 컨트랙트의 정보는 `manage-staking`의 하위 명령인 `deployManager`를 이용해 모두 추출할 수 있다.

아래 명령어를 이용해 루트체인에 배포한 스테이킹 컨트랙트 정보들을 `manager.json` 파일로 저장하자.

```bash
plasam-evm $ build/bin/geth --nousb manage-staking getManagers manager.json --datadir ./.pls.staking/manager

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/manager/geth/stakingdata ca
che=16.00MiB handles=16
INFO [01-01|00:00:00.000] Exporting manager contracts              path=manager.json
INFO [01-01|00:00:00.000] Exported manager contracts               path=manager.json
{
  "TON": "0x3a220f351252089d385b29beca14e27f204c296a",
  "WTON": "0xdb7d6ab1f17c6b31909ae466702703daef9269cf",
  "DepositManager": "0x880ec53af800b5cd051531672ef4fc4de233bd5d",
  "RootChainRegistry": "0x537e697c7ab75a26f9ecf0ce810e3154dfcaaf44",
  "SeigManager": "0x3dc2cd8f2e345951508427872d8ac9f635fbe0ec",
  "PowerTON": "0xbcdfc870ea0c6463c6ebb2b2217a4b32b93bcfb7"
}
```

`TON`,`WTON`등 앞서 배포한 6개의 컨트랙트 주소가 `manager.json`에 저장되었다.

### PowerTON 실행

미발행 시뇨리지 분배에 대한 규칙을 가지고 있는 `PowerTON`의 라운드(Round)를 활성화하기 위해서는 `staking`의 하위 명령어인 `startPowerTON`를 실행해야 한다.

아래 명령어를 통해 `PowerTON`의 라운드 활성화 트랜잭션을 전송한다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking startPowerTON \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Unlocking developer account              address=0x0000000000000000000000000000000000000000
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x71562b71999873DB5b286dF957af199Ec94617F7
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/manager/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] PowerTON started                         PowerTON=0xBcDfc870Ea0C6463C6EBb2B2217a4b32B93BCFB7
```

## 다음으로

루트체인을 설정하는 과정은 이더리움 기반의 프라이빗 블록체인을 설정하는것과 실질적으로 같다. 다만 이 과정에서는 단순히 프라이빗 블록체인 하나를 만드는데 그치지 않고, 레이어2 토카막 플라즈마를 셋업을 위한 [다양한 스마트 컨트랙트](https://docs.tokamak.network/docs/ko/learn/advanced/plasma-evm-smart-contracts)까지 미리 배포해 두었다. 이어지는 [자식체인 설정](https://docs.tokamak.network/docs/ko/guides/getting-started/how-to-open-private-testnet-manually) 과정을 통해서 본격적으로 이렇게 환경설정을 마친 루트체인과 연결된 레이어2 토카막 플라즈마 체인을 본격적으로 구성해보자.

<!-TODO : should be update based on this contents ## 설정 완료 후 구조도 [루트 체인 설정 완료후](assets/guides_private_testnet_rootchain.png)->
