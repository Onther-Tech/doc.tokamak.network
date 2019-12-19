---
id: how-to-open-private-testnet-rootchain
title: 프라이빗 테스트넷 루트체인 설정하기 
sidebar_label: 루트체인 설정하기
---
Ubuntu 18.04 를 기준으로 작성되었다.

## 환경 설정하기

golang이 구성되어 있지 않은 경우, 아래를 수행하여 plasam-evm 컴파일 가능한 환경을 만든다.

### 1. golang 설치하기(go 1.13.4)

    go 실행파일은 `/usr/local/` 경로 아래 위치하게 된다.
    ```bash
    ~$ wget https://dl.google.com/go/go1.13.4.linux-amd64.tar.gz
    ~$ tar -xvf go1.13.4.linux-amd64.tar.gz
    ~$ mv go /usr/local
    ```

### 3. GOPATH && GOROOT 설정하기

GOPATH로 사용할 디렉토리를 생성하고 환경변수를 설정한다.

```bash
~$ export GOROOT=/usr/local/go
~$ mkdir -p $HOME/plasma
~$ export GOPATH=$HOME/plasma
~$ export PATH=$GOPATH/bin:$GOROOT/bin:$PAT
```

재부팅시에도 해당 환경변수를 자동적으로 설정되도록 `~/.profile` 파일에 환경변수를 등록 해두는 것이 좋다.

```sh
# ~/.profile
....

export GOROOT=/usr/local/go
export GOPATH=$HOME/plasma
export PATH=$GOPATH/bin:$GOROOT/bin:$PATH
```

## 부모 체인 설정하기

이더리움 테스트 체인인 ganache 또한 루트체인으로 사용할 수 있으나, 편의상 스크립트가 설정되어 있는 `onther-tech/go-ethereum` 를 사용한다.

루트체인(rootchain)에서 사용할 오퍼레이터(Operator)와 첼린저(Challenger) 계정에 이더 잔고(Balance)가 있어야 한다. 특히, <U>첼린저 계정에 최소 0.5 ETH 이상이</U> 있어야 오퍼레이터 노드가 정상적으로 실행된다.

만약 오퍼레이터 계정의 이더 잔고가 부족한 경우, 오퍼레이터는 루트체인에 트랜젝션(Tx)를 전송 할 수 없게 되어 자식체인이 멈출 수 있으므로 주의해야 한다.

### 1. 루트체인 소스코드 받기

루트체인으로 사용할 `go-ethereum` 소스코드를 다운로드 받는다.

```bash
$ git clone github.com/Onther-Tech/go-ethereum
$ cd go-ethereum
```

### 2. 실행 스크립트 확인

  `onther-tech/go-ethereum`에 위치하고 있는 `run.rootchain.sh` 스크립트는 아래와 같다.


```bash
# plasam-evm/run.rootchain.sh
OPERATOR_PRIV_KEY="b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291"
CHALLENGER_KEY="78ae75d1cd5960d87e76a69760cb451a58928eee7890780c352186d23094a114"

ADDR0="0x5df7107c960320b90a3d7ed9a83203d1f98a811d";
ADDR1="0x3cd9f729c8d882b851f8c70fb36d22b391a288cd";
ADDR2="0x57ab89f4eabdffce316809d790d5c93a49908510";
ADDR3="0x6c278df36922fea54cf6f65f725267e271f60dd9";

KEY0="78ae75d1cd5960d87e76a69760cb451a58928eee7890780c352186d23094a115";
KEY1="bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5";
KEY2="067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc";
KEY3="ae03e057a5b117295db86079ba4c8505df6074cdc54eec62f2050e677e5d4e66";


make geth && build/bin/geth \
    --dev \
    --dev.period 1 \
    --dev.faucetkey "$OPERATOR_PRIV_KEY,$KEY0,$KEY1,$KEY2,$KEY3,$CHALLENGER_KEY" \
    --miner.gastarget 7500000 \
    --miner.gasprice "10" \
    --rpc \
    --rpcport 8545 \
    --rpcapi eth,debug,net\
    --ws \
    --wsport 8546
```

위 스크립트를 통해 생성되는 오퍼레이터와 첼린저 계정 정보는 다음과 같다.

오퍼레이터 : 0x71562b71999873DB5b286dF957af199Ec94617F7

첼린저 : 0x3616BE06D68dD22886505e9c2CaAa9EcA84564b8

### 3. 루트체인 실행하기

아래 명령어를 통해 `run.rootchain.sh` 스크립트를 실행하여 프라이빗 네트워크에서 사용되는 루트체인을 구동한다.

```bash
go-ethereum$ bash run.rootchain.sh
```


## 설정 완료 후 구조도
![루트 체인 설정 완료후](assets/guides_private_testnet_rootchain.png)