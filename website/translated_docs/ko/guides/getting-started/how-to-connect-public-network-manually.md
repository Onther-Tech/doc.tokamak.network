---
id: how-to-connect-public-testnet-manually
title: How to connect public testnet manually
sidebar_label: Manually
---

## 페러데이 사용자 노드

### 1. 초기화

페러데이 사용자 노드를 시작하기 위해, 초기화 하려면 페러데이 테스트넷의 `genesis` 파일이 필요하다.
해당 `genesis` 파일은 [github.com/onther-tech/plasma-evm-networks](https://github.com/Onther-Tech/plasma-evm-networks/tree/master/faraday-testnet) 의 [`faraday.json`](https://github.com/Onther-Tech/plasma-evm-networks/blob/master/faraday-testnet/faraday.json)를 통해 확인 할 수 있다.

`rootchain.url`은 `Rinkeby` 테스트넷 웹소켓 접속주소를 사용한다.

아래 커맨드를 입력하여 사용자 노드를 초기화한다.

```bash
plasma-evm$ build/bin/geth init \
            --datadir ./chaindata \
            --rootchain.url wss://rinkeby.infura.io/ws/v3/<PROJECT ID> \
            https://raw.githubusercontent.com/Onther-Tech/plasma-evm-networks/master/faraday-testnet/faraday.json
```

`--datadir` 플래그를 통해서 체인데이터가 저장될 위치를 설정할 수 있다. **이 경로는 plasma-evm 실행시 동일해야 한다.**

### 2. 사용자 노드 실행

반드시 [1. 초기화](how-to-connect-public-testnet-manually#1-초기화)에서 `datadir`로 지정해준 값을 사용한다. 

아래 명령어를 입력하여 사용나 노드를 실행한다.
```bash
plasma-evm$ build/bin/geth \
    --datadir ./chaindata \
    --syncmode="full" \
    --networkid 16 \
    --rootchain.url wss://rinkeby.infura.io/ws/v3/<PROJECT ID> \
    --rpc \
    --rpcaddr '127.0.0.1' \
    --rpcport 8547 \
    --rpcapi eth,net,debug \
    --rpccorsdomain "*" \
    --rpcvhosts=localhost \
    --ws \
    --wsorigins '*' \
    --wsaddr '127.0.0.1' \
    --wsport 8548 \
    --port 30307 \
    --nat extip:::1 \
    --maxpeers 50
```
사용자 노드의 체인데이터는 `plasma-evm/chaindata` 에 저장된다.

> `--syncmode` 가 `full` 이어야 노드간 블록이 동기화 된다.

> 만약, `rpc`와 `keystore`를 동시에 사용하고 싶은 경우 `--allow-insecure-unlock` 를 추가하여 실행한다.

페러데이 테스트넷 네트워크 상태는 [여기](http://ethstats.faraday.tokamak.network/)에서 확인 가능하다.