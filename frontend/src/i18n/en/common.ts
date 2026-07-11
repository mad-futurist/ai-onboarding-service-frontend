const mentorDashboard = {
  // Hero
  "mentor.dash.hero.eyebrow": "Кабіна ментора",
  "mentor.dash.hero.descActive":
    "AI наглядає за {count} онбордингами. {attention} потребують вашого ока.",
  "mentor.dash.hero.descActiveOne":
    "AI наглядає за {count} онбордингом. {attention} потребує вашого ока.",
  "mentor.dash.hero.descCalm":
    "AI наглядає за {count} онбордингами. Усе за планом — насолоджуйтесь тишею.",
  "mentor.dash.hero.descCalmOne":
    "AI наглядає за {count} онбордингом. Усе за планом — насолоджуйтесь тишею.",
  "mentor.dash.hero.descEmpty":
    "Почніть із першого новачка — AI накидає персональний план 30/60/90 за хвилини.",
  "mentor.dash.hero.actionKnowledge": "База знань",
  "mentor.dash.hero.actionAdd": "Додати новачка",

  // AI pulse strip
  "mentor.dash.pulse.template":
    "AI позначив {sigCount} сигналів · підготував {draftCount} відповідей · заощадив вам {hours}г цього тижня",
  "mentor.dash.pulse.fallback":
    "AI прогрівається. Додайте новачка, щоб запустити стрічку.",

  // KPI cards
  "mentor.dash.kpi.active.label": "Активні новачки",
  "mentor.dash.kpi.active.hintLoaded": "У {teamCount} командах",
  "mentor.dash.kpi.active.hintOneTeam": "Одна команда",
  "mentor.dash.kpi.active.hintEmpty": "Поки немає активних новачків",

  "mentor.dash.kpi.attention.label": "Потребує вашого ока",
  "mentor.dash.kpi.attention.hintLoaded":
    "{flagged} позначено · {blocked} заблоковано",
  "mentor.dash.kpi.attention.hintEmpty": "Нічого не позначено",

  "mentor.dash.kpi.progress.label": "Середній прогрес",
  "mentor.dash.kpi.progress.hintLoaded": "У {active} активних планах",
  "mentor.dash.kpi.progress.hintEmpty": "Поки немає активних планів",

  "mentor.dash.kpi.timeSaved.label": "Годин, які AI заощадив",
  "mentor.dash.kpi.timeSaved.hintLoaded": "Цього тижня, проти ручної роботи",
  "mentor.dash.kpi.timeSaved.hintEmpty": "Додайте новачка, щоб почати рахувати",

  // Today's focus
  "mentor.dash.today.needsTitle": "Що потребує вас сьогодні",
  "mentor.dash.today.needsEmpty":
    "Усе чисто. AI не знайшов нічого термінового — використайте час, щоб спланувати тиждень.",
  "mentor.dash.today.handledTitle": "Що AI зробив за ніч",
  "mentor.dash.today.handledEmpty":
    "AI ще нічого не торкався — дайте кілька годин після старту онбордингу.",

  "mentor.dash.today.rowBlocked":
    "{count} заблокованих завдань — 15-хвилинний дзвінок зазвичай розблоковує тиждень",
  "mentor.dash.today.rowSignal": "AI помітив: {signalTitle}",
  "mentor.dash.today.rowSlow":
    "Стартували {days} днів тому, прогрес досі менше 25% — варто звіритись",

  "mentor.dash.today.handledDrafted":
    "Накидав чернетку відповіді для {firstName}",
  "mentor.dash.today.handledSummarized":
    "Підсумував прогрес тижня 1 для {firstName}",
  "mentor.dash.today.handledResolved":
    "Автоматично закрив легкий сигнал для {firstName}",
  "mentor.dash.today.handledLink": "Відкрити",

  // Newcomers
  "mentor.dash.ncs.heading": "Ваші новачки",
  "mentor.dash.ncs.add": "Додати новачка",
  "mentor.dash.ncs.filterAll": "Усі ({n})",
  "mentor.dash.ncs.filterEyes": "Потребує ока ({n})",
  "mentor.dash.ncs.filterOk": "За планом ({n})",
  "mentor.dash.ncs.filterEmptyEyes":
    "Нічого не позначено. Поверніться до «Усі», щоб побачити когорту.",
  "mentor.dash.ncs.filterEmptyOk":
    "Поки ніхто не йде ідеально за планом — дайте день.",
  "mentor.dash.ncs.emptyTitle": "Поки немає новачків",
  "mentor.dash.ncs.emptyDesc":
    "Додайте першого новачка — AI накидає персональний план 30/60/90 за хвилини.",
  "mentor.dash.ncs.cardSignal": "Що помітив AI",

  // AI signals
  "mentor.dash.sig.heading": "AI-сигнали",
  "mentor.dash.sig.lastScan": "Останнє сканування {relativeTime}.",
  "mentor.dash.sig.openCenter": "Центр сигналів",
  "mentor.dash.sig.openShort": "Відкрити",
  "mentor.dash.sig.emptyTitle": "Поки немає сигналів",
  "mentor.dash.sig.emptyDesc":
    "AI сканує активність, заблоковані завдання та питання. Сигнали з'являться, щойно щось піде не так.",

  // Cohort heartbeat
  "mentor.dash.cohort.title": "Пульс когорти",
  "mentor.dash.cohort.subhead":
    "Кожна колонка — новачок. Вищі стовпчики означають більше зробленого. Кольорові «шапки» — AI щось помітив.",
  "mentor.dash.cohort.empty":
    "Поки немає когорти — пульс з'явиться, щойно матимете активного новачка.",
  "mentor.dash.cohort.tooltip": "{firstName} · {percent}% готово",
  "mentor.dash.cohort.tooltipSignal": "AI помітив: {signalTitle}",
  "mentor.dash.cohort.view": "Відкрити",

  // Mentor moves
  "mentor.dash.moves.title": "Кроки ментора",
  "mentor.dash.moves.subhead":
    "Три речі, які ви можете зробити в один клік просто зараз.",

  "mentor.dash.moves.checkIn.title": "Звіртеся з {firstName}",
  "mentor.dash.moves.checkIn.body":
    "У них {n} заблокованих завдань. 15-хвилинний дзвінок зазвичай розблоковує тиждень.",
  "mentor.dash.moves.checkIn.cta": "Запланувати 15 хв",

  "mentor.dash.moves.adjust.title": "Скоригуйте план {firstName}",
  "mentor.dash.moves.adjust.body":
    "AI помітив {signalTitle}. Хочете перебудувати наступні два тижні навколо цього?",
  "mentor.dash.moves.adjust.cta": "Відкрити генератор плану",

  "mentor.dash.moves.course.title": "Перетворіть «{topic}» на курс",
  "mentor.dash.moves.course.body":
    "Зустрічалося {count}× у різних новачків. AI може накидати короткий курс, який ви випустите сьогодні.",
  "mentor.dash.moves.course.cta": "Накидати курс",

  "mentor.dash.moves.empty.title": "Додайте новачка, щоб розблокувати кроки",
  "mentor.dash.moves.empty.body":
    "Щойно стартує онбординг, AI підкаже три кроки в один клік.",
  "mentor.dash.moves.empty.cta": "Додати новачка",

  // Week rollup
  "mentor.dash.week.title": "Цей тиждень у цифрах",
  "mentor.dash.week.subhead": "Що ви з AI зробили разом від понеділка.",
  "mentor.dash.week.tasks": "завдань завершено",
  "mentor.dash.week.signals": "сигналів закрито",
  "mentor.dash.week.drafts": "AI-чернеток ви схвалили",
  "mentor.dash.week.hours": "роботи ментора AI забрав на себе",
  "mentor.dash.week.celebrate": "Готово 🎉",
};

export default mentorDashboard;
