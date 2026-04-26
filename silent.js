"use strict";

/*
 * The weekday calculation method used in this game is different from Doomsday or similar algorithms.
 * Intermediate values also differ; only the century anchor matches numerically.
 * When combining formulas using 30.61 and 30.6,
 * the calculation must always be closed within 366 days,
 * starting from March 1 and ending on February 29.
 * the 367th day will be misclassified as February.
 * The intercalary value must not be used as −1 directly.
 * Using −1 would cause an out-of-bounds array access (usedCards.day[-1]).
 * 6 is used instead (since 6 ≡ −1 mod 7).
 * State variables are grouped into objects only for organization.
 * Be careful: careless reassignment may cause destructive side effects.
 * For correctness checking, weekday calculation is performed
 * using a Julian Day–based formula separate from the game's internal method.
 * Debugging utility: View per-question result logs in DevTools console (F12).
 ---
 * 当ゲームの曜日算出方式はDooms Day方式とは異なります(途中経過の値も異なります)
 * センチュリーアンカーのみ数値として一致します
 * 30.61と30.6の数式を組み合わせて使用する場合は必ず3月1日を基準に2月29日までの366日で閉じてください（367日目が2月判定になります）
 * 30.61の数式は「何日までがその月に含まれるか」の近似と考えてください
 * intercalaryの値は−1のまま使用するとusedCards.day[-1]で配列範囲外アクセスになるため6を使用しています(6 ≡ -1 mod 7)
 * 変数群はオブジェクトに閉じているだけなので不用意な書き換えによる破壊的変更に注意してください
 * 正誤判定の曜日算出には独自式とは別のユリウス日を元にした計算式を使用しています
 * 出題ごとの判定結果がDevToolsコンソール（F12）で確認できます
 */

/***********************************************
  Default Variables
***********************************************/
(() => {
  const DEFAULT_VALUE_SETTINGS = {
    TIME_LIMIT: 30 * 1000, // milliSec
    ANSWER_REVEAL_DELAY: 0.6 * 1000, // milliSec
    WHITE_OUT_DELAY: 9 * 1000, // milliSec game-end-flash 9s ease-outと合わせる
    ANNUAL_DAYS: 366, // 年間日数（うるう日含む）366が2月29日 367は2月30日
    NUMBER_OF_CYCLE: 2, // 366問9999.99秒なら2周分（732問）でクリアまたはゲームオーバー
    NUMBER_OF_QUESTION: 366, // 総問題数（重複しない日付366日分を試すなら366）
    QUESTIONS_MIN: 0, // 残問数0で勝利
    REMAINING_TIME_MAX: 999999, // *10ms(9999.99sec) １問未満で時間切れに設定するとtotalTimeが0でのまま終了
    REMAINING_TIME_MIN: 0, // 残時間0で敗北
    MAIN_CARD_DAMAGE: 10000, // 曜日を間違えるとremainingTimeから引かれる時間（ペナルティ）
    SUB_CARD_DAMAGE: 1000, // 補助カードを間違えるとremainingTimeから引かれる時間(同上)
    DEFAULT_MONTH_ADJUST_INDEX: 3, // MONTH ADJUSTボタンの初期選択位置
    YEAR_DIGITS: 5, // このゲームでは5桁年(カードが5枚分なので)
    TIME_IS_UP: 7, // CALENDAR.WEEKDAY_LABELS[7]
    CALCULATION_CARDS_LENGTH: 7,
  };

  const IMG_PATH_SETTINGS = {
    IMG_DIRECTORY_PATH: "img/",
    BG_IMG_NORMAL: "is_safe",
    BG_IMG_DAMAGED: "under_fire",
    BG_IMG_EXT: ".jpg",
    CARD_IMG_EXT: ".png",
  };

  const CARD_PATH_SETTINGS = {
    RED_CARD: `${IMG_PATH_SETTINGS.IMG_DIRECTORY_PATH}red${IMG_PATH_SETTINGS.CARD_IMG_EXT}`,
    BLUE_CARD: `${IMG_PATH_SETTINGS.IMG_DIRECTORY_PATH}blue${IMG_PATH_SETTINGS.CARD_IMG_EXT}`,
  };

  /***********************************************
    Get Card Path
  ***********************************************/

  const getCardPath = (value) => {
    return `${IMG_PATH_SETTINGS.IMG_DIRECTORY_PATH}${value}${IMG_PATH_SETTINGS.CARD_IMG_EXT}`;
  };

  /***********************************************
    Cards container elements
  ***********************************************/

  const Cards = {
    current: {
      year: document.querySelectorAll(".year-card-current"),
      month: document.querySelectorAll(".month-card-current"),
      date: document.querySelectorAll(".date-card-current"),
      day: document.querySelector(".day-card-current"),
      back: document.querySelectorAll(".card-back-current"),
    },
    previous: {
      year: document.querySelectorAll(".year-card-previous"),
      month: document.querySelectorAll(".month-card-previous"),
      date: document.querySelectorAll(".date-card-previous"),
      day: document.querySelector(".day-card-previous"),
      back: document.querySelectorAll(".card-back-previous"),
    },
    calculating: {
      intercalary: document.querySelector("#intercalary-card-calculating"),
      century: document.querySelectorAll(".century-card-calculating"),
      year: document.querySelectorAll(".year-card-calculating"),
      month: document.querySelectorAll(".month-card-calculating"),
      date: document.querySelectorAll(".date-card-calculating"),
      day: document.querySelectorAll(".day-card-calculating"),
      back: document.querySelectorAll(".card-back-calculating"),
    },
  };

  /***********************************************
    Control Cards Open
  ***********************************************/

  const CARD_OFFSET = {
    SPADE_CARD: 0, // 年
    CLOVER_CARD: 10, // 月
    DIAMOND_CARD: 20, // 日付
    HEART_WEEKDAY_CARD: 40, // 曜日
  };

  // うるう年の時はうるう年カードを開く（月を問わない
  const openIntercalaryCard = () => {
    usedCards.intercalary = false; // 初期化
    if (calendarState.intercalary === true) {
      Cards.calculating.intercalary.setAttribute("src", getCardPath("s1"));
    } else {
      usedCards.intercalary = true;
    }
  };

  const openCardsCalculating = (group, usedArrayRef, offset = 0, limit = null) => {
    // usedCardsを初期化
    if (Array.isArray(usedArrayRef)) {
      usedArrayRef.length = 0;
    }
    // limit枚まで開く(selectDay) limitがなければgroup全体を開く
    const len = limit !== null ? limit : group.length;
    for (let i = 0; i < len; i++) {
      const el = group[i];
      if (!el) continue;
      el.setAttribute("src", getCardPath(i + offset));
    }
  };

  const openCenturyCardsCalculating = () => {
    openCardsCalculating(Cards.calculating.century, usedCards.century, CARD_OFFSET.SPADE_CARD);
  };

  const openYearCardsCalculating = () => {
    openCardsCalculating(Cards.calculating.year, usedCards.year, CARD_OFFSET.SPADE_CARD);
  };

  const openMonthCardsCalculating = () => {
    openCardsCalculating(Cards.calculating.month, usedCards.month, CARD_OFFSET.CLOVER_CARD);
  };

  const openDateCardsCalculating = () => {
    openCardsCalculating(Cards.calculating.date, usedCards.date, CARD_OFFSET.DIAMOND_CARD);
  };

  const openDayCardsCalculating = () => {
    openCardsCalculating(
      Cards.calculating.day,
      usedCards.day,
      CARD_OFFSET.HEART_WEEKDAY_CARD,
      Cards.calculating.day.length - 1, // TimeIsUp == selectDay(7) 時間切れ判定の8要素目を封印する引値
    );
  };

  const openCardsQuestion = (group, values) => {
    for (let i = 0; i < values.length; i++) {
      group[i].setAttribute("src", getCardPath(values[i]));
    }
  };

  // centuryCardsはyearCardsに含まれる（同時に開かれる）ためopenCentury関数は存在しない
  const openYearCardsQuestion = () => {
    openCardsQuestion(Cards.current.year, digitsForCards.year);
    Cards.current.year[1].style.opacity = OPACITY.MID;
    Cards.current.year[2].style.opacity = OPACITY.MID;
  };

  const openMonthCardsQuestion = () => {
    openCardsQuestion(Cards.current.month, digitsForCards.month);
  };

  const openDateCardsQuestion = () => {
    openCardsQuestion(Cards.current.date, digitsForCards.date);
  };

  // 解答表示用関数
  const openDayCardAnswer = () => {
    Cards.current.day.setAttribute("src", getCardPath(Answer.day + CARD_OFFSET.HEART_WEEKDAY_CARD));
  };

  /***********************************************
    Control Cards Close
  ***********************************************/

  const closeIntercalaryCard = () => {
    Cards.calculating.intercalary.setAttribute("src", `${IMG_PATH_SETTINGS.IMG_DIRECTORY_PATH}y.png`);
  };

  const closeCards = (groups, dayCardEl) => {
    for (const group of groups) {
      for (const el of group) {
        el.setAttribute("src", CARD_PATH_SETTINGS.RED_CARD);
      }
    }
    dayCardEl.setAttribute("src", CARD_PATH_SETTINGS.RED_CARD);
  };

  const closeCardsQuestion = (group) => {
    for (let i = 0; i < group.length; i++) {
      group[i].setAttribute("src", CARD_PATH_SETTINGS.RED_CARD);
    }
  };

  // centuryCardsはyearCardsに含まれる（同時に閉じられる）ためcloseCentury関数は存在しない
  const closeYearCards = () => {
    closeCardsQuestion(Cards.current.year);
  };

  const closeMonthCards = () => {
    closeCardsQuestion(Cards.current.month);
  };

  const closeDateCards = () => {
    closeCardsQuestion(Cards.current.date);
  };

  const closeDayCardAnser = () => {
    Cards.current.day.setAttribute("src", CARD_PATH_SETTINGS.RED_CARD);
  };

  const setCardGroupFromValues = (group, values, offset = 0) => {
    for (let i = 0; i < values.length; i++) {
      group[i].setAttribute("src", getCardPath(values[i] + offset));
    }
  };

  const shiftCurrentCardsToPreviousCards = () => {
    setCardGroupFromValues(Cards.previous.year, digitsForCards.year);
    setCardGroupFromValues(Cards.previous.month, digitsForCards.month);
    setCardGroupFromValues(Cards.previous.date, digitsForCards.date);
    Cards.previous.day.setAttribute("src", getCardPath(Answer.day + CARD_OFFSET.HEART_WEEKDAY_CARD));
  };

  /***********************************************
    Control Opacity
  ***********************************************/

  const OPACITY = {
    FULL: 1,
    MID: 0.8,
    DIM: 0.6,
  };

  const setOpacityAllCards = (value) => {
    const groups = [
      Cards.current.year,
      Cards.current.month,
      Cards.current.date,
      Cards.current.back,
      Cards.calculating.century,
      Cards.calculating.year,
      Cards.calculating.month,
      Cards.calculating.date,
      Cards.calculating.day,
      Cards.calculating.back,
    ];
    for (const group of groups) {
      if (!group) continue;
      for (const el of group) {
        el.style.opacity = value;
      }
    }
    if (Cards.calculating.intercalary) {
      Cards.calculating.intercalary.style.opacity = value;
    }
  };

  // 必要に応じて追加 要微調整
  const transparentAllCards = () => {
    setOpacityAllCards(OPACITY.DIM);
  };

  const resetCardOpacity = () => {
    setOpacityAllCards(OPACITY.FULL);
  };

  const setOpacityPreviousCards = (value) => {
    const groups = [Cards.previous.year, Cards.previous.month, Cards.previous.date, Cards.previous.back];
    for (const group of groups) {
      if (!group) continue;
      for (const el of group) {
        el.style.opacity = value;
      }
    }
    Cards.previous.day.style.opacity = value;
  };

  const transparentPreviousCards = () => {
    setOpacityPreviousCards(OPACITY.DIM);
  };

  const resetOpacityPreviousCards = () => {
    setOpacityPreviousCards(OPACITY.FULL);
  };

  /***********************************************
    UI Container Elements
  ***********************************************/

  const UI = {
    container: document.querySelector(".ui-container"),
    buttons: {
      otherGames: document.querySelector("#other-games-button"),
      gameA: document.querySelector("#game-a-button"),
      gameB: document.querySelector("#game-b-button"),
      resumeGame: document.querySelector("#resume-game-button"),
      start: document.querySelector("#start-button"),
      reset: document.querySelector("#reset-button"),
      monthAdjust: document.querySelectorAll(".month-adjust-button"),
    },
    status: {
      resources: document.querySelector("#status-resources"),
      remainingQuestions: document.querySelector("#remaining-questions-value"),
      totalCount: document.querySelector("#total-count-value"),
      remainingTime: document.querySelector("#remaining-time-value"),
      clean: document.querySelector("#clean-value"),
      combo: document.querySelector("#combo-value"),
      assistMisses: document.querySelector("#assist-misses-value"),
      answerMisses: document.querySelector("#answer-misses-value"),
      totalTime: document.querySelector("#total-time-value"),
      averageTime: document.querySelector("#average-time-value"),
      timer: document.querySelector("#timer-value"),
      timeHistory: document.querySelectorAll(".time-history-values"),
    },
    result: {
      indicator: document.querySelector("#result-indicator"),
      totalResult: document.querySelector("#total-result"),
    },
  };

  /***********************************************
    Draw UI Values
  ***********************************************/

  const drawUIValues = () => {
    UI.status.remainingQuestions.innerText = hudState.remainingQuestions;
    UI.status.remainingTime.innerText = hudState.remainingTime;
    UI.status.totalCount.innerText = hudState.totalCount;
    UI.status.clean.innerText = hudState.clean;
    UI.status.combo.innerText = hudState.combo;
    UI.status.answerMisses.innerText = hudState.misses.answer;
    UI.status.assistMisses.innerText = hudState.misses.assist;
  };

  /***********************************************
    Variables
  ***********************************************/

  const INITIAL_GAME_STATE = {
    pause: true,
    nonstop: true,
    clean: true,
    win: false,
    lose: false,
    daySelected: false,
  };

  let gameState = structuredClone(INITIAL_GAME_STATE);

  const initializeGameState = () => {
    gameState = structuredClone(INITIAL_GAME_STATE);
  };

  const INITIAL_HUD_STATE = {
    remainingTime: DEFAULT_VALUE_SETTINGS.REMAINING_TIME_MAX,
    remainingQuestions: DEFAULT_VALUE_SETTINGS.NUMBER_OF_QUESTION,
    totalCount: 0,
    combo: 0,
    clean: 0,
    misses: {
      assist: 0,
      answer: 0,
    },
  };

  let hudState = structuredClone(INITIAL_HUD_STATE);

  const initializeHudState = () => {
    hudState = structuredClone(INITIAL_HUD_STATE);
  };

  const INITIAL_CALENDAR_STATE = {
    intercalary: false,
    centuryData: null,
    yearData: "", // 各配列の要素が1桁分の数字なので一度文字列型に結合して取る
    monthData: null, // 1〜12の乱数（0〜11ではない）
    dateData: null, // 日付用の乱数
  };

  let calendarState = structuredClone(INITIAL_CALENDAR_STATE);

  const initializeCalendarState = () => {
    calendarState = structuredClone(INITIAL_CALENDAR_STATE);
  };

  const INITIAL_QUESTION_STATE = {
    questionSequence: [], // 出題される日付の配列
    questionIndex: 0, // 出題中の配列要素
    currentQuestionDay: null, // 現在出題されている日付（3/1起点 1〜366）
    year00Questions: [], // 00年問題を強制出題する日付の配列
    year00Index: 0, // 00年問題が強制出題されると1進む
  };

  let questionState = structuredClone(INITIAL_QUESTION_STATE);

  const initializeQuestionState = () => {
    questionState = structuredClone(INITIAL_QUESTION_STATE);
  };

  const INITIAL_ANSWER_STATE = {
    intercalary: 0,
    century: null,
    year: 0,
    month: null,
    date: null,
    day: null,
    intercalaryDisplay: null,
    WEEKDAY_LABELS: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "\nTime is up"],
    selectedAnswer: "Not Selected.",
  };

  let Answer = structuredClone(INITIAL_ANSWER_STATE);

  const initializeAnswerState = () => {
    Answer = structuredClone(INITIAL_ANSWER_STATE);
  };

  const INITIAL_MARKING_STATE = {
    correct: false,
    incorrect: false,
    timeIsUp: false,
  };

  let markingState = structuredClone(INITIAL_MARKING_STATE);

  const initializeMarkingState = () => {
    markingState = structuredClone(INITIAL_MARKING_STATE);
  };

  // trueが入っている要素は使用済
  const INITIAL_USEDCARDS_STATE = {
    intercalary: false,
    century: [],
    year: [],
    month: [],
    date: [],
    day: [],
  };

  let usedCards = structuredClone(INITIAL_USEDCARDS_STATE);

  const initializeUsedCards = () => {
    usedCards = structuredClone(INITIAL_USEDCARDS_STATE);
  };

  // まとめてリセットする必要がない（してもよい）
  const digitsForCards = {
    year: [],
    month: [],
    date: [],
  };

  /***********************************************
    Timer
  ***********************************************/

  const INITIAL_TIMER_STATE = {
    countMilliSec: 0,
    intervalId: null,
    totalTime: 0,
    averageTime: 0,
    display: {
      sec: "00",
      milliSec: "00",
      text: "00.00sec",
    },
  };

  let timerState = structuredClone(INITIAL_TIMER_STATE);

  const initializeTimerState = () => {
    timerState = structuredClone(INITIAL_TIMER_STATE);
  };

  const formatToStrAndPad = (value) => {
    return value.toString().padStart(2, "0");
  };

  const formatToFixAndPad = (value) => {
    return value.toFixed(2).padStart(5, "0");
  };

  const formatCenturyAnswer = (value) => {
    return value.toString().padStart(3);
  };
  const tickTimer = () => {
    timerState.countMilliSec += 10;
  };

  const updateTimerDisplay = () => {
    const sec = Math.floor(timerState.countMilliSec / 1000) % 60;
    const milliSec = timerState.countMilliSec % 1000;
    timerState.display.sec = formatToStrAndPad(sec);
    timerState.display.milliSec = formatToStrAndPad(milliSec).slice(0, 2);
    timerState.display.text = `${timerState.display.sec}.${timerState.display.milliSec}sec`;
  };

  const renderTimer = () => {
    UI.status.timer.innerText = timerState.display.text;
    UI.status.remainingTime.innerText = hudState.remainingTime;
  };

  const timeMarker = () => {
    tickTimer();
    hudState.remainingTime--;
    if (hudState.remainingTime <= DEFAULT_VALUE_SETTINGS.REMAINING_TIME_MIN) {
      stopTimer();
      hudState.remainingTime = DEFAULT_VALUE_SETTINGS.REMAINING_TIME_MIN;
      damageFlash();
      damageBackgroundImgChange();
      judgement();
    }
    if (timerState.countMilliSec >= DEFAULT_VALUE_SETTINGS.TIME_LIMIT) {
      selectDay(7);
      markingState.timeIsUp = true;
    }
    updateTimerDisplay();
    renderTimer();
  };

  const startTimer = () => {
    timerState.intervalId = setInterval(timeMarker, 10);
  };

  const stopTimer = () => {
    clearInterval(timerState.intervalId);
  };

  const resetTimer = () => {
    timerState.countMilliSec = 0;
  };

  const shiftRecord = (list, value) => {
    for (let i = 0; i < list.length - 1; i++) {
      list[i].innerText = list[i + 1].textContent;
    }
    list[list.length - 1].innerText = value;
  };

  const recordTimeResult = () => {
    const value = timerState.display.text;
    shiftRecord(UI.status.timeHistory, value);
    if (markingState.correct) {
      UI.status.timeHistory[UI.status.timeHistory.length - 1].innerText = `○${value}`;
      markingState.correct = false;
    } else if (markingState.incorrect || markingState.timeIsUp) {
      UI.status.timeHistory[UI.status.timeHistory.length - 1].innerText = `×${value}`;
    }
  };

  const calculateAverageTime = () => {
    if (!gameState.win && !gameState.lose) {
      timerState.totalTime += parseInt(timerState.display.sec) + parseInt(timerState.display.milliSec) / 100;
    }
    if (hudState.totalCount !== 0) {
      timerState.averageTime = timerState.totalTime / hudState.totalCount;
    }
    UI.status.totalTime.innerText = `${formatToFixAndPad(timerState.totalTime)}sec`;
    UI.status.averageTime.innerText = `${formatToFixAndPad(timerState.averageTime)}sec`;
  };

  const initializeTimerValuesAndElements = () => {
    initializeTimerState();
    for (let i = 0; i < UI.status.timeHistory.length; i++) {
      UI.status.timer.innerHTML = timerState.display.text;
      UI.status.totalTime.innerText = timerState.display.text;
      UI.status.averageTime.innerHTML = timerState.display.text;
      for (let i = 0; i < UI.status.timeHistory.length; i++) {
        UI.status.timeHistory[i].textContent = timerState.display.text;
      }
    }
  };

  /************************
    Month Adjust
  ************************/

  UI.buttons.monthAdjust.forEach((btn, index) => {
    btn.onclick = () => setAdjuster(index);
  });

  const MONTH_ADJUST_TABLE = [3, 2, 1, 0, 6, 5, 4];

  const setAdjuster = (index) => {
    monthAdjust.monthAdjustValue = MONTH_ADJUST_TABLE[index];

    UI.buttons.monthAdjust.forEach((el, i) => {
      el.style.opacity = i === index ? OPACITY.DIM : OPACITY.FULL;
    });

    return (monthAdjust.recordedAdjustIndex = index);
  };

  const monthAdjust = {
    recordedAdjustIndex: DEFAULT_VALUE_SETTINGS.DEFAULT_MONTH_ADJUST_INDEX, // この値はreset時も引き継ぐ（初期化しない）
    monthAdjustValue: null,
  };

  /***********************************************
    Pause Game
  ***********************************************/

  const pauseGame = () => {
    gameState.pause = true;
    UI.buttons.start.hidden = false;
  };

  /***********************************************
    Answer Section
  ************************************************/

  const calculateJulianDayNumber = () => {
    const y = parseInt(calendarState.yearData);
    const k = Math.floor((14 - calendarState.monthData) / 12);
    return (
      Math.floor(((-k + y + 4800) * 1461) / 4) +
      Math.floor(((k * 12 + calendarState.monthData - 2) * 367) / 12) -
      Math.floor((Math.floor((-k + y + 4900) / 100) * 3) / 4) +
      calendarState.dateData -
      32075
    );
  };

  const getWeekdayFromJDN = (jdn) => {
    return Answer.WEEKDAY_LABELS[(jdn + 1) % 7];
  };

  const outPutWeekDay = () => {
    return getWeekdayFromJDN(calculateJulianDayNumber());
  };

  const outPutselectedAnswer = (cardIndex) => {
    return Answer.WEEKDAY_LABELS[cardIndex];
  };

  const setDayAnswer = () => {
    const jdn = calculateJulianDayNumber();
    Answer.day = (jdn + 1) % 7;
  };

  const calculateHitRate = () => {
    ((DEFAULT_VALUE_SETTINGS.NUMBER_OF_QUESTION - hudState.remainingQuestions) / hudState.totalCount) * 100 || 0;
  };

  const outPutResult = () => {
    const prefix = markingState.correct
      ? "%c○ CORRECT\n"
      : markingState.timeIsUp
        ? "%c× TimeIsUp\n"
        : "%c× INCORRECT\n";
    const selectedAnswer = `SelectedAnswer:${Answer.selectedAnswer}`;
    const time = `${timerState.display.text.slice(0, 5)}sec`;
    const questionNumber = `QuestionNumber:${questionState.questionIndex + 1}`;
    const fullYear = `FullYear:${calendarState.yearData}`;
    const SerialDay = `SerialDayFrom3/1 :${questionState.currentQuestionDay}`;
    const jdn = `JDN:${calculateJulianDayNumber()}`;
    const century = `Century:${formatCenturyAnswer(calendarState.centuryData)}  CA=${Answer.century}`;
    const year = `Year   : ${calendarState.yearData.toString().slice(-2)}  YA=${Answer.year}`;
    const month = `Month  : ${formatToStrAndPad(calendarState.monthData)}  MA=${Answer.month}`;
    const date = `Date   : ${formatToStrAndPad(calendarState.dateData)}  DA=${Answer.date}(${calendarState.dateData})`;
    const intercalary = `Intercalary: IA=${Answer.intercalaryDisplay}`;
    const weekDayAnswerBase = Answer.century + Answer.year + Answer.month + Answer.intercalaryDisplay; // (-1≡6 mod7)
    const weekDayAnswerRaw = weekDayAnswerBase + Answer.date;
    const weekDayValueRaw = weekDayAnswerBase + calendarState.dateData;
    const weekDayAnswerValue = weekDayValueRaw % 7;
    const weekDayData = `WeekDay:${outPutWeekDay()}  WD=${weekDayAnswerValue}(${weekDayAnswerRaw},${weekDayValueRaw})`;
    console.log(
      [
        prefix,
        selectedAnswer,
        time,
        questionNumber,
        fullYear,
        SerialDay,
        jdn,
        "",
        century,
        year,
        month,
        date,
        intercalary,
        weekDayData,
      ].join("\n"),
      "font-size:20px;",
    );
    const HitRate =
      ((DEFAULT_VALUE_SETTINGS.NUMBER_OF_QUESTION - hudState.remainingQuestions) / hudState.totalCount) * 100 || 0;
    if (gameState.win || gameState.lose)
      console.log(
        `%c${[
          `${formatToFixAndPad(timerState.totalTime)}sec`,
          `(${formatToFixAndPad(timerState.totalTime / 60)}min)`,
          `AverageTime:`,
          `${formatToFixAndPad(timerState.averageTime)}sec`,
          `HitRate:`,
          `${formatToFixAndPad(HitRate)}%`,
          `(DayAnswer)`,
        ].join("\n")}`,
        "font-size:20px;",
      );
  };

  /***********************************************
    Questions Section
  ************************************************/

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  };

  const generateDayArray = (n) => {
    return Array.from({ length: n }, (_, i) => i + 1);
  };

  // 必要に応じて追加
  const pickRandom00Years = (dayArray) => {
    const shuffled = [...dayArray];
    shuffleArray(shuffled);
    return shuffled.slice(0, 10).sort((a, b) => a - b);
  };

  const generateShuffledYearDays = () => {
    const days = generateDayArray(DEFAULT_VALUE_SETTINGS.ANNUAL_DAYS);
    shuffleArray(days);
    return days;
  };

  const setQuestionSequence = () => {
    const annualCycle = generateShuffledYearDays();
    const questionSequenceArray = [];
    for (let i = 0; i < DEFAULT_VALUE_SETTINGS.NUMBER_OF_CYCLE; i++) {
      questionSequenceArray.push(...annualCycle);
    }
    questionState.questionSequence = questionSequenceArray;
    console.log("questionSequence", questionSequenceArray);
  };

  /***********************************************
    Intercalary Section
  ***********************************************/

  const isIntercalaryYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  };

  const getIntercalaryAnswer = (year, month) => {
    if (!isIntercalaryYear(year)) return 0;
    return month <= 2 ? 6 : 0; // 6 ≡ -1 mod 7
  };

  const getIntercalaryDisplay = (year, month) => {
    if (!isIntercalaryYear(year)) return 0;
    return month <= 2 ? -1 : 0; // 6 ≡ -1 mod 7
  };

  const setIntercalaryAnswer = (year, month) => {
    Answer.intercalary = getIntercalaryAnswer(year, month);
    Answer.intercalaryDisplay = getIntercalaryDisplay(year, month);
    calendarState.intercalary = isIntercalaryYear(year);
  };

  /***********************************************
    Century Section
  ***********************************************/

  const setCenturyAnswer = (year) => {
    calendarState.centuryData = Math.floor(year / 100);
    Answer.century = Math.floor((calendarState.centuryData % 4) * 5) % 7;
  };

  /***********************************************
    Year Section
  ***********************************************/

  const generateRandomDigits = (n) => {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 10));
  };

  const setYearAnswer = () => {
    digitsForCards.year = generateRandomDigits(DEFAULT_VALUE_SETTINGS.YEAR_DIGITS);
    // 00年問題強制出題時の対処
    if (hudState.totalCount === questionState.year00Questions[questionState.year00Index]) {
      digitsForCards.year[digitsForCards.year.length - 1] = 0;
      digitsForCards.year[digitsForCards.year.length - 2] = 0;
      questionState.year00Index++;
    }
    calendarState.yearData = digitsForCards.year.join("");
    /* グレゴリオ暦採用時期が地域によって異なるため地域によって曜日が異なる場合がある
  2000年未満なら12000年に補正 1万年経過（400年周期）で同曜日になるため答えは変わらない */
    if (parseInt(calendarState.yearData) < 2000) {
      digitsForCards.year[0] = 1;
      calendarState.yearData = digitsForCards.year.join("");
    }
    // 年の答え
    const yy = parseInt(calendarState.yearData.slice(-2));
    Answer.year = (yy + Math.floor(yy / 4) + (7 - monthAdjust.monthAdjustValue)) % 7;
  };

  /***********************************************
    Month Section
  ***********************************************/

  const setMonthAnswer = () => {
    questionState.currentQuestionDay = questionState.questionSequence[questionState.questionIndex];
    if (questionState.currentQuestionDay === DEFAULT_VALUE_SETTINGS.ANNUAL_DAYS && Answer.intercalary !== 6) {
      ensureLeapYearForFeb29();
    }
    const { month, passedDays } = calculateMonthFromDayOfYear(questionState.currentQuestionDay);
    calendarState.monthData = month;
    Answer.month = calculateMonthAnswer(passedDays, month, monthAdjust.monthAdjustValue);
    digitsForCards.month = buildMonthValues(month);
  };

  const calculateMonthFromDayOfYear = (dayOfYear) => {
    const rawMonth = Math.floor((dayOfYear + 122) / 30.61); // このゲームは366日で閉じている
    const passedDays = Math.floor(rawMonth * 30.6) - 122; // 同上
    const month = ((rawMonth - 2) % 12) + 1;
    return { month, passedDays };
  };

  const ensureLeapYearForFeb29 = () => {
    while (Answer.intercalary !== 6) {
      calendarState.monthData = 2;
      calendarState.yearData = [];
      setYearAnswer();
      setCenturyAnswer(calendarState.yearData);
      setIntercalaryAnswer(calendarState.yearData, calendarState.monthData);
    }
  };

  const calculateMonthAnswer = (passedDays, month, adjust) => {
    const base = month > 2 ? 2 : 1;
    return (passedDays + base + adjust) % 7;
  };

  const buildMonthValues = (month) => {
    const tens = Math.floor(month / 10);
    const ones = month % 10;
    return [CARD_OFFSET.CLOVER_CARD + tens, CARD_OFFSET.CLOVER_CARD + ones];
  };

  /***********************************************
    Date Section
  ***********************************************/

  const splitTwoDigits = (n) => {
    return [Math.floor(n / 10), n % 10];
  };

  const setDateAnswer = () => {
    const { passedDays } = calculateMonthFromDayOfYear(questionState.currentQuestionDay);
    calendarState.dateData = questionState.currentQuestionDay - passedDays;
    const [tens, ones] = splitTwoDigits(calendarState.dateData);
    digitsForCards.date = [CARD_OFFSET.DIAMOND_CARD + tens, CARD_OFFSET.DIAMOND_CARD + ones];
    Answer.date = calendarState.dateData % 7;
  };

  /***********************************************
    Initialize Section
  ************************************************/

  const initializeBasicValuesAndElements = () => {
    initializeHudState();
    initializeQuestionState();
    initializeAnswerState();
    initializeCalendarState();
    initializeUsedCards();
    initializeGameState();
    initializeMarkingState();
    setAdjuster(monthAdjust.recordedAdjustIndex);
  };

  const initializeCalendarValuesAndElements = () => {
    closeIntercalaryCard();
    closeDayCardAnser();
    gameState.clean = true;
    calendarState.intercalary = false;
    Answer.intercalary = 0;
    calendarState.yearData = ""; // 配列の要素ごとに1桁分の数字が入っているので文字列型で取る必要がある
    UI.result.indicator.hidden = true;
  };

  // ゲーム開始時及びリセット時に呼ばれる
  const firstInitializer = () => {
    initializeBasicValuesAndElements();
    initializeTimerValuesAndElements();
    initializeCalendarValuesAndElements();
    setQuestionSequence();
    resetCardOpacity();
    drawUIValues();
    UI.buttons.start.hidden = true;
    UI.buttons.reset.hidden = false;
  };

  // リセット時に呼ばれる
  const initializeAll = () => {
    stopTimer();
    initializeBasicValuesAndElements();
    initializeTimerValuesAndElements();
    drawUIValues();
    closeCards([Cards.current.year, Cards.current.month, Cards.current.date], Cards.current.day); // Current閉じる
    closeCards([Cards.previous.year, Cards.previous.month, Cards.previous.date], Cards.previous.day); // Previous閉じる
    openCenturyCardsCalculating();
    openYearCardsCalculating();
    openMonthCardsCalculating();
    openDateCardsCalculating();
    openDayCardsCalculating();
    resetCardOpacity();
    UI.buttons.reset.hidden = true;
    UI.buttons.start.hidden = false;
    UI.buttons.start.inert = false;
    UI.buttons.monthAdjust.forEach((btn) => {
      btn.disabled = false;
    });
  };

  // 一問ごとに呼ばれる
  const calendarStart = () => {
    initializeCalendarValuesAndElements();
    setYearAnswer();
    setCenturyAnswer(calendarState.yearData); // 年データを使うのでこの位置
    setMonthAnswer();
    setIntercalaryAnswer(calendarState.yearData, calendarState.monthData); // 年データ・月データを使うのでこの位置
    setDateAnswer();
    setDayAnswer();
    openCenturyCardsCalculating();
    openYearCardsCalculating();
    openMonthCardsCalculating();
    openDateCardsCalculating();
    openDayCardsCalculating();
    resetCardOpacity();
    drawUIValues();
    openYearCardsQuestion();
    openMonthCardsQuestion();
    openDateCardsQuestion();
    openIntercalaryCard();
    gameState.pause = false;
    gameState.daySelected = false;
    recordTimeResult();
    resetTimer();
    startTimer();
  };

  /***********************************************
    Game End Section
  ************************************************/

  const totalResultHidden = () => {
    UI.result.totalResult.hidden = true;
  };

  const gameEnd = () => {
    calculateAverageTime();
    UI.result.indicator.hidden = true;
    const HitRate =
      ((DEFAULT_VALUE_SETTINGS.NUMBER_OF_QUESTION - hudState.remainingQuestions) / hudState.totalCount) * 100 || 0;
    UI.result.totalResult.innerHTML = `
    TotalTime:<br>
    ${formatToFixAndPad(timerState.totalTime)}sec<br>
    (${formatToFixAndPad(timerState.totalTime / 60)}min)<br>
    AverageTime:<br>
    ${formatToFixAndPad(timerState.averageTime)}sec<br>
    HitRate:<br>
    ${formatToFixAndPad(HitRate)}%<br>
    (DayAnswer)
  `;
    UI.result.totalResult.hidden = false;
    UI.buttons.reset.hidden = true; // 必要
    UI.buttons.start.hidden = false; // 必要
    UI.buttons.start.inert = true; // 必要
    pauseGame();
    whiteOut();
    setTimeout(totalResultHidden, DEFAULT_VALUE_SETTINGS.WHITE_OUT_DELAY);
    setTimeout(initializeAll, DEFAULT_VALUE_SETTINGS.WHITE_OUT_DELAY);
  };

  const judgement = () => {
    // 敗北が決定した場合
    if (hudState.remainingTime <= DEFAULT_VALUE_SETTINGS.REMAINING_TIME_MIN) {
      hudState.remainingTime = DEFAULT_VALUE_SETTINGS.REMAINING_TIME_MIN;
      gameState.lose = true;
      gameEnd();
      // 勝利が決定した場合
    } else if (hudState.remainingQuestions <= DEFAULT_VALUE_SETTINGS.QUESTIONS_MIN) {
      hudState.remainingQuestions = DEFAULT_VALUE_SETTINGS.REMAINING_TIME_MIN;
      gameState.win = true;
      gameEnd();
    }
    drawUIValues();
  };

  /***********************************************
    Regions
  ***********************************************/

  const regions = {
    gameBoard: document.querySelector("#game-board"),
    modalOverlay: document.querySelector("#modal-overlay"),
    damageScreen: document.querySelector("#damage-screen"),
    uiContainer: document.querySelector(".ui-container"),
    otherGamesDialog: document.querySelector("#other-games-dialog"),
  };

  /***********************************************
    Selection Control
  ***********************************************/

  const canSelect = (usedFlag) => {
    return !gameState.pause && !usedFlag;
  };

  const lockRemainingCards = (cardEls, usedFlags) => {
    for (let i = 0; i < cardEls.length; i++) {
      if (usedFlags[i]) {
        cardEls[i].style.opacity = OPACITY.DIM;
        continue;
      }
      cardEls[i].setAttribute("src", CARD_PATH_SETTINGS.BLUE_CARD);
      cardEls[i].style.opacity = OPACITY.DIM;
      usedFlags[i] = true;
    }
  };

  /***********************************************
    Visual Effects
  ***********************************************/

  const damageFlash = () => {
    regions.damageScreen.classList.add("damage-flash");
    setTimeout(() => {
      regions.damageScreen.classList.remove("damage-flash");
    }, DEFAULT_VALUE_SETTINGS.ANSWER_REVEAL_DELAY);
  };

  const damageBackgroundImgChange = () => {
    const ui = regions.uiContainer;
    ui.classList.add("under-fire");
    setTimeout(() => {
      ui.classList.remove("under-fire");
    }, DEFAULT_VALUE_SETTINGS.ANSWER_REVEAL_DELAY);
  };

  const whiteOut = () => {
    regions.damageScreen.classList.add("game-end-flash");
    setTimeout(() => {
      regions.damageScreen.classList.remove("game-end-flash");
    }, DEFAULT_VALUE_SETTINGS.WHITE_OUT_DELAY);
  };

  /***********************************************
    Success Handling
  ***********************************************/

  const handleCorrectDayAnswer = (cardIndex) => {
    usedCards.day[cardIndex] = true;
    UI.result.indicator.innerText = `○${timerState.display.sec}.${timerState.display.milliSec}sec`;
    markingState.correct = true;
    for (let i = 0; i < Cards.calculating.day.length - 1 /* 時間切れ用の7がある(8要素ある)ため-1 */; i++) {
      if (usedCards.day[i] === true) {
        continue;
      }
      Cards.calculating.day[i].setAttribute("src", CARD_PATH_SETTINGS.BLUE_CARD); // 正解カード以外閉じる
      usedCards.day[i] = true;
    }
    hudState.remainingQuestions = hudState.remainingQuestions - 1;
    UI.status.remainingQuestions.innerText = hudState.remainingQuestions;
    afterSelectDayCard(); // 要judgement前（この場所）
    judgement();
  };

  const finalizeDayselect = (cardIndex) => {
    Answer.selectedAnswer = outPutselectedAnswer(cardIndex);
    outPutResult();
    questionState.questionIndex++; // この場所
    gameState.daySelected = true;
  };

  /***********************************************
    Failure Handling
  ***********************************************/

  const handleSubCardFailure = (cardEl, usedFlags, index) => {
    cardEl[index].setAttribute("src", CARD_PATH_SETTINGS.RED_CARD);
    usedFlags[index] = true;
    subCardFailed();
  };

  const subCardFailed = () => {
    damageBackgroundImgChange();
    damageFlash();
    hudState.remainingTime = hudState.remainingTime - DEFAULT_VALUE_SETTINGS.SUB_CARD_DAMAGE;
    UI.status.remainingTime.innerText = hudState.remainingTime;
    hudState.misses.assist++;
    hudState.combo = 0;
    gameState.clean = false;
    judgement();
  };

  const dayCardFailed = () => {
    damageBackgroundImgChange();
    damageFlash();
    hudState.remainingTime = hudState.remainingTime - DEFAULT_VALUE_SETTINGS.MAIN_CARD_DAMAGE;
    UI.status.remainingTime.innerText = hudState.remainingTime;
    hudState.misses.answer++;
    afterSelectDayCard(); // 要judgement前（この場所）
    judgement();
  };

  const handleIncorrectDayAnswer = (cardIndex) => {
    gameState.clean = false;
    UI.result.indicator.innerText = `×${timerState.display.sec}.${timerState.display.milliSec}sec`;
    markingState.incorrect = true;
    Cards.calculating.day[cardIndex].setAttribute("src", CARD_PATH_SETTINGS.RED_CARD); // 誤答カードを閉じる
    usedCards.day[cardIndex] = true;
    dayCardFailed();
  };

  const handleTimeIsUp = () => {
    UI.result.indicator.innerText = "TIME_IS_UP.";
    UI.result.indicator.hidden = false;
    dayCardFailed();
  };

  /***********************************************
    After Selection
  ***********************************************/

  const afterSelectDayCard = () => {
    if (gameState.clean === true) {
      hudState.clean++;
      hudState.combo++;
    } else if (gameState.clean === false) {
      hudState.combo = 0;
    }
    useAllCards();
    resetCardOpacity();
    drawUIValues();
    openDayCardAnswer();
    transparentAllCards();
    calculateAverageTime();
    UI.result.indicator.hidden = false; // 正誤判定表示
    UI.result.indicator.style.opacity = OPACITY.FULL;
  };

  const useAllCards = () => {
    for (let i = 0; i < DEFAULT_VALUE_SETTINGS.CALCULATION_CARDS_LENGTH; i++) {
      usedCards.century[i] = true;
      usedCards.year[i] = true;
      usedCards.month[i] = true;
      usedCards.date[i] = true;
      usedCards.day[i] = true;
    }
  };

  /***********************************************
    Next Challenge
  ***********************************************/

  const nextChallenge = () => {
    if (gameState.win === true || gameState.lose === true) {
      gameState.nonstop = false; // 勝敗決定で出題を止める
    }
    gameState.pause = true;
    regions.gameBoard.inert = true;
    // 勝敗未決時は出題を続ける
    if (gameState.nonstop === true) {
      setTimeout(() => {
        shiftCurrentCardsToPreviousCards();
        regions.gameBoard.inert = false;
        calendarStart();
      }, DEFAULT_VALUE_SETTINGS.ANSWER_REVEAL_DELAY);
    }
  };

  /***********************************************
    Select Answers
  ***********************************************/

  const selectIntercalary = () => {
    if (!canSelect(usedCards.intercalary)) return;
    const isCorrect = calendarState.intercalary && (calendarState.monthData === 1 || calendarState.monthData === 2);
    if (!isCorrect) {
      Cards.calculating.intercalary.setAttribute("src", CARD_PATH_SETTINGS.RED_CARD);
      subCardFailed();
    }
    usedCards.intercalary = true;
    Cards.calculating.intercalary.style.opacity = OPACITY.DIM;
  };

  const selectCentury = (cardIndex) => {
    if (!canSelect(usedCards.century[cardIndex])) return;
    if (cardIndex === Answer.century) {
      usedCards.century[cardIndex] = true;
      lockRemainingCards(Cards.calculating.century, usedCards.century);
    } else {
      handleSubCardFailure(Cards.calculating.century, usedCards.century, cardIndex);
    }
  };

  const selectYear = (cardIndex) => {
    if (!canSelect(usedCards.year[cardIndex])) return;
    if (cardIndex === Answer.year) {
      usedCards.year[cardIndex] = true;
      lockRemainingCards(Cards.calculating.year, usedCards.year);
    } else {
      handleSubCardFailure(Cards.calculating.year, usedCards.year, cardIndex);
    }
  };

  const selectMonth = (cardIndex) => {
    if (!canSelect(usedCards.month[cardIndex])) return;
    if (cardIndex === Answer.month) {
      usedCards.month[cardIndex] = true;
      lockRemainingCards(Cards.calculating.month, usedCards.month);
    } else {
      handleSubCardFailure(Cards.calculating.month, usedCards.month, cardIndex);
    }
  };

  const selectDate = (cardIndex) => {
    if (!canSelect(usedCards.date[cardIndex])) return;
    if (cardIndex === Answer.date) {
      usedCards.date[cardIndex] = true;
      lockRemainingCards(Cards.calculating.date, usedCards.date);
    } else {
      handleSubCardFailure(Cards.calculating.date, usedCards.date, cardIndex);
    }
  };

  const selectDay = (cardIndex) => {
    if (!canSelect(usedCards.day[cardIndex])) return;
    stopTimer();
    hudState.totalCount++;
    if (cardIndex === DEFAULT_VALUE_SETTINGS.TIME_IS_UP) {
      handleTimeIsUp(cardIndex);
      finalizeDayselect(cardIndex); //必要（returnする）
      nextChallenge();
      return;
    }
    if (cardIndex === Answer.day) {
      handleCorrectDayAnswer(cardIndex);
    } else {
      handleIncorrectDayAnswer(cardIndex);
    }
    finalizeDayselect(cardIndex);
    if (gameState.win || gameState.lose) return;
    nextChallenge();
  };

  /***********************************************
    Buttons
  ***********************************************/

  UI.buttons.start.onclick = () => {
    UI.buttons.monthAdjust.forEach((btn) => {
      btn.disabled = true;
    });
    firstInitializer();
    calendarStart();
  };

  UI.buttons.reset.onclick = () => {
    initializeAll();
  };

  UI.buttons.otherGames.onclick = () => {
    openOtherGamesDialog();
  };

  Cards.calculating.intercalary.onclick = () => selectIntercalary(true);

  Cards.calculating.century.forEach((img, cardIndex) => {
    img.onclick = () => selectCentury(cardIndex);
  });

  Cards.calculating.year.forEach((img, cardIndex) => {
    img.onclick = () => selectYear(cardIndex);
  });

  Cards.calculating.month.forEach((img, cardIndex) => {
    img.onclick = () => selectMonth(cardIndex);
  });

  Cards.calculating.date.forEach((img, cardIndex) => {
    img.onclick = () => selectDate(cardIndex);
  });

  Cards.calculating.day.forEach((img, cardIndex) => {
    img.onclick = () => selectDay(cardIndex);
  });

  /************************
    Other Games
  ************************/

  const openOtherGamesDialog = () => {
    resetOpacityPreviousCards();
    regions.otherGamesDialog.hidden = false;
    regions.modalOverlay.hidden = false;
    UI.buttons.start.inert = true;
    UI.buttons.reset.inert = true;
    // プレイ中の場合
    if (UI.buttons.start.hidden === true) {
      gameState.pause = true;
      closeIntercalaryCard();
      closeYearCards();
      closeMonthCards();
      closeDateCards();
      closeDayCardAnser();
      stopTimer();
    }
    UI.buttons.resumeGame.onclick = () => {
      regions.modalOverlay.hidden = true;
      if (UI.buttons.start.hidden === true) {
        gameState.pause = false;
        openIntercalaryCard();
        openYearCardsQuestion();
        openMonthCardsQuestion();
        openDateCardsQuestion();
        startTimer();
      }
      regions.otherGamesDialog.hidden = true;
      UI.buttons.reset.inert = false;
      UI.buttons.start.inert = false;
      setOpacityPreviousCards();
    };
  };
})();

/*** End of JS ***/
