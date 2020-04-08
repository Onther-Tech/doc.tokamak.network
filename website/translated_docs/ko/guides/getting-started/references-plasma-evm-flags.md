---
id: references-plasma-evm-flags
title: Plasma-evm Flag references
sidebar_label: Flag References
---

오퍼레이터와 개발자를 위해 `Plasma-evm`에 다양한 플래그들이 추가되었다.
이 특별하게 추가된 플래그들을 통해 오퍼레이터와 개발자는 루트체인 컨트랙트 배포와 관리, 커밋관련 옵션들을 사용할 수 있다.

> 주의, 토카막 플라즈마 클라이언트 베타 버전으로 CLI 커맨드 및 플래그는 변경될 가능성이 있다.

아래 플래그 옵션들은 [16e9e0310fa180a360a870dac88e1c098489826b](https://github.com/Onther-Tech/plasma-evm/tree/16e9e0310fa180a360a870dac88e1c098489826b) 커밋 기준이다.

```text
PLASMA EVM - OPERATOR OPTIONS:
  --operator value                    Plasma operator address as hex.
  --operator.key value                Plasma operator key as hex(for dev)
  --operator.password value           Operator password file to use for non-interactive password input
  --operator.minether value           Plasma operator minimum balance (default = 0.5 ether) (default: "0.5")
  --miner.recommit value              Time interval to recreate the block being mined (default: 3s)
  
PLASMA EVM - ROOTCHAIN TRANSACTION MANAGER OPTIONS:
  --tx.gasprice value                 Gas price for transaction (default = 10 Gwei) (default: 0)
  --tx.mingasprice value              Minimum gas price for submitting a block (default = 1 Gwei) (default: 1000000000)
  --tx.maxgasprice value              Maximum gas price for submitting a block (default = 100 Gwei) (default: 100000000000)
  --tx.interval value                 Pending interval time after submitting a block (default = 10s). If block submit transaction is not mined in 2 intervals, gas price will be adjusted. See https://golang.org/pkg/time/#ParseDuration (default: 10s)
  
PLASMA EVM - STAMINA OPTIONS:
  --stamina.operatoramount value      Operator stamina amount at genesis block in ETH (default: 1)
  --stamina.mindeposit value          Minimum deposit amount in ETH (default: 0.5)
  --stamina.recoverepochlength value  The length of recovery epoch in block (default: 120960)
  --stamina.withdrawaldelay value     Withdrawal delay in block (default: 362880)
  
PLASMA EVM - CHALLENGER OPTIONS:
  --rootchain.challenger value        Address of challenger account
  --challenger.password value         Challenger password file to use for non-interactive password input
  
PLASMA EVM - ROOTCHAIN CONTRACT OPTIONS:
  --rootchain.url value               JSONRPC endpoint of rootchain provider. If URL is empty, ignore the provider.
  --rootchain.contract value          Address of the RootChain contract
  
PLASMA EVM - STAKING OPTIONS OPTIONS:
  --unlock value                      Comma separated list of accounts to unlock
  --password value                    Password file to use for non-interactive password input
  --rootchain.sender value            Address of root chain transaction sender account. it MUST be unlocked by --unlock, --password flags (CAVEAT: To set plasma operator, use --operator flag)
  --rootchain.gasPrice value          Transaction gas price to root chain in GWei (default: 10000000000)
  --rootchain.ton value               Address of TON token contract
  --rootchain.wton value              Address of WTON token contract
  --rootchain.registry value          Address of RootChainRegistry contract
  --rootchain.depositManager value    Address of Deposit Manager contract
  --rootchain.seigManager value       Address of SeigManager contract
  --rootchain.powerton value          Address of PowerTON contract
```

 `Plasma-evm` 이 지원하는 전체 커맨드와 플래그 정보를 확인하려면, 아래 명령어로 확인 할 수 있다.
 (단, plasma-evm 의 geth 실행 가능한 환경이어야 한다.)


 ```bash
plasma-evm $ geth --help
 ```