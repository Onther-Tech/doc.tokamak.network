---
id: private-testnet-staking
title: Staking Tutorial in Priavte Testnet
sidebar_label: Private Testnet Staking
---

> This Document Work In Progress

<!--- 용어 정리
스테이킹 Staking or 스테이크 Stake ?
매니저 or 스테이크 매니저 ?
--->

## 프라이빗 네트워크 TON 스테이크

이 문서 테스트 루트체인에서 두 오퍼레이터가 TON 토큰을 스테이크하는 예시를 다룬다.

<!- TODO : check statement ->
전반적으로 `plasma-evm`의 `staking` 명령어 사용에 대한 것으로, 개발자 및 오퍼레이터(Operator) 에게 유용한 툴이다.

> 일반 사용자의 경우 [dashboard](https://dashboard.faraday.tokamak.network)를 사용한다.

<!- TODO : plasma-evvm 브랜치 정보는 다시 확인할 것 ->
테스트 환경 구성은 onther-tech/go-ethereum을 rootchain으로 사용하고, plasma-evm 은 [onther-tech/plasmaa-evm - v0.0.0.0-rc5.2] 를 사욘한다.

## TON 스테이킹 컨트랙트 설정

### TON 스테이킹 매니저 컨트랙트 배포

동작중인 rootchain에 스테이크 컨트렉트를 배포한다.

동작하고 있는 rootchain 이 없다면, [ 프라이빗 테스트넷 루트체인 설정하기](https://docs.tokamak.network/docs/ko/guides/getting-started/how-to-open-private-testnet-rootchain#루트-체인-설정) 수행한다.


```bash
plasma-evm $ make geth && build/bin/geth staking deployManagers 10 1.5 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --dev.key b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 \
            --operator 0x71562b71999873DB5b286dF957af199Ec94617F7
```

위 명령어를 통해 TON 스테이킹에 필요한 컨트랙트가 모두 배포된다.

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
INFO [03-17|17:41:18.879] 8. Setting SeigManager address to target contracts targets="[DepositManager WTON]"
INFO [01-01|00:00:00.000] Set SeigManager to target cotnract       target=DepositManager tx=9435d0…c15c3a
INFO [01-01|00:00:00.000] Set SeigManager to target cotnract       target=WTON           tx=4f26fc…ffacb4
INFO [01-01|00:00:00.000] Staking manager contract deployed        TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
```

### PowerTON 컨트랙트 배포

다음 명령어를 통해 `PowerTON` 컨트랙트를 배포한다.

`dpeloyPowerTON`의 입력 인자는 파워톤 라운드 시간을 의미하며, 테스트를 위해 60초로 설정한다.

<!- TODO : 링크 삽입 ->
`PowerTON`에 대한 자세한 내용은 [여기]()를 참고한다.

```bash
plasma-evm $ build/bin/geth staking deployPowerTON 60s \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --dev.key b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 \
            --operator 0x71562b71999873DB5b286dF957af199Ec94617F7
```

### 배포 컨트랙트 정보

배포한 컨트랙트의 정보는 rawdb에 저장되어 있다.

명령어를 통해서 배포한 컨트랙트들 정보들을 `manager.json` 파일로 저장한다.

```bash
 plasam-evm $ build/bin/geth staking getManagers manager.json --datadir ./.pls.staking/manager

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

`PowerTON` 컨트랙트를 포함하여 6개의 컨트랙트 주소가 `manager.json` 에 저장된다.

## TON 스테이크 설정

### PowerTON 실행

<!- TODO : 파워톤에 대한 간략한 소개 및 링크 추가 ->

PowerTON 기능을 활성화 하려면 아래 명령어를 실행하여 Tx 를 전송한다.

```bash
plasma-evm $ build/bin/geth staking startPowerTON \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --dev.key b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 \
            --operator 0x71562b71999873DB5b286dF957af199Ec94617F7

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Unlocking developer account              address=0x0000000000000000000000000000000000000000
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x71562b71999873DB5b286dF957af199Ec94617F7
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/manager/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] PowerTON started                         PowerTON=0xBcDfc870Ea0C6463C6EBb2B2217a4b32B93BCFB7
```

### 스테이크 TON 생성

[TON Staking 컨트랙트 배포](#ton-staking-컨트랙트-배포)를 수행하여 `DepositManager` 컨트랙트가 배포되었다면, 스테이크에 참가할 오퍼레이터들에게 TON을 생성해주어야 한다.

두 오퍼레이터 상황을 가정하여, 각각 Operator1 Operator2 아래의 계정을 사용한다.

- 오퍼레이터1 는 `0x3cd9f729c8d882b851f8c70fb36d22b391a288cd`
- 오퍼레이터2 는 `0x57ab89f4eabdffce316809d790d5c93a49908510`

아래 명령어를 통해 각각 오퍼레이터에게 10,000 TON을 생성한다.

```bash
plasma-evm $ build/bin/geth staking mintTON 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd 10000.0 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x71562b71999873DB5b286dF957af199Ec94617F7
```

```bash
plasma-evm $ build/bin/geth staking mintTON 0x57ab89f4eabdffce316809d790d5c93a49908510 10000.0 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x71562b71999873DB5b286dF957af199Ec94617F7
```

<!--- TODO : Check how to get balance with stkaing command
오퍼레이터2의 잔고를 확인해 본다.
```bash
plasma-evm $ build/bin/geth staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x71562b71999873DB5b286dF957af199Ec94617F7
```
--->

## 오퍼레이터 TON 스테이크

스테이크에 참여하는 오퍼레이터1 과 오퍼레이터2 는 각각 10,000 TON을 가지고 있다.

TON을 스테이크 함으로써 발생하는 시뇨리지를 얻기 위해서는 자신의 체인을 설정하고 매니저에 루트체인 컨트랙트를 등록 해야 한다.

### 오퍼레이터1 체인 설정 및 스테이크 주소 설정

```bash
plasma-evm $ build/bin/geth deploy ./.pls.staking/operator1/operator1_genesis.json 1021 true 2 \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --dev.key bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5 \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

오퍼레이터1 이 배포한 `rootchain` 루트체인 컨트랙트 정보가 포함되어 있는 `operator1_genesis.json` 을 통해 초기화 한다.

```bash
plasma-evm $ build/bin/geth init ./.pls.staking/operator1/operator1_genesis.json  \
            --datadir ./.pls.staking/operator1  \
            --rootchain.url ws://127.0.0.1:8546
```

아래 `staking setManagers` 명령어를 통해 오퍼레이터1의 체인데이터에 위치에 스테이크 컨트랙트 정보를 등록한다.

```
plasma-evm $ build/bin/geth staking setManagers manager.json  \
            --datadir ./.pls.staking/operator1
NFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Set address                              name=TON addr=0x3A220f351252089D385b29beca14e27F204c296A
INFO [01-01|00:00:00.000] Set address                              name=WTON addr=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf
INFO [01-01|00:00:00.000] Set address                              name=DepositManager addr=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d
INFO [01-01|00:00:00.000] Set address                              name=RootChainRegistry addr=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44
INFO [01-01|00:00:00.000] Set address                              name=SeigManager       addr=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Set address                              name=PowerTON          addr=0xBcDfc870Ea0C6463C6EBb2B2217a4b32B93BCFB7
```

`getManagers` 메소드를 실행하여 오퍼레이터1 체인데이터에 스테이크 컨트랙트 정보가 등록되어 있는지 확인한다.

```
plasma-evm $ build/bin/geth staking getManagers --datadir ./.pls.staking/operator1
```

### 오퍼레이터1 루트체인 등록 및 TON 잔고 확인

오퍼레이터1 이 설정한 Plasma-evm 체인의 루트체인 주소를 매니저 컨트랙트에 등록하여 스테이크를 시뇨리지를 받을 수 있게 한다.

```bash
plasma-evm $ build/bin/geth staking register \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
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

아래 명령어를 통해 TON 잔고를 확인한다.

```bash
plasma-evm $ build/bin/geth staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

오퍼레이터1 의 TON 생성과, 루트체인이 메니저 컨트랙트 등록이 정상적으로 이루어 졌다면 아래와 같이 10,000 TON 의 잔고를 확인할 수 있다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
WARN [01-01|00:00:00.000] Failed depositor read uncomitted stake   err="abi: attempting to unmarshall an empty string while arguments are expected"
INFO [01-01|00:00:00.000] TON Balance                              amount="10000.0 TON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] WON Balance                              amount="0 WTON"      depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Deposit                                  amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Total Stake                              amount="0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Comitted Stake                           amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```

### 오퍼레이터1 TON 스테이크

<!- TODO : 타겟 컨트랙트 확인 ->
TON을 스테이크 하려면 WTON으로 변환한 후, `WTON`을 `depositManager` 컨트랙트에 `stake` 해주어야 한다.

아래 명령어를 사용하여, 1,000 TON을 WTON으로 변환한다.

```bash
plasma-evm $ build/bin/geth staking swapFromTON 1000.0 \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
WARN [01-01|00:00:00.000] Allowances is inefficient                current=0 target=1000.0 diff=1000.0
WARN [01-01|00:00:00.000] Approve to deposit TON                   amount=1000.0
WARN [01-01|00:00:00.000] Approved to deposit TON                  amount=1000.0 tx=5d9880…76506a
INFO [01-01|00:00:00.000] Swap from TON to WTON                    amount="1000.0 TON" from=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD tx=4d15eb…904dd6
```

`stake` 명령어로 변환된 1,000 WTON 중 500 WTON을 스테이크 한다.

```bash
plasma-evm $ build/bin/geth staking stake 500.0 \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

<!- TODO : check swapToTON need?? ->

<!- TODO : Checl 오퍼레이터2 과정 반복 해야 하는가.. 다른 방법은 ->
### 오퍼레이터2 체인 설정 및 스테이크 주소 설정

```bash
plasma-evm $ build/bin/geth deploy ./.pls.staking/operator2/operator2_genesis.json 1021 true 2 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --dev.key  067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터2 가 배포한 `rootchain` 루트체인 컨트랙트 정보가 포함되어 있는 `operator2_genesis.json` 을 통해 초기화 한다.

```bash
plasma-evm $ build/bin/geth init ./.pls.staking/operator2/operator2_genesis.json  \
            --datadir ./.pls.staking/operator2  \
            --rootchain.url ws://127.0.0.1:8546
```

아래 `staking setManagers` 명령어를 통해 오퍼레이터2 의 체인데이터에 위치에 스테이크 컨트랙트 정보를 등록한다.

```
plasma-evm $ build/bin/geth staking setManagers manager.json  \
            --datadir ./.pls.staking/operator2
```

`getManagers` 메소드를 실행하여 오퍼레이터2 체인데이터에 스테이크 컨트랙트 정보가 등록되어 있는지 확인한다.

```
plasma-evm $ build/bin/geth staking getManagers --datadir ./.pls.staking/operator2
```

### 오퍼레이터2 루트체인 등록 및 TON 잔고 확인

오퍼레이터2 이 설정한 Plasma-evm 체인의 루트체인 주소를 매니저 컨트랙트에 등록하여 스테이크를 시뇨리지를 받을 수 있게 한다.

```bash
plasma-evm $ build/bin/geth staking register \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터1 의 루트체인 컨트랙트가 정상적으로 등록되면 아래와 같이 출력된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/operator2/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Registered SeigManager to RootChain      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=a63891…0a9d9a
INFO [01-01|00:00:00.000] Registered RootChain to SeigManager      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=f7017e…d8fa00
```

아래 명령어를 통해 TON 잔고를 확인한다.

```bash
plasma-evm $ build/bin/geth staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터1 의 TON 생성과, 루트체인이 메니저 컨트랙트 등록이 정상적으로 이루어 졌다면 아래와 같이 10,000 TON 의 잔고를 확인할 수 있다.

### 오퍼레이터2 TON 스테이크

TON을 스테이크 하려면 WTON으로 변환한 후, `WTON`을 `depositManager` 컨트랙트에 `stake` 해주어야 한다.

아래 명령어를 사용하여, 1,000 TON을 WTON으로 변환한다.

```bash
plasma-evm $ build/bin/geth staking swapFromTON 1000.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

`stake` 메소드로 변환된 1,000 WTON 중 500 WTON을 스테이크 한다.

```bash
plasma-evm $ build/bin/geth staking stake 500.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

## TON 커밋 보상 확인

오퍼레이터1 또는 오퍼레이터2 가 자신의 플라즈마 체인의 블록을 진행하게 되면, 오퍼레이터의 플라즈마 클라이언트가 루트체인에 Tx 커밋을 제출한다.
이때,  스테이크 되어 있는 TON에 따라, 매니저 컨트랙트에서 발행보상이 계산된다.

### 오퍼레이터1 체인 실행

아래 명령어를 통해 프라이빗 환경의 오퍼레이터를 실행 한다

```bash
plasma-evm build/bin/geth \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

새로운 터미널에서 오퍼레이터1의 콘솔에 접속한다.

```bash
plasma-evm build/bin/geth attach --datadir ./.pls.staking/operator1
```

`geth attach` 를 실행하면, geth의 javasciprt console에 접속된다.

console에 `eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})` 입력하여 임의의 Tx를 생성하여 블록을 진행시킨다.

```shell
> web3.eth.accounts
["0x3cd9f729c8d882b851f8c70fb36d22b391a288cd"]
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x0a65e80eb105c448ffa1ca50430dc1d3f4b0da14ad1d4793a43ed36b6df0959c"
```

위와 같이 오퍼레이터1 자기 자신에게 0 ETH를 전송하는 더미 트랜잭션을 2회 이상 입력한다.

이때, 오퍼레이터가 루트체인 컨트랙트 배포시 사용한 Epoch 숫자보다 많은 블록을 생성해야 루트체인에 Tx를 커밋하게 된다.
이 예제에서 사용한 Epoch 은 2 이다.

### TON 시뇨리지 확인

또 다른 새로운 터미널에서 `staking` 커맨드의 `balances` 메소드를 사용하여 TON의 시뇨리지 발행을 확인한다.

```bash
plasma-evm $ build/bin/geth staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

위의 상황에서는 오퍼레이터1 만 루트체인에 커밋하였으므로, 오퍼레이터2는 스테이크 보상은 `Uncommited` 상태에 TON 잔고가 쌓이게 된다.

```
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator2/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator2/geth/stakingdata cache=16.00MiB handles=16
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

## TON 커밋 보상 인출

## TON 위임 방법