---
id: user-manual
title: Plasma-evm 사용자 메뉴얼
sidebar_label: 사용자 메뉴얼
---
# plasma-evm 일반인 사용법

[TODO] 사용자가 사용하기 편하도록 UI를 변경해야 

- TON - enter / exit / escape / undo only

## Enter / Exit request 생성 TX 메뉴얼

 사용자가 Plasma-evm Wallet을 사용하여 Rootchain contract에 Enter/Exit Tx 생성 해주는 방식으로 설명.

이더리움 메인넷 또는 Rinkeby 테스트넷의 자산을 플라즈마 체인으로 옮기기 위해서는 Enter 트랜잭션을 생성하여야 합니다.

다음은 [https://wallet.tokamak.network](https://wallet.tokamak.network) 에 접속하여 Enter 트랜잭션을 생성하고 RootChain의 자산을 Plasma체인으로 옮기는 과정을 설명하도록 하겠습니다.

### ENTER

1. Plasma Wallet 접속

    ![plasma%20evm/Untitled.png](plasma%20evm/Untitled.png)

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

    ![plasma%20evm/Untitled.png](plasma%20evm/Untitled.png)

2. Metamask 네트워크 선택 : Plasma
3. swapFrometh 선택 + 전송 ETH 입력
4. Metamask TX 전송.
5. 함수 선택 : getBalanceTrieKey + Key 저장.
6. 컨트렉트 선택 : rootchain
7. startExit 선택 + Input 값 입력 [TODO] _trieVlue 값 value로 대체.. 핵불편.
8. Metamask TX 전송.
9. [Optional] FinalizeBlock 함수 선택 TX 전송

## deposit PETH and get STAMINA

**개요**

Plasma-evm 체인별 MGP가 매우 상이하기때문에 Stamina contract의 Default 주소인 "0xDead" 에 대해서 minDeposit, recoveryEpochLength, withdrawalDelay 에 대해서 확인 해볼 필요성과 확인 방법에 대해서 기술. → 개념 정리 링크 대체 가능

**GET PETH**

- 접속 가능한 Endpoint (https:/wallet.faraday.tokamak.network) 을 시작포인트로 하여 Plasma-evm 내에 PETH를 STAMINA 컨트렉트에 대해 Deposit하여 STAMINA를 얻는 방법에 대해서 Step-by-Step으로 설명
    - 3가지 타입의 PETH Base Asset // 개념 설명에서
        1. EtherToken
        2. Requestable ERC20
        3. Requestable Wrapper ERC20
    - Plasma Wallet에서 Enter Process
- Faraday Testnet의 경우 [https://faucet.faraday.tokamak.network](https://faucet.faraday.tokamak.network) 를 통해서 PETH를 얻을 수 있음을 기술.

**GET STAMINA -1- Self Staking Stamina**

자기 자신의 PETH를 Staking 하여 Stamina를 얻을 수 있다

1. Metamask Network 선택 : Faraday
2. Plasma-Wallet의 S Dashboard 선택

    ![plasma%20evm/Untitled%201.png](plasma%20evm/Untitled%201.png)

3. [Optional] Min Deposit 확인
토카막 플라즈마 체인의 Operator 정책마다 다르므로 확인해보아야 한다. 해당 값 미만으로는 Stamina를 위한 PETH 전송이 불가능하다.

    ![plasma%20evm/Untitled%202.png](plasma%20evm/Untitled%202.png)

4. Deposit 함수 선택

    ![plasma%20evm/Untitled%203.png](plasma%20evm/Untitled%203.png)

5. Deposit 값 입력

    ![plasma%20evm/Untitled%204.png](plasma%20evm/Untitled%204.png)

6. Tx 전송 및 생성된 Stamina 확인.

[ TODO ] Step-by-Step 사진 등록

**GET STAMINA -2- Get From Operator**

토카막 플라즈마 체인을 운영하는 오퍼레이터마다 스테미나 정책이 다르다. Operator가 지원하는 Stamina 운영정책에 따라 Delegator로 지정 될 수 있다. 

Faraday Testnet의 경우 Delegator 등록 페이지를 따로 운영하고 있으며,
아래는 Faraday Testnet 체인에서 사용할 수 있는 Stamina를 확인 하는 방법이다.

1. Metamask Network 선택 : Faraday
2. Input address에 자신의 Address를 입력하고 stamina를 get 한다.

![plasma%20evm/Untitled%205.png](plasma%20evm/Untitled%205.png)

## Public (test)network 구성품

## Endpoints Info

- wallet : [https://wallet.tokamak.network](https://wallet.tokamak.network) [ TODO : Have to setup plama-evm wallet ]
- faucet : https://faucet.faraday.tokamak.network
- explorer : https://explorer.faraday.tokamak.network
- bootnodes : https://api.faraday.tokamak.network

---

# Staking

## How to stake TONs?

## How to unstake TONs?

## How to delegate TONs?
