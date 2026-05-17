export type Locale = "en" | "uk";

export const LOCALES: { value: Locale; label: string; shortLabel: string }[] = [
  { value: "en", label: "English", shortLabel: "EN" },
  { value: "uk", label: "Українська", shortLabel: "UA" },
];

export const MESSAGES: Record<Locale, Record<string, string>> = {
  en: {
    "assessment.cta.eyebrow": "Day 1 calibration",
    "assessment.cta.title": "Your mentor prepared a quick skill check.",
    "assessment.cta.description":
      "Takes about {minutes} minutes. Your answers shape your personalized onboarding plan.",
    "assessment.cta.start": "Start your skill check",
    "assessment.cta.submitted": "Skill check submitted",
    "assessment.cta.submittedHint": "- your mentor is reviewing it.",

    "assessment.runner.eyebrow": "Skill check",
    "assessment.runner.progress": "Question {current} / {total}",
    "assessment.runner.back": "Back",
    "assessment.runner.next": "Next",
    "assessment.runner.submit": "Submit",
    "assessment.runner.submitting": "Submitting...",
    "assessment.runner.done.title": "All done!",
    "assessment.runner.done.body":
      "Your answers are with your mentor. We're personalizing your onboarding plan right now - see you on the dashboard.",
    "assessment.runner.placeholderScenario":
      "Walk us through how you'd approach this...",
    "assessment.runner.placeholderShort": "Type your answer here...",
    "assessment.runner.empty": "This assessment has no questions.",
    "assessment.runner.alreadyDone.title": "You're all set.",
    "assessment.runner.alreadyDone.body":
      "You already submitted this skill check. Your mentor is reviewing it.",
    "assessment.runner.backToDashboard": "Back to dashboard",

    "assessment.generator.title": "Generate skill assessment with AI",
    "assessment.generator.description":
      "Describe what you want to probe. The AI uses the role context, your notes and the selected sources to design a short skill check the newcomer takes on day 1.",
    "assessment.generator.notes.label":
      "Mentor notes (what should the test cover?)",
    "assessment.generator.notes.placeholder":
      "Focus on git fluency, our deployment flow, and async communication.",
    "assessment.generator.sources": "Sources to ground the questions",
    "assessment.generator.types": "Question types",
    "assessment.generator.count": "Number of questions",
    "assessment.generator.fast": "Generate (fast)",
    "assessment.generator.live": "Generate live",
    "assessment.generator.generating": "Generating...",
    "assessment.generator.streaming": "Streaming...",

    "settings.language.label": "Language",
    "settings.language.description":
      "Choose English or Ukrainian for the full interface. AI and ReadySet.AI stay unchanged.",
    "settings.language.active": "Active",

    // Mentor dashboard — hero
    "mentor.dash.hero.eyebrow": "Mentor cockpit",
    "mentor.dash.hero.descActive":
      "AI is watching {count} onboardings. {attention} need a look from you.",
    "mentor.dash.hero.descActiveOne":
      "AI is watching {count} onboarding. {attention} needs a look from you.",
    "mentor.dash.hero.descCalm":
      "AI is watching {count} onboardings. Everything's on track — enjoy the quiet.",
    "mentor.dash.hero.descCalmOne":
      "AI is watching {count} onboarding. Everything's on track — enjoy the quiet.",
    "mentor.dash.hero.descEmpty":
      "Start by adding your first newcomer — AI will draft a personalized 30/60/90 plan in minutes.",
    "mentor.dash.hero.actionKnowledge": "Open knowledge base",
    "mentor.dash.hero.actionAdd": "Add newcomer",

    // Mentor dashboard — AI pulse strip
    "mentor.dash.pulse.template":
      "AI flagged {sigCount} signals · drafted {draftCount} answers · saved you {hours}h this week",
    "mentor.dash.pulse.fallback":
      "AI is warming up. Add a newcomer to start the feed.",

    // Mentor dashboard — KPI cards
    "mentor.dash.kpi.active.label": "Active newcomers",
    "mentor.dash.kpi.active.hintLoaded": "Across {teamCount} teams",
    "mentor.dash.kpi.active.hintOneTeam": "One team",
    "mentor.dash.kpi.active.hintEmpty": "No active newcomers yet",
    "mentor.dash.kpi.attention.label": "Needs your eyes",
    "mentor.dash.kpi.attention.hintLoaded": "{flagged} flagged · {blocked} blocked",
    "mentor.dash.kpi.attention.hintEmpty": "Nothing flagged",
    "mentor.dash.kpi.progress.label": "Average progress",
    "mentor.dash.kpi.progress.hintLoaded": "Across {active} active plans",
    "mentor.dash.kpi.progress.hintEmpty": "No plans active yet",
    "mentor.dash.kpi.timeSaved.label": "Hours AI saved you",
    "mentor.dash.kpi.timeSaved.hintLoaded": "This week, vs. doing it manually",
    "mentor.dash.kpi.timeSaved.hintEmpty": "Add a newcomer to start counting",

    // Mentor dashboard — Today's focus
    "mentor.dash.today.needsTitle": "What needs you today",
    "mentor.dash.today.needsEmpty":
      "All clear. The AI didn't find anything that needs you right now — go shape your week.",
    "mentor.dash.today.handledTitle": "What AI handled overnight",
    "mentor.dash.today.handledEmpty":
      "AI hasn't touched anything yet — give it a few hours after onboarding starts.",
    "mentor.dash.today.rowBlocked":
      "{count} blocked tasks — a 15-min call usually unblocks the week",
    "mentor.dash.today.rowSignal": "AI noticed: {signalTitle}",
    "mentor.dash.today.rowSlow":
      "Started {days} days ago, still under 25% — worth a check-in",
    "mentor.dash.today.handledDrafted": "Drafted onboarding reply for {firstName}",
    "mentor.dash.today.handledSummarized": "Summarized week 1 progress for {firstName}",
    "mentor.dash.today.handledResolved": "Auto-resolved low-severity signal for {firstName}",
    "mentor.dash.today.handledLink": "View",

    // Mentor dashboard — Newcomers section
    "mentor.dash.ncs.heading": "Your newcomers",
    "mentor.dash.ncs.add": "Add newcomer",
    "mentor.dash.ncs.filterAll": "All ({n})",
    "mentor.dash.ncs.filterEyes": "Needs eyes ({n})",
    "mentor.dash.ncs.filterOk": "On track ({n})",
    "mentor.dash.ncs.filterEmptyEyes":
      "Nothing flagged. Switch back to All to see your cohort.",
    "mentor.dash.ncs.filterEmptyOk":
      "No one's fully on track yet — give it a day.",
    "mentor.dash.ncs.emptyTitle": "No newcomers yet",
    "mentor.dash.ncs.emptyDesc":
      "Add your first newcomer and the AI will draft a personalized 30/60/90 plan in minutes.",
    "mentor.dash.ncs.cardSignal": "What AI noticed",

    // Mentor dashboard — AI signals rail
    "mentor.dash.sig.heading": "AI signals",
    "mentor.dash.sig.lastScan": "Last scan {relativeTime}.",
    "mentor.dash.sig.openCenter": "Open signals center",
    "mentor.dash.sig.openShort": "Open",
    "mentor.dash.sig.emptyTitle": "No signals yet",
    "mentor.dash.sig.emptyDesc":
      "AI is scanning engagement, blocked tasks and Q&A patterns. Signals appear here the moment something looks off.",

    // Mentor dashboard — Cohort heartbeat
    "mentor.dash.cohort.title": "Cohort heartbeat",
    "mentor.dash.cohort.subhead":
      "Each column is a newcomer. Taller bars mean more shipped. Colored caps mean AI noticed something.",
    "mentor.dash.cohort.empty":
      "No cohort yet — your heartbeat shows up once you have an active newcomer.",
    "mentor.dash.cohort.tooltip": "{firstName} · {percent}% complete",
    "mentor.dash.cohort.tooltipSignal": "AI noticed: {signalTitle}",
    "mentor.dash.cohort.view": "View",

    // Mentor dashboard — Mentor moves
    "mentor.dash.moves.title": "Mentor moves",
    "mentor.dash.moves.subhead": "Three things you could do in one click right now.",
    "mentor.dash.moves.checkIn.title": "Check in with {firstName}",
    "mentor.dash.moves.checkIn.body":
      "They have {n} blocked tasks. A 15-min call usually unblocks the week.",
    "mentor.dash.moves.checkIn.cta": "Schedule 15 min",
    "mentor.dash.moves.adjust.title": "Adjust {firstName}'s plan",
    "mentor.dash.moves.adjust.body":
      "AI noticed {signalTitle}. Want to reshape the next two weeks around it?",
    "mentor.dash.moves.adjust.cta": "Open plan generator",
    "mentor.dash.moves.course.title": "Turn \"{topic}\" into a course",
    "mentor.dash.moves.course.body":
      "Seen {count}× across newcomers. AI can draft a short course you can ship today.",
    "mentor.dash.moves.course.cta": "Draft course",
    "mentor.dash.moves.empty.title": "Add a newcomer to unlock moves",
    "mentor.dash.moves.empty.body":
      "Once someone's onboarding, AI will surface three one-click moves you can take.",
    "mentor.dash.moves.empty.cta": "Add newcomer",

    // Mentor dashboard — Week rollup
    "mentor.dash.week.title": "This week in numbers",
    "mentor.dash.week.subhead": "What the AI and you shipped together since Monday.",
    "mentor.dash.week.tasks": "tasks shipped",
    "mentor.dash.week.signals": "signals resolved",
    "mentor.dash.week.drafts": "AI drafts you approved",
    "mentor.dash.week.hours": "mentor work absorbed",
    "mentor.dash.week.celebrate": "Mark as done 🎉",
  },
  uk: {
    "assessment.cta.eyebrow": "Калібрування першого дня",
    "assessment.cta.title": "Ваш ментор підготував коротку перевірку навичок.",
    "assessment.cta.description":
      "Займе приблизно {minutes} хв. Ваші відповіді сформують персоналізований план онбордингу.",
    "assessment.cta.start": "Почати перевірку навичок",
    "assessment.cta.submitted": "Перевірку навичок надіслано",
    "assessment.cta.submittedHint": "- ваш ментор її переглядає.",

    "assessment.runner.eyebrow": "Перевірка навичок",
    "assessment.runner.progress": "Питання {current} / {total}",
    "assessment.runner.back": "Назад",
    "assessment.runner.next": "Далі",
    "assessment.runner.submit": "Надіслати",
    "assessment.runner.submitting": "Надсилання...",
    "assessment.runner.done.title": "Готово!",
    "assessment.runner.done.body":
      "Ваші відповіді вже у ментора. Ми персоналізуємо ваш план онбордингу - побачимось на панелі.",
    "assessment.runner.placeholderScenario":
      "Опишіть, як би ви підійшли до цього...",
    "assessment.runner.placeholderShort": "Введіть відповідь тут...",
    "assessment.runner.empty": "У цій перевірці немає питань.",
    "assessment.runner.alreadyDone.title": "Усе готово.",
    "assessment.runner.alreadyDone.body":
      "Ви вже надіслали цю перевірку навичок. Ментор її переглядає.",
    "assessment.runner.backToDashboard": "Назад до панелі",

    "assessment.generator.title": "Згенерувати перевірку навичок з AI",
    "assessment.generator.description":
      "Опишіть, що саме потрібно перевірити. AI використає контекст ролі, ваші нотатки й вибрані джерела, щоб створити коротку перевірку навичок для першого дня.",
    "assessment.generator.notes.label":
      "Нотатки ментора (що має охоплювати тест?)",
    "assessment.generator.notes.placeholder":
      "Зосередьтеся на впевненості з git, нашому процесі розгортання та асинхронній комунікації.",
    "assessment.generator.sources": "Джерела для побудови питань",
    "assessment.generator.types": "Типи питань",
    "assessment.generator.count": "Кількість питань",
    "assessment.generator.fast": "Згенерувати швидко",
    "assessment.generator.live": "Генерувати наживо",
    "assessment.generator.generating": "Генерація...",
    "assessment.generator.streaming": "Потокова генерація...",

    "settings.language.label": "Мова",
    "settings.language.description":
      "Виберіть англійську або українську для всього інтерфейсу. AI та ReadySet.AI залишаються без змін.",
    "settings.language.active": "Активна",

    // Mentor dashboard — hero
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

    // Mentor dashboard — AI pulse strip
    "mentor.dash.pulse.template":
      "AI позначив {sigCount} сигналів · підготував {draftCount} відповідей · заощадив вам {hours}г цього тижня",
    "mentor.dash.pulse.fallback":
      "AI прогрівається. Додайте новачка, щоб запустити стрічку.",

    // Mentor dashboard — KPI cards
    "mentor.dash.kpi.active.label": "Активні новачки",
    "mentor.dash.kpi.active.hintLoaded": "У {teamCount} командах",
    "mentor.dash.kpi.active.hintOneTeam": "Одна команда",
    "mentor.dash.kpi.active.hintEmpty": "Поки немає активних новачків",
    "mentor.dash.kpi.attention.label": "Потребує вашого ока",
    "mentor.dash.kpi.attention.hintLoaded": "{flagged} позначено · {blocked} заблоковано",
    "mentor.dash.kpi.attention.hintEmpty": "Нічого не позначено",
    "mentor.dash.kpi.progress.label": "Середній прогрес",
    "mentor.dash.kpi.progress.hintLoaded": "У {active} активних планах",
    "mentor.dash.kpi.progress.hintEmpty": "Поки немає активних планів",
    "mentor.dash.kpi.timeSaved.label": "Годин, які AI заощадив",
    "mentor.dash.kpi.timeSaved.hintLoaded": "Цього тижня, проти ручної роботи",
    "mentor.dash.kpi.timeSaved.hintEmpty": "Додайте новачка, щоб почати рахувати",

    // Mentor dashboard — Today's focus
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
    "mentor.dash.today.handledDrafted": "Накидав чернетку відповіді для {firstName}",
    "mentor.dash.today.handledSummarized": "Підсумував прогрес тижня 1 для {firstName}",
    "mentor.dash.today.handledResolved": "Автоматично закрив легкий сигнал для {firstName}",
    "mentor.dash.today.handledLink": "Відкрити",

    // Mentor dashboard — Newcomers section
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

    // Mentor dashboard — AI signals rail
    "mentor.dash.sig.heading": "AI-сигнали",
    "mentor.dash.sig.lastScan": "Останнє сканування {relativeTime}.",
    "mentor.dash.sig.openCenter": "Центр сигналів",
    "mentor.dash.sig.openShort": "Відкрити",
    "mentor.dash.sig.emptyTitle": "Поки немає сигналів",
    "mentor.dash.sig.emptyDesc":
      "AI сканує активність, заблоковані завдання та питання. Сигнали з'являться, щойно щось піде не так.",

    // Mentor dashboard — Cohort heartbeat
    "mentor.dash.cohort.title": "Пульс когорти",
    "mentor.dash.cohort.subhead":
      "Кожна колонка — новачок. Вищі стовпчики означають більше зробленого. Кольорові «шапки» — AI щось помітив.",
    "mentor.dash.cohort.empty":
      "Поки немає когорти — пульс з'явиться, щойно матимете активного новачка.",
    "mentor.dash.cohort.tooltip": "{firstName} · {percent}% готово",
    "mentor.dash.cohort.tooltipSignal": "AI помітив: {signalTitle}",
    "mentor.dash.cohort.view": "Відкрити",

    // Mentor dashboard — Mentor moves
    "mentor.dash.moves.title": "Кроки ментора",
    "mentor.dash.moves.subhead": "Три речі, які ви можете зробити в один клік просто зараз.",
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

    // Mentor dashboard — Week rollup
    "mentor.dash.week.title": "Цей тиждень у цифрах",
    "mentor.dash.week.subhead": "Що ви з AI зробили разом від понеділка.",
    "mentor.dash.week.tasks": "завдань завершено",
    "mentor.dash.week.signals": "сигналів закрито",
    "mentor.dash.week.drafts": "AI-чернеток ви схвалили",
    "mentor.dash.week.hours": "роботи ментора AI забрав на себе",
    "mentor.dash.week.celebrate": "Готово 🎉",
  },
};

export const UI_TRANSLATIONS_UK: Record<string, string> = {
  "Overview": "Огляд",
  "Add newcomer": "Додати новачка",
  "Knowledge base": "База знань",
  "AI Plan Generator": "Генератор планів AI",
  "Courses": "Курси",
  "Calendar": "Календар",
  "Signals": "Сигнали",
  "Settings": "Налаштування",
  "Home": "Головна",
  "My plan": "Мій план",
  "Knowledge": "Знання",
  "Ask AI": "Запитати AI",
  "Progress": "Прогрес",
  "Demo scenario": "Демо-сценарій",
  "Mentor cockpit": "Панель ментора",
  "Your workspace": "Ваш робочий простір",
  "Your onboarding": "Ваш онбординг",
  "AI onboarding": "AI-онбординг",
  "AI copilot": "AI-помічник",
  "AI live": "AI наживо",
  "AI signals": "AI-сигнали",
  "AI signal": "AI-сигнал",
  "AI suggestion": "AI-пропозиція",
  "AI summary": "AI-підсумок",
  "AI draft": "AI-чернетка",
  "AI ready": "AI готовий",
  "Search newcomers, signals, docs...": "Шукати новачків, сигнали, документи...",
  "Search your plan, docs, people...": "Шукати у плані, документах, людях...",
  "AI is watching 4 onboardings and will surface signals as they appear.":
    "AI відстежує 4 онбординги й покаже сигнали, щойно вони з'являться.",
  "Stuck on something? Ask AI - it knows your team's docs.":
    "Застрягли на чомусь? Запитайте AI - він знає документи вашої команди.",
  "Show the full": "Показати повний",
  "loop": "цикл",
  "A richer demo path for the current product: mentor setup, grounded knowledge, plan generation, courses, signals, meetings, and the newcomer workspace.":
    "Насиченіший демо-маршрут для поточного продукту: налаштування ментора, знання з джерел, генерація плану, курси, сигнали, зустрічі та робочий простір новачка.",
  "Guided walkthrough": "Керований walkthrough",
  "Demo mode points, fills, and waits for your click.":
    "Демо-режим підсвічує, заповнює і чекає вашого кліку.",
  "Use it during a pitch when you want the app to guide the room: spotlight overlays dim the rest of the UI, arrows pulse on the next control, and form fields fill with demo data. Every navigation and action still waits for a user click, with a Do it helper when you want the tour to perform the highlighted action.":
    "Використовуйте під час pitch, коли хочете, щоб застосунок вів аудиторію: spotlight затемнює решту UI, стрілки пульсують на наступному елементі, а поля форми заповнюються демо-даними. Кожна навігація й дія все одно чекає кліку користувача, а помічник «Виконати» робить підсвічену дію, коли потрібно.",
  "Source-grounded answers": "Відповіді на основі джерел",
  "AI plan & adjustments": "AI-план і коригування",
  "Course authoring": "Створення курсів",
  "Signals with evidence": "Сигнали з доказами",
  "Submit & approve loop": "Цикл надсилання й схвалення",
  "Shared calendar & progress": "Спільний календар і прогрес",
  "Demo mode is running": "Демо-режим запущено",
  "Start the guided mode": "Запустити керований режим",
  "The tour is deliberate: it never clicks by itself. You can click the target, or use the Do it helper in the tour panel to perform the highlighted action.":
    "Тур навмисно не клікає сам. Ви можете клікнути ціль або використати помічник «Виконати» на панелі туру, щоб виконати підсвічену дію.",
  "Stop demo mode": "Зупинити демо-режим",
  "Start demo mode": "Запустити демо-режим",
  "Manual path": "Ручний маршрут",
  "The product story": "Історія продукту",
  "ReadySet.AI is not only Ask AI. It creates the work, teaches through sources, detects friction, proposes interventions, and keeps the mentor in control.":
    "ReadySet.AI - це не лише Ask AI. Він створює роботу, навчає через джерела, виявляє тертя, пропонує втручання й залишає контроль за ментором.",
  "Jump to any step": "Перейти до будь-якого кроку",
  "Search by title, id, or route...": "Шукати за назвою, id або маршрутом...",
  "Search by title, id, or route…": "Шукати за назвою, id або маршрутом...",
  "Search demo tour steps": "Шукати кроки демо-туру",
  "No step matches": "Немає кроку, що відповідає",
  "Start here": "Почати тут",
  "Tip: starting at a deep step assumes earlier setup already happened in the running demo (personas selected, plans generated, etc.). Use Regenerate database from settings first if you hit empty pages.":
    "Порада: старт із глибокого кроку передбачає, що попереднє налаштування вже виконане в поточному демо (персони вибрані, плани згенеровані тощо). Якщо бачите порожні сторінки, спочатку скористайтеся «Перегенерувати базу даних» у налаштуваннях.",
  "Show:": "Показати:",
  "Act": "Акт",
  "Act 1 — Setup": "Акт 1 — Налаштування",
  "Oleg opens the mentor cockpit, grounds it in the company knowledge base, and generates Marina's 30/60/90 plan with the AI Plan Generator. Period by period, sources selected, mentor approves.":
    "Oleg відкриває панель ментора, спирається на базу знань компанії й генерує план Marina 30/60/90 через AI Plan Generator. Період за періодом, джерела вибрані, ментор схвалює.",
  "The operating center and the journey are in place.":
    "Операційний центр і шлях готові.",
  "Act 2 — Marina's daily life": "Акт 2 — Щоденна робота Marina",
  "Switch into Marina. She opens her plan, picks a task, chats with task-context AI, then reads a grounded HR document — with mind map and source-cited answers. The experience feels focused, not overwhelming.":
    "Перемкніться на Marina. Вона відкриває свій план, вибирає завдання, спілкується з AI у контексті завдання, а потім читає HR-документ із джерел — з mind map і відповідями з посиланнями. Досвід сфокусований, не перевантажений.",
  "Newcomer sees only what matters today, with grounded answers.":
    "Новачок бачить лише те, що важливо сьогодні, з відповідями на основі джерел.",
  "Act 3 — Signals & adjustments": "Акт 3 — Сигнали й коригування",
  "Back to mentor. AI flags that Tanya needs attention with evidence — repeated questions, blocked tasks, review patterns. Oleg opens a signal, regenerates a targeted plan change, edits a precise task, and applies the adjustment.":
    "Повернення до ментора. AI позначає, що Tanya потребує уваги, з доказами — повторні питання, заблоковані завдання, патерни review. Oleg відкриває сигнал, генерує цільову зміну плану, редагує точне завдання й застосовує коригування.",
  "AI proposes, the mentor decides. Friction caught early.":
    "AI пропонує, ментор вирішує. Тертя помічене завчасно.",
  "Signals center": "Центр сигналів",
  "Act 4 — Author courses & onboard a new hire": "Акт 4 — Створення курсів і онбординг нового найму",
  "Mentor drafts a short HR/process course from selected sources, reviews it, and approves it. Then adds a brand-new hire (Noa Benali), generates a 2-question skill check, and Noa takes the test — triggering plan generation in the background.":
    "Ментор створює короткий HR/process курс із вибраних джерел, переглядає і схвалює його. Потім додає нового найма (Noa Benali), генерує перевірку з 2 питань, а Noa проходить тест — це запускає генерацію плану у фоні.",
  "The system scales: courses and new newcomers in minutes, not days.":
    "Система масштабується: курси й нові новачки за хвилини, а не за дні.",
  "Act 5 — Daily rhythm & closing the loop": "Акт 5 — Щоденний ритм і закриття циклу",
  "Switch back to Marina. Notifications keep her in sync, the Progress page shows momentum, the Calendar lets her schedule a weekly sync (the dialog is bright, not in shadow), her Kanban submits a task for review. Then back to mentor — same task in his review queue, one click to approve. Loop closed.":
    "Перемкніться назад на Marina. Сповіщення тримають її в синхроні, сторінка прогресу показує динаміку, календар дозволяє запланувати щотижневу синхронізацію, її Kanban надсилає завдання на review. Потім назад до ментора — те саме завдання в його черзі review, один клік для схвалення. Цикл закрито.",
  "Both sides share the same surface, AI does the lifting, humans decide.":
    "Обидві сторони працюють в одному просторі, AI бере на себе важке, люди вирішують.",
  "Newcomer home": "Головна новачка",
  "Newcomer Kanban": "Kanban новачка",
  "Mentor Kanban": "Kanban ментора",
  "Welcome to the ReadySet.AI walkthrough": "Ласкаво просимо до walkthrough ReadySet.AI",
  "In about 5 minutes we'll cover the full loop: mentor cockpit, knowledge-grounded plan, Marina's daily work, AI signals & plan adjustments, course authoring, onboarding a new hire, then the daily rhythm — notifications, progress, calendar, submit & approve. Click Next to start by regenerating fresh demo data.":
    "Приблизно за 5 хвилин пройдемо повний цикл: панель ментора, план на основі знань, щоденну роботу Marina, AI-сигнали й коригування плану, створення курсу, онбординг нового найма, а потім щоденний ритм — сповіщення, прогрес, календар, надсилання й схвалення. Натисніть «Далі», щоб почати з оновлення демо-даних.",
  "Open Settings": "Відкрити налаштування",
  "We'll start by resetting the demo database so the walkthrough runs from a clean, predictable state. The reset button lives at the bottom of Settings — open it from the sidebar.":
    "Почнемо зі скидання демо-бази, щоб walkthrough ішов із чистого й передбачуваного стану. Кнопка reset унизу налаштувань — відкрийте їх із sidebar.",
  "Regenerate the demo database": "Перегенерувати демо-базу даних",
  "Click Regenerate database. Confirm in the browser prompt — this wipes the workspace and recreates Oleg, Marina, Tanya, their plans, documents, courses and signals. Takes a few seconds.":
    "Натисніть «Перегенерувати базу даних». Підтвердьте в browser prompt — це очистить workspace і створить заново Oleg, Marina, Tanya, їхні плани, документи, курси й сигнали. Займе кілька секунд.",
  "Overview is the cockpit": "Огляд — це панель керування",
  "The mentor workspace opens on Overview. The sidebar confirms where we are before the dashboard content takes over.":
    "Робочий простір ментора відкривається на огляді. Sidebar підтверджує, де ми знаходимося, перш ніж dashboard бере фокус.",
  "Mentor dashboard": "Панель ментора",
  "This is Oleg's operating dashboard: AI pulse, active onboarding metrics, today's focus, signals, and weekly rollup in one place.":
    "Це операційний dashboard Oleg: AI-пульс, метрики активного онбордингу, фокус дня, сигнали й тижневий підсумок в одному місці.",
  "Then focus on newcomers": "Потім фокус на новачках",
  "Start in Oleg's cockpit. The seeded demo shows two active newcomers — Marina (Sales) and Tanya (Backend/Payments) — with live progress, attention signals, today's focus, and saved time, all in one place.":
    "Почніть у панелі Oleg. Демо-дані показують двох активних новачків — Marina (продажі) і Tanya (Backend/Payments) — з live-прогресом, сигналами уваги, фокусом дня й заощадженим часом в одному місці.",
  "Viewing as Marina": "Перегляд як Marina",
  "Open the persona switcher. The tour will wait for your click before it moves.":
    "Відкрийте перемикач персони. Тур чекатиме вашого кліку, перш ніж рухатися далі.",
  "Choose Marina": "Вибрати Marina",
  "Select Marina Kovalenko so the room sees the newcomer workspace from her point of view.":
    "Виберіть Marina Kovalenko, щоб аудиторія побачила простір новачка з її точки зору.",
  "Open Marina's plan": "Відкрити план Marina",
  "Use the sidebar navigation to open My plan. Navigation clicks are manual too.":
    "Використайте навігацію sidebar, щоб відкрити «Мій план». Навігаційні кліки також ручні.",
  "Marina's onboarding journey": "Онбординг-шлях Marina",
  "Her plan reads like a journey, not a wall of tickets — progress per week, day-level tasks, AI-recommended sources and people for each beat. Focused, not overwhelming.":
    "Її план читається як шлях, а не стіна ticket — прогрес за тижнями, завдання за днями, рекомендовані AI джерела й люди для кожного етапу. Сфокусовано, без перевантаження.",
  "Open a task": "Відкрити завдання",
  "Click the highlighted task to drill into task context, acceptance criteria, sources, and help channels.":
    "Клікніть підсвічене завдання, щоб перейти до контексту, критеріїв прийняття, джерел і каналів допомоги.",
  "Task detail": "Деталі завдання",
  "The task page keeps the work concrete: description, checklist, related sources, and people who can help.":
    "Сторінка завдання робить роботу конкретною: опис, чекліст, пов'язані джерела й люди, які можуть допомогти.",
  "Discuss the task": "Обговорити завдання",
  "Open the task chat. The AI carries task context into the conversation.":
    "Відкрийте чат завдання. AI переносить контекст завдання в розмову.",
  "Task chat with a prepared prompt": "Чат завдання з підготовленим prompt",
  "The prompt is filled in. Click Send when you want the AI response.":
    "Prompt уже заповнений. Натисніть «Надіслати», коли хочете отримати відповідь AI.",
  "Help me understand the expected output and the first step for this task.":
    "Допоможи зрозуміти очікуваний результат і перший крок для цього завдання.",
  "Read the task chat answer": "Прочитати відповідь у чаті завдання",
  "Wait for the AI answer to appear. The tour keeps the response highlighted; click Next only after the answer is visible.":
    "Дочекайтеся відповіді AI. Тур тримає відповідь підсвіченою; натискайте «Далі» лише після її появи.",
  "Back to the task": "Назад до завдання",
  "Return to the task detail so you can open the source document attached to the work.":
    "Поверніться до деталей завдання, щоб відкрити документ-джерело, прив'язаний до роботи.",
  "Open the document": "Відкрити документ",
  "Open the first related source to show how tasks stay grounded in company knowledge.":
    "Відкрийте перше пов'язане джерело, щоб показати, як завдання спираються на знання компанії.",
  "Demo mode": "Демо-режим",
  "Resume": "Продовжити",
  "Pause": "Пауза",
  "click target": "клікніть ціль",
  "Skip": "Пропустити",
  "Do it": "Виконати",
  "Skip step": "Пропустити крок",
  "Finish": "Завершити",
  "Next": "Далі",
  "Skip without clicking the target": "Пропустити без кліку по цілі",
  "Skip ahead without waiting for the target": "Перейти далі без очікування цілі",

  "Workspace": "Робочий простір",
  "Demo-only settings for the hackathon build.": "Демо-налаштування для хакатонної збірки.",
  "Language": "Мова",
  "Palette": "Палітра",
  "Choose the color palette for the whole application. Your choice is saved in this browser.":
    "Виберіть палітру кольорів для всієї програми. Вибір зберігається в цьому браузері.",
  "Font": "Шрифт",
  "Pick a font independently from the palette, or keep the default type style of the selected palette.":
    "Виберіть шрифт окремо від палітри або залиште типовий стиль вибраної палітри.",
  "Custom hex palette": "Власна HEX-палітра",
  "Override any global color with your own hex code. Empty fields fall back to the selected palette.":
    "Замініть будь-який глобальний колір власним HEX-кодом. Порожні поля повертаються до вибраної палітри.",
  "Editing:": "Редагується:",
  "no overrides on this palette yet": "у цій палітрі ще немає перевизначень",
  "Revert this palette to original colors": "Повернути оригінальні кольори палітри",
  "Background": "Фон",
  "Surface": "Поверхня",
  "Primary": "Основний",
  "Demo data": "Демо-дані",
  "The demo workspace is seeded once per session. Refresh to wipe local state and pull fresh IDs.":
    "Демо-простір створюється один раз за сесію. Оновіть, щоб очистити локальний стан і отримати нові ID.",
  "Mentor": "Ментор",
  "Newcomer": "Новачок",
  "Refresh demo data": "Оновити демо-дані",
  "Reset database": "Скинути базу даних",
  "Resetting...": "Скидання...",
  "Demo data reset": "Демо-дані скинуто",
  "Reset failed": "Не вдалося скинути",
  "Recreated 1 mentor, 1 newcomer, 4 documents, a plan, tasks and blockers.":
    "Повторно створено 1 ментора, 1 новачка, 4 документи, план, завдання й блокери.",
  "Active": "Активна",
  "Viewing as mentor": "Перегляд як ментор",
  "Viewing as newcomer": "Перегляд як новачок",
  "Current (default)": "Поточна (типова)",
  "The original app palette - warm stone surfaces with orange-500 accent.":
    "Оригінальна палітра програми - теплі кам'яні поверхні з акцентом orange-500.",
  "Sunset Orange": "Помаранчевий захід",
  "Warm white workspace with a vibrant blaze-orange accent inspired by the brand HTML.":
    "Теплий білий робочий простір із яскравим помаранчевим акцентом, натхненним HTML бренду.",
  "Solar Amber": "Сонячний бурштин",
  "Premium dark obsidian background with golden amber highlights.":
    "Преміальний темний обсидіановий фон із золотисто-бурштиновими акцентами.",
  "Cyber Tech": "Кібер-технологічна",
  "Deep navy surfaces with electric cyan and violet - for tech-forward sales.":
    "Глибокі темно-сині поверхні з електричним ціаном і фіолетовим - для технологічних продажів.",
  "Velvet Premium": "Оксамитова преміальна",
  "Deep velvet purple with a luxurious gold accent - premium feel for top accounts.":
    "Глибокий оксамитовий фіолетовий із розкішним золотим акцентом - преміальне відчуття для ключових клієнтів.",
  "Coral Marketing": "Кораловий маркетинг",
  "Bright coral and teal energy - onboarding marketing storytelling for new reps.":
    "Яскрава коралова й бірюзова енергія - маркетингова історія онбордингу для нових представників.",
  "Theme default": "Типовий для теми",
  "Use the font designed for the selected palette.": "Використати шрифт, створений для вибраної палітри.",
  "Adaptive onboarding": "Адаптивний онбординг",
  "Clean technical UI, close to the original app.": "Чистий технічний інтерфейс, близький до оригінальної програми.",
  "Clear execution": "Чітке виконання",
  "Warm, rounded and friendly for ReadySet Light.": "Теплий, округлий і дружній для ReadySet Light.",
  "Warm guidance": "Теплі підказки",
  "Structured and professional for dense dashboards.": "Структурований і професійний для щільних панелей.",
  "Sharper editorial feel for energetic product screens.":
    "Виразніше редакційне відчуття для енергійних продуктових екранів.",
  "Signal clarity": "Ясність сигналів",
  "Modern geometric tone for high-contrast themes.": "Сучасний геометричний тон для контрастних тем.",
  "Neon workflow": "Неоновий робочий процес",
  "Surfaces": "Поверхні",
  "Surface muted": "Приглушена поверхня",
  "Surface elevated": "Піднята поверхня",
  "Border": "Межа",
  "Border strong": "Сильна межа",
  "Text": "Текст",
  "Text muted": "Приглушений текст",
  "Text subtle": "Ледь помітний текст",
  "Text faint": "Блідий текст",
  "Brand": "Бренд",
  "Primary hover": "Основний при наведенні",
  "Primary active": "Основний активний",
  "Primary soft": "М'який основний",
  "Primary softer": "М'якший основний",
  "Primary ring": "Основне кільце",
  "Primary text": "Основний текст",
  "AI gradient from": "Градієнт AI від",
  "AI gradient via": "Градієнт AI через",
  "AI gradient to": "Градієнт AI до",
  "AI soft from": "М'який AI від",
  "AI soft via": "М'який AI через",
  "AI soft to": "М'який AI до",
  "Status": "Статус",
  "Success": "Успіх",
  "Success soft": "М'який успіх",
  "Success text": "Текст успіху",
  "Warning": "Попередження",
  "Warning soft": "М'яке попередження",
  "Warning text": "Текст попередження",
  "Danger": "Небезпека",
  "Danger soft": "М'яка небезпека",
  "Danger text": "Текст небезпеки",
  "Info": "Інформація",
  "Info soft": "М'яка інформація",
  "Info text": "Текст інформації",
  "Use #RGB or #RRGGBB.": "Використайте #RGB або #RRGGBB.",

  "Day 1 calibration": "Калібрування першого дня",
  "Your mentor prepared a quick skill check.": "Ваш ментор підготував коротку перевірку навичок.",
  "Start your skill check": "Почати перевірку навичок",
  "Skill check submitted": "Перевірку навичок надіслано",
  "Skill check": "Перевірка навичок",
  "Question types": "Типи питань",
  "Number of questions": "Кількість питань",
  "Generate skill assessment with AI": "Згенерувати перевірку навичок з AI",
  "Mentor notes (what should the test cover?)": "Нотатки ментора (що має охоплювати тест?)",
  "Focus on git fluency, our deployment flow, and async communication.":
    "Зосередьтеся на впевненості з git, нашому процесі розгортання та асинхронній комунікації.",
  "Sources to ground the questions": "Джерела для побудови питань",
  "Multiple choice": "Множинний вибір",
  "Short answer": "Коротка відповідь",
  "Scenario": "Сценарій",
  "Generate (fast)": "Згенерувати швидко",
  "Generate live": "Генерувати наживо",
  "Generating...": "Генерація...",
  "Streaming...": "Потокова генерація...",
  "Back": "Назад",
  "Submit": "Надіслати",
  "Submitting...": "Надсилання...",
  "All done!": "Готово!",
  "Back to dashboard": "Назад до панелі",

  "Add": "Додати",
  "Edit": "Редагувати",
  "Delete": "Видалити",
  "Cancel": "Скасувати",
  "Save": "Зберегти",
  "Save changes": "Зберегти зміни",
  "Save lesson": "Зберегти урок",
  "Save week": "Зберегти тиждень",
  "Send": "Надіслати",
  "Continue": "Продовжити",
  "Complete": "Завершити",
  "Completed": "Завершено",
  "Done": "Готово",
  "Open": "Відкрити",
  "Close": "Закрити",
  "Resolve": "Вирішити",
  "Resolved": "Вирішено",
  "Ignore": "Ігнорувати",
  "Ignored": "Проігноровано",
  "Approve": "Затвердити",
  "Approved": "Затверджено",
  "Reject": "Відхилити",
  "Apply changes": "Застосувати зміни",
  "Refresh": "Оновити",
  "Regenerate": "Згенерувати повторно",
  "Regenerate with AI": "Згенерувати повторно з AI",
  "Regenerating...": "Повторна генерація...",
  "Generate": "Згенерувати",
  "Generate plan": "Згенерувати план",
  "Generate with AI": "Згенерувати з AI",
  "Generate mind map": "Згенерувати мапу думок",
  "Start drafting": "Почати чернетку",
  "Publish": "Опублікувати",
  "Review": "Переглянути",
  "Preview": "Попередній перегляд",
  "Previous": "Попередній",
  "Copy": "Копіювати",
  "Browse": "Переглянути",
  "Browse all": "Переглянути все",
  "Browse courses": "Переглянути курси",
  "Browse files": "Переглянути файли",
  "Search": "Пошук",
  "Filters": "Фільтри",
  "Clear filters": "Очистити фільтри",
  "All": "Усі",
  "Selected": "Вибрано",
  "Source": "Джерело",
  "Sources": "Джерела",
  "Source documents": "Документи-джерела",
  "Sources used": "Використані джерела",
  "Related sources": "Пов'язані джерела",
  "Recommended docs": "Рекомендовані документи",
  "Open source": "Відкрити джерело",
  "Add sources": "Додати джерела",
  "Add a source": "Додати джерело",
  "Add your first source": "Додайте перше джерело",
  "Add to KB": "Додати до бази знань",
  "Content": "Вміст",
  "Description": "Опис",
  "Title": "Назва",
  "Domain": "Домен",
  "Type": "Тип",
  "Metadata": "Метадані",
  "External URL": "Зовнішня URL-адреса",
  "GitHub URL": "URL GitHub",
  "GitHub link": "Посилання GitHub",
  "Paste text": "Вставити текст",
  "Drop a .txt / .md file": "Перетягніть файл .txt / .md",
  "Drag and drop files here": "Перетягніть файли сюди",
  "Document not found": "Документ не знайдено",
  "No documents yet. Add some in the Knowledge Base.":
    "Документів ще немає. Додайте їх у базі знань.",
  "No documents match your filters": "Жоден документ не відповідає фільтрам",
  "No source matches that search.": "Жодне джерело не відповідає цьому пошуку.",
  "No sources yet.": "Джерел ще немає.",

  "Plan": "План",
  "Open my plan": "Відкрити мій план",
  "Open plan generator": "Відкрити генератор планів",
  "Plan progress": "Прогрес плану",
  "Plan preview (live": "Попередній перегляд плану наживо",
  "Plan signals tree": "Дерево сигналів плану",
  "Generation plan": "План генерації",
  "Build the onboarding": "Побудувати онбординг",
  "Generate the next chapter of the journey": "Згенерувати наступний розділ шляху",
  "Adjust plan": "Налаштувати план",
  "Adjust the plan with AI": "Налаштувати план з AI",
  "Adjustments": "Коригування",
  "No adjustments yet.": "Коригувань ще немає.",
  "No active plan yet": "Активного плану ще немає",
  "No tasks. Regenerate the plan to scaffold tasks.":
    "Завдань немає. Згенеруйте план повторно, щоб створити структуру завдань.",
  "No tasks scheduled yet - your mentor is still preparing the journey.":
    "Завдань ще не заплановано - ваш ментор ще готує шлях.",
  "All tasks": "Усі завдання",
  "Add task": "Додати завдання",
  "Add manual task": "Додати завдання вручну",
  "Regenerate task": "Згенерувати завдання повторно",
  "Task": "Завдання",
  "Tasks": "Завдання",
  "Blocked tasks": "Заблоковані завдання",
  "Acceptance criteria": "Критерії прийняття",
  "No acceptance criteria yet.": "Критерії прийняття ще не додано.",
  "Priority": "Пріоритет",
  "Goal": "Ціль",
  "Goals": "Цілі",
  "Goals (one per line": "Цілі (по одній у рядку",
  "Main goal": "Головна ціль",
  "Position in the journey": "Позиція у шляху",
  "Phase": "Етап",
  "Phases": "Етапи",
  "Period": "Період",
  "New period": "Новий період",
  "Add a new period": "Додати новий період",
  "Week": "Тиждень",
  "Weeks": "Тижні",
  "No weeks yet": "Тижнів ще немає",
  "Loading weeks...": "Завантаження тижнів...",
  "Days": "Дні",

  "Course": "Курс",
  "New course": "Новий курс",
  "Course basics": "Основи курсу",
  "Course complete!": "Курс завершено!",
  "Resume course": "Продовжити курс",
  "Finish course": "Завершити курс",
  "Back to courses": "Назад до курсів",
  "Lesson": "Урок",
  "Lessons": "Уроки",
  "Lesson title": "Назва уроку",
  "Lesson notes": "Нотатки до уроку",
  "Number of lessons": "Кількість уроків",
  "No lessons yet.": "Уроків ще немає.",
  "No lessons yet. Add one below.": "Уроків ще немає. Додайте один нижче.",
  "No body content yet - your mentor is still drafting this lesson.":
    "Вмісту ще немає - ваш ментор ще готує цей урок.",
  "Learn at your own pace": "Навчайтеся у своєму темпі",
  "Pick up where you left off": "Продовжити з місця зупинки",
  "Make course": "Створити курс",
  "Draft a course with": "Створити чернетку курсу з",
  "Generate the next chapter for": "Згенерувати наступний розділ для",

  "Meetings": "Зустрічі",
  "Meeting": "Зустріч",
  "Add meeting": "Додати зустріч",
  "New meeting": "Нова зустріч",
  "Schedule a meeting": "Запланувати зустріч",
  "Schedule 15-min": "Запланувати 15 хв",
  "Schedule walkthrough": "Запланувати демонстрацію",
  "Agenda": "Порядок денний",
  "Duration": "Тривалість",
  "Attendee emails (optional, comma or newline separated":
    "Email учасників (необов'язково, через кому або з нового рядка",
  "Meetings scheduled for this month.": "Зустрічі, заплановані на цей місяць.",
  "Nothing scheduled for this week.": "На цей тиждень нічого не заплановано.",
  "Join": "Приєднатися",

  "Signal context": "Контекст сигналу",
  "Signal detail with evidence, suggested action, and comment thread.":
    "Деталі сигналу з доказами, запропонованою дією та гілкою коментарів.",
  "Latest AI signal": "Останній AI-сигнал",
  "New signals will appear here as they are detected.":
    "Нові сигнали з'являтимуться тут після виявлення.",
  "No signals yet": "Сигналів ще немає",
  "No signals to replay yet.": "Сигналів для повтору ще немає.",
  "How AI signals work": "Як працюють AI-сигнали",
  "About these signals": "Про ці сигнали",
  "Good signal": "Хороший сигнал",
  "Needs attention": "Потребує уваги",
  "Critical": "Критично",
  "Low engagement": "Низька залученість",
  "Blocked task": "Заблоковане завдання",
  "Topic confusion": "Нерозуміння теми",
  "Deployment confusion": "Нерозуміння розгортання",
  "Deployment-heavy plan": "План з акцентом на розгортанні",
  "Access issue": "Проблема з доступом",
  "HR question": "HR-питання",
  "Repeated question": "Повторне питання",
  "Documentation gap": "Прогалина в документації",
  "Fast completion": "Швидке завершення",
  "HR friction": "HR-перешкода",
  "Access friction": "Перешкода з доступом",
  "Knowledge friction": "Перешкода в знаннях",
  "Gaps": "Прогалини",
  "Gaps detected": "Виявлені прогалини",
  "Coverage looks healthy.": "Покриття виглядає здоровим.",

  "On track": "За планом",
  "Blocked": "Заблоковано",
  "Draft": "Чернетка",
  "Pending": "Очікує",
  "In progress": "У процесі",
  "To do": "До виконання",
  "Not started": "Не розпочато",
  "Plan generated": "План згенеровано",
  "Low": "Низький",
  "Medium": "Середній",
  "High": "Високий",
  "General": "Загальне",
  "Junior": "Молодший",
  "Middle": "Середній",
  "Senior": "Старший",
  "Staff": "Провідний",
  "Principal": "Головний",

  "People to ask": "До кого звернутися",
  "People to know": "З ким познайомитися",
  "People who can help": "Люди, які можуть допомогти",
  "No people suggested yet.": "Людей ще не запропоновано.",
  "Questions": "Питання",
  "Questions & answers": "Питання та відповіді",
  "Answers are grounded in this document and your knowledge base.":
    "Відповіді базуються на цьому документі та вашій базі знань.",
  "Ask": "Запитати",
  "Ask this document anything": "Запитайте будь-що про цей документ",
  "About this doc": "Про цей документ",
  "Mind map": "Мапа думок",
  "Building your mind map...": "Будуємо мапу думок...",
  "Central topic:": "Центральна тема:",
  "Detected topics": "Виявлені теми",
  "Chat": "Чат",
  "Chat with task context": "Чат з контекстом завдання",
  "Press Enter to send · Shift+Enter for newline":
    "Enter, щоб надіслати · Shift+Enter для нового рядка",
  "I'm blocked": "Я заблокований",
  "Mentor comment": "Коментар ментора",
  "Newcomer comment": "Коментар новачка",
  "Add comment": "Додати коментар",
  "Comments": "Коментарі",
  "Draft message": "Чернетка повідомлення",
  "Follow-ups": "Подальші дії",
  "Evidence": "Докази",
  "Reasoning": "Обґрунтування",
  "Show full AI rationale": "Показати повне обґрунтування AI",

  "Loading...": "Завантаження...",
  "Loading your workspace...": "Завантаження вашого простору...",
  "Spinning up your demo workspace...": "Запускаємо демо-простір...",
  "Connecting to the AI onboarding service and seeding your demo data.":
    "Підключаємося до сервісу AI-онбордингу й створюємо демо-дані.",
  "Cannot reach the backend": "Не вдається підключитися до бекенду",
  "Make sure the FastAPI backend is running on": "Переконайтеся, що бекенд FastAPI запущено на",
  "Ready": "Готово",
  "Ready to generate": "Готово до генерації",
  "Ready to generate?": "Готові генерувати?",
  "Nothing to preview yet - write something in Edit mode.":
    "Поки немає що переглядати - напишіть щось у режимі редагування.",
  "No answer.": "Немає відповіді.",
  "No note yet - waiting on": "Нотатки ще немає - очікуємо",
  "No description yet.": "Опису ще немає.",
  "No examples yet.": "Прикладів ще немає.",
  "No links yet.": "Посилань ще немає.",
  "Options (check the correct one": "Варіанти (позначте правильний",
  "Add option": "Додати варіант",
  "Add question": "Додати питання",
  "Draft questions (": "Чернетки питань (",
  "Live preview - questions persist on completion.":
    "Попередній перегляд наживо - питання зберігаються після завершення.",
  "Live preview — questions persist on completion.":
    "Попередній перегляд наживо - питання зберігаються після завершення.",
  "Live generation": "Жива генерація",
  "Live generation workspace": "Робочий простір живої генерації",
  "Building the skill check": "Створюємо перевірку навичок",

  // Guided demo tour — additional titles & bodies
  "Document preview": "Попередній перегляд документа",
  "The document is readable before any AI layer appears. The next steps show mind map and chat.":
    "Документ можна читати ще до появи AI-шару. Наступні кроки показують mind map і чат.",
  "Mind map tab": "Вкладка mind map",
  "Open Mind map manually. The tour will not switch tabs for you.":
    "Відкрийте вкладку Mind map вручну. Тур не перемикає вкладки за вас.",
  "Generate the mind map": "Згенерувати mind map",
  "Click Generate mind map to turn the document into a visual structure.":
    "Натисніть «Згенерувати mind map», щоб перетворити документ на візуальну структуру.",
  "Mind map generated": "Mind map згенеровано",
  "The map turns a 20-page document into a navigable structure — central topic, branches, leaf ideas. Marina can scan the shape of the doc in 30 seconds before reading.":
    "Мапа перетворює 20-сторінковий документ на навігаційну структуру — центральна тема, гілки, ключові ідеї. Marina охопить форму документа за 30 секунд до прочитання.",
  "Ask about the document": "Запитайте про документ",
  "Open the Ask tab so Marina can discuss a real HR process question.":
    "Відкрийте вкладку «Запитати», щоб Marina могла обговорити реальне питання HR-процесу.",
  "Chat about the HR process": "Чат про HR-процес",
  "The question is prefilled. Click Ask to keep the answer grounded in available sources.":
    "Питання вже заповнене. Натисніть «Запитати», щоб відповідь спиралася на доступні джерела.",
  "Can you explain the HR onboarding process and what I should do first?":
    "Можеш пояснити HR-процес онбордингу і що мені робити насамперед?",
  "Read the HR process answer": "Прочитати відповідь про HR-процес",
  "Wait for the grounded answer to render in the document chat. The highlighted response is the moment to pause before continuing.":
    "Дочекайтеся, поки відповідь з джерел з'явиться в чаті документа. Підсвічена відповідь — момент паузи перед продовженням.",
  "Back to mentor": "Назад до ментора",
  "Open Viewing as again so we can return to Oleg's mentor workspace.":
    "Знову відкрийте «Перегляд як», щоб повернутися до простору ментора Oleg.",
  "Choose Oleg": "Вибрати Oleg",
  "Select the mentor persona.": "Виберіть персону ментора.",
  "Add a course": "Додати курс",
  "Use the mentor sidebar to open Courses.": "Через sidebar ментора відкрийте «Курси».",
  "Create a new course": "Створити новий курс",
  "Click New course. We will draft a small HR/process course that Marina can see.":
    "Натисніть «Новий курс». Створимо невеликий HR/process-курс, який побачить Marina.",
  "Course inputs are ready": "Поля курсу готові",
  "The fields are prefilled for a short process course. Click Generate with AI when ready.":
    "Поля заповнені для короткого process-курсу. Натисніть «Згенерувати з AI», коли будете готові.",
  "HR Process Essentials for Newcomers": "Основи HR-процесу для новачків",
  "Create a concise onboarding course that explains the HR process, first-week admin steps, and where a newcomer asks for help.":
    "Створи стислий онбординг-курс, що пояснює HR-процес, адмінкроки першого тижня та куди новачку звертатися по допомогу.",
  "Course draft, ready to refine": "Чернетка курсу, готова до доопрацювання",
  "AI drafts the course from the selected knowledge sources — title, lessons, structure. The mentor stays in control: edit any lesson, then approve before it's visible to newcomers.":
    "AI створює чернетку курсу з вибраних джерел знань — назву, уроки, структуру. Ментор контролює: редагуйте будь-який урок, а потім схваліть, перш ніж він стане видимим новачкам.",
  "Submit the course": "Надіслати курс",
  "Click Submit for review. This is still a deliberate mentor action.":
    "Натисніть «Надіслати на review». Це залишається свідомою дією ментора.",
  "Approve the course": "Схвалити курс",
  "Approve the course so it becomes visible to newcomers.":
    "Схваліть курс, щоб він став видимим новачкам.",
  "Return to Marina": "Повернутися до Marina",
  "Open the persona switcher again.": "Знову відкрийте перемикач персон.",
  "View as Marina again": "Знову переглянути як Marina",
  "Select Marina to verify the course is available from her workspace.":
    "Виберіть Marina, щоб переконатися, що курс доступний з її простору.",
  "Open Marina's courses": "Відкрити курси Marina",
  "Use the newcomer sidebar to open Courses.": "Через sidebar новачка відкрийте «Курси».",
  "See the course": "Подивитися курс",
  "Open the first recommended course to show the newcomer learning view.":
    "Відкрийте перший рекомендований курс, щоб показати вигляд навчання для новачка.",
  "Course reader": "Читач курсу",
  "Marina can read lessons, track progress, and take notes without leaving her workspace.":
    "Marina може читати уроки, відстежувати прогрес і робити нотатки, не виходячи з робочого простору.",
  "Back to mentor signals": "Назад до сигналів ментора",
  "Open Viewing as so Oleg can inspect Tanya's attention signals.":
    "Відкрийте «Перегляд як», щоб Oleg перевірив сигнали уваги для Tanya.",
  "Return to the mentor persona.": "Поверніться до персони ментора.",
  "Open Signals": "Відкрити «Сигнали»",
  "Use the sidebar to open the Signals center.":
    "Через sidebar відкрийте «Центр сигналів».",
  "Select Tanya": "Вибрати Tanya",
  "Open the newcomer selector to inspect Tanya's attention state.":
    "Відкрийте перемикач новачків, щоб перевірити стан уваги Tanya.",
  "Tanya needs attention": "Tanya потребує уваги",
  "Choose Tanya Petrova. Her open signals show where mentor intervention is useful.":
    "Виберіть Tanya Petrova. Її відкриті сигнали показують, де корисне втручання ментора.",
  "Open an attention signal": "Відкрити сигнал уваги",
  "Click the highlighted signal to see evidence and suggested actions.":
    "Клікніть підсвічений сигнал, щоб побачити докази й запропоновані дії.",
  "Turn a signal into a plan change": "Перетворіть сигнал на зміну плану",
  "From the signal drawer, click Regenerate plan. The AI proposes targeted modifications informed by the signal evidence — the mentor stays in the loop to approve.":
    "З панелі сигналу натисніть «Згенерувати план повторно». AI пропонує цільові зміни на основі доказів сигналу — ментор схвалює.",
  "Targeted changes": "Цільові зміни",
  "Choose targeted changes so the draft can modify individual tasks precisely.":
    "Виберіть цільові зміни, щоб чернетка могла точно змінювати окремі завдання.",
  "Pick the period": "Виберіть період",
  "Confirm the recommended period for the signal-aware adjustment.":
    "Підтвердіть рекомендований період для коригування з урахуванням сигналу.",
  "Generate the adjustment draft": "Згенерувати чернетку коригування",
  "Click Generate from signal. The draft is created only after this deliberate mentor action.":
    "Натисніть «Згенерувати з сигналу». Чернетка створюється лише після цієї свідомої дії ментора.",
  "Adjustment draft": "Чернетка коригування",
  "The draft proposes changes to unfinished work. You can accept, skip, defer, or edit each change.":
    "Чернетка пропонує зміни до незавершеної роботи. Кожну зміну можна прийняти, пропустити, відкласти або редагувати.",
  "Precise task edits": "Точні правки завдань",
  "Open the editor on a proposed change to adjust the exact task title, description, week, day, and reason.":
    "Відкрийте редактор на запропонованій зміні, щоб налаштувати точну назву завдання, опис, тиждень, день і причину.",
  "Save the precise edit": "Зберегти точну правку",
  "The edit fields are prefilled with a sharper action. Click Save edits.":
    "Поля правки заповнені чіткішою дією. Натисніть «Зберегти правки».",
  "Add a focused staging dry run": "Додати сфокусований staging dry run",
  "Schedule a hands-on staging deployment dry run with Victor, then capture rollback checkpoints in the PR notes.":
    "Запланувати практичний staging dry run розгортання з Victor, потім зафіксувати точки rollback у нотатках PR.",
  "Tanya needs practice on deployment confidence before independent release work.":
    "Tanya потрібна практика з впевненості в розгортанні перед самостійним релізом.",
  "Apply modifications": "Застосувати зміни",
  "Apply the selected changes to the plan when the mentor is satisfied.":
    "Застосуйте вибрані зміни до плану, коли ментор задоволений.",
  "Add a new newcomer": "Додати нового новачка",
  "Now use the sidebar to add a brand-new newcomer.":
    "Тепер через sidebar додайте абсолютно нового новачка.",
  "Profile is prefilled": "Профіль заповнено",
  "Review the prepared profile, then click Continue.":
    "Перегляньте підготовлений профіль і натисніть «Продовжити».",
  "Role context": "Контекст ролі",
  "The Backend/Platform context is ready. Click Continue.":
    "Контекст Backend/Platform готовий. Натисніть «Продовжити».",
  "Generate the skill test": "Згенерувати перевірку навичок",
  "The skill gaps and two-question assessment are prepared. Click Generate fast.":
    "Прогалини навичок і перевірка з двох питань підготовлені. Натисніть «Згенерувати швидко».",
  "Two questions ready": "Два питання готові",
  "The newcomer test is now a short draft with two questions. Review it before finishing setup.":
    "Тест новачка тепер — коротка чернетка з двох питань. Перегляньте її перед завершенням налаштування.",
  "Review the newcomer": "Перегляньте новачка",
  "Move to the final review step.": "Перейдіть до фінального кроку перегляду.",
  "Create newcomer": "Створити новачка",
  "Click Add newcomer. The assessment will be published to this new workspace.":
    "Натисніть «Додати новачка». Перевірка буде опублікована в цьому новому просторі.",
  "Newcomer created": "Новачка створено",
  "The new profile is created. Next, switch into the latest newcomer workspace to take the two-question test.":
    "Новий профіль створено. Далі перемкніться в простір останнього новачка, щоб пройти тест із двох питань.",
  "View as the new newcomer": "Переглянути як нового новачка",
  "Open the persona switcher.": "Відкрийте перемикач персон.",
  "Choose the new newcomer": "Вибрати нового новачка",
  "Select the latest newcomer persona created in this demo.":
    "Виберіть останню персону новачка, створену в цьому демо.",
  "Take the two-question test": "Пройти тест із двох питань",
  "The skill check appears in the newcomer dashboard. Click Start.":
    "Перевірка навичок з'являється на панелі новачка. Натисніть «Почати».",
  "Question 1": "Питання 1",
  "The first answer is prefilled. Click Next.":
    "Перша відповідь заповнена. Натисніть «Далі».",
  "I would read the release checklist, run tests locally, and ask the owner to confirm the rollback path before staging.":
    "Я б прочитав release-чекліст, локально запустив тести й попросив власника підтвердити шлях rollback перед staging.",
  "Question 2": "Питання 2",
  "The second answer is prefilled. Click Submit to finish the test and trigger plan generation.":
    "Друга відповідь заповнена. Натисніть «Надіслати», щоб завершити тест і запустити генерацію плану.",
  "If I am blocked, I would document the exact error, tag the owner, and propose the smallest next diagnostic step.":
    "Якщо я заблокований, я б задокументував точну помилку, відмітив власника та запропонував найменший наступний діагностичний крок.",
  "Back to mentor after submission": "Назад до ментора після надсилання",
  "The submitted test triggers plan generation in the background. Open Viewing as and return to Oleg.":
    "Надісланий тест запускає генерацію плану у фоні. Відкрийте «Перегляд як» і поверніться до Oleg.",
  "Back to Overview": "Назад до огляду",
  "After the assessment, return to the mentor Overview first so the navigation and dashboard context are clear.":
    "Після перевірки спершу поверніться до огляду ментора, щоб контекст навігації та панелі був зрозумілим.",
  "Plan generated for Noa": "План згенеровано для Noa",
  "Back on the dashboard, the new newcomer appears with her freshly generated draft plan. The card is highlighted; the next step opens her workspace.":
    "Знову на панелі — новий новачок з'являється зі свіжо згенерованою чернеткою плану. Картка підсвічена; наступний крок відкриває її простір.",
  "Open the AI Plan Generator": "Відкрити генератор планів AI",
  "To extend a newcomer's plan with a new period — and demo live editing — open the AI Plan Generator from the sidebar.":
    "Щоб розширити план новачка новим періодом — і показати live-редагування — відкрийте генератор планів AI у sidebar.",
  "The journey timeline": "Хронологія шляху",
  "The plan is split into periods. Add a new period to extend the plan with a focused chunk — for example, a fourth onboarding sprint.":
    "План розбито на періоди. Додайте новий період, щоб розширити план сфокусованим блоком — наприклад, четвертим спринтом онбордингу.",
  "Click New period — the flow opens as a multi-step sheet: period info, generation mode, then review.":
    "Натисніть «Новий період» — потік відкриється багатокроковою панеллю: інфо про період, режим генерації, потім перегляд.",
  "Period info": "Інфо про період",
  "Label, dates, and a goal — the AI uses these to scope the period. Fields are pre-filled. Click Next.":
    "Назва, дати й ціль — AI використовує їх, щоб окреслити період. Поля заповнені. Натисніть «Далі».",
  "Sprint 4 — Production readiness": "Спринт 4 — Готовність до продакшну",
  "Independent on-call rotation, comfortable shipping production changes solo with confidence.":
    "Самостійна on-call ротація, впевнене самостійне впровадження продакшн-змін.",
  "Choose Live collaboration": "Виберіть Live-співпрацю",
  "Live mode streams the AI's reasoning, sources, and tasks as they are generated — the mentor watches and steers, instead of waiting for a black-box draft.":
    "Live-режим транслює міркування AI, джерела й завдання в міру їх генерації — ментор спостерігає і скеровує замість того, щоб чекати на чернетку «чорної скриньки».",
  "Review the choice": "Переглянути вибір",
  "Click Next to confirm the mode and move to the review step.":
    "Натисніть «Далі», щоб підтвердити режим і перейти до перегляду.",
  "Open live mode": "Відкрити live-режим",
  "Click Open live mode — the sheet closes and the live workspace takes over. The AI starts generating the period in real time.":
    "Натисніть «Відкрити live-режим» — панель закривається, і live-простір бере керування. AI починає генерувати період у реальному часі.",
  "View the draft, then commit": "Перегляньте чернетку, потім підтвердьте",
  "Reasoning streams on the left, the draft plan builds on the right. When it's ready (or hit Skip step to jump ahead), click Commit draft to persist this period.":
    "Міркування транслюється ліворуч, чернетка плану будується праворуч. Коли готово (або натисніть «Пропустити крок»), натисніть «Зберегти чернетку», щоб зафіксувати цей період.",
  "Switch to All tasks": "Перейти до «Усі завдання»",
  "The new period landed on the workspace. Switch to the All tasks view to see the flat list and pick one to refine.":
    "Новий період з'явився в просторі. Перейдіть на вигляд «Усі завдання», щоб побачити плаский список і вибрати одне для доопрацювання.",
  "Click a task to edit it": "Клікніть завдання, щоб його редагувати",
  "Every task is editable. Click the highlighted task to open the editor.":
    "Кожне завдання можна редагувати. Клікніть підсвічене завдання, щоб відкрити редактор.",
  "Edit the task content": "Редагуйте вміст завдання",
  "Title, description, priority, success and acceptance criteria — every field is editable. The mentor refines what the AI drafted. We've sharpened the title for you.":
    "Назва, опис, пріоритет, успіх і критерії прийняття — кожне поле редаговане. Ментор доопрацьовує те, що накидав AI. Ми вже загострили назву за вас.",
  "Pair on a real staging-to-prod release with rollback rehearsal":
    "Парне виконання реального релізу staging→prod із репетицією rollback",
  "Click Save changes — the task title updates instantly. The newcomer sees the new wording on her plan next time she loads it.":
    "Натисніть «Зберегти зміни» — назва завдання оновлюється миттєво. Новачок побачить нове формулювання у плані під час наступного завантаження.",
  "Back to the period workspace": "Назад до простору періоду",
  "Click the back arrow to return to the period workspace and publish.":
    "Натисніть стрілку «назад», щоб повернутися до простору періоду і опублікувати.",
  "Publish the period": "Опублікувати період",
  "Click Approve period — the draft becomes live for the newcomer. Generated by AI, refined by the mentor, owned by the mentor. That's the loop.":
    "Натисніть «Схвалити період» — чернетка стає live для новачка. Згенеровано AI, доопрацьовано ментором, відповідальність ментора. Це і є цикл.",
  "Step back into Marina": "Знову увійти як Marina",
  "Setup is done. Now switch back to Marina to show her daily operating rhythm: progress, calendar, kanban — the surfaces she lives in.":
    "Налаштування завершено. Тепер перемкніться назад на Marina, щоб показати її щоденний ритм: прогрес, календар, kanban — поверхні, в яких вона живе.",
  "Choose Marina again": "Знову вибрати Marina",
  "Re-enter Marina's workspace. The next beats show how a newcomer actually uses the product day after day.":
    "Знову увійдіть у простір Marina. Наступні кроки показують, як новачок реально використовує продукт день за днем.",
  "Open Marina's Progress page": "Відкрити сторінку прогресу Marina",
  "Use the sidebar to open Progress. This is Marina's source of truth for where she stands in the journey.":
    "Через sidebar відкрийте «Прогрес». Це джерело істини Marina, де вона перебуває у шляху.",
  "Progress at a glance": "Прогрес із першого погляду",
  "Completed, in progress, blocked, and a weekly hint. Marina sees momentum without asking; the mentor sees the same numbers on the dashboard. One shared truth.":
    "Завершено, у процесі, заблоковано і щотижнева підказка. Marina бачить динаміку без запитань; ментор бачить ті самі числа на панелі. Одна спільна істина.",
  "Weekly velocity & milestones": "Тижнева швидкість і віхи",
  "Velocity per week and milestone tracking turn onboarding from vibes into evidence — useful both for Marina and for her mentor's quarterly review.":
    "Швидкість за тиждень і відстеження віх перетворюють онбординг із «відчуттів» на докази — корисно і Marina, і квартальному review ментора.",
  "Open the Calendar": "Відкрити календар",
  "Move to Marina's calendar. Mentor syncs, demo sessions, and ad-hoc help meetings all live here.":
    "Перейдіть до календаря Marina. Синки з ментором, демо-сесії й ad-hoc зустрічі допомоги — усе тут.",
  "A month at a glance": "Місяць із першого погляду",
  "The calendar shows the full month. Every scheduled session, with its time and Teams link, is here. Marina (or the mentor) can add a meeting on any day.":
    "Календар показує весь місяць. Кожна запланована сесія з часом і Teams-посиланням — тут. Marina (або ментор) може додати зустріч у будь-який день.",
  "Click Add meeting to open the scheduling dialog. Watch how it appears: bright and on top of the page — the spotlight no longer dims it.":
    "Натисніть «Додати зустріч», щоб відкрити діалог планування. Подивіться, як він з'являється: яскраво й поверх сторінки — spotlight більше його не затемнює.",
  "30-minute weekly sync": "30-хвилинний щотижневий sync",
  "Title and agenda are pre-filled. The mentor is the default attendee. Click Schedule — the meeting is created, an invite goes out, and a notification fires for the mentor.":
    "Назва й порядок денний заповнені. Ментор — учасник за замовчуванням. Натисніть «Запланувати» — зустріч створено, надіслано запрошення, і ментор отримує сповіщення.",
  "Weekly sync with Marina": "Щотижневий sync з Marina",
  "1) Wins from the week\n2) Blockers and questions\n3) Plan for next week\n4) Anything I can support faster?":
    "1) Перемоги тижня\n2) Блокери й питання\n3) План на наступний тиждень\n4) Що я можу підтримати швидше?",
  "Meeting saved": "Зустріч збережено",
  "The new meeting is now on Marina's calendar and on the mentor's. Both sides see the same source of truth — no email chains, no rescheduling drift.":
    "Нова зустріч тепер у календарі Marina і ментора. Обидві сторони бачать одне джерело істини — без email-ланцюжків, без переплутаних переплануваннь.",
  "Open Marina's task board": "Відкрити дошку завдань Marina",
  "Use the sidebar to open her Kanban. This is where Marina actually moves work forward day to day.":
    "Через sidebar відкрийте її Kanban. Саме тут Marina реально рухає роботу день за днем.",
  "Five lanes, one flow": "П'ять колонок, один потік",
  "To do, In progress, In review, Blocked, Done. Marina drags her own work forward; In review hands off to the mentor for validation; only the mentor moves a task to Done.":
    "До виконання, У процесі, На review, Заблоковано, Готово. Marina рухає свою роботу; «На review» передає завдання ментору на валідацію; тільки ментор переводить у «Готово».",
  "Pick a task in progress": "Виберіть завдання у процесі",
  "Click an in-progress task to open it. Marina is going to submit her work for mentor review in one click.":
    "Клікніть завдання у процесі, щоб відкрити його. Marina надішле свою роботу ментору на review в один клік.",
  "Submit for review": "Надіслати на review",
  "One click. The task moves to In review on Marina's board, lands on the mentor's review queue, and fires a notification. Click Submit for review.":
    "Один клік. Завдання переходить у «На review» на дошці Marina, потрапляє в чергу review ментора й викликає сповіщення. Натисніть «Надіслати на review».",
  "Back to the board": "Назад до дошки",
  "Open Marina's Kanban again to see where the task landed.":
    "Знову відкрийте Kanban Marina, щоб побачити, куди потрапило завдання.",
  "Now in the mentor's hands": "Тепер у руках ментора",
  "The task has moved to In review. Marina cannot drag it from here — only the mentor can approve. The handoff is explicit, not implicit.":
    "Завдання перейшло у «На review». Marina не може його тягнути звідси — тільки ментор може схвалити. Передача явна, а не неявна.",
  "Switch to the mentor": "Перемкнутися на ментора",
  "Open the persona switcher to step back into Oleg and close the loop on the review side.":
    "Відкрийте перемикач персон, щоб знову увійти як Oleg і закрити цикл на стороні review.",
  "Re-enter the mentor workspace. The mentor will now see real notifications from Marina's actions.":
    "Знову увійдіть у простір ментора. Ментор зараз побачить реальні сповіщення від дій Marina.",
  "Notifications fired": "Сповіщення спрацювали",
  "Marina scheduled a meeting and submitted a task — both fired notifications to the mentor. The bell shows unread items. Click it to open the inbox.":
    "Marina запланувала зустріч і надіслала завдання — обидва дії викликали сповіщення для ментора. Дзвіночок показує непрочитані. Клікніть його, щоб відкрити інбокс.",
  "Each notification is a shortcut": "Кожне сповіщення — це швидкий доступ",
  "Clicking a notification routes straight to the related task, signal, or meeting — no hunting through tabs. Mentor and newcomer share the same notification spine.":
    "Клік на сповіщенні веде прямо до пов'язаного завдання, сигналу або зустрічі — без пошуку по вкладках. Ментор і новачок мають один спільний канал сповіщень.",
  "Open the mentor Kanban": "Відкрити Kanban ментора",
  "Open the mentor task board from the sidebar. This is the operations cockpit across every newcomer.":
    "Відкрийте дошку завдань ментора через sidebar. Це операційна панель по всіх новачках.",
  "The review queue": "Черга review",
  "Every newcomer submission lands in this In review column — sorted by urgency, with AI signal markers. Marina's just-submitted task is here.":
    "Кожне надсилання новачка потрапляє у цю колонку «На review» — відсортоване за терміновістю, з маркерами AI-сигналів. Щойно надіслане завдання Marina — тут.",
  "Open the submission": "Відкрити надсилання",
  "Click the highlighted card to open the review sheet. The mentor sees the task, the conversation, prior signals, and review history — everything to decide in seconds.":
    "Клікніть підсвічену картку, щоб відкрити панель review. Ментор бачить завдання, розмову, попередні сигнали й історію review — усе, щоб вирішити за секунди.",
  "Approve in one click": "Схвалити в один клік",
  "Click Approve. The task moves to Done in both boards, Marina is notified, and her Progress page updates instantly. The full submit → review → approve loop is closed.":
    "Натисніть «Схвалити». Завдання переходить у «Готово» на обох дошках, Marina отримує сповіщення, її сторінка прогресу оновлюється миттєво. Повний цикл надсилання → review → схвалення закрито.",
  "The full loop, in one tour": "Повний цикл за один тур",
  "Setup → plan → grounded knowledge → courses → signals → adjustments → new hire onboarded → daily rhythm → submit → approve. Mentor and newcomer always on the same surface, AI doing the heavy lifting, humans deciding.":
    "Налаштування → план → знання з джерел → курси → сигнали → коригування → новий найм онбординг → щоденний ритм → надсилання → схвалення. Ментор і новачок завжди на одній поверхні, AI виконує важку роботу, люди вирішують.",
};

export function formatMessage(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] != null ? String(vars[k]) : `{${k}}`,
  );
}
