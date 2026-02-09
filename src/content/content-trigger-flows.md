# Content Trigger Flows (`src/content/content.ts`)

This document maps the trigger paths in the content script: startup init, SPA navigation, fallback recovery, `src` observer behavior, and reset/cleanup.

## 1) Module load startup flow

```mermaid
flowchart TD
  moduleLoad[ModuleEvaluated] --> startInit[startInitialization]
  moduleLoad --> bindNav[bindNavListeners]
  startInit --> pendingCheck{isInitPending?}
  pendingCheck -- yes --> skipStart[ReturnNoOp]
  pendingCheck -- no --> setPending[SetIsInitPendingTrue]
  setPending --> initCall[initializeExtension]
  initCall --> finalize[finallySetIsInitPendingFalse]
```

## 2) SPA navigation trigger flow

`yt-navigate-finish` and `yt-page-data-updated` both call `handleSpaNavigation()`.

```mermaid
flowchart TD
  ytNavigateFinish[yt_navigate_finish] --> spaHandler[handleSpaNavigation]
  ytPageDataUpdated[yt_page_data_updated] --> spaHandler

  spaHandler --> clearFallback[cleanupFallback]
  clearFallback --> setTimer[SetNavFallbackTimer2000ms]
  spaHandler --> guardedInit[startInitialization]

  setTimer --> timerFires{TimerFires}
  timerFires -- hasVideoAndButtons true --> timerDone[Return]
  timerFires -- hasVideoAndButtons false --> armObserver[CreateFallbackMutationObserver]
```

## 3) `initializeExtension()` decision tree

```mermaid
flowchart TD
  initStart[initializeExtension] --> bindWait[bindWaitCleanup]
  bindWait --> bindNavCleanup[bindNavCleanup]
  bindNavCleanup --> firstRun[await run]
  firstRun --> hasCustomButton{CustomButtonExists?}

  hasCustomButton -- yes --> attachSrcObserverA[observeVideoSrcChange]
  attachSrcObserverA --> initEndA[Return]

  hasCustomButton -- no --> waitForElements[await waitForPlayerElements]
  waitForElements --> elementsFound{ElementsFound?}
  elementsFound -- no --> initEndB[Return]
  elementsFound -- yes --> secondRun[await run]
  secondRun --> attachSrcObserverB[observeVideoSrcChange]
  attachSrcObserverB --> initEndC[Return]
```

## 4) Fallback observer recovery path

This covers delayed player appearance after SPA navigation.

```mermaid
flowchart TD
  fallbackObserverCallback[FallbackObserverCallback] --> playerReady{isPlayerReady?}
  playerReady -- no --> waitMore[WaitForMoreMutations]
  playerReady -- yes --> disconnectFallback[DisconnectFallbackObserver]
  disconnectFallback --> runNow[run]
  disconnectFallback --> attachSrc[observeVideoSrcChange]
```

## 5) Video `src` observer lifecycle

```mermaid
flowchart TD
  observeCall[observeVideoSrcChange] --> cleanupOld[cleanupVideoSrcObserver]
  cleanupOld --> queryVideo[QueryVideoElement]
  queryVideo --> videoExists{VideoExists?}
  videoExists -- no --> returnNoObserver[Return]
  videoExists -- yes --> createObserver[CreateVideoSrcMutationObserver]
  createObserver --> observeSrc[ObserveAttributeSrc]
  observeSrc --> onSrcMutation[OnSrcMutation]
  onSrcMutation --> rerun[exportFunctions.run]
```

## 6) Cleanup and reset paths

```mermaid
flowchart TD
  pagehide[window_pagehide] --> cleanupNavState[cleanupNavState]
  beforeunload[window_beforeunload] --> cleanupNavState

  cleanupNavState --> clearFallbackA[cleanupFallback]
  cleanupNavState --> clearVideoSrcA[cleanupVideoSrcObserver]
  cleanupNavState --> abortWaitA[abortWait]
  cleanupNavState --> resetPendingA[SetIsInitPendingFalse]

  testsOrManual[resetNavState] --> clearFallbackB[cleanupFallback]
  testsOrManual --> clearVideoSrcB[cleanupVideoSrcObserver]
  testsOrManual --> abortWaitB[abortWait]
  testsOrManual --> resetPendingB[SetIsInitPendingFalse]
  testsOrManual --> resetListenerFlags[ResetBoundFlagsFalse]
```

## 7) State-focused overview

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Initializing: startInitialization
  Initializing --> Idle: initializeExtension finally

  Idle --> FallbackTimerArmed: handleSpaNavigation
  FallbackTimerArmed --> Idle: hasVideoAndButtons true
  FallbackTimerArmed --> FallbackObserving: timer expiry and not ready
  FallbackObserving --> Idle: isPlayerReady then run and observeVideoSrcChange

  Idle --> SrcObserving: observeVideoSrcChange with video
  SrcObserving --> SrcObserving: src mutation triggers run
  SrcObserving --> Idle: cleanupVideoSrcObserver

  Initializing --> Idle: cleanupNavState or resetNavState
  FallbackTimerArmed --> Idle: cleanupFallback
  FallbackObserving --> Idle: cleanupFallback
```

## 8) Sequence: startup and early SPA event

This sequence shows how the guarded init prevents double initialization if a YouTube SPA event arrives while startup init is still running.

```mermaid
sequenceDiagram
  participant Module as ContentModule
  participant Nav as NavEvents
  participant Core as startInitialization
  participant Init as initializeExtension

  Module->>Core: startInitialization on module load
  Core->>Core: check isInitPending false
  Core->>Core: set isInitPending true
  Core->>Init: call initializeExtension

  Module->>Nav: bindNavListeners
  Nav-->>Core: yt-navigate-finish or yt-page-data-updated
  Core->>Core: check isInitPending true
  Core-->>Nav: return no second init

  Init-->>Core: resolve or reject
  Core->>Core: finally set isInitPending false
```

## 9) Sequence: fallback timer and observer recovery

This sequence shows late player availability after SPA navigation and how fallback attaches src observation.

```mermaid
sequenceDiagram
  participant YT as YouTubeSPA
  participant Handler as handleSpaNavigation
  participant Timer as navFallbackTimer
  participant Obs as fallbackObserver
  participant DOM as DocumentBody
  participant Run as run
  participant Src as observeVideoSrcChange

  YT-->>Handler: navigation event
  Handler->>Handler: cleanupFallback
  Handler->>Timer: setTimeout 2000ms
  Handler->>Handler: startInitialization

  Timer-->>Handler: timer fires
  Handler->>Handler: hasVideoAndButtons false
  Handler->>Obs: create and observe document.body

  DOM-->>Obs: player nodes inserted
  Obs->>Handler: callback
  Handler->>Handler: isPlayerReady true
  Handler->>Obs: disconnect and clear fallbackObserver
  Handler->>Run: run
  Handler->>Src: observeVideoSrcChange
```
