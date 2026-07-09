const mentorDashboard = {
  // Hero
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

  // AI pulse strip
  "mentor.dash.pulse.template":
    "AI flagged {sigCount} signals · drafted {draftCount} answers · saved you {hours}h this week",
  "mentor.dash.pulse.fallback":
    "AI is warming up. Add a newcomer to start the feed.",

  // KPI cards
  "mentor.dash.kpi.active.label": "Active newcomers",
  "mentor.dash.kpi.active.hintLoaded": "Across {teamCount} teams",
  "mentor.dash.kpi.active.hintOneTeam": "One team",
  "mentor.dash.kpi.active.hintEmpty": "No active newcomers yet",

  "mentor.dash.kpi.attention.label": "Needs your eyes",
  "mentor.dash.kpi.attention.hintLoaded":
    "{flagged} flagged · {blocked} blocked",
  "mentor.dash.kpi.attention.hintEmpty": "Nothing flagged",

  "mentor.dash.kpi.progress.label": "Average progress",
  "mentor.dash.kpi.progress.hintLoaded": "Across {active} active plans",
  "mentor.dash.kpi.progress.hintEmpty": "No plans active yet",

  "mentor.dash.kpi.timeSaved.label": "Hours AI saved you",
  "mentor.dash.kpi.timeSaved.hintLoaded": "This week, vs. doing it manually",
  "mentor.dash.kpi.timeSaved.hintEmpty": "Add a newcomer to start counting",

  // Today's focus
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

  "mentor.dash.today.handledDrafted":
    "Drafted onboarding reply for {firstName}",
  "mentor.dash.today.handledSummarized":
    "Summarized week 1 progress for {firstName}",
  "mentor.dash.today.handledResolved":
    "Auto-resolved low-severity signal for {firstName}",
  "mentor.dash.today.handledLink": "View",

  // Newcomers
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

  // AI signals
  "mentor.dash.sig.heading": "AI signals",
  "mentor.dash.sig.lastScan": "Last scan {relativeTime}.",
  "mentor.dash.sig.openCenter": "Open signals center",
  "mentor.dash.sig.openShort": "Open",
  "mentor.dash.sig.emptyTitle": "No signals yet",
  "mentor.dash.sig.emptyDesc":
    "AI is scanning engagement, blocked tasks and Q&A patterns. Signals appear here the moment something looks off.",

  // Cohort heartbeat
  "mentor.dash.cohort.title": "Cohort heartbeat",
  "mentor.dash.cohort.subhead":
    "Each column is a newcomer. Taller bars mean more shipped. Colored caps mean AI noticed something.",
  "mentor.dash.cohort.empty":
    "No cohort yet — your heartbeat shows up once you have an active newcomer.",
  "mentor.dash.cohort.tooltip": "{firstName} · {percent}% complete",
  "mentor.dash.cohort.tooltipSignal": "AI noticed: {signalTitle}",
  "mentor.dash.cohort.view": "View",

  // Mentor moves
  "mentor.dash.moves.title": "Mentor moves",
  "mentor.dash.moves.subhead":
    "Three things you could do in one click right now.",

  "mentor.dash.moves.checkIn.title": "Check in with {firstName}",
  "mentor.dash.moves.checkIn.body":
    "They have {n} blocked tasks. A 15-min call usually unblocks the week.",
  "mentor.dash.moves.checkIn.cta": "Schedule 15 min",

  "mentor.dash.moves.adjust.title": "Adjust {firstName}'s plan",
  "mentor.dash.moves.adjust.body":
    "AI noticed {signalTitle}. Want to reshape the next two weeks around it?",
  "mentor.dash.moves.adjust.cta": "Open plan generator",

  "mentor.dash.moves.course.title": 'Turn "{topic}" into a course',
  "mentor.dash.moves.course.body":
    "Seen {count}× across newcomers. AI can draft a short course you can ship today.",
  "mentor.dash.moves.course.cta": "Draft course",

  "mentor.dash.moves.empty.title": "Add a newcomer to unlock moves",
  "mentor.dash.moves.empty.body":
    "Once someone's onboarding, AI will surface three one-click moves you can take.",
  "mentor.dash.moves.empty.cta": "Add newcomer",

  // Week rollup
  "mentor.dash.week.title": "This week in numbers",
  "mentor.dash.week.subhead":
    "What the AI and you shipped together since Monday.",
  "mentor.dash.week.tasks": "tasks shipped",
  "mentor.dash.week.signals": "signals resolved",
  "mentor.dash.week.drafts": "AI drafts you approved",
  "mentor.dash.week.hours": "mentor work absorbed",
  "mentor.dash.week.celebrate": "Mark as done 🎉",
};

export default mentorDashboard;
