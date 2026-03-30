# This-game-is-silent

## Overview
This is a browser-based game themed around calendar calculation.  
URL: [   ]

This project was created for the purpose of training basic programming skills,
logical thinking, and making technical understanding visible.

**Consistency**  
For validating weekday correctness, a standard formula based on the Julian Day is used.  
This calculation is independent of the game’s internal logic and serves as a verification reference.

**Debugging**  
By using DevTools (F12), you can inspect the internal calculation process
and the judgment results for each question in real time.

### Notes
* The weekday calculation method used in this game differs from existing algorithms such as Doomsday.
* Like playing a G–C–E–G arpeggio, process four pieces of information—century, year, month, and date—in a smooth, continuous flow.
* Clearing the game does not require understanding formulas, but rather developing a sense of quickly and accurately turning a virtual dial in your mind.
* The auxiliary cards represent the number of dial rotations expressed as numerical values.
* Their total corresponds to the weekday position on the calendar (Sunday === 0, Monday === 1, ...).
* Rotation is fixed in the additive direction, and reversing this thought process into formulas forms the core algorithm of this game.
* For January and February in leap years only, a “−1” adjustment is applied to maintain calculation consistency (by design).
* If the process does not feel intuitive, use the Month Adjust button, or ignore the auxiliary card values and answer directly.
* Use of the auxiliary cards is optional.
* The "Previous Cards" does not close when pressing the "Other Games button";
  this is an intentional design choice to allow verification of the previous question or a short pause.
* If you are interested in the algorithmic details, please refer to the source code.

---

# This-game-is-silent（日本語）

## 概要
本作品はカレンダー計算をテーマにしたブラウザゲームです。  
URL: [   ]

本作品は基礎的なプログラミングスキルおよび論理的思考の訓練、ならびに技術的理解の可視化を目的として作成されています。

**整合性**  
曜日の正誤判定にはユリウス日を用いた標準的な数式を採用しています。  
これは本ゲームの内部ロジックとは独立しており検証用の基準として機能します。

**デバッグ**  
DevTools（F12）を使用することで内部の計算過程や出題ごとの判定結果をリアルタイムで確認できます。

### 補足
* 本ゲームの曜日算出方式はDoomsday等の既存アルゴリズムとは異なります。
* G–C–E–Gのアルペジオを弾くように、世紀・年・月・日の4つの情報を流れるように処理してください。
* クリアに必要なのは計算式の理解ではなく、より速く、より正確に脳内の仮想ダイヤルを回す感覚に近いかもしれません。
* 補助カードはダイヤルを回す回数を数値化したものです。
* その合計値はカレンダー上の曜日の位置（日曜 === 0,月曜 === 1...）を意味する値と一致します。
* 回転は加算方向に固定されており、この思考過程を逆算して数式化したものが本ゲームの核となるアルゴリズムです。
* うるう年の1月・2月のみ、計算の整合性を保つために「−1」の補正が加わります（仕様）。
* 直感に合わない場合はMonth Adjustボタンを使用するか、補助カードの数値を無視して直接解答してください。
* 補助カードの使用は必須ではありません。
* Other Gamesボタンを押してもPrevious Cardsが閉じないのは前問の検算や小休止に活用いただくための意図的な設計です。
* アルゴリズムの詳細に興味がある方はコードをご参照ください。
  
