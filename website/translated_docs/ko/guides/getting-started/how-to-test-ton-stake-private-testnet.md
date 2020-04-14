---
id: private-testnet-staking
title: Staking Test in Private Testnet
sidebar_label: Private Testnet Staking test
---

이 문서는 프라이빗 테스트 루트체인에서 두 오퍼레이터가 TON 토큰을 스테이킹/언스테이킹하는 테스트 시나리오를 다루고 있다.

> 일반 사용자의 경우 [dashboard](https://dashboard.faraday.tokamak.network)를 사용을 권장한다.

더하여 이어지는 테스트는 [루트체인 설정](how-to-open-private-testnet-rootchain)과 [자식체인 설정](how-to-open-private-testnet-manually)과정을 동일한 머신에서 이미 수행한 상태를 가정하고 있다. 그리고 이 과정에서 만들어진 오퍼레이터 노드를 여기서 편의상 `오퍼레이터 노드1`로 칭한다.

> 이때, [사용자 노드 설정](how-to-open-private-testnet-manually#사용자-노드-설정) 과정에서의 사용자 노드는 동작하지 않아도 된다.

## 오퍼레이터 TON 스테이킹

### 테스트 TON 생성

[루트체인 설정](how-to-open-private-testnet-rootchain)을 통해 [TON 스테이크 매니저 컨트랙트 배포](how-to-open-private-testnet-rootchain#ton-스테이크-매니저-컨트랙트-배포)과정을 마쳤다면 `DepositManager` 컨트랙트가 이미 루트체인에 올라가 있을것이다. 이제 스테이킹에 참가할 오퍼레이터들에게 테스트용 TON을 조금 나눠주자.

이 테스트 시나리오는 두 오퍼레이터가 스테이킹 하는 상황을 가정한다. 이미 만들어진 `오퍼레이터1`과 앞으로 만들어질 `오퍼레이터2`의 계정 주소는 다음과 같다.

- 오퍼레이터1 : `0x3cd9f729c8d882b851f8c70fb36d22b391a288cd`
- 오퍼레이터2 : `0x57ab89f4eabdffce316809d790d5c93a49908510`

아래 명령은 각각의 오퍼레이터에게 10,000 TON의 잔액을 만들어준다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking mintTON 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd 10000.0 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7
```

```bash
plasma-evm $ build/bin/geth --nousb manage-staking mintTON 0x57ab89f4eabdffce316809d790d5c93a49908510 10000.0 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7
```

### TON 잔고 확인

오퍼레이터1의 테스트용 TON 잔고를 확인해보자.

```bash
plasma-evm $ build/bin/geth --nousb staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

`오퍼레이터1`에 대한 테스트 TON 생성 및 루트체인이 매니저 컨트랙트 등록이 정상적으로 이루어 졌다면 아래와 같이 10,000 TON의 잔고가 만들어졌음을 확인할 수 있다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] TON Balance                              amount="10000.0 TON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] WTON Balance                              amount="0 WTON"      depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Deposit                                  amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Total Stake                              amount="0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9
INFO [01-01|00:00:00.000] Uncommitted Stake                         amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Committed Stake                           amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```

### 오퍼레이터1 TON 스테이킹

#### 방법 1 : TON -> WTON -> Stake

이 테스트 방법은 `TON`을 `WTON`으로 변환한 후, 변환된 `WTON`을 `depositManager` 컨트랙트에 스테이킹 하는 과정을 담고 있다.

실질적으로 오퍼레이터가 플라즈마 체인 운영을 위해 `depositManager`에 스테이킹 되는 토큰은 WTON이다.

아래 명령릏 이용하여 1,000 TON을 WTON으로 변환한다.

> 이때 하위 명령어인 `swapFromTON` 의 입력인자로 소수점(.0)을 사용하여야 1e9(1,000,000,000 wei) 단위가 적용된다.

```bash
plasma-evm $ build/bin/geth --nousb staking swapFromTON 1000.0 \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd

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

`staking`의 하위 명령어인 `stakeWTON`을 사용하여, 변환된 1,000 WTON 중 500 WTON을 스테이킹 한다.

```bash
plasma-evm $ build/bin/geth --nousb staking stakeWTON 500.0 \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

#### 방법 2 : TON -> Stake

`stakeTON` 명령을 이용하면 TON을 WTON으로 스왑하지 않고 더 간편하게 스테이킹 하는것도 가능하다.

```bash
plasma-evm $ build/bin/geth --nousb staking stakeTON 500.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

### 오퍼레이터2 체인 설정 및 스테이킹 주소 설정

`오퍼레이터1` 설정을 마쳤으니, 이제 테스트를 위한 두번째 노드인 `오페레이터2`를 구동시켜보자.

`오퍼레이터2`가 만들어지는 과정은 [자식체인 설정](https//docs.tokamak.network/docs/ko/guides/getting-started/how-to-open-private-testnet-manually##오퍼레이터1-노드-설정)에서 진행했던 오퍼레이터 설정 과정과 거의 동일하다. 다만 네트워크 분리를 위해 몇몇의 파라미터가 변경되어야 한다.

`deploy` 명령을 이용하여 오퍼레이터2 실행에 필요한 컨트랙트를 루트체인에 배포한다.

```bash
plasma-evm $ build/bin/geth --nousb deploy ./.pls.staking/operator2/operator2_genesis.json 103 true 2 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

`오퍼레이터2`가 배포한 `rootchain contract` 정보가 포함되어 있는 `operator2_genesis.json` 파일을 통해 `오퍼레이터2`의 플라즈마 체인을 초기화 한다.

```bash
plasma-evm $ build/bin/geth --nousb init ./.pls.staking/operator2/operator2_genesis.json  \
            --datadir ./.pls.staking/operator2  \
            --rootchain.url ws://127.0.0.1:8546
```

아래 `manage-staking`의 하위 명령어인 `setManagers` 사용하여 `오퍼레이터2`의 플라즈마 체인 운영에 필요한 스테이크 컨트랙트 주소를 설정한다.

```bash
plasma-evm $ build/bin/geth manage-staking setManagers manager.json  \
            --datadir ./.pls.staking/operator2
```

`manage-staking`의 하위 명령어인 `getManagers` 를 실행하여 오퍼레이터1 체인데이터에 스테이크 컨트랙트 정보가 등록되어 있는지 확인한다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking getManagers --datadir ./.pls.staking/operator2
```

### 오퍼레이터2 루트체인 등록 및 TON 잔고 확인

`오퍼레이터2`가 설정한 플라즈마 체인의 루트체인 주소를 스테이크 매니저 컨트랙트에 등록하여 스테이킹 시뇨리지를 받을 수 있게 한다.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking register \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

`오퍼레이터2`의 루트체인 컨트랙트가 정상적으로 등록되면 아래와 같이 출력된다.

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
plasma-evm $ build/bin/geth --nousb staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

`오퍼레이터2`의 TON 생성 및 루트체인 컨트랙트가 매니저 컨트랙트에 등록이 정상적으로 이루어 졌다면 아래와 같이 10,000 TON 의 잔고를 확인할 수 있다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] TON Balance                              amount="10000.0 TON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] WTON Balance                              amount="0 WTON"      depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Deposit                                  amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Total Stake                              amount="500.0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9
INFO [01-01|00:00:00.000] Uncommitted Stake                         amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Committed Stake                           amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```

### 오퍼레이터2 TON 스테이킹

테스트 `TON`을 스테이크 하려면 `WTON`으로 변환한 후, `WTON`을 `depositManager` 컨트랙트에 `stake` 해주어야 한다.

실질적으로 오퍼레이터가 플라즈마 체인 운영을 위해 depositManager에 스테이크 되는 토큰은 WTON 이다.

아래 명령어를 사용하여 1,000 TON을 WTON으로 변환한다.

> 이때 하위 명령어인 `swapFromTON` 의 입력인자로 소수점을 사용하여야 1e9(1,000,000,000 wei) 단위가 적용된다.

```bash
plasma-evm $ build/bin/geth --nousb staking swapFromTON 1000.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

`staking`의 하위 명령어인 `stake`를 사용하여, 변환된 1,000 WTON 중 500 WTON을 스테이킹 한다.

```bash
plasma-evm $ build/bin/geth --nousb staking stakeWTON 500.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

또는, 위 두 과정을 `stakeTON` 명령어로 한번에 처리 할 수 있다.

```bash
plasma-evm $ build/bin/geth --nousb staking stakeTON 500.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

## TON 커밋 보상 확인 및 인출

`오퍼레이터1` 또는 `오퍼레이터2` 각각이 플라즈마 체인 블록을 만드는 과정에서 이 오퍼레이터들은 각자의 블록의 루트해시를 모아 루트체인에 커밋 tx를 만들어낸다.

이때, 각 오퍼레이터가 스테이킹 하고 있는 WTON양에 따라, 시뇨리지 매니저 컨트랙트에서 시뇨리지 보상이 계산된다.

### 오퍼레이터1 체인 실행 및 더미 트랜잭션 생성

토카막 네트워크는 독특한 구조적 특징으로 인해, 트랜잭션이 만들어지지 않는다면 블록의 높이가 높아지지 않는다. 그리고 스테이킹 테스트를 위해서는 일정한 블록 높이의 에폭(Epoch)을 지나야 한다. 따라서 이 과정은 몇 개의 더미 트랜잭션(Dummy Transaction)을 만들어내어 플라즈마 블록을 인위적으로 쌓는데에 그 목적이 있다.

아래 명령어를 통해 프라이빗 환경의 오퍼레이터를 실행 한다.

> 만약 [자식체인 설정](https//docs.tokamak.network/docs/ko/guides/getting-started/how-to-open-private-testnet-manually##오퍼레이터1-노드-설정)을 통해 이미 오퍼레이터노드1이 동작중이라면 아래의 명령은 실행하지 않아도 된다.

```bash
plasma-evm $ build/bin/geth --nousb \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

새로운 터미널에서 `오퍼레이터1`의 콘솔로 접속한다.

```bash
plasma-evm $ build/bin/geth attach --datadir ./.pls.staking/operator1
```

`geth attach` 를 실행하면, geth의 javasciprt console에 접속된다.

console에 `eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})` 입력하여 임의의 Tx를 생성하여 블록을 진행시킨다.

```javascript
> web3.eth.accounts
["0x3cd9f729c8d882b851f8c70fb36d22b391a288cd"]
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x0a65e80eb105c448ffa1ca50430dc1d3f4b0da14ad1d4793a43ed36b6df0959c"
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x81130ae471f536c04cc6b9901962dd5a15bb72f3924422ea051a3b0494c0fade"
```

위와 같이 오퍼레이터1 이 자기 자신에게 0 ETH를 전송하는 더미 트랜잭션을 2회 이상 입력한다.

> 오퍼레이터가 루트체인 컨트랙트 배포시 사용한 Epoch 숫자보다 많은 블록을 생성해야 루트체인에 Tx를 커밋하게 된다. 현재 에폭(Epoch)값은 2이므로 2개의 더미 트랜잭션을 생성하였다.

이 예제에서 사용한 Epoch 은 `2` 이다.

`exit` 명령어로 `geth` console 접속을 종료 한다.

### 시뇨리지 확인

[오퍼레이터1 체인 실행](#오퍼레이터1-체인-실행) 에서 오퍼레이터1 플라즈마 체인만 루트체인에 커밋하였으므로, 오퍼레이터2는 스테이킹 보상은 `Uncommited` 상태에 TON 잔고가 쌓이게 된다.

새로운 터미널에서 `staking balances` 명령어를 사용하여, 오퍼레이터2가 받은 TON의 시뇨리지 발행량을 확인할 수 있다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator2/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator2/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] WTON Balance                              amount="500.0 WTON" depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Deposit                                  amount="500.0 WTON" rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON"     rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Total Stake                              amount="1100.0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="1100.0 WTON"  rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080
INFO [01-01|00:00:00.000] Uncommitted Stake                         amount="100.0 WTON"    rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Committed Stake                           amount="500.0 WTON"  rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 depositor=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
```

위 결과는 예시이며, 실제 테스트시에는 경과 시간에 따라 시뇨리지 WTON이 계산되기 때문에 소수점까지 사용하는 다양한 스테이킹 보상 수치를 확인할 수 있을것이다.

### 보상 인출

`오퍼레이터1`이 커밋을 했기 때문에 스테이킹된 테스트 TON의 시뇨리지는 `오퍼레이터1`과 `오퍼레이터2` 모두에게 발생하였다.

발생한 시뇨리지는 WTON 형태로 오퍼레이터 계정에 쌓인다.

이 과정은 `오퍼레이터1`이 받은 시뇨리지에 대한 인출 과정을 담고있다.

TON의 인출을 위해서는 `staking`의 하위 명령어인 `requestWithdrawal`을 사용한다. 510 WTON 인출을 위해 아래와 같이 입력한다.

```bash
plasma-evm $ build/bin/geth --nousb staking requestWithdrawal 510.0 \
              --datadir ./.pls.staking/operator1 \
              --rootchain.url ws://127.0.0.1:8546 \
              --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
              --password pwd.pass \
              --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

`오퍼레이터1`의 WTON 잔고가 510 이상 있다면 출금 요청이 정상적으로 처리된다.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Withdrawal requested                     rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 amount="510.0 WTON" tx=570061…
b07f4d
```

다시 오퍼레이터1의 잔고를 확인해보면 `Pending withdrawal ..` 에 요청한 510.0 WTON이 나타난다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] WTON Balance                              amount="500.0 WTON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Deposit                                  amount="500.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=1
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="510.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Uncommitted Stake                         amount="0 WTON"                                rootchain=0x17FB80e2E16b02faC9369334
24305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Committed Stake                           amount="10 WTON"                                rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```

최종 인출을 위해 `processWithdrawal` 명령어를 사용한다.

```bash
plasma-evm $ build/bin/geth --nousb staking processWithdrawal \
              --datadir ./.pls.staking/operator1 \
              --rootchain.url ws://127.0.0.1:8546 \
              --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
              --password pwd.pass \
              --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

`processWithDrawal`이 정상적으로 처리된 이후에 잔고가 510WTON이 증가된 1,010 WTON으로 늘어난 것을 확인할 수 있다.

```bash
plasma-evm $ build/bin/geth --nousb staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd

INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] cfg.Node.DataDir                         v=.pls.staking/operator1/geth/genesis.json
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] TON Balance                              amount="9000.0 TON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] WTON Balance                              amount="1010.0 WTON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Deposit                                  amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Uncommitted Stake                         amount="0 WTON"                                rootchain=0x17FB80e2E16b02faC9369334
24305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Committed Stake                           amount="0 WTON"                                rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```

## 하위 명령어 정리

plasma-evm 의 `geth` 는 TON 스테이킹 기능을 위해 `manage-staking` 과 `staking` 명령어가 추가되었다.

### `manage-staking` 하위 명령어

다음은 `manage-staking` 명령어가 지원하는 하위 명령어들과 입련 인자(Arguments)들을 정리하고 있다.

| Sub-command    | Argument        | Unit    | Describes   |
|----------------|------------------|---------|--------|
| deployManager  | withdrawalDelay* | Int     | 스테이킹된 WTON 을 언스테이크 상태로 변환하기 위해서는 `requestWithdrawal` 트랜잭션을 전송해야 한다. 해당 파라미터 숫자만큼 루트체인 블록이 진행 된 후, `requestWithdrawal` 이 처리 가능한 상태가 된다. |
|                | seigPerBlock*    | Float   | 블록당 발생가능한 최대 시뇨리지 수. 토큰의 인플레이션에 영향을 준다. |
| deployPowerTON | roundDuration*   | Int(Seconds) | `PowerTON` 컨트랙트를 배포한다. 컨트랙트 배포에 필요한 `roundDuration` 단위는 초이다. 예를들어 `60s` 값으로 배포한 `PowerTON` 컨트랙트는 60초 주기로 미발행 TON 시뇨리지를 받아 갈 수 있는 오퍼레이터가 선정된다. |
| startPowerTON  |  없음            | -       | `deployPowerTON`을 통해 배포된 `PowerTON` 컨트랙트를 활성화 시킨다. |
| getManagers    | 파일이름    | string       | `--datadir` 로 입력받은 위치의 데이터베이스에서 스테이크 매니저 컨트랙트들의 주소들을 추출하여 <파일이름>.json 으로 저장한다. 대부분의 경우 스테이크 매니저 컨트랙트 배포 하위명령어인  `deployManager` 실행할때 지정한 `--datadir` 의 위치를 사용한다.  |
| setManagers  |  파일이름*      | string       | 스테이크 매니저 컨트랙트 주소가 저장되어 있는 파일, (e,g `manager.json`), 을 읽어. 오퍼레이터의 플라즈마 체인 운영에 필요한 컨트랙트 주소들을 설정한다. 이때 사용하는 `--datadir` 의 위치는 오퍼레이터 체인데이터 위치가 된다. |
| register    |  없음            | -       | 오퍼레이터가 TON 의 시뇨리지를 받기 위해서 시뇨리지 컨트랙트에 자신의 루트체인 주소를 등록해야 한다. `--datadir` 을 오퍼레이터 데이터 위치하여야 하며, 해당 위치에 `setManagers`를 통해 스테이크 매니저 컨트랙트 정보들을 이미 설정해 두어야 한다.  |
| mintTON  |  amount*            | Float or Int       | 테스트를 위해 임의로 입력한 `amount` 만큼의 TON을 생성할 수 있다. |

> 입력인자에 `*` 가 붙은경우 필수 입력 인자이다.

### `staking` 하위 명령어

다음은 `staking` 명령어가 지원하는 하위 명령어들과 입력 인자(Arguments) 들에 대한 정리이다.

| Sub-command    | Argument        | Unit    | Describes   |
|----------------|------------------|---------|--------|
| balances   |  address*         | address       | 입력인자로 입력한 주소가 가지고 있는 `TON`, `WTON`, `staked WTON(==deposit)`, `reward WTON(==(Un)Committed)` 등과 같은 정보를 출력한다. |
| swapFromTON  |  amount*            | Float or Int       | `TON`을 `WTON` 으로 변환하는 트랜잭션을 전송한다. `WTON` 으로 변환할 `TON`의 수량을 입력인자로 사용한다. 대상이 되는 주소는 `--rootchain.sender` 플래그로 지정한다. |
| swapToTON  |  amount*            | Float or Int       | `WTON`을 `TON` 으로 변환하는 트랜잭션을 전송한다. `TON` 으로 변환할 `WTON`의 수량을 입력인자로 사용한다.대상이 되는 주소는 `--rootchain.sender` 플래그로 지정한다.  |
| stakeTON   |  amount*            | Float or Int  | 이 명령어는 `swapFromTON` 과 `stakeWTON` 을 하나의 명령어로 처리. 오퍼레이터가 입력한 `amount`의 만큼의 `TON`을 스테이크된 상태(staked status)로 변환한다. 이때 대상이 되는 주소는 `--rootchain.sender` 로 지정한다. |
| stakeWTON  |  amount*            | Float or Int  | TON의 시뇨리지를 받기 위해 `WTON`을 스테이크 해야 한다. 오퍼레이터가 입력한 `amount`의 만큼의 `WTON`을 스테이크된 상태로 변환한다. 이때 대상이 되는 주소는 `--rootchain.sender` 로 지정한다. |
| requestWithdrawal  |  amount*            | Float or Int       | 스테이크된 상태의 `WTON` 을 언스테이크 상태로 전환하는 트랜잭션을 전송한다. 대상이 되는 주소는 `--rootchain.sender` 플래그로 지정한다. 언스테이크 요청(i.e requestWithdrawal) 은 `depositManager` 에서 설정한 `withdrawalDelay` 만큼의 블록이 진행된 이후 처리가능한 상태가 된다. |
| processWithdrawal  | numRequests         | Int       | `requestWithdrawal` 을 통해 등록된 `WTON` 언스테이킹을 완료한다. 입력인자 미입력시 완료 가능한 모든 `requestWithdrawal`이 처리 된다. |

> 입력인자에 `*` 가 붙은경우 필수 입력 인자이다.

> `amount` 입력값에 소수점 붙지 않은 경우 1e9 단위가 적용되지 않는다.
