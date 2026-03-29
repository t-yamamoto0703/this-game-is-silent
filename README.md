/*
 * --- Calendar Logic & Design Philosophy ---

 * The weekday calculation method used in this game is different from Doomsday or similar algorithms.
 * Intermediate values also differ; only the century anchor matches numerically.

 * In principle, no formula is required to derive weekdays.
 * Neither division by 7 nor division by 12 is inherently necessary.

 * When playing a G-C–E-G chord, four fingers move simultaneously.
 * Likewise, calendar calculation involves four pieces of information moving at the same time.
 * Reversing that process into formulas results in the structure used in this game.

 * Leap years introduce a fifth tone (a 9th chord).
 * A four-tone version is also possible, but requires fixed values for 14 months.

 * When combining formulas using 30.61 and 30.6,
 * the calculation must always be closed within 366 days,
 * starting from March 1 and ending on February 29.
 * Otherwise, the 367th day will be misclassified as February.

 * The intercalary value must not be used as −1 directly.
 * Using −1 would cause an out-of-bounds array access (usedCards.day[-1]).
 * Therefore, 6 is used instead (since 6 ≡ −1 mod 7).

 * State variables are grouped into objects only for organization.
 * Be careful: careless reassignment may cause destructive side effects.

 * The "Previous Cards" does not close when pressing the "Other Games" button by design.
 * This provides a short grace period for verifying the previous answer.
 * (The "Current Cards" does close.)

 * For correctness checking, weekday calculation is performed
 * using a Julian Day–based formula separate from the game's internal method.
 * Debugging utility: View per-question result logs in DevTools console (F12).

 * 当ゲームの曜日算出方式はDooms Day方式とは異なります(途中経過の値も異なります)
 * センチュリーアンカーのみ数値として一致します
 * 本質的には曜日の導出に数式は必要ありません 7の割り算も12の割り算も不要です
 * ソドミソの和音を出す時4つの指が同時に動くのと同様にカレンダー計算をする時も脳内で4つの情報が同時に動きます
 * その過程（組み合わせ）を逆算して数式を求めるとこのゲームの形になります
 * うるう年のみ5和音となりますが4和音対応も可能です（ただし14ヶ月分の固定値算出が必要）
 * 30.61と30.6の数式を組み合わせて使用する場合は必ず3月1日を基準に2月29日までの366日で閉じてください（367日目が2月判定になります）
 * intercalaryの値は−1のまま使用するとusedCards.day[-1]で配列範囲外アクセスになるため6を使用しています(6 ≡ -1 mod 7)
 * 変数群はオブジェクトに閉じているだけなので不用意な書き換えによる破壊的変更に注意してください
 * Other GamesボタンでPrevious Cardsが閉じないのは仕様です（前問検算用猶予：Current Cardsは閉じるので休憩も可能）
 * 正誤判定の曜日算出には独自式とは別のユリウス日を元にした計算式を使用しています
 * 出題ごとの判定結果がDevToolsコンソール（F12）で確認できます
 */
