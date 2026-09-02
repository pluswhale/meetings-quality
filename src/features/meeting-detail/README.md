# MeetingDetail Feature

Live meeting room: Socket.IO for presence and answers, React Query for REST
metadata, Zustand (`store/useMeetingStore.ts`) as the client source of truth
for every phase's results.

```
meeting-detail/
├── index.ts
├── types.ts                          # MeetingDetailViewModel
├── useMeetingDetailViewModel.ts      # Alternate composer (container is canonical)
├── containers/
│   └── MeetingDetailContainer.tsx    # Route entry: wires hooks → view
├── store/
│   └── useMeetingStore.ts            # votesByPhase, conclusions, presence
├── hooks/
│   ├── useMeetingSocket.ts           # Socket.IO lifecycle + emits
│   ├── useMeetingData.ts
│   ├── useMeetingPresence.ts
│   ├── useMeetingPhase.ts            # live vs reviewed phase
│   ├── useMeetingSubmissions.ts      # GET /:id/all-submissions fallback
│   ├── usePendingVoters.ts
│   ├── useEmotionalEvaluation.ts
│   ├── useUnderstandingContribution.ts
│   ├── useTaskPlanning.ts            # several tasks, each with a taskKey
│   ├── useMeetingConclusions.ts      # creator-only «Выводы встречи»
│   ├── useTaskEvaluation.ts          # scores keyed by task _id
│   └── useTaskApproval.ts
└── components/
    ├── MeetingHeader.tsx
    ├── MeetingManageControls.tsx
    ├── PhaseContent.tsx
    ├── CreatorAdminPanel.tsx         # follows viewedPhase, not always live
    ├── FinishedPhaseView.tsx
    ├── RetroPhaseView.tsx
    ├── EmotionalEvaluationTable.tsx
    ├── UnderstandingScorePanel.tsx
    ├── ContributionDistributionPanel.tsx
    ├── TaskPlanningForm.tsx
    ├── TaskEvaluationForm.tsx
    ├── TaskEmotionalScaleSlider.tsx
    └── PendingVotersPanel.tsx
```

## Live-vote model

There are no per-phase submit buttons. Field blur / slider release emits
`user:update_live_vote`. The server stores the payload in Redis per
`(meeting, phase, user)` and broadcasts `room:vote_updated`. Joining or
reconnecting receives `room:state_sync` with `votesByPhase` for every phase
entered so far, plus `conclusions`.

`setPhase` does not wipe earlier phases. The creator's panel reads
`votesByPhase[reviewedPhase]` and falls back to `GET /:id/all-submissions`
when live state is missing.

## Phases

1. Emotional evaluation — rate other participants.
2. Understanding & contribution — self understanding score + contribution split.
3. Task planning — several tasks per person (`taskKey`); creator writes
   «Выводы встречи»; per-task approval.
4. Task evaluation — score each persisted task except your own.
5. Finished — analytics; conclusions shown when present; no trailing
   «Понимание и вклад» list.

## Constants

Phase names come from `MeetingResponseDtoCurrentPhase` in
`@/src/shared/constants`. Creator checks use `isUserCreator` from `lib/`.
