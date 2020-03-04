---
id: glossary
title: Parameters
sidebar_label: Parameters
---


## Token Supply and Distribution

|Index|Variable|Descrioption|Property*|Formular|Example|
|-----|------|---|---|-----------|-----|
|S1|$D_{min}$  |Minimum staking amount                     |C|-|-|
|S2|$IS$       |Initial issued amount                     |V|-|-|
|S3|$IR_{y}$   |Annual target inflation Rate               |C|-|0.19|
|S4|$S_{y}$    |Annual maximum commit reward        |C|$IS * IR_{y}$|-|
|S5|$S_{b}$    |Annual maximum commit reward per block of root chain |C|$S_{y}/N_{y}$|-|
|S6|$N_{y}$    |Total number of blocks in root chain for a year  |-|-|-|
|S7|$s_{y}$    |Annual actual commit reward |V|$\sum_{i=1}^{N_{y}}\cfrac{td_{i}}{ts_{i}} * S_{b}$|-|
|S8|$ts_{t}$   |Total issued amount in $t$          |V|-|-|
|S9|$td_{t}$   |Total staked amount in $t$         |V|-|-|
|S10|$s_{k,t}^{staker}$ |Commit reward of staker from $k$ to $t$  |V|$\sum_{i=k}^{t}\cfrac{d_{i}^{staker}}{ts_{i}}*S_{b}$|-|

## PowerTON
|Index|Variable|Descrioption|Property*|Formular|Example|
|-----|------|---|---|-----------|-----|
|P1|$O$  |odds of winning                   |C|-|-|
|P2|$TP$ |total supply of power for each round                    |C|-|-|
|P3|$P$  |total amount of power held by a player for each round             |C|-|-|


## Fee and Challenge
|Index|Variable|Descrioption|Property*|Formular|Example|
|-----|-------|---|---|---|-----|
|F1|$E_{r}$   |Recovery epoch                |C|-|-|
|F2|$MGP$     |Minimum gas price                   |C|-|-|
|F3|$d^{o}$   |Total amount staked to an operator|V|-|-|
|F3|$ED$      |Exit deposit                          |C|-|-|
|F4|$CD$      |Challenge deposit                        |C|-|-|


## Index
|Property|Description|
|---|----|
|C|Contants |
|V|Variables|
