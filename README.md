# This-game-is-silent

## Overview
This is a browser-based game themed around calendar calculation.  
- This project was created for the purpose of training basic programming skills,
logical thinking, and making technical understanding visible.
- [This-game-is-silent.](https://t-yamamoto0703.github.io/This-game-is-silent/)

## Day‑of‑Week Calculation Algorithm
- The calendar (weekday) calculation method used in this game is a coded reconstruction of the developer’s actual mental process: taking the four pieces of information—century, year, month, and date—in whatever order they are perceived, combining them intuitively, and identifying the weekday position on the calendar.
- In the developer’s mind, each step is handled less like a “calculation” and more like a hash‑table‑style lookup. For the purpose of implementation, these intuitive processes were deliberately decomposed into logical “computations” and rebuilt as code.

## Consistency
- For validating weekday correctness, a standard formula based on the Julian Day is used.  
- This calculation is independent of the game’s internal logic and serves as a verification reference.

## Role of the Auxiliary Cards
- The cards numerically represent rightward movement on the calendar (weekday shifts).
- Their total value is designed to match the weekday index (Sunday === 0, Monday === 1, ...).

## Specification‑Level Adjustment
- Only for January and February of leap years, a “−1” adjustment is applied to maintain consistency in the calculation.

Supported Environments
The game has been tested only in the following minimal environments:
- Lubuntu 24.04.4 LTS / Chromium
- Windows 11 / Microsoft Edge, Firefox
Console output for debugging is left enabled.

Notes
- Using DevTools (F12), you can inspect the internal calculation steps and the evaluation results for each question in real time.
- The weekday calculation method used in this game differs from existing algorithms such as Doomsday.
- Clearing the game may feel less like understanding a formula and more like quickly and accurately turning an internal “virtual dial”.
- If possible, process the four pieces of information—century, year, month, date—smoothly, as if playing the arpeggio G–C–E–G.
- Only for January and February of leap years, a “−1” adjustment is applied (by design).
- If the method does not feel intuitive, you may use the Month Adjust button or ignore the auxiliary card values and answer directly.
- Using the auxiliary cards is not required.
- The Previous Cards panel intentionally remains open even when pressing the Other Games button, so you can use it for checking the previous question or taking a short break.
- For details of the algorithm, please refer to the source code.

---

# This-game-is-silent（日本語）

## 概要
本作品はカレンダー計算をテーマにしたブラウザゲームです。  
- 本作品は基礎的なプログラミングスキルおよび論理的思考の訓練、ならびに技術的理解の可視化を目的として作成されています。
- [This-game-is-silent.](https://t-yamamoto0703.github.io/This-game-is-silent/)

## 曜日計算アルゴリズム
- 本ゲームのカレンダー計算（曜日算出）方式は開発者の脳内で実際に行われている「世紀・年・月・日の4情報を順不同で見たままに処理・合成してカレンダー上の曜日位置を特定する」という感覚的なプロセスをコードに落とし込んだものです。
- 脳内では計算と言うよりもハッシュテーブル的な検索に近い処理で済んでいる各プロセスを、あえて論理的な『計算』へと分解し、再構築しました。
- 結果的に実際の脳内で行われている処理とコード上での処理との間にかなりの距離があいてしまっていることを御理解いただければさいわいです。

## 整合性
- 曜日の正誤判定にはユリウス日を用いた標準的な数式を採用しています。
- これは本ゲームの内部ロジックとは独立しており検証用の基準として機能します。

## 補助カードの役割
- カレンダー上での日付の右移動（曜日移動）を数値化したものです。
- 合計値が曜日のインデックス（日曜 === 0,月曜 === 1...）と一致するように設計されております。

## 仕様上の補正
- うるう年の1月・2月のみ、計算の整合性を保つために「−1」の補正を加える仕様としております。

## 動作環境
以下の環境でのみ簡易的な動作確認を行っています。

- Lubuntu 24.04.4 LTS / Chromium
- Windows 11 / Microsoft Edge, Firefox

デバッグ用のコンソール出力を残していますので、必要に応じてご利用ください。

### 補足
- DevTools（F12）を使用することで内部の計算過程や出題ごとの判定結果をリアルタイムで確認できます。
- 本ゲームの曜日算出方式はDoomsday等の既存アルゴリズムとは異なります。
- クリアに必要なのは計算式の理解ではなく、より速く、より正確に脳内の仮想ダイヤルを回す感覚に近いかもしれません。
- 可能であればG–C–E–Gのアルペジオを弾くように、世紀・年・月・日の4つの情報を流れるように処理してください。
- うるう年の1月・2月のみ、計算の整合性を保つために「−1」の補正が加わります（仕様）。
- 直感に合わない場合はMonth Adjustボタンを使用するか、補助カードの数値を無視して直接解答してください。
- 補助カードの使用は必須ではありません。
- Other Gamesボタンを押してもPrevious Cardsが閉じないのは前問の検算や小休止に活用いただくための意図的な設計です。
- アルゴリズムの詳細に興味がある方はコードをご参照ください。
  
