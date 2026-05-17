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
  "Next": "Далі",
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
  "Junior": "Junior",
  "Middle": "Middle",
  "Senior": "Senior",
  "Staff": "Staff",
  "Principal": "Principal",

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
