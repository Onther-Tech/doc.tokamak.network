---
id: private-testnet-staking
title: Staking Test in Priavte Testnet
sidebar_label: Private Testnet Staking test
---

## 프라이빗 네트워크 TON 스테이크

이 문서는 프라이빗 테스트 루트체인에서 두 오퍼레이터가 TON 토큰을 스테이크하는 예시를 다룬다.

문서의 대부분 `plasma-evm`의 `staking` 명령어 사용에 대한 것이다. 이 명령어는 개발자 및 오퍼레이터(Operator) 에게 유용한 툴이다.

> 일반 사용자의 경우 [dashboard](https://dashboard.faraday.tokamak.network)를 사용한다.

테스트 환경 구성은 [onther-tech/go-ethereum]()을 rootchain으로 사용하고, plasma-evm 은 [onther-tech/plasmaa-evm]()를 사용한다.

## TON 스테이크 컨트랙트 설정

### TON 스테이크 매니저 컨트랙트 배포

동작중인 rootchain에 스테이크 관련 컨트렉트를 배포한다.

만약, 동작하고 있는 rootchain 이 없다면, [프라이빗 테스트넷 루트체인 설정하기](https://docs.tokamak.network/docs/ko/guides/getting-started/how-to-open-private-testnet-rootchain#루트-체인-설정) 수행한다.

`deployManagers` 실행에 필요한 입력 파라미터는 <withdrawalDelay> 와 <seigPerBlock>, 총 2개 이다.

입력 파라미터에 대한 설명은 다음과 같다.

`withdrawalDelay` : 단위는 루트체인의 블록 갯수이다. 스테이크된 WTON 을 언스테이크 상태로 변환하기 위해서는 `requestWithdrawal` 트랜잭션을 전송하고, 해당 파라미터 동안 지연된후 처리된다. 예를 들어 `10` 으로 정한경우, 스테이크 TON에 대해 `requestWithdrawal` 을 100 블록에 처리되었다면, 루트체인 110번째 이후에 `processRequest` 트랜잭션이 실행됨으로써 요청한 WTON에 대해 언-스테이크 상태가 된다.

`seigPerBlock` : 루트체인 블록당 발생할 수 있는 시뇨리지의 최대 TON 개수. 해당 파라미터에 의해 연 인플레이션이 영향을 받는다.

```bash
plasma-evm $ make geth && build/bin/geth staking deployManagers 10 1.5 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --dev.key b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 \
            --operator 0x71562b71999873DB5b286dF957af199Ec94617F7
```

위 명령어를 통해 TON 스테이크에 필요한 컨트랙트가 모두 배포된다.

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

다음 명령어를 통해 `PowerTON` 컨트랙트를 배포한다.

`dpeloyPowerTON` 입력 인자는 파워톤 라운드 시간을 의미하며, 테스트를 위해 60초로 설정한다.

여기서 파워톤 라운드 시간이란, 미발행 시뇨리지를 파워톤 규칙에 의해 재분배되는 주기를 말한다. 예를들어 `60s` 로 해당 값을 설정한 경우, 미발행 시뇨리지 WTON을 받는 오퍼레이터가 매 60초 마다 정해진다.

`PowerTON`에 대한 자세한 내용은 [여기]()를 참고한다.

```bash
plasma-evm $ build/bin/geth staking deployPowerTON 60s \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --dev.key b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 \
            --operator 0x71562b71999873DB5b286dF957af199Ec94617F7
```

### 배포 컨트랙트 정보

배포한 컨트랙트의 정보는 `staking`의 하위 명령어인 `deployManager` 통해 `.pls.staking/manager` 에 위치한 rawdb저장된다.

아래 명령어를 통해, 루트체인에 배포한 스테이크 컨트랙트 정보들을 추출하여 `manager.json` 파일로 저장한다.

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

미발행 시뇨리지 분배에 대한 규칙을 가지고 있는 `PowerTON` 활성화 하려면 `staking`의 하위 명령어인 `startPowerTON`을 사용한다.

아래 명령어를 실행하여 `PowerTON` 활성화 Tx를 전송한다.

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

### 테스트 TON 생성

[TON 스테이크 매니저 컨트랙트 배포](#ton-스테이크-컨트랙트-배포)를 수행하여 `DepositManager` 컨트랙트가 배포되었다면, 스테이크에 참가할 오퍼레이터들에게 테스트용 TON을 생성해주어야 한다.

테스트 토카막 네트워크 에서 두 오퍼레이터 상황을 가정하였다, 따라서 오퍼레이터1 과 오퍼레이터2 는 아래의 계정을 사용한다.

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

아래 명령어를 통해 오퍼레이터2의 잔고를 확인 할 수 있다.

```bash
plasma-evm $ build/bin/geth staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x71562b71999873DB5b286dF957af199Ec94617F7
```

## 오퍼레이터 TON 스테이크

오퍼레이터1 과 오퍼레이터2 는 각각 10,000 TON을 가지고 있다.

오퍼레이터의 플라즈마 체인을 설정 이후, 스테이크 메니저 컨트랙트에 각 오퍼레이터의 루트체인 컨트랙트 주소를 등록 해야 한다.

### 오퍼레이터1 체인 설정 및 스테이크 주소 설정

`deploy` 명령어를 사용하여 오퍼레이터1 실행에 필요한 컨트랙트를 루트체인에 배포한다.

```bash
plasma-evm $ build/bin/geth deploy ./.pls.staking/operator1/operator1_genesis.json 1021 true 2 \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --dev.key bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5 \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

오퍼레이터1 이 배포한 `rootchain` 컨트랙트 정보가 포함되어 있는 `operator1_genesis.json` 파일을 통해 플라즈마 체인을 초기화 한다.

```bash
plasma-evm $ build/bin/geth init ./.pls.staking/operator1/operator1_genesis.json  \
            --datadir ./.pls.staking/operator1  \
            --rootchain.url ws://127.0.0.1:8546
```

아래 `staking`의 하위 명령어인 `setManagers` 를 사용하여 오퍼레이터1의 플라즈마 체인 운영에 필요한 스테이크 컨트랙트 주소를 설정한다.

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

`staking`의 하위 명령어인 `getManagers` 를 실행하여 오퍼레이터1 체인데이터에 스테이크 컨트랙트 정보가 등록되어 있는지 확인한다.

```
plasma-evm $ build/bin/geth staking getManagers --datadir ./.pls.staking/operator1
```

### 오퍼레이터1 루트체인 등록 및 TON 잔고 확인

오퍼레이터1 이 설정한 플라즈마 체인의 루트체인 주소를 스테이크 매니저 컨트랙트에 등록하여 스테이크 시뇨리지를 받을 수 있게 한다.

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

아래 명령어를 통해, 오퍼레이터1의 테스트 TON 잔고를 확인한다.

```bash
plasma-evm $ build/bin/geth staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

오퍼레이터1 의 테스트 TON 생성과, 루트체인이 메니저 컨트랙트 등록이 정상적으로 이루어 졌다면 아래와 같이 10,000 TON 의 잔고를 확인할 수 있다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
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

테스트 `TON`을 스테이크 하려면 `WTON`으로 변환한 후, `WTON`을 `depositManager` 컨트랙트에 `stake` 해주어야 한다.

실질적으로 오퍼레이터가 플라즈마 체인 운영을 위해 `depositManager`에 스테이크 되는 토큰은 WTON 이다.

아래 명령어를 사용하여 1,000 TON을 WTON으로 변환한다.

> 이때 하위 명령어인 `swapFromTON` 의 입력인자로 소수점을 사용하여야 1e9(1,000,000,000 wei) 단위가 적용된다.

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

`staking`의 하위 명령어인 `stake` 를 사용하여, 변환된 1,000 WTON 중 500 WTON을 스테이크 한다.

```bash
plasma-evm $ build/bin/geth staking stake 500.0 \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

### 오퍼레이터2 체인 설정 및 스테이크 주소 설정

`deploy` 명령어를 사용하여 오퍼레이터2 실행에 필요한 컨트랙트를 루트체인에 배포한다.

```bash
plasma-evm $ build/bin/geth deploy ./.pls.staking/operator2/operator2_genesis.json 1021 true 2 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --dev.key  067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터2 이 배포한 `rootchain` 컨트랙트 정보가 포함되어 있는 `operator2_genesis.json` 파일을 통해 플라즈마 체인을 초기화 한다

```bash
plasma-evm $ build/bin/geth init ./.pls.staking/operator2/operator2_genesis.json  \
            --datadir ./.pls.staking/operator2  \
            --rootchain.url ws://127.0.0.1:8546
```

아래 `staking`의 하위 명령어인 `setManagers` 사용하여 오퍼레이터2의 플라즈마 체인 운영에 필요한 스테이크 컨트랙트 주소를 설정한다.

```
plasma-evm $ build/bin/geth staking setManagers manager.json  \
            --datadir ./.pls.staking/operator2
```

`staking`의 하위 명령어인 `getManagers` 를 실행하여 오퍼레이터1 체인데이터에 스테이`크 컨트랙트 정보가 등록되어 있는지 확인한다.

```
plasma-evm $ build/bin/geth staking getManagers --datadir ./.pls.staking/operator2
```

### 오퍼레이터2 루트체인 등록 및 TON 잔고 확인

오퍼레이터2 이 설정한 플라즈마 체인의 루트체인 주소를 스테이크 매니저 컨트랙트에 등록하여 스테이크 시뇨리지를 받을 수 있게 한다.

```bas마
plasma-evm $ build/bin/geth staking register \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터2 의 루트체인 컨트랙트가 정상적으로 등록되면 아래와 같이 출력된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/operator2/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Registered SeigManager to RootChain      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=a63891…0a9d9a
INFO [01-01|00:00:00.000] Registered RootChain to SeigManager      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=f7017e…d8fa00
```

아래 명령어를 통해, 오퍼레이터2의 테스트 TON 잔고를 확인한다.

```bash
plasma-evm $ build/bin/geth staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터1 의 TON 생성과, 루트체인이 메니저 컨트랙트 등록이 정상적으로 이루어 졌다면 아래와 같이 10,000 TON 의 잔고를 확인할 수 있다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
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

### 오퍼레이터2 TON 스테이크

테스트 `TON`을 스테이크 하려면 `WTON`으로 변환한 후, `WTON`을 `depositManager` 컨트랙트에 `stake` 해주어야 한다.

실질적으로 오퍼레이터가 플라즈마 체인 운영을 위해 depositManager에 스테이크 되는 토큰은 WTON 이다.

아래 명령어를 사용하여, 1,000 TON을 WTON으로 변환한다.

> 이때 하위 명령어인 `swapFromTON` 의 입력인자로 소수점을 사용하여야 1e9(1,000,000,000 wei) 단위가 적용된다.

```bash
plasma-evm $ build/bin/geth staking swapFromTON 1000.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

`staking`의 하위 명령어인 `stake` 를 사용하여, 변환된 1,000 WTON 중 500 WTON을 스테이크 한다.

```bash
plasma-evm $ build/bin/geth staking stake 500.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510
```

## TON 커밋 보상 확인 및 인출

오퍼레이터1 또는 오퍼레이터2 가 자신의 플라즈마 체인의 블록을 진행하게 되면, 오퍼레이터의 플라즈마 클라이언트가 루트체인에 Tx 커밋을 제출한다.
이때, 각 오퍼레이터가 스테이크 하고 있는 WTON에 따라, 시뇨리지 매니저 컨트랙트에서 시뇨리지 보상이 계산된다.

### 오퍼레이터1 체인 실행

아래 명령어를 통해 프라이빗 환경의 오퍼레이터를 실행 한다.

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
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x81130ae471f536c04cc6b9901962dd5a15bb72f3924422ea051a3b0494c0fade"
```

위와 같이 오퍼레이터1 이 자기 자신에게 0 ETH를 전송하는 더미 트랜잭션을 2회 이상 입력한다.

> 오퍼레이터가 루트체인 컨트랙트 배포시 사용한 Epoch 숫자보다 많은 블록을 생성해야 루트체인에 Tx를 커밋하게 된다. 

이 예제에서 사용한 Epoch 은 2 이다.

`exit` 명령어로 `geth` console 접속을 종료 한다.

### 시뇨리지 확인

[오퍼레이터1 체인 실행](#오퍼레이터1-체인-실행) 에서 오퍼레이터1 플라즈마 체인만 루트체인에 커밋하였으므로, 오퍼레이터2는 스테이크 보상은 `Uncommited` 상태에 TON 잔고가 쌓이게 된다.

새로운 터미널에서 `staking balances` 명령어를 사용하여, 오퍼레이터2가 받은 TON의 시뇨리지 발행을 확인한다.

```bash
plasma-evm $ build/bin/geth staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x57ab89f4eabdffce316809d790d5c93a49908510

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

위 결과는 예시이며, 실제 스테이크 테스트시에는 시간에따라 시뇨리지 WTON이 계산되기 때문에 소수점자리까지 나타난다.

### 보상 인출

오퍼레이터1 의 커밋으로 인해 스테이크한 테스트 TON의 시뇨리지가 오퍼레이터1 과 오퍼레이터2 모두에게 발생하였다.

발생한 시뇨리지는 WTON 형태로 추가 발행되어 가 오퍼레이터 계정에 쌓인다.

이 예시에서는 오퍼레이터1 의 시뇨리지 받은 WTON을 인출 해보고자 한다.

먼저 인출 요청은 `staking`의 하위 명령어인 `requestWithdrawal` 을 사용한다. 510 WTON 인출을 위해 아래와 같이 입력한다.

```bash
plasma-evm $ build/bin/geth staking requestWithdrawal 510.0 \
              --datadir ./.pls.staking/operator1 \
              --rootchain.url ws://127.0.0.1:8546 \
              --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

오퍼레이터1의 WTON 잔고가 510 이상 있다면 출금 요청이 정상적으로 처리된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Withdrawal requested                     rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 amount="510.0 WTON" tx=570061…
b07f4d
```

다시 오퍼레이터1의 잔고를 확인해보면 `Pending withdrawal ..` 에 요청한 510.0 WTON 가 나타난다.

```
plasma-evm $ build/bin/geth staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
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

<!- TODO : request와 pocess 가 나뉘어 있는지에 대해 내용 보충 ->

최종 인출을 위해 `processWithdrawal` 명령어를 사용한다.

```
plasma-evm $ build/bin/geth staking processWithdrawal \
              --datadir ./.pls.staking/operator1 \
              --rootchain.url ws://127.0.0.1:8546 \
              --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

processWithDrawal 이 정상적으로 처리된 경우 잔고 확인 해보면 510 증가된 1,010 WTON 확인 가능하다.

```
plasma-evm $ build/bin/geth staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
              --datadir ./.pls.staking/operator1 \
              --rootchain.url ws://127.0.0.1:8546 \
              --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
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

## staking 하위 명령어 정리

plasma-evm 의 `geth` 는 TON 토큰을 위해 `staking` 명령어가 추가되었다.

다음은 `staking` 명령어가 지원하는 하위 명령어들과 입련 인자(Arguments) 들에 대한 정리이다.

| 하위 명령어    | 입력인자         | 단위    | 설명   |
|----------------|------------------|---------|--------|
| deployManager  | withdrawalDelay* | Int     | 스테이크된 WTON 을 언스테이크 상태로 변환하기 위해서는 `requestWithdrawal` 트랜잭션을 전송해야 한다. 해당 파라미터 숫자만큼 루트체인 블록이 진행 된 후, `requestWithdrawal` 이 처리 가능한 상태가 된다.      |
|                | seigPerBlock*    | Float   | 블록당 발생가능한 최대 시뇨리지 수. 토큰의 인플레이션에 영향을 준다. |
| deployPowerTON | roundDuration*   | Int(Seconds) | `PowerTON` 컨트랙트를 배포한다. 컨트랙트 배포에 필요한 `roundDuration` 단위는 초이다. 예를들어 `60s` 값으로 배포한 `PowerTON` 컨트랙트는 60초 주기로 미발행 TON 시뇨리지를 받아 갈 수 있는 오퍼레이터가 선정된다.
| startPowerTON  |  없음            | -       | `deployPowerTON`을 통해 배포된 `PowerTON` 컨트랙트를 활성화 시킨다.  |
| getManagers    | <파일이름>*       | string       | `--datadir` 로 입력받은 위치의 데이터베이스에서 스테이크 메니저 컨트랙트들의 주소들을 추출하여 <파일이름>.json 으로 저장한다. 대부분의 경우 스테이크 메니저 컨트랙트 배포 하위명령어인  `deployManager` 실행할때 지정한 `--datadir` 의 위치를 사용한다. |
| setManagers  |  <파일이름>*        | string       | 스테이크 메니저 컨트랙트 주소가 저장되어 있는 파일, (e,g `manager.json`), 을 읽어. 오퍼레이터의 플라즈마 체인 운영에 필요한 컨트랙트 주소들을 설정한다. 이때 사용하는 `--datadir` 의 위치는 오퍼레이터 체인데이터 위치가 된다. |
| register    |  없음            | -       | 오퍼레이터가 TON 의 시뇨리지를 받기 위해서 시뇨리지 컨트랙트에 자신의 루트체인 주소를 등록해야 한다. `--datadir` 을 오퍼레이터 데이터 위치하여야 하며, 해당 위치에 `setManagers`를 통해 스테이크 메니저 컨트랙트 정보들을 이미 설정해 두어야 한다. |
| balances   |  address*         | address       | 입력인자로 입력한 주소가 가지고 있는 `TON`, `WTON`, `staked WTON(==deposit)`, `reward WTON(==(Un)Comitted)` 등과 같은 정보를 출력한다. |
| mintTON  |  amount*            | Float or Int       | 테스트를 위해 임의로 입력한 `amount` 만큼의 TON을 생성할 수 있다.  |
| swapFromTON  |  amount*            | Float or Int       | `WTON`을 `TON` 으로 변환하는 트랜잭션을 전송한다. `WTON` 으로 변환할 `TON`의 수량을 입력인자로 사용한다. 오퍼레이터 주소는 `--operator` 플래그로 지정한다.   |
| swapToTON  |  amount*            | Float or Int       | `TON`을 `WTON` 으로 변환하는 트랜잭션을 전송한다. `TON` 으로 변환할 `WTON`의 수량을 입력인자로 사용한다. 오퍼레이터 주소는 `--operator` 플래그로 지정한다. |
| stake  |  amount*            | Float or Int  | TON의 시뇨리지를 받기 위해 `WTON`을 스테이크 해야 한다. 오퍼레이터가 가지고 있는 `amount`의 만큼의 `WTON`을 스테이크 상태로 변환한다. 이때 오퍼레이터 주소는 `--operator` 로 지정한다. |
| requestWithdrawal  |  amount*            | Float or Int       | 스테이크 상태의 `WTON` 을 언스테이크 상태로 전환하는 트랜잭션을 전송한다. 오퍼레이터 주소는 `--operator` 플래그로 지정한다. 언스테이크 요청(i.e requestWithdrawal) 은 `depositManager` 에서 설정한 `withdrawalDelay` 만큼의 블록이 진행된 이후 처리가능한 상태가 된다. |
| processWithdrawal  | numRequests         | Int       | `requestWithdrawal` 을 통해 등록된 `WTON` 언스테이크를 완료 시킨다. 입력인자 미입력시 완료 가능한 모든 `requestWithdrawal` 이 처리 된다. |

> 입력인자에 `*` 가 붙은경우 필수 입력 인자이다.

> `amount` 입력값이 소수점이 아닌경우 1e9 단위가 적용되지 않는다.
