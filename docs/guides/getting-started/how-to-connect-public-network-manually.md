---
id: how-to-connect-public-testnet-manually
title: 퍼블릿 테스트넷 직접 연결하기
sidebar_label: 직접 연결하기
---

## 페러데이 사용자 노드

만약 자신이 운영하고 있는 `Rinkeby` 테스트넷 노드가 존재한다면 [연결 준비하기](how-to-connect-public-testnet-prepare)에서 생성한 `Infura` 접속 주소 대신 사용 가능하다.

### 1. 초기화 하기

공개되어 있는 페러데이 테스트넷의 `Genesis`파일을 사용한다.
[Faraday Testnet Genesis](https://github.com/Onther-Tech/plasma-evm-networks/tree/master/faraday-testnet) 파일은 `onther-tech github`에 위치하고 있다.

`rootchain.url`은 루트체인 컨트렉트가 배포된 `Rinkeby` 테스트넷 웹소켓 접속주소(websocket Endpoint)를 사용한다.

아래 커맨드를 통해서 `genesis` 파일을 초기화 시켜준다.

```bash
plasma-evm$ build/bin/geth init \
            --datadir ./chaindata \
            --rootchain.url wss://rinkeby.infura.io/ws/v3/[PROJECT ID] \
            https://raw.githubusercontent.com/Onther-Tech/plasma-evm-networks/master/faraday-testnet/faraday.json
```

`--datadir` 플래그를 통해서 체인데이터가 저장될 위치를 설정할 수 있다. 이 경로는 plasma-evm 실행시 동일해야 한다.

### 2. 사용자 노드 실행

[1. 초기화 하기](how-to-connect-public-testnet-manually#2-%EC%B4%88%EA%B8%B0%ED%99%94-%ED%95%98%EA%B8%B0)에서 사용한 `datadir`과 동일한 주소를 사용해주어야 한다.
만약, `JSON-RPC` 접속 가능한 상태에서 `keystore`를 추가하여 사용하고 싶은 경우 사용자 노드 실행시 `--allow-insecure-unlock` 를 추가하여 실행한다.

```bash
plasma-evm$ build/bin/geth \
    --datadir ./chaindata \
    --syncmode="full" \
    --networkid 16 \
    --rootchain.url wss://rinkeby.infura.io/ws/v3/[PROJECT ID] \
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

> `--syncmode` 가 `full` 이어야 노드간 블록이 동기화 된다.

페러데이 테스트넷 네트워크 상태는 [여기](http://ethstats.faraday.tokamak.network/)에서 확인 가능하다.