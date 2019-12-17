---
id: guides_manuals_how-to-make-request
title: How to make request
sidebar_label: How to make request
---
> This Document Work In Progress

 사용자가 Plasma-evm Wallet을 사용하여 Rootchain contract에 Enter/Exit Tx 생성 해주는 방식으로 설명.

이더리움 메인넷 또는 Rinkeby 테스트넷의 자산을 플라즈마 체인으로 옮기기 위해서는 Enter 트랜잭션을 생성하여야 합니다.

다음은 [https://wallet.tokamak.network](https://wallet.tokamak.network) 에 접속하여 Enter 트랜잭션을 생성하고 RootChain의 자산을 Plasma체인으로 옮기는 과정을 설명하도록 하겠습니다.

### ENTER

1. Plasma Wallet 접속
2. Metamask 네트워크 선택 : RootChain[Mainn
3. TODO: RootChain 컨트랙트 주소 입력 (혹은 선택)
4. 컨트렉트 선택 : EtherToken
5. 함수 선택 : swapFrometh + 전송 ETH 입력
6. Metamask TX 전송.
7. 함수 선택 : getBalanceTrieKey + Key 저장.
8. 컨트렉트 선택 : rootchain
9. startEnter 선택 + Input 값 입력 [TODO] _trieVlue 값 value로 대체.. 핵불편.
10. Metamask TX 전송.

### EXIT

1. Plasma Wallet 접속.
2. Metamask 네트워크 선택 : Plasma
3. swapFrometh 선택 + 전송 ETH 입력
4. Metamask TX 전송.
5. 함수 선택 : getBalanceTrieKey + Key 저장.
6. 컨트렉트 선택 : rootchain
7. startExit 선택 + Input 값 입력 [TODO] _trieVlue 값 value로 대체.. 핵불편.
8. Metamask TX 전송.
9. [Optional] FinalizeBlock 함수 선택 TX 전송