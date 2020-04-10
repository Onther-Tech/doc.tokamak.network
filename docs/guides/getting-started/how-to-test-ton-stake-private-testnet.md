---
id: private-testnet-staking
title: Staking Test in Private Testnet
sidebar_label: Private Testnet Staking test
---

In this document, we will cover how to stake TON token on a private testnet where two operators exist.

Most of this document is about how to use `staking` and `manage-staking` command in `plasma-evm`. This command is quite useful for developers and operators.

> For common users, we recommend using [dashboard](https://dashboard.faraday.tokamak.network).

For this testing, you should proceed [Setup Rootchain in Private Testnet](how-to-open-private-testnet-rootchain) and [Setup Childchain in Private Testnet](how-to-open-private-testnet-manually). If you did not yet, please those two steps.

> The usernode is not necessary in this section by [Setup Childchain - Setup Usernode node](how-to-open-private-testnet-manually#setup-user-node).

## Staking TON for Operators

### Minting Test TON

If the `DepositManager` contract is deployed ([Deploy TON Stake manager contract](how-to-open-private-testnet-rootchain#deploy-ton-stake-manager-contract)), you have to mint test TON to give out to participating operators.

In this private testnet, we assumed that two operators exist. Operator1 and operator2 use the following accounts.

- Operator1 : `0x3cd9f729c8d882b851f8c70fb36d22b391a288cd`
- Operator2 : `0x57ab89f4eabdffce316809d790d5c93a49908510`

Execute the following command to mint 10,000 TON to each operator.

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

### Checking TON balance

Check test TON balance of operator1 with the following command.

```bash
plasma-evm $ build/bin/geth staking balances 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

You will be able to see the balance of 10,000 TON as below if test TON have been minted correctly and rootchain has been registered to the manager contract.

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

### Staking TON for Operator1

To stake test `TON`, it has to be converted to `WTON` first. Then, it will be available for staking in `depositManager` contract.

Operator can stake only `WTON` to `depositManager` for operating plasma chain.

As following command, Convert 1,000 TON into WTON.

> You have to use decimal points in the input argument of `swapFromTON` sub-command in order to apply 1e9(1,000,000,000 wei) unit.

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

Stake 500 of converted 1,000 WTON using `stake`, a sub-command of `staking`.

```bash
plasma-evm $ build/bin/geth staking stakeWTON 500.0 \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

Or, you can do the above two steps at once with using `stakeTON` sub-command.

```bash
plasma-evm $ build/bin/geth staking stakeTON 500.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

### Operator2 Plasma Chain and Stake Contract Address Setup

As Operator2, follow the same as setup process in [Setup Childchain in Private Testnet](how-to-open-private-testnet-manually).

Use deploy command to deploy rootchain contracts necessary for running operator2 plasma chain.

```bash
plasma-evm $ build/bin/geth --nousb deploy ./.pls.staking/operator2/genesis-operator2.json 103 true 2 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

Use following command to initialize the plasma chain with `genesis-operator2.json` file including the address of rootchain contract deployed by operator2.

```bash
plasma-evm $ build/bin/geth --nousb init ./.pls.staking/operator2/genesis-operator2.json  \
            --datadir ./.pls.staking/operator2  \
            --rootchain.url ws://127.0.0.1:8546
```

Using `setManagers` sub-command of `manage-staking`, set the stake contract addresses to run operator2's plasma chain.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking setManagers manager.json  \
            --datadir ./.pls.staking/operator2
```

Check if the information of stake contract address is included in the operator2 chaindata with `getManagers` sub-command of `manage-staking`.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking getManagers --datadir ./.pls.staking/operator2
```

### Registering Operator2 Rootchain Contract and TON Balance Check

Register the rootchain address of operator2 plasma chain to the stake manager contract in order to receive seigniorage.

```bash
plasma-evm $ build/bin/geth --nousb manage-staking register \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

If rootchain address is successfully registered, you will see the following message.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x57ab89f4eAbDfFCe316809D790D5c93a49908510
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/home/ubuntu/plasma-evm/.pls.staking/operator2/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Registered SeigManager to RootChain      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=a63891…0a9d9a
INFO [01-01|00:00:00.000] Registered RootChain to SeigManager      registry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 rootchain=0x8Bb208b42B2d1dA1606B3E06ad6648514b6aE080 seigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC tx=f7017e…d8fa00
```

Check test TON balance of operator2 with the following command.

```bash
plasma-evm $ build/bin/geth --nousb staking balances 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

You will be able to see the balance of 10,000 TON as below if test TON have been minted correctly and rootchain has been registered to the manager contract.

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

### Operator2 TON Staking

To stake test `TON`, it has to be converted to `WTON` first. Then, it will be available for staking in `depositManager` contract.

Operators can only stake `WTON` to `depositManager` in order to operate plasma chains.

Convert 1,000 TON into WTON using the following command.

> You have to use decimal points in the input argument of `swapFromTON` sub-command in order to apply 1e9(1,000,000,000 wei) unit.

```bash
plasma-evm $ build/bin/geth --nousb staking swapFromTON 1000.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

Stake 500 of converted 1,000 WTON using `stake`, a sub-command of `staking`.

```bash
plasma-evm $ build/bin/geth --nousb staking stakeWTON 500.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

Or, you can do the above two steps at once with using `stakeTON` sub-command.

```bash
plasma-evm $ build/bin/geth --nousb staking stakeTON 500.0 \
            --datadir ./.pls.staking/operator2 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x57ab89f4eabdffce316809d790d5c93a49908510 \
            --password pwd.pass \
            --rootchain.sender 0x57ab89f4eabdffce316809d790d5c93a49908510
```

## Checking TON Commit Rewards and Withdrawal

Operator client submits Tx commits to rootchain when operator proceeds with mining child chain blocks.

Seigniorage rewards of TON will be calculated by the seigniorage manager contract based on how much `WTON` are staked by each operator.

### Running Operator1 chain

Run operator1 node in a private network with the following command.

```bash
plasma-evm $ build/bin/geth --nousb \
            --datadir ./.pls.staking/operator1 \
            --rootchain.url ws://127.0.0.1:8546 \
            --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --password pwd.pass \
            --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
            --operator 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

Access operator1's node console from a new terminal with the following command.

```bash
plasma-evm $ build/bin/geth attach --datadir ./.pls.staking/operator1
```

Run `geth attach` to connect to the javascript console of geth.

Send a dummy tx to advance the blocks by running `eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})` command in console.

```javascript
> web3.eth.accounts
["0x3cd9f729c8d882b851f8c70fb36d22b391a288cd"]
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x0a65e80eb105c448ffa1ca50430dc1d3f4b0da14ad1d4793a43ed36b6df0959c"
> eth.sendTransaction({from: eth.accounts[0], to:eth.accounts[0], value: 0})
"0x81130ae471f536c04cc6b9901962dd5a15bb72f3924422ea051a3b0494c0fade"
```

Generate more than two dummy transactions, sending 0 ETH to operator1.

> The rootchain Tx will occur when there are more blocks mined than the initial `Epoch` number in the rootchain contract.

The Epoch Number used in this example is `2`.

Close console connection by sending `exit` command at console.

### Checking seigniorage

Operator2 stake reward status is currently `Uncommited` because only operator1 chain has been submitted to the rootchain on Running [Running Operator1 chain](#running-operator1-chain).

In a new terminal, check operator2 TON stake rewards by using `staking balances` command.

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

The above result is an example(modified). Actual seigniorage WTON number will be float type with decimal points, because it is calculated by the timestamp of block in rootchain.

### Withdrawing Rewards

Both operator1 and operator2 have received seigniorage rewards from staked TON after operator1's tx commit.

The rewards are accumulated on each operators' account in `WTON`.

In this section, we are going to withdraw the seigniorage reward of operator1.

We will be using `requestWithdrawal`, a sub-command of `staking` to request withdrawal. Run the following command to request withdrawal for 510 WTON.

```bash
plasma-evm $ build/bin/geth --nousb staking requestWithdrawal 510.0 \
              --datadir ./.pls.staking/operator1 \
              --rootchain.url ws://127.0.0.1:8546 \
              --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
              --password pwd.pass \
              --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

If operator1 balance is more than 510 WTON, the withdrawal request will be successfully processed.

```bash
INFO [01-01|00:00:00.000] Maximum peer count                       ETH=50 LES=0 total=50
INFO [01-01|00:00:00.000] Operator account is unlocked             address=0x3cD9F729C8D882B851F8C70FB36d22B391A288CD
INFO [01-01|00:00:00.000] Set options for submitting a block       mingaspirce=1000000000 maxgasprice=100000000000 resubmit=0s
INFO [01-01|00:00:00.000] Allocated cache and file handles         database=/Users/jinhwan/gitrepo/plasma-evm/.pls.staking/operator1/geth/stakingdata cache=16.00MiB handles=16
INFO [01-01|00:00:00.000] Using manager contracts                  TON=0x3A220f351252089D385b29beca14e27F204c296A WTON=0xdB7d6AB1f17c6b31909aE466702703dAEf9269Cf DepositManager=0x880EC53Af800b5Cd051531672EF4fc4De233bD5d RootChainRegistry=0x537e697c7AB75A26f9ECF0Ce810e3154dFcaaf44 SeigManager=0x3Dc2cd8F2E345951508427872d8ac9f635fBe0EC
INFO [01-01|00:00:00.000] Withdrawal requested                     rootchain=0x17FB80e2E16b02faC936933424305d4F29F9d5D9 amount="510.0 WTON" tx=570061…
b07f4d
```

If you check operator1 balance, you can see 510 WTON in a line that starts with `Pending withdrawal ..`.

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

To finalize withdrawal request, use `processWithdrawal` sub-command as follows.

```bash
plasma-evm $ build/bin/geth --nousb staking processWithdrawal \
              --datadir ./.pls.staking/operator1 \
              --rootchain.url ws://127.0.0.1:8546 \
              --unlock 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd \
              --password pwd.pass \
              --rootchain.sender 0x3cd9f729c8d882b851f8c70fb36d22b391a288cd
```

When the `processWithdrawal` tx is successfully processed, you can see the balance total of 1,010 WTON in `WTON Balance`

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

## List of Sub-commands

`manage-staking` and  `staking` commands have been added to plasma-evm `geth` for TON staking features.

### `manage-staking` Sub-commands

This table is a list of sub-commands form `manage-staking` and its arguments.

| Sub-command    | Argument        | Unit    | Description   |
|----------------|------------------|---------|--------|
| deployManager  | withdrawalDelay* | Int     | In order to convert the status of WTON from staked to un-staked, you have to send `requestWithdrawal` transaction. The `requestWithdrawal` will be processible after the number of blocks set in this argument are mined in rootchain.  |
|                | seigPerBlock*    | Float   | The amount of maximum TON seigniorage per block. This parameter affects the total inflation of TON token. |
| deployPowerTON | roundDuration*   | Int(Seconds) | Deploys `PowerTON` contract. The unit of `roundDuration` is seconds. For example, if the round duration is set to `60s`, an operator will be selected every 60 seconds to receive unissued seigniorage of TON. |
| startPowerTON  |  None            | -       | Activates `PowerTON` contract which is deployed with `deployPowerTON` sub-command. |
| getManagers    | filename      | string       | Extracts the addresses of stake manager contracts from the db(located with `--datadir`) and saves the addresses as `<filename>.json`. In most cases, the path for  `--datadir` should be specified when running `deployManager` sub-command.  |
| setManagers  |  filename*      | string       | Reads the target file (e.g. `manager.json`) that contains the addresses of stake manager contracts then sets required addresses to operate the plasma chain. the path of `--datadir` would be the operator chaindata location. |
| register    |  None            | -       | To receive TON seigniorage, Operators have to register their rootchain contract address in the seigniorage manager contract. The path of `--datadir` should be placed in the operator chaindata location, with stake manager contracts already set up by `setManager` sub-command.  |
| mintTON  |  amount*            | Float or Int       | Generates test TON token.  |

> Input argument with "*" is required.

### `staking` Sub-commands

This table is a list of sub-commands from `staking` and its arguments.

| Sub-command    | Argument        | Unit    | Description   |
|----------------|------------------|---------|--------|
| balances   |  address*         | address       | Prints information about the address balance of `TON`, `WTON`, `staked WTON(==deposit)`, `reward WTON(==(Un)Committed)` and others. |
| swapFromTON  |  amount*            | Float or Int       | Send transaction to convert `TON` to `WTON` token. The argument is the amount to convert. Target address must be specified in the `--rootchain.sender` flag. |
| swapToTON  |  amount*            | Float or Int       |  Send transaction to convert `WTON` to `TON` token. The argument is the amount to convert. Target address must be specified in the `--rootchain.sender` flag. |
| stakeTON   |  amount*            | Float or Int  | Combines `swapFromTON` and `stakeWTON` to convert `TON` to `WTON` and stake `WTON` in a single command. Converts the input `amount` of `TON` staked status. Target address must be specified in the `--rootchain.sender` flag. |
| stakeWTON  |  amount*            | Float or Int  | In order to receive seigniorage of TON token, operators have to stake `WTON`. This sub-command converts the state of `WTON` to staked. Target address must be specified in the `--rootchain.sender` flag. |
| requestWithdrawal  |  amount*            | Float or Int       | Sends transaction that converts `WTON` state from `stake` to `un-stake`.  Target address must be specified in the `--rootchain.sender` flag. Un-stake request will be valid after a number of blocks are increased in rootchain, specified in `withdrawalDelay` of`depositManager`.  |
| processWithdrawal  | numRequests         | Int       | Finalizes un-stake requests registered through `requestWithdrawal`. All valid requests will be finalized if no arguments are set. |

> Input argument with "*" is required.

> 1e9 units will not be applied without a decimal point in `amount`.