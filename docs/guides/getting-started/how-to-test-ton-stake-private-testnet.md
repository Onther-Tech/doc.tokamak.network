---
id: private-testnet-staking
title: Staking Test in Priavte Testnet
sidebar_label: Private Testnet Staking test
---

## 프라이빗 네트워크 TON 스테이크
Stake TON in Private Network

이 문서는 프라이빗 테스트 루트체인에서 두 오퍼레이터가 TON 토큰을 스테이크하는 예시를 다룬다.

In this document, We will cover to staking TON token on private testnet which is two operator exists.

문서의 대부분 `plasma-evm`의 `staking` 과 `manage-staking`에 대한 명령어 사용에 대한 것이다. 이 명령어는 개발자 및 오퍼레이터(Operator) 에게 유용한 툴이다.

Almost of this document for How to using `stakin` and `manage=staking` command in `plasma-evm`. this command is quite useful for developer and Operator.

> 일반 사용자의 경우 [dashboard](https://dashboard.faraday.tokamak.network)를 사용한다.

> For common user, Recommand to use [dashboard](https://dashboard.faraday.tokamak.network).

테스트 환경 구성은 [onther-tech/go-ethereum](https://github.com/onther-tech/go-ethereum)을 rootchain으로 사용하고, plasma-evm 은 [onther-tech/plasma-evm](https://github.com/onther-tech/plasma-evm)를 사용한다.

Setup Testing Environments with [onther-tech/go-ethereum](https://github.com/onther-tech/go-ethereum) as `rootchain` and  [onther-tech/plasma-evm](https://github.com/onther-tech/plasma-evm) as `plasma-evm`.

## TON 스테이크 컨트랙트 설정
## Setup TON stake contracts

프라이빗 테스트넷 TON 스테이크 테스트에는 한명의 매니저가 있으며, 스테이크에 참여하는 두 오퍼레이터가 있다고 가정한다.
Let assume that one manager and two operators for staking in TON staking private testnet.

매니저는 테스트 TON 토큰 및 스테이크에 관련한 컨트랙트를 배포하고 관리한다.
The manager deploy and manage contracts for TON staking.

오퍼레이터들은 자신의 플라즈마 체인을 운영하면서 TON 토큰을 스테이크, 언스테이크 한다.
The operators stakes and un-stakes TON token, also they are oprating their own plasma chain.

### Plasma-evm 소스코드 다운로드
### Source code download for Plasma-evm
동작중인 rootchain에 스테이크 관련 컨트렉트를 배포한다.
Deploy stake and other contracts to a running rootchain.

만약, 동작하고 있는 rootchain 이 없다면 [프라이빗 테스트넷 루트체인 설정하기](https://docs.tokamak.network/docs/ko/guides/getting-started/how-to-open-private-testnet-rootchain#루트-체인-설정) 수행한다.
If there is no active rootchain, please follow [Setup Rootchain in Private Testnet](https://docs.tokamak.network/docs/en/guides/getting-started/how-to-open-private-testnet-manually).

우선, 아래 명령어를 통해 `plasma-evm` 저장소 다운로드 완료 한다.
First of all, Download `plasma-evm` repository with following below commands.

```bash
$ git clone https://github.com/onther-tech/plasma-evm
$ cd plasma-evm
plasma-evm $
```

`plasma-evm` 설정에 대한 자세한 내용은, [프라이빗 테스트넷 시작 - 자식체인 설정](https://docs.tokamak.network/docs/ko/guides/getting-started/how-to-open-private-testnet-manually) 을 참고 한다.
For more details about setup `plasma-evm`, you can see [Setup Childchain in Private Testnet](https://docs.tokamak.network/docs/en/guides/getting-started/how-to-open-private-testnet-manually).

### 매니저 와 오퍼레이터 계정 생성
### Generate accounts for Manager and Operators

테스트에 필요한 계정을 생성한다.
Create accounts for test.

```bash
plasma-evm $ build/bin/geth account importKey b71c71a67e1177ad4e901695e1b4b9ee17ae16c6668d313eac2f96dbcda3f291 \
            --datadir ./.pls.staking/manager
```

테스트 편의상 빈 패스워드를 지정한다.
Press enter twice, to insert empty string password for convinient test.

```bash
INFO [03-24|15:35:42.112] Maximum peer count                       ETH=50 LES=0 total=50
INFO [03-24|15:35:42.276] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
Your new account is locked with a password. Please give a password. Do not forget this password.
Password:
Repeat password:
Address: {71562b71999873db5b286df957af199ec94617f7}
```

아래 명령어를 통해, 각 오퍼레이터 계정을 생성한다.
As following command, create accounts for two operators.

```bash
plasma-evm $ build/bin/geth account importKey bfaa65473b85b3c33b2f5ddb511f0f4ef8459213ada2920765aaac25b4fe38c5 \
            --datadir ./.pls.staking/operator1
```

```bash
plasma-evm $ build/bin/geth account importKey 067394195895a82e685b000e592f771f7899d77e87cc8c79110e53a2f0b0b8fc \
            --datadir ./.pls.staking/operator2
```

아래명령어를 사용하여 위 계정들의 암호를 저장하고 있는 `pwd.pass` 파일을 생성한다.
As following below command, create empty password file as `pwd.pass` for all accounts we created.

```bash
plasma-evm $ echo "" > pwd.pass
```

### TON 스테이크 매니저 컨트랙트 배포
### Deploy TON Stake manager contract

`deployManagers`는 `manage-staking` 명령어의 하위명령어로 매니저가 TON 토큰의 스테이킹에 대한 컨트랙트를 배포 및 관리하기 위한 기능을 가지고 있다.
`deployManagers` sub-command is in `manage-staking`, It is for deploying or management about contracts of TON staking by manager, not operator.

`deployManagers` 실행에 필요한 입력 파라미터는 `withdrawalDelay` 와 `seigPerBlock` 총 2개 이다.
`deployManagers` command required two input arguments, `withdrawalDelay` and `seigPerBlock`, to run.

입력 파라미터에 대한 설명은 다음과 같다.
The description of the input parameters is as follows.

`withdrawalDelay` : 단위는 루트체인의 블록 갯수이다. 스테이크된 WTON 을 언스테이크 상태로 변환하기 위해서는 `requestWithdrawal` 트랜잭션을 전송하고, 해당 파라미터 동안 지연된후 처리된다. 예를 들어 `10` 으로 정한경우, 스테이크 TON에 대해 `requestWithdrawal` 을 100 블록에 처리되었다면, 루트체인 110번째 이후에 `processRequest` 트랜잭션이 실행됨으로써 요청한 WTON에 대해 언-스테이크 상태가 된다.

`withdrawalDelay` : Unit is the number of blocks in rootchain. Send `requestWithdrawal` transaction in order to convert staked WTON to un-staked WTON then it can be processed after this number of blocks in rootchain. For example, Let assume that this parameter set as `10`. If the request withdrawal tx processed in 100 block in rootchain, It can be valid `processRequest` transaction for this request after 110 block in rootchain.

`seigPerBlock` : 루트체인 블록당 발생할 수 있는 시뇨리지의 최대 TON 개수. 해당 파라미터에 의해 연 인플레이션이 영향을 받는다.
`seigPerBlock` : The amount of maximum seigniorage of TON per block. This parameter is effect to total inflation of TON token.

```bash
plasma-evm $ make geth && build/bin/geth manage-staking deployManagers 10 1.5 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7
```

위 명령어를 통해 TON 스테이크에 필요한 컨트랙트가 모두 배포된다.
As following above command, All contracts for TON stake will be deployed.

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
### Deploy PowerTON contract

다음 명령어를 통해 `PowerTON` 컨트랙트를 배포한다.
Deploy `PowerTON` contract with the following command.

`dpeloyPowerTON` 입력 인자는 파워톤 라운드 시간을 의미하며, 테스트를 위해 60초로 설정한다.
An input argument of `deployPowerTON` sub-command is powerton round time. Set it 60 seconds for testing.

여기서 파워톤 라운드 시간이란, 미발행 시뇨리지를 파워톤 규칙에 의해 재분배되는 주기를 말한다. 예를들어 `60s` 로 해당 값을 설정한 경우, 미발행 시뇨리지 WTON을 받는 오퍼레이터가 매 60초 마다 정해진다.
The powerton round time refers to a cycle in which un-issued seigniorage distributed as powerton rule. For example, If it set `60s`, an operator who receives un-issued seigniorage of TON is selected every 60 seconds.

`PowerTON`에 대한 자세한 내용은 [여기]()를 참고한다.
More information about `PowerTon` in [Here]().

```bash
plasma-evm $ build/bin/geth manage-staking deployPowerTON 60s \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7
```

### 배포 컨트랙트 정보
### Information of deployed contracts

배포한 컨트랙트의 정보는 `manage-staking`의 하위 명령어인 `deployManager` 통해 `.pls.staking/manager` 에 위치한 rawdb저장된다.
The information of deployed contracts with sub-command `deployManager` of `manage-staking` command is saved in `.pls.staking/manager` as rawdb.

아래 명령어를 통해, 루트체인에 배포한 스테이크 컨트랙트 정보들을 추출하여 `manager.json` 파일로 저장한다.
As following command, Extract all information about deployed stake contract in rootchain then save in `manager.json` file.

```bash
 plasam-evm $ build/bin/geth manage-staking getManagers manager.json --datadir ./.pls.staking/manager

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
Total 6 contract addresses, include `PowerTON` contract address, are stored in `manager.json`.

## TON 스테이크 설정
## Setup TON Stake

### PowerTON 실행
### Run PowerTON

미발행 시뇨리지 분배에 대한 규칙을 가지고 있는 `PowerTON` 활성화 하려면 `staking`의 하위 명령어인 `startPowerTON`을 사용한다.
Use `startPowerTON`, a sub-command of `manage-staking`, to activate `PowerTON` which has the rule of un-issued seigniorage of TON.

아래 명령어를 실행하여 `PowerTON` 활성화 Tx를 전송한다.
As following command, Send transaction for activating `PowerTON`.

```bash
plasma-evm $ build/bin/geth manage-staking startPowerTON \
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

### 테스트 TON 생성
### Mint Test TON

[TON 스테이크 매니저 컨트랙트 배포](#ton-스테이크-컨트랙트-배포)를 수행하여 `DepositManager` 컨트랙트가 배포되었다면, 스테이크에 참가할 오퍼레이터들에게 테스트용 TON을 생성해주어야 한다.
For this testing, have to mint test TON to each Operator who attend `stake` If `DepositManager` contract deployed as follow [Deploy TON Stake manager contract](#deploy-ton-stake-manager-contract).

테스트 토카막 네트워크 에서 두 오퍼레이터 상황을 가정하였다, 따라서 오퍼레이터1 과 오퍼레이터2 는 아래의 계정을 사용한다.
In this private testnet, we assumed that two operators are exist. Operator1 and Operator2 use following accounts.

- Operator1 : `0x3cd9f729c8d882b851f8c70fb36d22b391a288cd`
- Operator2 : `0x57ab89f4eabdffce316809d790d5c93a49908510`

아래 명령어를 통해 각각 오퍼레이터에게 10,000 TON을 생성한다.
As following command, Mint 10,000 TON to each Operator.

```bash
plasma-evm $ build/bin/geth manage-staking mintTON 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd 10000.0 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7
```

```bash
plasma-evm $ build/bin/geth manage-staking mintTON 0x57ab89f4eabdffce316809d790d5c93a49908510 10000.0 \
            --datadir ./.pls.staking/manager \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x71562b71999873DB5b286dF957af199Ec94617F7 \
            --password pwd.pass \
            --rootchain.sender 0x71562b71999873DB5b286dF957af199Ec94617F7
```

## 오퍼레이터 TON 스테이크
## Operator stake TON

오퍼레이터1 과 오퍼레이터2 는 각각 10,000 TON을 가지고 있다.
Operator1 and Operator2 have 10,000 TON in the private testnet.

오퍼레이터의 플라즈마 체인을 설정 이후, 스테이크 메니저 컨트랙트에 각 오퍼레이터의 루트체인 컨트랙트 주소를 등록 해야 한다.
After setup operator plasma chain, Operator must register an address of rootchain to stake manager contract.

### 오퍼레이터1 체인 설정 및 스테이크 주소 설정
### Setup operator1 plasma chain and set stake contract address

`deploy` 명령어를 사용하여 오퍼레이터1 실행에 필요한 컨트랙트를 루트체인에 배포한다.
Use `deploy` command to deploy rootchain contracts for running operator1 plasma chain.

```bash
plasma-evm $ build/bin/geth deploy ./.pls.staking/operator1/operator1_genesis.json 1021 true 2 \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

오퍼레이터1 이 배포한 `rootchain` 컨트랙트 정보가 포함되어 있는 `operator1_genesis.json` 파일을 통해 플라즈마 체인을 초기화 한다.
As following command, Initialize the plasma chain with `operator1_genesis.json` file including an address of `rootchain` contract deployed by Operator1.

```bash
plasma-evm $ build/bin/geth init ./.pls.staking/operator1/operator1_genesis.json  \
            --datadir ./.pls.staking/operator1  \
            --rootchain.url ws://127.0.0.1:8546
```

아래 `manage-staking`의 하위 명령어인 `setManagers` 를 사용하여 오퍼레이터1의 플라즈마 체인 운영에 필요한 스테이크 컨트랙트 주소를 설정한다.
Using `setManagers` sub-command of `manage-staking`, Set the stake contract addresses for running Operator1's plasma chain.

```bash
plasma-evm $ build/bin/geth manage-staking setManagers manager.json  \
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

`manage-staking`의 하위 명령어인 `getManagers` 를 실행하여 오퍼레이터1 체인데이터에 스테이크 컨트랙트 정보가 등록되어 있는지 확인한다.
Check the information of stake contract addresses with `getManagers` sub-command of `manage-staking` in Operator1 chaindata.

```bash
plasma-evm $ build/bin/geth manage-staking getManagers --datadir ./.pls.staking/operator1
```

### 오퍼레이터1 루트체인 등록 및 TON 잔고 확인
### Register operator1 rootchain contract and Check TON balance

오퍼레이터1 이 설정한 플라즈마 체인의 루트체인 주소를 스테이크 매니저 컨트랙트에 등록하여 스테이크 시뇨리지를 받을 수 있게 한다.
Make to receive stake seigniorage of TON with register an address of rootchain which setup by Operator1 to the stake manager contract.

```bash
plasma-evm $ build/bin/geth manage-staking register \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

오퍼레이터1 의 루트체인 컨트랙트가 정상적으로 등록되면 아래와 같이 출력된다.
If sucessfully registered the rootchain address, output as follows.

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
As following command, Check test TON balance of Operator1.

```bash
plasma-evm $ build/bin/geth staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

오퍼레이터1 의 테스트 TON 생성과, 루트체인이 메니저 컨트랙트 등록이 정상적으로 이루어 졌다면 아래와 같이 10,000 TON 의 잔고를 확인할 수 있다.
If minted test TON and registered the address of rootchain in manager contract are sucessful, The balance of Operator1's TON as follows.

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
### Operator1 stake TON

테스트 `TON`을 스테이크 하려면 `WTON`으로 변환한 후, `WTON`을 `depositManager` 컨트랙트에 `stake` 해주어야 한다.
To stake test `TON`, have to convert it to `WTON`. then can be staked in `depositManager` contract.

실질적으로 오퍼레이터가 플라즈마 체인 운영을 위해 `depositManager`에 스테이크 되는 토큰은 WTON 이다.
Actually, Operator can stake only `WTON` to `depositManager` for operating plasma chain.

아래 명령어를 사용하여 1,000 TON을 WTON으로 변환한다.
As following command, Convert 1,000 TON into WTON.

> 이때 하위 명령어인 `swapFromTON` 의 입력인자로 소수점을 사용하여야 1e9(1,000,000,000 wei) 단위가 적용된다.
> Applying 1e9(1,000,000,000 wei) unit only when the decimal point is used as the input argument of `swapFromTON` sub-command.

```bash
plasma-evm $ build/bin/geth staking swapFromTON 1000.0 \
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

`staking`의 하위 명령어인 `stake` 를 사용하여, 변환된 1,000 WTON 중 500 WTON을 스테이크 한다.
Stake 500 WTON of 1,000 WTON converted with using `stake` sub-command of `staking`.

```bash
plasma-evm $ build/bin/geth staking stake 500.0 \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

### 오퍼레이터2 체인 설정 및 스테이크 주소 설정
### Setup operator2 plasma chain and set stake contract address

`deploy` 명령어를 사용하여 오퍼레이터2 실행에 필요한 컨트랙트를 루트체인에 배포한다.
Use `deploy` command to deploy rootchain contracts for running operator2 plasma chain.

```bash
plasma-evm $ build/bin/geth deploy ./.pls.staking/operator2/operator2_genesis.json 1021 true 2 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터2 이 배포한 `rootchain` 컨트랙트 정보가 포함되어 있는 `operator2_genesis.json` 파일을 통해 플라즈마 체인을 초기화 한다.
As following command, Initialize the plasma chain with `operator2_genesis.json` file including an address of rootchain contract deployed by Operator2.

```bash
plasma-evm $ build/bin/geth init ./.pls.staking/operator2/operator2_genesis.json  \
            --datadir ./.pls.staking/operator2  \
            --rootchain.url ws://127.0.0.1:8546
```

아래 `manage-staking`의 하위 명령어인 `setManagers` 사용하여 오퍼레이터2의 플라즈마 체인 운영에 필요한 스테이크 컨트랙트 주소를 설정한다.
Using `setManagers` sub-command of `manage-staking`, Set the stake contract addresses for running Operator2's plasma chain.

```bash
plasma-evm $ build/bin/geth manage-staking setManagers manager.json  \
            --datadir ./.pls.staking/operator2
```

`manage-staking` 의 하위 명령어인 `getManagers` 를 실행하여 오퍼레이터1 체인데이터에 스테이`크 컨트랙트 정보가 등록되어 있는지 확인한다.

Check the information of stake contract addresses with `getManagers` sub-command of `manage-staking` in Operator2 chaindata.

```bash
plasma-evm $ build/bin/geth manage-staking getManagers --datadir ./.pls.staking/operator2
```

### 오퍼레이터2 루트체인 등록 및 TON 잔고 확인
### Register operator2 rootchain contract and Check TON balance

오퍼레이터2 이 설정한 플라즈마 체인의 루트체인 주소를 스테이크 매니저 컨트랙트에 등록하여 스테이크 시뇨리지를 받을 수 있게 한다.
Make to receive stake seigniorage of TON with register an address of rootchain which setup by Operator2 to the stake manager contract.

```bash
plasma-evm $ build/bin/geth manage-staking register \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터2 의 루트체인 컨트랙트가 정상적으로 등록되면 아래와 같이 출력된다.
If sucessfully registered the rootchain address, output as follows.

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
As following command, Check test TON balance of Operator2.

```bash
plasma-evm $ build/bin/geth staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

오퍼레이터2 의 TON 생성과, 루트체인이 메니저 컨트랙트 등록이 정상적으로 이루어 졌다면 아래와 같이 10,000 TON 의 잔고를 확인할 수 있다.
If minted test TON and registered the address of rootchain in manager contract are sucessful, The balance of Operator2's TON as follows.

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
INFO [01-01|00:00:00.000] Total Stake                              amount="500.0 WTON"
INFO [01-01|00:00:00.000] Total Stake of Root Chain                amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Comitted Stake                           amount="0 WTON"      rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```

### 오퍼레이터2 TON 스테이크
### Operator2 stake TON

테스트 `TON`을 스테이크 하려면 `WTON`으로 변환한 후, `WTON`을 `depositManager` 컨트랙트에 `stake` 해주어야 한다.
To stake test `TON`, have to convert it to `WTON`. then can be staked in `depositManager` contract.

실질적으로 오퍼레이터가 플라즈마 체인 운영을 위해 depositManager에 스테이크 되는 토큰은 WTON 이다.
Actually, Operator can stake only `WTON` to `depositManager` for operating plasma chain.

아래 명령어를 사용하여, 1,000 TON을 WTON으로 변환한다.
As following command, Convert 1,000 TON into WTON.

> 이때 하위 명령어인 `swapFromTON` 의 입력인자로 소수점을 사용하여야 1e9(1,000,000,000 wei) 단위가 적용된다.
> Applying 1e9(1,000,000,000 wei) unit only when the decimal point is used as the input argument of `swapFromTON` sub-command.

```bash
plasma-evm $ build/bin/geth staking swapFromTON 1000.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

`staking`의 하위 명령어인 `stake` 를 사용하여, 변환된 1,000 WTON 중 500 WTON을 스테이크 한다.
Stake 500 WTON of 1,000 WTON converted with using `stake` sub-command of `staking`.

```bash
plasma-evm $ build/bin/geth staking stake 500.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

## TON 커밋 보상 확인 및 인출
## Check TON commit rewards and withdrawal

오퍼레이터1 또는 오퍼레이터2 가 자신의 플라즈마 체인의 블록을 진행하게 되면, 오퍼레이터의 플라즈마 클라이언트가 루트체인에 Tx 커밋을 제출한다.
Operator client is going to submit an Tx commit to rootchain when Operator proceeds mining child chain block.

이때, 각 오퍼레이터가 스테이크 하고 있는 WTON에 따라, 시뇨리지 매니저 컨트랙트에서 시뇨리지 보상이 계산된다.
At this time, Seigniorage rewards of TON will be calculated as follow how much `WTON` staked by each operator in the seigniorage manager contract.

### 오퍼레이터1 체인 실행
### Run Operator1 chain

아래 명령어를 통해 프라이빗 환경의 오퍼레이터를 실행 한다.
As following command, Run Opreator1 node in private network.

```bash
plasma-evm $ build/bin/geth \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

새로운 터미널에서 오퍼레이터1의 콘솔에 접속한다.
Connect a console of Operator1's node from new terminal with following command.

```bash
plasma-evm $ build/bin/geth attach --datadir ./.pls.staking/operator1
```

`geth attach` 를 실행하면, geth의 javasciprt console에 접속된다.
Run command with `geth attach` then connect javascript console of geth.

console에 `eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})` 입력하여 임의의 Tx를 생성하여 블록을 진행시킨다.
To proceed operator1's child chain,  Send dummy tx insert with `eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})` command into console.

```javascript
> web3.eth.accounts
["0x3cd9f729c8d882b851f8c70fb36d22b391a288cd"]
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x0a65e80eb105c448ffa1ca50430dc1d3f4b0da14ad1d4793a43ed36b6df0959c"
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x81130ae471f536c04cc6b9901962dd5a15bb72f3924422ea051a3b0494c0fade"
```

위와 같이 오퍼레이터1 이 자기 자신에게 0 ETH를 전송하는 더미 트랜잭션을 2회 이상 입력한다.
Send dummy transaction, with 0 ETH to itself, More than twice.

> 오퍼레이터가 루트체인 컨트랙트 배포시 사용한 Epoch 숫자보다 많은 블록을 생성해야 루트체인에 Tx를 커밋하게 된다.
> For sending commit Tx in rootchain, Have to mine blocks more than `Epoch` number which used in deploying rootchain contract by Operator.

이 예제에서 사용한 Epoch 은 2 이다.
The Epoch Number is `2` used in this example.

`exit` 명령어로 `geth` console 접속을 종료 한다.
Close console connection with sending `exit` command at console.

### 시뇨리지 확인
### Check seigniorage

[오퍼레이터1 체인 실행](#오퍼레이터1-체인-실행) 에서 오퍼레이터1 플라즈마 체인만 루트체인에 커밋하였으므로, 오퍼레이터2는 스테이크 보상은 `Uncommited` 상태에 TON 잔고가 쌓이게 된다.
Operator2 stake rewards has increased as `Uncommited` status because only operator1 chain proceed at [Run Operator1 chain](#run-perator1-chain).

새로운 터미널에서 `staking balances` 명령어를 사용하여, 오퍼레이터2가 받은 TON의 시뇨리지 발행을 확인한다.
In new terminal, Check Operator2 rewards of staked TON with using `staking balances`, like as following.

```bash
plasma-evm $ build/bin/geth staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
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
The above result is an example(modified). Actual seigniorage WTON number will be float, the numbers with under decimal point, because it calculated by timestamp of block in rootchain.

### 보상 인출
### Withdrawal rewards

오퍼레이터1 의 커밋으로 인해 스테이크한 테스트 TON의 시뇨리지가 오퍼레이터1 과 오퍼레이터2 모두에게 발생하였다.
Both Operator1 and Operator2 are received rewards of seigniorage of staked TON due to Operator1 tx commit.

발생한 시뇨리지는 WTON 형태로 추가 발행되어 가 오퍼레이터 계정에 쌓인다.
The rewards is additionally issued in `WTON` for each operator account.

이 예시에서는 오퍼레이터1 의 시뇨리지 받은 WTON을 인출 해보고자 한다.
In this part, we are going to withdraw `WTON` including the seigniorage of staked in Operator1.

먼저 인출 요청은 `staking`의 하위 명령어인 `requestWithdrawal` 을 사용한다. 510 WTON 인출을 위해 아래와 같이 입력한다.
For withdraw 510 WTON, use `requestWithdrawal` sub-command of `staking` for request withdrwaing as following.

```bash
plasma-evm $ build/bin/geth staking requestWithdrawal 510.0 \
              --datadir ./.pls.staking/operator1 \
              --rootchain.url ws://127.0.0.1:8546 \
              --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
              --password pwd.pass \
              --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

오퍼레이터1의 WTON 잔고가 510 이상 있다면 출금 요청이 정상적으로 처리된다.
If Operator1 has 510 WTON or more, the withdraw request is successfully processed.

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
And re-check Operator1 balance, you can see the amount of 510 WTON in a line start with `Pending withdrawal ..`.

```bash
plasma-evm $ build/bin/geth staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
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
INFO [01-01|00:00:00.000] WON Balance                              amount="500.0 WTON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Deposit                                  amount="500.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=1
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="510.0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON"                                rootchain=0x17FB80e2E16b02faC9369334
24305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Comitted Stake                           amount="10 WTON"                                rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```

최종 인출을 위해 `processWithdrawal` 명령어를 사용한다.
To finalize withdrawal request, use `processWithdrawal` sub-command as follow.

```bash
plasma-evm $ build/bin/geth staking processWithdrawal \
              --datadir ./.pls.staking/operator1 \
              --rootchain.url ws://127.0.0.1:8546 \
              --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
              --password pwd.pass \
              --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

`processWithDrawal` 이 정상적으로 처리된 경우 잔고 확인 해보면 510 증가된 1,010 WTON 확인 가능하다.
If `processWithDrawal` tx is successfully processed, then you can check 1,010 WTON in `WTON Balance` in result of using `balances`.

```bash
plasma-evm $ build/bin/geth staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
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
INFO [01-01|00:00:00.000] WON Balance                              amount="1010.0 WTON" depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Deposit                                  amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Pending withdrawal requests              num=0
INFO [01-01|00:00:00.000] Pending withdrawal WTON                  amount="0 WTON" rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Uncomitted Stake                         amount="0 WTON"                                rootchain=0x17FB80e2E16b02faC9369334
24305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Comitted Stake                           amount="0 WTON"                                rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 depositor=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
```

## staking 하위 명령어 정리
## Appendix  `staking` sub-commands 

plasma-evm 의 `geth` 는 TON 토큰을 위해 `manage-staking` 과 `staking` 명령어가 추가되었다.
Plasma-evm has a new commands `manage-staking` and  `staking` for deploying and managements of TON token.

다음은 `manage-staking` 명령어가 지원하는 하위 명령어들과 입련 인자(Arguments) 들에 대한 정리이다.
This table is about sub-commands of `staking` and its arguments.


| Sub-command    | Argument        | Unit    | Describes   |
|----------------|------------------|---------|--------|
| deployManager  | withdrawalDelay* | Int     | 스테이크된 WTON 을 언스테이크 상태로 변환하기 위해서는 `requestWithdrawal` 트랜잭션을 전송해야 한다. 해당 파라미터 숫자만큼 루트체인 블록이 진행 된 후, `requestWithdrawal` 이 처리 가능한 상태가 된다. <br> In order to convert a staked WTON to a un-staked WTON, have to send `requestWithdrawal` transaction. It can be processible after the number of this parameter blocks increased in rootchain.  |
|                | seigPerBlock*    | Float   | 블록당 발생가능한 최대 시뇨리지 수. 토큰의 인플레이션에 영향을 준다. <br> The amount of maximum seigniorage of TON per block. This parameter is effect to total inflation of TON token. |
| deployPowerTON | roundDuration*   | Int(Seconds) | `PowerTON` 컨트랙트를 배포한다. 컨트랙트 배포에 필요한 `roundDuration` 단위는 초이다. 예를들어 `60s` 값으로 배포한 `PowerTON` 컨트랙트는 60초 주기로 미발행 TON 시뇨리지를 받아 갈 수 있는 오퍼레이터가 선정된다. <br> Deploy `PowerTON` contract. this sub-command required `roundDuration`, unit is seconds. for example, If deployed `PowerTON` contract with `60s` as round duration.  an operator who receives un-issued seigniorage of TON is selected every 60 seconds.
| startPowerTON  |  없음            | -       | `deployPowerTON`을 통해 배포된 `PowerTON` 컨트랙트를 활성화 시킨다. <br> Activate `PowerTON` contract which deployed with `deployPowerTON` sub-command. |
| getManagers    | <파일이름>* <br> <filename>*      | string       | `--datadir` 로 입력받은 위치의 데이터베이스에서 스테이크 메니저 컨트랙트들의 주소들을 추출하여 <파일이름>.json 으로 저장한다. 대부분의 경우 스테이크 메니저 컨트랙트 배포 하위명령어인  `deployManager` 실행할때 지정한 `--datadir` 의 위치를 사용한다.  <br> Extract the addressses of the stake manager contracts from the db, located with `--datadir` and save the addresses as <filename>.json. In most cases, the path for  `--datadir` should be specified same as `deployManager` sub-command.  |
| setManagers  |  <파일이름>*  <br> <filename>*      | string       | 스테이크 메니저 컨트랙트 주소가 저장되어 있는 파일, (e,g `manager.json`), 을 읽어. 오퍼레이터의 플라즈마 체인 운영에 필요한 컨트랙트 주소들을 설정한다. 이때 사용하는 `--datadir` 의 위치는 오퍼레이터 체인데이터 위치가 된다. |
| register    |  없음            | -       | 오퍼레이터가 TON 의 시뇨리지를 받기 위해서 시뇨리지 컨트랙트에 자신의 루트체인 주소를 등록해야 한다. `--datadir` 을 오퍼레이터 데이터 위치하여야 하며, 해당 위치에 `setManagers`를 통해 스테이크 메니저 컨트랙트 정보들을 이미 설정해 두어야 한다. <br> Operator have to register own rootchain contract address to seigniroage manager contract in order to receive seigniorage TON. the path of `--datadir` should place in the operator chaindata location, which was set stake manager contracts by `setManager` sub-command.  |
| mintTON  |  amount*            | Float or Int       | 테스트를 위해 임의로 입력한 `amount` 만큼의 TON을 생성할 수 있다. <br> Generate test TON token as much as input argument.  |


다음은 `staking` 명령어가 지원하는 하위 명령어들과 입련 인자(Arguments) 들에 대한 정리이다.
This table is about sub-commands of `staking` and its arguments.

| Sub-command    | Argument        | Unit    | Describes   |
|----------------|------------------|---------|--------|
| balances   |  address*         | address       | 입력인자로 입력한 주소가 가지고 있는 `TON`, `WTON`, `staked WTON(==deposit)`, `reward WTON(==(Un)Comitted)` 등과 같은 정보를 출력한다. <br> Output information about how much this address has `TON`, `WTON`, `staked WTON(==deposit)`, `reward WTON(==(Un)Committed)` and others. |
| swapFromTON  |  amount*            | Float or Int       | `WTON`을 `TON` 으로 변환하는 트랜잭션을 전송한다. `WTON` 으로 변환할 `TON`의 수량을 입력인자로 사용한다. 대상이 되는 주소는 `--rootchain.sender` 플래그로 지정한다. <br> Send transaction for convert `WTON` to `TON` token. the argument is how much will be convert. Target address must be specified `--rootchain.sender` flag. |
| swapToTON  |  amount*            | Float or Int       | `TON`을 `WTON` 으로 변환하는 트랜잭션을 전송한다. `TON` 으로 변환할 `WTON`의 수량을 입력인자로 사용한다.대상이 되는 주소는 `--rootchain.sender` 플래그로 지정한다. <br>  Send transaction that convert `TON` to `WTON` token. the argument is how much will be convert. Target address must be specified `--rootchain.sender` flag. |
| stake  |  amount*            | Float or Int  | TON의 시뇨리지를 받기 위해 `WTON`을 스테이크 해야 한다. 오퍼레이터가 가지고 있는 `amount`의 만큼의 `WTON`을 스테이크 상태로 변환한다. 이때 대상이 되는 주소는 `--rootchain.sender` 로 지정한다. <br> In order to receive seigniorage of TON token, Operator have to stake `WTON`. Send transaction that the operator's `WTON` to the `stake` state with this amount. Target address must be specified `--rootchain.sender` flag. |
| requestWithdrawal  |  amount*            | Float or Int       | 스테이크 상태의 `WTON` 을 언스테이크 상태로 전환하는 트랜잭션을 전송한다. 대상이 되는 주소는 `--rootchain.sender` 플래그로 지정한다. 언스테이크 요청(i.e requestWithdrawal) 은 `depositManager` 에서 설정한 `withdrawalDelay` 만큼의 블록이 진행된 이후 처리가능한 상태가 된다. <br> Send transaction that convert  `WTON` state from `stake` to `un-stake`.  Target address must be specified `--rootchain.sender` flag. this un-stake request will be valid after the number of blocks, `withdrawalDelay` specified in `depositManager`, increased in rootchain.  |
| processWithdrawal  | numRequests         | Int       | `requestWithdrawal` 을 통해 등록된 `WTON` 언스테이크를 완료 시킨다. 입력인자 미입력시 완료 가능한 모든 `requestWithdrawal` 이 처리 된다. <br> Finalize un-stake requests. Without using argument, it will finalize all valid requests. | 

> 입력인자에 `*` 가 붙은경우 필수 입력 인자이다. <br> Input argument with "*" is required.

> `amount` 입력값이 소수점이 아닌경우 1e9 단위가 적용되지 않는다. <br> Not applying 1e9 unit without decimal point in `amount`.
