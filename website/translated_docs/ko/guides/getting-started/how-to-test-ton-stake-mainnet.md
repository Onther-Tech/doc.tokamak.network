---
id: mainnet-staking
title: How to stake TON in Mainnet
sidebar_label: Mainnet staking
---

이 문서는 오퍼레이터가 TON을 스테이크 하는 방법에대해 다룬다.

> 일반 사용자의 경우 [dashboard](https://dashboard.tokamak.network)를 사용한다.

## 오퍼레이터 준비

### TON 컨트랙트 정보

`TON` 토큰 및 스테이크 매니저 컨트랙트 주소는 다음과 같다.

**컨트렉트 정보**

    "TON": "0xe3a87a9343d262f5f11280058ae807b45aa34669",
    "WTON": "0x57b7D965082CB6015a89AE1E7df18231A39e1a30",
    "RootChainRegistry": "0x5C7F8e605dC7B276a501A27EBc1de756c206c333",
    "DepositManager": "0xB993793d7a3641b8b7A099D0D2D7ae8A36F849FC",
    "SeigManager": "0x53B9d6c605B27FFDFea787566f21F776c0197805",
    "PowerTON": "0x21CDEDEF641Ea65F5BF7e0A0031b20647BD9d0eD"

해당 정보는 [Tokamak Network - Dashboard api](https://dashboard-api.tokamak.network/managers)를 통해서 확인 할 수 있다.

### 루트체인 접속 주소

오퍼레이터 노드를 실행하기 위해 루트체인 접속 주소가 필요하다. 여러 방법이 있지만, `Infura`를 통해 제공되는 노드 주소를 사용하는것이 간편하다. `Infura`를 통해 접속 가능한 주소를 확보한다.

만약, `Infura` 계정이 없다면 [infura.io](https://infura.io/) 회원가입을 통해 접속 주소(URL)를 얻을 수 있다.

사이트 가입이 완료된 경우, `Dashboard`의 `"CREATE NEW PROJECT"` 를 클릭하여 프로젝트를 생성한다.

그 다음, 아래와 같이 `PROJECT ID`가 조합된 `ENDPOINTS` 주소를 사용한다.

`wss://mainnet.infura.io/ws/v3/[PROJECT ID]`

![Infura node ID](assets/guides_create-infura-node.png)
예) `wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194`

만약 자신이 운영하고 있는 이더리움 노드가 있다면, 해당 노드의 접속 주소를 `Infura` 주소 대신 사용할 수 있다.

### `ChainID` 확인

토카막 네트워크는 여러 오퍼레이터가 각자 자신의 자식체인을 운영하는 구조를 가지고 있다. 이때, 루트체인 컨트랙트 배포시 사용되는 `ChainID` 가 중복 될 수 있다.

이는 [`Replay Attack`]() 이 가능한 요소이다. 예를들어 오퍼레이터A 와 오퍼레이터B 모두 동일한 `ChainID`를 사용하여 루트체인을 배포 하였다면, 오퍼레이터A 자식체인에서 처리된 트랜잭션을 누구나 가져와 오퍼레이터B의 자식체인에서도 사용 할 수 있다.

이 `Replay Attack`을 방지하기 위해서는 오퍼레이터 서로가 겹치지 않은 고유의 `ChainID`를 사용해야 한다.

오퍼레이터는 루트체인 컨트랙트를 배포하기 전에 반드시 아래 링크에서 자신이 사용하고자 하는 `ChainID` 가 이미 등록되어 있는지 확인해야 한다.

```baash
$ curl -g https://dashboard-api.tokamak.network/chainids
[16, 125]
```

현재까지 등록된 자식체인들의 ID가 `List` 형태로 출력된다.

## 오퍼레이터 자식체인 설정

### Plasma-evm 실행 환경 구성

Plasma-evm 소스코드 컴파일 환경 구성은 [루트체인 설정 - 로컬 환경 설정](how-to-open-private-testnet-rootchain#로컬-환경-설정) 을 참고한다.

[프라이빗 테스트넷 시작]() 과정을 통해 `plasma-evm` 의 `geth` 실행이 가능하다면 다음 단계로 넘어가도 된다.

먼저, 소스코드를 다운로드 받는다.

```bash
$ git clone -b v0.0.0-rc6.0 https://github.com/onther-tech/plasma-evm
```

> 이 문서는 master 브랜치의 [v0.0.0-rc6.0 : 16e9e0310fa180a360a870dac88e1c098489826b](https://github.com/Onther-Tech/plasma-evm/tree/16e9e0310fa180a360a870dac88e1c098489826b) 커밋을 기준으로 작성되었다.


소스코드 다운로드 후, `plasma-evm` 디렉토리로 이동하여 아래 `make` 명령어로 실행  가능한 `geth` 파일을 생성한다.

```bash
$ cd plasma-evm
plasma-evm $ make geth
```

해당 과정이 정상적으로 종료되면, `plasma-evm/build/bin` 위치에 `geth`파일이 생성된다.

### 오퍼레이터 계정 생성

먼저, 아래 `geth account new` 명령어를 통해 오퍼레이터 계정을 생성한다.

오퍼레이터 노드에서 사용할 키파일 암호를 `Password` 에 입력한다.

```bash
plasma-evm $ build/bin/geth account new --datadir ./operator
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
Your new account is locked with a password. Please give a password. Do not forget this password.
Password:
Repeat password:

Your new key was generated

Public address of the key:   0x57ab89f4eabdffce316809d790d5c93a49908510
Path of the secret key file: operator/keystore/UTC--2020-01-01T00-00-00.000000000Z--57ab89f4eabdffce316809d790d5c93a49908510

- You can share your public address with anyone. Others need it to interact with you.
- You must NEVER share the secret key with anyone! The key controls access to your funds!
- You must BACKUP your key file! Without the key, it's impossible to access account funds!
- You must REMEMBER your password! Without the password, it's impossible to decrypt the key!
```

`--datadir` 입력한 경로인 `plasma-evm/operator` 에 해당 키파일이 생성된다.

위에서 입력한 암호를 담고 있는 파일을 생성해야 한다. 바로 위 계정생성에 사용한 암호를 `<password>` 대신 사용하여 아래 명령어를 입력한다.

```bash
plasma-evm $ echo "<password>" > pwd.pass
```

해당 키파일 이름은 `geth`의 `--password` 플래그의 인자로 `pwd.pass` 사용된다.

### 루트체인 컨트랙트 배포

`plasma-evm/operator` 폴더 안에 키파일이 생성된다. 이 키파일은 오퍼레이터 노드 운영에 있어 중요한 파일이므로 보안에 유의하여야 한다.

다음은 루트체인 컨트랙트 배포 커맨드인 `deploy`에 대한 설명이다.

`deploy` 커맨드의 입력인자는 <출력할 genesis 파일 이름>, <체인아이디(CHAINID)>, <프리 에셋(PRE-ASSET)>, <에폭(EPOCH)>.

`CHAINID` : 오퍼레이터가 임의로 정할 수 있는 체인 고유의 숫자.

`PRE-ASSET` : `genesis` 파일에 미리 PETH를 부여할지에 대한 여부. `true` 경우 자식체인 계정들에 PETH 잔고가 생성됨.

`EPOCH` : 루트체인에 커밋할 자식체인의 블록갯수.
예) `2` 설정하는 경우, 자식체인 2개 블록 마다 루트체인에 1회 커밋 트랜잭션을 전송.

아래, `deploy` 명령어를 사용하여 루트체인 컨트랙트를 루트체인에 배포한다.

```bash
plasma-evm $ build/bin/geth --nousb deploy genesis.json 1010 true 2 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터가 배포한 `rootchain` 컨트랙트 정보가 포함되어 있는 `genesis.json` 파일을 통해 플라즈마 체인을 초기화 한다.

```bash
plasma-evm $ build/bin/geth --nousb init genesis.json \
            --datadir ./operator  \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194
```

### 스테이크 주소 설정

이더리움 메인넷에 배포되어 있는 컨트렉트 정보를 `json` 파일로 저장한다.

```bash
curl -o managers.json 'https://dashboard.tokamak.network/managers'
```

아래 `manage-staking`의 하위 명령어인 `setManagers` 사용하여 오퍼레이터의 자식체인 운영에 필요한 스테이크 컨트랙트 주소를 설정한다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking setManagers managers.json  \
            --datadir ./operator
```

`manage-staking` 의 하위 명령어인 `getManagers` 를 실행하여 오퍼레이터의 체인데이터에 스테이크 컨트랙트 정보가 등록되어 있는지 확인한다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking getManagers --datadir ./operator
```

### 루트체인 등록

오퍼레이터가 설정한 자식체인의 루트체인 주소를 스테이크 매니저 컨트랙트에 등록하여 스테이크 시뇨리지를 받을 수 있게 한다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking register \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터의 루트체인 컨트랙트가 정상적으로 등록되면 아래와 같이 출력된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Registered SeigManager to RootChain      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=a63891…0a9d9a
INFO [01-01|00:00:00.000] Registered RootChain to SeigManager      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=f7017e…d8fa00
```

메니저 컨트렉트에 등록된 후, `dashboard` 에도 등록을 해주어야 일반 사용자로 부터 위임을 받을 수 있다.

아래 명령어를 통해 `dashboard.tokamak.network` API 서버로 등록한 `rootchain` 주소 및 정보를 전송한다.

입력해야 하는 정보는 다음과 같다.

- `GENESIS` : 오퍼레이터가 배포한 `rootchain` 컨트랙트 주소 및 고유 `chainId`가 포함되어 있는 `genesis` 파일.
- `NAME` : `dashboard`에 표기될 오퍼레이터 이름.
- `WEBSITE` : 오퍼레이터 공식 웹페이지 주소. 없다면 "" 사용.
- `DESCRIPTION` : 오퍼레이터 소개란. 없다면 "" 사용.

위 정보들은 [`dashboard.tokamak.network`](https://dashboard.tokamak.network) 에 등록된다.

각 환경변수를 등록한다. `GENESIS` 환경변수에 `genesis.json` 파일 전체를 입력해야 하므로, 해당 파일이 위치한 `plasma-evm` 에서 아래 명령어를 실행한다.

```bash
plasma-evm $ GENESIS="$(cat genesis.json)"
plasma-evm $ NAME="Operator"
plasma-evm $ WEBSITE="https://tokamak.network"
plasma-evm $ DESCRIPTION="This is test operator"
```

아래 명령어를 실행하여 등록한 환경 변수들을 `json` 타입 데이터로 변환하고, `curl`을 사용하여 변환된 데이터를 토카막 네트워크 `dashboard` API로 전송한다.

```bash
plasma-evm $ ROOTCHAIN_REGISTRY=$(jq -n \
                   --arg genesis $GENESIS \
                   --arg name "$NAME" \
                   --arg website "$WEBSITE" \
                   --arg description "$DESCRIPTION" \
                   '{genesis: $genesis, name: $name, website: $website, description: $description}')

plasma-evm $ curl -X POST \
              -H "Content-Type: application/json" \
              --data "$ROOTCHAIN_REGISTRY" \
              "https://dashboard-api.tokamak.network/operators"
```

이미 `ChainId`가 등록되어 있는 경우 아래와 같은 응답메시지가 수신된다.

`{"error":"Already registered","description":"Something went wrong. Please try again or contact support."}`

### 커미션 설정

오퍼레이터가 아닌 일반 사용자들로부터 `TON`을 위임받을 수 있다. 이때, 오퍼레이터는 위임 받은 `TON` 토큰에서 발생한 시뇨리지에 대한 커미션, 즉 수수료를 정할 수 있다.

초기 루트체인 컨트랙트를 등록하거나, 오퍼레이터가 자식체인을 운영하는 도중에서도 변경 가능하다.

커미션 비율은 최소 0.01 부터 1.0 까지, 100분위로 설정 할 수 있다. 예를 들어 아래와 같이 커미션 비율을 `0.01`로 설정한 경우 위임으로 인해 발생한 시뇨리지의 1% 를 오퍼레이터 계정에 지급된다. 커미션 비율은 0 또는 최소 0.0000000000000000000000001(=1e25) 부터 1.0 까지 설정 가능하다.

아래 `setCommissionRate` 명령어를 통해 오퍼레이터의 커미션을 설정할 수 있다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking setCommissionRate 0.01 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

### TON 잔고 확인

아래 명령어를 통해, 오퍼레이터의 `TON` 잔고를 확인한다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194
```

아래 예시와 같이, 오퍼레이터 계정이 보유하고 있는 잔고를 `TON Balance` 란에서 확인할 수 있다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.operator/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Home/ubuntu/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] TON Balance                              amount="10000.0 TON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] WON Balance                              amount="0 WTON"      depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Deposit                                  amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Total Stake                              amount="500.0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Comitted Stake                           amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```

위 예시는 `0x3cD9F7...` 계정에 10,000 TON 을 보유하고 있다.

### TON 스테이크

`TON`을 스테이크 하려면 `WTON`으로 변환한 후, `WTON`을 `depositManager` 컨트랙트에 `stake` 해주어야 한다.

실질적으로 오퍼레이터가 플라즈마 체인 운영을 위해 depositManager에 스테이크 되는 토큰은 WTON 이다.

아래 명령어를 사용하여, 1,000 TON을 WTON으로 변환한다.

> 이때 하위 명령어인 `swapFromTON` 의 입력인자로 소수점을 사용하여야 1e9(1,000,000,000 wei) 단위가 적용된다.

```bash
plasma-evm $ build/bin/geth --nousb staking swapFromTON 1000.0 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

`staking`의 하위 명령어인 `stake` 를 사용하여, 변환된 1,000 WTON 중 500 WTON을 스테이크 한다.

```bash
plasma-evm $ build/bin/geth --nousb staking stakeWTON 500.0 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

또는, 위 두 과정을 `stakeTON` 명령어로 한번에 처리 할 수 있다.

```bash
plasma-evm $ build/bin/geth --nousb staking stakeTON 500.0 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

## TON 커밋 보상 확인 및 인출

오퍼레이터의 클라이언트가 루트체인에서 설정된 `Epoch` 주기로 루트체인에 Tx 커밋을 제출한다.

루트체인 컨트랙트에 커밋 트랜잭션이 제출되면, 매니저 컨트랙트에서 모든 오퍼레이터들의 스테이크 된 자산을 고려하여 시뇨리지가 계산된다.

### 자식체인 실행

아래 명령어를 통해 오퍼레이터 노드를 실행 한다.

네트워크 외부에서 접근 하지 못하도록 보안적으로 닫혀 있어야 안전하다. 오직 `usernode`를 설정하여 실제 사용자의 트랜잭션을 받도록 구성해야 한다.

`usernode` 설정에 대한 부분은 [자식체인 설정 - 사용자 노드 설정](how-to-open-private-testnet-manually#사용자-노드-설정) 을 참고한다.

```bash
plasma-evm $ build/bin/geth --nousb \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --operator.password pwd.pass
```

새로운 터미널에서 오퍼레이터의 콘솔에 접속한다.

```bash
plasma-evm $ build/bin/geth attach --datadir ./operator
```

`geth attach` 를 실행하면, `geth`의 javasciprt console에 접속된다.

console에 `eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})` 입력하여 임의의 Tx를 생성하여 블록을 진행시킨다.

```javascript
> web3.eth.accounts
["0x57ab89f4eabdffce316809d790d5c93a49908510"]
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x0a65e80eb105c448ffa1ca50430dc1d3f4b0da14ad1d4793a43ed36b6df0959c"
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x81130ae471f536c04cc6b9901962dd5a15bb72f3924422ea051a3b0494c0fade"
```

위와 같이 오퍼레이터 이 자기 자신에게 0 ETH를 전송하는 더미 트랜잭션을 2회 이상 입력한다.

> 오퍼레이터가 루트체인 컨트랙트 배포시 사용한 Epoch 숫자보다 많은 블록을 생성해야 루트체인에 Tx를 커밋하게 된다.

이 예시에서 적용된 `Epoch` 은 `2` 이다.

`exit` 명령어로 `geth` console 접속을 종료 한다.

### 시뇨리지 확인

`staking balances` 명령어를 사용하여, 오퍼레이터가 받은 TON의 시뇨리지 발행을 확인한다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=./operator/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] WON Balance                              amount="500.0 WTON" depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Deposit                                  amount="500.0 WTON" rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON"     rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Total Stake                              amount="1100.0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="1100.0 WTON"  rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="100.0 WTON"    rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Comitted Stake                           amount="500.0 WTON"  rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
```

위 결과는 예시이며, 실제 스테이크된 시간에 따라 시뇨리지 `WTON`이 계산되기 때문에 소수점자리까지 나타난다.

[자식체인 실행](#자식체인-실행) 에서 오퍼레이터 자식체인만 루트체인에 커밋되 었으므로, 다른 오퍼레이터들의 스테이크 보상은 `Uncommited` 상태에 TON 잔고가 쌓이게 된다.

### 보상 인출

발생한 시뇨리지는 `WTON` 형태로 추가 발행되어 스테이크 되어 있는 모든 오퍼레이터 계정에 쌓인다.

오퍼레이터가 시뇨리지로 받은 `WTON`을 인출 해보고자 한다.

먼저 인출 요청은 `staking`의 하위 명령어인 `requestWithdrawal` 을 사용한다. 510 WTON 인출을 위해 아래와 같이 입력한다.

```bash
plasma-evm $ build/bin/geth --nousb staking requestWithdrawal 510.0 \
              --datadir ./operator \
              --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
              --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
              --password pwd.pass \
              --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터의 WTON 잔고가 510 이상 있다면 출금 요청이 정상적으로 처리된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Withdrawal requested                     rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 amount="510.0 WTON" tx=570061…
b07f4d
```

다시 오퍼레이터의 잔고를 확인해보면 `Pending withdrawal ..` 에 요청한 510.0 WTON 가 나타난다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=operator/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] WON Balance                              amount="500.0 WTON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Deposit                                  amount="500.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=1
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="510.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON"                                rootchain=0x17FB80e2E16b02faC9369334
24305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Comitted Stake                           amount="10 WTON"                                rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```

최종 인출을 위해 `processWithdrawal` 명령어를 사용한다.

`requestWithdrawal` 이 포함된 블록

```bash
plasma-evm $ build/bin/geth --nousb staking processWithdrawal \
              --datadir ./operator \
              --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
              --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
              --password pwd.pass \
              --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

`processWithDrawal` 이 정상적으로 처리된 경우 잔고 확인 해보면 510 증가된 1,010 WTON 확인 가능하다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194 \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=./operator/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] WON Balance                              amount="1010.0 WTON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Deposit                                  amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON"                                rootchain=0x17FB80e2E16b02faC9369334
24305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Comitted Stake                           amount="0 WTON"                                rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```
