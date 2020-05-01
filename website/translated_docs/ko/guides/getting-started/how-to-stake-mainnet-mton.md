---
id: mainnet-mton-staking
title: MTON Staking in Mainnet
sidebar_label: Mainnet MTON staking
---

이 문서는 이더리움 메인넷에 MTON을 스테이킹 하는 과정을 담고있다.

MTON 이란, 토카막 네트워크 마켓팅을 위해 이더리움 메인넷에 배포된 토큰이다. 차후 공식 TON 토큰으로 전환이 가능하다.

> 스테이킹을 직접하는 경우 상당량의 ETH를 소모하기 때문에, 특별한 목적이 아니라면 [Dashboard](https://dashboard.tokamak.network)의 delegate사용을 권장한다.

## 오퍼레이터 준비

### MTON 컨트랙트 정보

`MTON` 토큰 및 스테이크 매니저 컨트랙트 주소는 다음과 같다.

**컨트렉트 정보**

    TON: "0xe3a87a9343D262F5f11280058ae807B45aa34669",
    WTON: "0xcDB18cd1f6763a93287d20598427A50d3Ba9977f"
    RootChainRegistry: "0xeE0aF430528311d2b48880E9055FB9f26fd64022"
    DepositManager: "0xa8f67b988f3227158146da1C1c4854d2DCcdE67D"
    SeigManager: "0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C"
    PowerTON: "0x8a5A36F16dd9eD0032cfce1a0496e543B6c72098"

> 위 `TON` 토큰 주소는 `MTON` 토큰의 주소이다. 이후 CLI 에서 출력되는 `TON`에 대한 정보도 모두 `MTON`이다. 그리고 `MTON`에서 전환된 `WTON`은 차후에 발행될 `TON`에서 변환되는 `WTON` 과 다르며 호환되지 않는다.

해당 정보는 [Dashboard API](https://dashboard-api.tokamak.network/managers)를 통해 확인 할 수 있다.

### 루트체인 접속 주소

오퍼레이터 노드를 실행하기 위해 루트체인 접속 주소가 필요하다. 여러 방법이 있지만, `Infura`를 통해 제공되는 노드 주소를 사용하는것이 간편하다. `Infura`를 통해 접속 가능한 주소를 확보한다.

만약, `Infura` 계정이 없다면 [infura.io](https://infura.io/) 회원가입을 통해 접속 주소(URL)를 얻을 수 있다.

사이트 가입이 완료된 경우, `Dashboard`의 `"CREATE NEW PROJECT"` 를 클릭하여 프로젝트를 생성한다.

그 다음, 아래와 같이 `PROJECT ID`가 조합된 `ENDPOINTS` 주소를 사용한다.

`wss://mainnet.infura.io/ws/v3/[PROJECT ID]`

![Infura node ID](assets/guides_create-infura-node.png)
예) `wss://mainnet.infura.io/ws/v3/07b1363d79a94e30af61da848ecfa194`

만약 자신이 운영하고 있는 이더리움 노드가 있다면, 해당 노드의 접속 주소를 `Infura` 주소 대신 사용할 수 있다.

### ChainID 확인

토카막 네트워크는 여러 오퍼레이터가 각자의 자식체인을 운영하는 구조를 가지고 있다. 이때, 루트체인 컨트랙트 배포시 사용되는 `ChainID`를 중복해서 사용할 경우, 중복 사용된 자식체인 사이에 [`Replay Attack`](https://medium.com/coinmonks/what-is-a-replay-attack-b0e2c3b1dec4)이 가해질 수 있다.

예를 들어 오퍼레이터A 와 오퍼레이터B 모두 동일한 `ChainID`를 사용하여 루트체인을 배포 하였다면, 오퍼레이터A 자식체인에서 처리된 트랜잭션을 누구나 가져와 오퍼레이터B의 자식체인에서도 사용 할 수 있다.

`Replay Attack`을 방지하기 위해서는 오퍼레이터 각자가 고유의 `ChainID`를 사용해야 한다.

따라서 오퍼레이터는 루트체인 컨트랙트를 배포하기 전에 반드시 아래 링크에서 자신이 사용하고자 하는 `ChainID` 가 현재의 네트워크에 이미 등록되어 있는지 확인한 이후 중복되지 않는 새로운 `ChainID`를 사용하길 권장한다.

```baash
$ curl -g https://dashboard-api.tokamak.network/chainids
[16, 125]
```

현재까지 등록된 자식체인들의 ID가 `List` 형태로 출력된다.

## 오퍼레이터 자식체인 설정

### Plasma-evm 실행 환경 구성

Plasma-evm 소스코드 컴파일 환경 구성은 [루트체인 설정 - 로컬 환경 설정](how-to-open-private-testnet-rootchain#로컬-환경-설정) 을 참고한다.

[프라이빗 테스트넷 시작](how-to-open-private-testnet-manually) 과정을 통해 `plasma-evm` 의 `geth` 실행이 가능하다면 다음 단계로 넘어가도 된다.

먼저, 소스코드를 다운로드 받는다.

```bash
$ git clone -b v0.0.0-rc7.3 https://github.com/onther-tech/plasma-evm
```

> 이 문서는 master 브랜치의 [v0.0.0-rc7.3 : 4313eeb43b1238a69b54853e5a31ede7d619c68b](https://github.com/Onther-Tech/plasma-evm/tree/v0.0.0-rc7.3) 커밋을 기준으로 작성되었다.

소스코드 다운로드 후, `plasma-evm` 디렉토리로 이동하여 아래 `make` 명령어로 실행  가능한 `geth` 파일을 생성한다.

```bash
$ cd plasma-evm
plasma-evm $ make geth
```

해당 과정이 정상적으로 종료되면, `plasma-evm/build/bin` 위치에 `geth`파일이 생성된다.

### 오퍼레이터 계정 생성

만약, `MTON`을 받은 계정을 오퍼레이터 계정으로 사용하여도 된다. 하지만, 보안을 위해 오퍼레이터용 계정을 따로 생성하여 사용하는 것을 권장한다.

먼저, 아래 `geth account new` 명령어를 통해 오퍼레이터 계정을 생성한다.

오퍼레이터 노드에서 사용할 키파일 암호를 `Password` 에 입력한다.

```bash
plasma-evm $ build/bin/geth account new --datadir ./operator
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
Your new account is locked with a password. Please give a password. Do not forget this password.
Password:
Repeat password:

Your new key was generated

Public address of the key:   <use-your-own-account-address>
Path of the secret key file: operator/keystore/UTC--2020-01-01T00-00-00.000000000Z--<use-your-own-account-address>

- You can share your public address with anyone. Others need it to interact with you.
- You must NEVER share the secret key with anyone! The key controls access to your funds!
- You must BACKUP your key file! Without the key, it's impossible to access account funds!
- You must REMEMBER your password! Without the password, it's impossible to decrypt the key!
```

`--datadir` 입력한 경로인 `plasma-evm/operator` 에 해당 키파일이 생성된다. 이 키파일은 오퍼레이터 노드 운영에 있어 중요한 파일이므로 보안에 유의하여야 한다.

이 과정에서 생성된 계정은 오퍼레이터 계정으로 사용되며, 앞으로 이글에서 `<use-your-own-account-address>`로 지칭한다.

위에서 입력한 암호를 담고 있는 파일을 생성해야 한다. 바로 위 계정생성에 사용한 암호를 `<do-not-use-this-password-use-your-own-password>` 대신 사용하여 아래 명령어를 입력한다.

```bash
plasma-evm $ echo "<do-not-use-this-password-use-your-own-password>" > pwd.pass
```

해당 키파일 이름은 `geth`의 `--password` 플래그의 인자로 `pwd.pass` 사용된다.

### 오퍼레이터 계정 준비

위 [오퍼레이터 계정 생성](#오퍼레이터-계정-생성)에서 생성한 계정("use-your-own-account-address")에 0.3 이상의 `ETH`와 스테이킹할 `MTON`을 보내야한다.

> 이더리움 메인넷의 `MTON` 토큰의 주소는 `"0xe3a87a9343D262F5f11280058ae807B45aa34669"`이다.

오퍼레이터 계정으로 사용할 `<use-your-own-account-address>`주소의 `ETH` 잔고 확인은 [etherscan.io](https://etherscan.io/)를 사용한다.

![Check MTON balance in etherscan](assets/guides_check_mton_balance_etherscan.png)

`MTON` 잔고는 [MTON Contract - etherscan.io](https://etherscan.io/token/0xe3a87a9343d262f5f11280058ae807b45aa34669)에서 `Find`에 `<use-your-own-account-address>`주소를 입력하여 확인 가능하다.

![MTON balance result in etherscan](assets/guides_result_mton_balance_etherscan.png)

### 루트체인 컨트랙트 배포

> [오퍼레이터 계정 준비](#오퍼레이터-계정-준비)를 통해 오퍼레이터 계정으로 사용할 `<use-your-own-account-address>`에 `ETH` 와 `MTON`이 준비 되어야 한다.

다음은 루트체인 컨트랙트 배포 커맨드인 `deploy`에 대한 설명이다.

`deploy` 커맨드는 입력인자로 <출력할 genesis 파일 이름>, <체인아이디(CHAINID)>, <프리 에셋(PRE-ASSET)>, <에폭(EPOCH)>을 받는다. 각 인자의 대한 설명은 다음과 같다.

- `CHAINID` : 오퍼레이터가 임의로 정할 수 있는 체인 고유의 숫자.
- `PRE-ASSET` : `genesis` 파일에 미리 PETH를 부여할지에 대한 여부. `true` 경우 자식체인 계정들에 PETH 잔고가 생성됨.
- `EPOCH` : 루트체인에 커밋할 자식체인의 블록 단위. 예를들어 `2`로 설정하는 경우, 자식체인 2개 블록 마다 루트체인에 1회 커밋 트랜잭션을 전송한다.

아래, `deploy` 명령어를 사용하여 루트체인 컨트랙트를 루트체인에 배포한다.

```bash
plasma-evm $ build/bin/geth --nousb deploy genesis.json 1010 false 2 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id> \
            --unlock <use-your-own-account-address> \
            --password pwd.pass \
            --rootchain.sender <use-your-own-account-address>
```

오퍼레이터가 배포한 `rootchain` 컨트랙트 정보가 포함되어 있는 `genesis.json` 파일을 통해 플라즈마 체인을 초기화 한다.

```bash
plasma-evm $ build/bin/geth --nousb init genesis.json \
            --datadir ./operator  \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id>
```

### 스테이킹 주소 설정

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

오퍼레이터가 설정한 자식체인의 루트체인 주소를 스테이크 매니저 컨트랙트에 등록하여 스테이킹 시뇨리지를 받을 수 있게 한다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking register \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id> \
            --unlock <use-your-own-account-address> \
            --password pwd.pass \
            --rootchain.sender <use-your-own-account-address>
```

오퍼레이터의 루트체인 컨트랙트가 정상적으로 등록되면 아래와 같이 출력된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0xe3a87a9343D262F5f11280058ae807B45aa34669 WTON=0xcDB18cd1f6763a93287d20598427A50d3Ba9977f DepositManager=0xa8f67b988f3227158146da1C1c4854d2DCcdE67D RootChainRegistry=0xeE0aF430528311d2b48880E9055FB9f26fd64022 SeigManager=0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C
INFO [01-01|00:00:00.000] Registered SeigManager to RootChain      registry=0xeE0aF430528311d2b48880E9055FB9f26fd64022 rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=a63891…0a9d9a
INFO [01-01|00:00:00.000] Registered RootChain to SeigManager      registry=0xeE0aF430528311d2b48880E9055FB9f26fd64022 rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=f7017e…d8fa00
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

위 메시지가 출력되는경우, [ChainID 확인](#chainid-확인)을 다시 수행하여 중복되는 `ChainId`가 있는지 확인한다.

### 커미션 설정

오퍼레이터가 아닌 일반 사용자들로부터 `MTON`을 위임받을 수 있다. 이때, 오퍼레이터는 위임 받은 `MTON` 에서 발생한 시뇨리지의 커미션, 즉 수수료를 정할 수 있다.

커미션 비율은 초기 루트체인 컨트랙트를 등록하거나, 오퍼레이터가 자식체인을 운영하는 도중에서도 변경 가능하다.

커미션 비율은 최소 -1.00 부터 1.00 까지 입력값을 사용하여, -100% 부터 100% 까지 설정 할 수 있다.

다음은, 오퍼레이터의 커미션 설정에 따른 시뇨리지 보상에 대한 예시이다.

- Commission Rate `0.0` : 기본값 설정값. 사용자는 위임한 토큰에 대한 시뇨리지 보상을 그대로 가져가게 되며, 오퍼레이터는 자신이 스테이킹한 `MTON`의 보상만 받게 된다.
- Commission Rate `0.5` : 사용자가 위임한 `MTON`에서 발생한 시뇨리지의 50% 를 오퍼레이터 계정에 수수료로 지급. 사용자는 시뇨리지의 50% 를 받게 된다.
- Commission Rate `1.0` : 오퍼레이터는 자신에게 위임받은 `MTON`의 시뇨리지를 모두 갖는다. 사용자는 자신이 위임한 `MTON`에 대한 시뇨리지 보상을 받지 못한다.
- Commission Rate `-0.5` : 오퍼레이터가 스테이킹한 `MTON`에서 발생한 시뇨리지의 50%를 위임한 사용자들에게 추가로 보상된다.
- Commission Rate `-1.0` : `MTON`을 위임한 사용자는 오퍼레이터의 스테이킹한 `MTON`에서 발생한 **모든** 시뇨리지를 추가로 분배 받는다.

오퍼레이터가 150 `MTON` 을 스테이킹 하고, 사용자 A와 B 는 각각 50, 100 `MTON`을 위임하였다고 가정해보자. 그리고 이에 대한 시뇨리지 보상인 30 `WTON` 이 생성된다고 가정할때, 커미션에 따라 사용자와 오퍼레이터가 받는 시뇨리지 보상을 정리하자면 다음과 같다.

| Commission Rate | User A(Delegated : 50)   | User B(Delegated : 100)   | Operator(Staked : 150)   | Seigniorage of 300 TON |
|-----------------|--------------------------|---------------------------|--------------------------|------------------------|
| 0               | 5                        | 10                        | 15                       | 30 WTON                |
| 0.01            | 4.95                     | 9                         | 16.5                     | 30 WTON                |
| 0.5             | 2.5                      | 5                         | 22.5                     | 30 WTON                |
| 1.0             | 0                        | 0                         | 30                       | 30 WTON                |
| -0.5            | 7.5                      | 15                        | 7.5                      | 30 WTON                |
| -1.0            | 10                       | 20                        | 0                        | 30 WTON                |

> 커미션이 없는 0은 제외 하고, -0.009 ~ +0.009 값은 커미션 비율로 설정 할 수 없다.

아래 `setCommissionRate` 명령어를 통해 오퍼레이터의 커미션을 설정할 수 있다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking setCommissionRate 0.01 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id> \
            --unlock <use-your-own-account-address> \
            --password pwd.pass \
            --rootchain.sender <use-your-own-account-address>
```

만약, 마이너스 커미션을 설정하고 싶다면 커미션 비율 뒤에 `true` 를 추가한다.

`setCommissionRate` 명령어는 입력인자 `<rate>`뒤에 추가적으로 마이너스 여부인 `<isCommissionRateNegative>`값을 받을 수 있다.
아래와 같이 커미션 비율을 마이너스로 설정하고 싶은경우 `true` 추가 해준다.

`<isCommissionRateNegative>`의 입력값이 없는 경우 기본값인 `false`가 선택된다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking setCommissionRate 0.01 true \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id> \
            --unlock <use-your-own-account-address> \
            --password pwd.pass \
            --rootchain.sender <use-your-own-account-address>
```

커미션을 설정을 하지 않는다면, 기본값인 0으로 설정된다. 이때 위임에 따른 수수료 또는 마이너스 커미션에 따른 추가적인 보상이 발생하지 않는다.

### MTON 잔고 확인

아래 명령어를 통해, 오퍼레이터의 `MTON` 잔고를 확인한다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances <use-your-own-account-address> \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id>
```

아래 예시와 같이, 오퍼레이터 계정이 보유하고 있는 잔고를 `TON Balance` 란에서 확인할 수 있다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.operator/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Home/ubuntu/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0xe3a87a9343D262F5f11280058ae807B45aa34669 WTON=0xcDB18cd1f6763a93287d20598427A50d3Ba9977f DepositManager=0xa8f67b988f3227158146da1C1c4854d2DCcdE67D RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C
INFO [01-01|00:00:00.000] TON Balance                              amount="10000.0 TON" depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] WON Balance                              amount="0 WTON"      depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Deposit                                  amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Total Stake                              amount="500.0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Committed Stake                          amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Commission Rate                          rate=0.010
```

위 예시는 `0x3cD9F7...` 계정에 10,000 MTON 을 보유하고 있다.

### MTON 스테이킹

> `MTON`을 얻는 방법에 대해서는 [What is MTON](https://medium.com/onther-tech/what-is-mton-80c011bb927e)을 참고한다.

오퍼레이터 계정에 반드시 스테이킹을 위한 `MTON` 잔고가 있어야 한다. 아직 오퍼레이터 계정에 `MTON` 잔고가 없다면, `MTON` 보유하고 있는 계정에서 옮겨와야 한다.

`MTON`을 스테이킹 하려면, `staking`의 하위 명령어인 `stakeTON`을 사용한다.

> 이때 하위 명령어인 `stakeTON` 의 입력인자로 소수점을 사용하여야 1e9(1,000,000,000 wei) 단위가 적용된다.

아래, `stakeTON` 하위 명령어를 사용하여 `MTON`을 스테이킹 한다.

```bash
plasma-evm $ build/bin/geth --nousb staking stakeTON 500.0 \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id> \
            --unlock <use-your-own-account-address> \
            --password pwd.pass \
            --rootchain.sender <use-your-own-account-address>
```

실질적으로 오퍼레이터가 플라즈마 체인 운영을 위해 `depositManager`에 스테이킹 되는 토큰은 WTON 이다.

## MTON 커밋 보상 확인 및 인출

오퍼레이터의 클라이언트가 루트체인에서 설정된 `Epoch` 주기로 루트체인에 Tx 커밋을 제출한다.

루트체인 컨트랙트에 커밋 트랜잭션이 제출되면, 매니저 컨트랙트에서 모든 오퍼레이터의 스테이킹된 자산을 고려하여 시뇨리지가 계산된다.

### 자식체인 실행

> 오퍼레이터의 ETH 잔고가 0이 되면 자식체인이 멈출 수 있다. 따라서 지속적으로 오퍼레이터의 `ETH` 잔고를 확인하고 채워줘야 한다.

아래 명령어를 통해 오퍼레이터 노드를 실행 한다.

네트워크 외부에서 접근 하지 못하도록 보안적으로 닫혀 있어야 안전하다. 오직 `usernode`를 설정하여 실제 사용자의 트랜잭션을 받도록 구성해야 한다.

`usernode` 설정에 대한 부분은 [자식체인 설정 - 사용자 노드 설정](how-to-open-private-testnet-manually#사용자-노드-설정) 을 참고한다.

```bash
plasma-evm $ build/bin/geth --nousb \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id> \
            --operator <use-your-own-account-address> \
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
["<use-your-own-account-address>"]
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x0a65e80eb105c448ffa1ca50430dc1d3f4b0da14ad1d4793a43ed36b6df0959c"
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x81130ae471f536c04cc6b9901962dd5a15bb72f3924422ea051a3b0494c0fade"
```

위와 같이 오퍼레이터 자기 자신에게 0 ETH를 전송하는 더미 트랜잭션을 2회 이상 입력한다.

> 루트체인 컨트랙트 배포시 사용한 `Epoch` 숫자 보다 많은 블록이 자식체인에 생성되면, 실행중인 오퍼레이터 노드의  `Plasma-evm` 클라이언트는 자동적으로 루트체인에 Tx를 커밋하게 된다.

이 예시에서 적용된 `Epoch`은 `2`이다. 참고로 자식체인내에서 트랜잭션이 발생하지 않는경우 블록이 생성되지 않는다.

`exit` 명령어로 `geth` console 접속을 종료 한다.

### 시뇨리지 확인

`staking balances` 명령어를 사용하여, 오퍼레이터가 받은 MTON의 시뇨리지 발행을 확인한다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances <use-your-own-account-address> \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id>

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=./operator/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0xe3a87a9343D262F5f11280058ae807B45aa34669 WTON=0xcDB18cd1f6763a93287d20598427A50d3Ba9977f DepositManager=0xa8f67b988f3227158146da1C1c4854d2DCcdE67D RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] WON Balance                              amount="500.0 WTON" depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Deposit                                  amount="500.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON"     rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Total Stake                              amount="1100.0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="1100.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON"  rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Committed Stake                          amount="600.0 WTON"  rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Commission Rate                          rate=0.010
```

위 결과는 예시이며, 실제 스테이킹된 시간에 따라 시뇨리지 `WTON`이 계산되기 때문에 소수점자리까지 나타난다.

[자식체인 실행](#자식체인-실행) 에서 오퍼레이터 자식체인만 루트체인에 커밋되 었으므로, 다른 오퍼레이터들의 스테이킹 보상은 `Uncommited` 상태에 MTON 잔고가 쌓이게 된다.

### 보상 인출

발생한 시뇨리지는 `WTON` 형태로 추가 발행되어 스테이킹 되어 있는 모든 오퍼레이터 계정에 쌓인다.

오퍼레이터가 시뇨리지로 받은 `WTON`을 인출 해보고자 한다.

먼저 인출 요청은 `staking`의 하위 명령어인 `requestWithdrawal` 을 사용한다. 550 WTON 인출을 위해 아래와 같이 입력한다.

```bash
plasma-evm $ build/bin/geth --nousb staking requestWithdrawal 550.0 \
              --datadir ./operator \
              --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id> \
              --unlock <use-your-own-account-address> \
              --password pwd.pass \
              --rootchain.sender <use-your-own-account-address>
```

오퍼레이터의 `Committed Stake` 잔고가 550 이상 있다면 출금 요청이 정상적으로 처리된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0xe3a87a9343D262F5f11280058ae807B45aa34669 WTON=0xcDB18cd1f6763a93287d20598427A50d3Ba9977f DepositManager=0xa8f67b988f3227158146da1C1c4854d2DCcdE67D RootChainRegistry=0xeE0aF430528311d2b48880E9055FB9f26fd64022 SeigManager=0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C
INFO [01-01|00:00:00.000] Withdrawal requested                     rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 amount="550.0 WTON" tx=570061…b07f4d
```

다시 오퍼레이터의 잔고를 확인해보면 `Pending withdrawal ..` 에 요청한 550.0 WTON 가 나타난다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances <use-your-own-account-address> \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id>

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=operator/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0xe3a87a9343D262F5f11280058ae807B45aa34669 WTON=0xcDB18cd1f6763a93287d20598427A50d3Ba9977f DepositManager=0xa8f67b988f3227158146da1C1c4854d2DCcdE67D RootChainRegistry=0xeE0aF430528311d2b48880E9055FB9f26fd64022 SeigManager=0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] WON Balance                              amount="500.0 WTON" depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Deposit                                  amount="500.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=1
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="550.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Total Stake                              amount="550.0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="50.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Committed Stake                          amount="50.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Commission Rate                          rate=0.010
```

최종 인출을 위해 `processWithdrawal` 명령어를 사용한다.

`requestWithdrawal` 이 포함된 블록부터 93046 블록(약 14일)이 경과된 시점에 `processWithdrawal` 트랜잭션 전송이 가능하다.

```bash
plasma-evm $ build/bin/geth --nousb staking processWithdrawal \
              --datadir ./operator \
              --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id> \
              --unlock <use-your-own-account-address> \
              --password pwd.pass \
              --rootchain.sender <use-your-own-account-address>
```

`processWithDrawal` 이 정상적으로 처리된 경우 잔고 확인 해보면 550 증가된 1,050 WTON 확인 가능하다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances <use-your-own-account-address> \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id>

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=./operator/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/operator/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0xe3a87a9343D262F5f11280058ae807B45aa34669 WTON=0xcDB18cd1f6763a93287d20598427A50d3Ba9977f DepositManager=0xa8f67b988f3227158146da1C1c4854d2DCcdE67D RootChainRegistry=0xeE0aF430528311d2b48880E9055FB9f26fd64022 SeigManager=0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] WON Balance                              amount="1050.0 WTON" depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Deposit                                  amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Total Stake                              amount="550.0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="50.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Committed Stake                          amount="50.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Commission Rate                          rate=0.010
```

### 보상 인출 취소

`requestWithdrawal`을 통한 출금 요청 상태의 `WTON`을 다시 스테이크 상태로 되돌릴 수 있다.

`staking`의 하위 명령어인 `restake`사용 하여, `Pending` 상태의 요청이 `processWithdrawal`을 통해 처리되기 전에 취소 가능하다.

먼저, `Pending` 상태의 요청을 만들기 위해 `staking`의 하위 명령어인 `requestWithdrawal`을 사용한다. 50 WTON 인출을 위해 아래와 같이 입력한다.

```bash
plasma-evm $ build/bin/geth --nousb staking requestWithdrawal 50.0 \
              --datadir ./operator \
              --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id> \
              --unlock <use-your-own-account-address> \
              --password pwd.pass \
              --rootchain.sender <use-your-own-account-address>
```

오퍼레이터1의 잔고를 확인해보면 `Pending withdrawal ..` 에 요청한 50.0 WTON이 나타난다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances <use-your-own-account-address> \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id>

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0xe3a87a9343D262F5f11280058ae807B45aa34669 WTON=0xcDB18cd1f6763a93287d20598427A50d3Ba9977f DepositManager=0xa8f67b988f3227158146da1C1c4854d2DCcdE67D RootChainRegistry=0xeE0aF430528311d2b48880E9055FB9f26fd64022 SeigManager=0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] WTON Balance                             amount="1050.0 WTON" depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Deposit                                  amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=1
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="50.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Total Stake                              amount="500.0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="0.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Committed Stake                          amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Commission Rate                          rate=0.010
```

출금 요청을 취소하기 위해 `restake` 명령어를 사용한다.

```bash
plasma-evm $ build/bin/geth --nousb staking restake \
              --datadir ./operator \
              --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id> \
              --unlock <use-your-own-account-address> \
              --password pwd.pass \
              --rootchain.sender <use-your-own-account-address>
```

`restake`가 정상적으로 처리된 후, `Pending withdrawal WTON`이 50.0 WTON 만큼 감소되고 `Committed Stake`가 50.0 WTON 만큼 증가된 부분을 확인 할 수 있다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances <use-your-own-account-address> \
            --datadir ./operator \
            --rootchain.url wss://mainnet.infura.io/ws/v3/<use-your-own-infura-project-id>

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x5E3230019fEd7aB462e3AC277E7709B9b2716b4F
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0xe3a87a9343D262F5f11280058ae807B45aa34669 WTON=0xcDB18cd1f6763a93287d20598427A50d3Ba9977f DepositManager=0xa8f67b988f3227158146da1C1c4854d2DCcdE67D RootChainRegistry=0xeE0aF430528311d2b48880E9055FB9f26fd64022 SeigManager=0x2104cEC955b6FaBF603d8B2Ee0c28EA88886fa8C
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=0x5E3230019fEd7aB462e3AC277E7709B9b2716b4F
INFO [01-01|00:00:00.000] WTON Balance                             amount="1050.0 WTON" depositor=0x5E3230019fEd7aB462e3AC277E7709B9b2716b4F
INFO [01-01|00:00:00.000] Deposit                                  amount="50.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Uncommitted Stake                        amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Committed Stake                          amount="50.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=<use-your-own-account-address>
INFO [01-01|00:00:00.000] Commission Rate                          rate=0.010
```
