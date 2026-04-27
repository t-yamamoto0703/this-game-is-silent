# This-game-is-silent

> **Note**  
> This README was drafted using **Microsoft Copilot**, intentionally instructed to write in a  
> **“Google‑engineer‑style” technical tone** as an experiment in cross‑style documentation.  
> The content reflects the project accurately, while the writing style is part of the experiment.

---

# English

## Overview

This project is a browser-based game that computes the day of the week for a given date.  
It provides a minimal, interactive environment for examining how intuitive mental heuristics can be formalized into deterministic computational logic.

## Live Demo

- https://t-yamamoto0703.github.io/This-game-is-silent/

## Development Goals

The project was created as part of a personal learning workflow with the following objectives:

- Strengthen core programming fundamentals
- Practice structured reasoning and decomposition
- Make the development process observable and reviewable
- Evaluate the practical use of generative AI in iterative development

## Algorithm Overview

The day-of-week algorithm is derived from the developer’s own mental strategy for identifying weekday positions.  
The approach combines four inputs — **century, year, month, and date** — in a flexible, non-sequential manner, reflecting an intuitive rather than procedural approach.

Implementation details:

- Intuitive steps were decomposed into explicit, ordered operations
- The resulting algorithm is a **structured approximation** of the original mental process
- The design prioritizes transparency and reproducibility over replicating the exact cognitive workflow

## Verification Model

- Correctness is verified using a standard Julian Day–based formula
- This verification logic is independent of the internal algorithm and serves as a stable reference baseline

## Auxiliary Cards

Auxiliary cards represent the forward movement of dates on a calendar — effectively, the weekday offset.

Key properties:

- The sum of card values aligns with the computed weekday index
- Cards are optional; users may rely on the **Month Adjust** control or answer directly
- For January and February in leap years, a **−1 adjustment** is applied to maintain consistency

## Tested Environments

The project has been validated in the following environments:

- Lubuntu 24.04.4 LTS / Chromium
- Windows 11 / Microsoft Edge, Firefox

Debug console output (F12) is intentionally left enabled.

## Display Notes

Depending on your system configuration, the game’s layout may not fit entirely
within the visible area when Windows display scaling or browser zoom is set
above 100%.

- This behavior is environment‑dependent. Adjusting the zoom level or display
scaling may improve the overall playability.

## Assets and Licensing

- Background and linked images were generated using AI and modified by the developer
- Card images were created by the developer using assets from the **RPG Maker** series  
  In accordance with the license terms, the original assets are not redistributed
- Source code is released under the MIT License  
  Redistribution or secondary use of the card images is not permitted

## Additional Notes

- The algorithm used in this project is **not** based on the Doomsday method  
  Intermediate values therefore differ from Doomsday-style calculations
- The **Other Games** button intentionally keeps **Previous Cards** open to support review and pacing
- For implementation details, refer to the source code

---

> **注記**  
> 本 README は、**Microsoft Copilot** に対して  
> **「Google のエンジニア文体で書いてほしい」** と指示して作成したものです。  
> 文体は実験的なものですが、内容は本プロジェクトを正確に反映しています。

# 日本語

## 概要

本作品は、指定した日付の曜日を算出するブラウザゲームです。  
直感的な思考手順を、決定的な計算ロジックへと形式化する過程を、軽量で操作しやすい環境として提供します。

## 公開ページ

- https://t-yamamoto0703.github.io/This-game-is-silent/

## 開発目的

本作品は、個人的な学習ワークフローの一環として開発したもので、以下を目的としています。

- 基礎的なプログラミングスキルの強化
- 構造化された思考と分解の練習
- 開発プロセスの可視化と検証
- 生成AIを活用した反復的開発手法の評価

## アルゴリズム概要

本ゲームの曜日算出アルゴリズムは、開発者自身が行っている  
「曜日を特定するための直感的な思考手順」を基にしています。  
**世紀・年・月・日** の4要素を、手順に縛られず柔軟に組み合わせるという、  
計算というより“感覚的な判断”に近いアプローチをモデル化しています。

実装にあたっては以下の方針を採用しています。

- 直感的な処理を、明示的で順序立った計算ステップへと分解
- 得られたアルゴリズムは、脳内処理の直接的な再現ではなく、  
  **構造化された近似モデル** として設計
- 認知プロセスの模倣よりも、透明性と再現性を優先

## 整合性モデル

- 曜日の正誤判定には、ユリウス日を用いた標準的な数式を採用しています
- この検証ロジックは内部アルゴリズムとは独立しており、基準値として機能します

## 補助カード

補助カードは、カレンダー上で日付が右方向へ進む量、  
すなわち曜日のオフセットを数値化したものです。

主な仕様は以下の通りです。

- カードの合計値が算出される曜日インデックスと一致するよう設計
- 補助カードは任意で、**Month Adjust** ボタンや直接入力での解答も可能
- うるう年の1月・2月のみ、整合性維持のため **−1 の補正** を適用

## 動作確認環境

以下の環境で動作検証を行っています。

- Lubuntu 24.04.4 LTS / Chromium
- Windows 11 / Microsoft Edge, Firefox

デバッグ用のコンソール出力（F12）は意図的に残しています。

## 画面表示について

Windows の表示スケールやブラウザの拡大率が 100% を超えている場合、
画面全体が表示領域に収まらないことがあります。

- この挙動は利用環境に依存します。必要に応じて拡大率を調整すると、
表示が安定し、操作しやすくなる場合があります。

## アセットとライセンス

- 背景画像およびリンク先画像は、AI が生成し開発者が加工したものです
- カード画像は、**RPG Maker** シリーズの素材を基に開発者が作成したものです  
  ライセンス条件に従い、元素材の再配布は行っていません
- ソースコードは MIT ライセンスで公開しています  
  ただしカード画像の再配布・二次利用は許可していません

## 補足

- 本作品のアルゴリズムは **Doomsday 方式ではありません**  
  そのため途中計算値も Doomsday 方式とは異なります
- **Other Games** ボタンを押しても **Previous Cards** が閉じないのは、  
  検算や小休止に利用できるようにするための仕様です
- アルゴリズムの詳細はソースコードをご参照ください
