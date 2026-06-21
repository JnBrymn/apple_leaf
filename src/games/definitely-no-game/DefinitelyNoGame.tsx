import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { Garden } from './garden'
import { NARRATOR } from './narrator'
import { GamePuzzles } from './puzzles'
import { createInitialGameState, type GameState, type GameUI } from './types'
import styles from './definitely-no-game.module.css'

const KEYPAD_DIGITS = '1234567890'.split('')
const PHOTO_CORNERS = ['tl', 'tr', 'bl', 'br'] as const
const HOTSPOT_CLASS: Record<(typeof PHOTO_CORNERS)[number], string> = {
  tl: styles.hotspotTl,
  tr: styles.hotspotTr,
  bl: styles.hotspotBl,
  br: styles.hotspotBr,
}

interface VisualState {
  stage: number
  narratorText: string | null
  periodFell: boolean
  titleShake: boolean
  screwVisible: boolean
  screwPos: { left: number; top: number }
  screwHidden: boolean
  screwTargetShow: boolean
  panelLoose: boolean
  powerOn: boolean
  stage1Glitch: boolean
  keypadVisible: boolean
  keypadShake: boolean
  codeValue: string
  windowPos: { left: number; top: number } | null
  windowPositioned: boolean
  fakeWindowShake: boolean
  fakeWindowOpacity: number
  okButtonOffset: { x: number; y: number }
  leakActive: boolean
  folderTrophyVisible: boolean
  folderTrophyPos: { left: number; top: number; zIndex: number }
  folderTrophyDragging: boolean
  trophyWaterPct: number
  filePhotoDim: boolean
  filePlantGlow: boolean
  shakingFile: string | null
  photoOverlay: boolean
  photoFound: Set<string>
  plantOverlay: boolean
  plantIsTree: boolean
  appleFall: boolean
  appleLocation: 'none' | 'plant' | 'carried'
  applePos: { left: number; top: number }
  appleDragging: boolean
  chatOverlay: boolean
  appleCoreOnScreen: boolean
  appleCorePos: { left: number; top: number }
  appleCoreDragging: boolean
  mrGlitchVisible: boolean
  musicToast: boolean
  trophyPos: { left: string; top: string; transform: string }
  trophyCaughtAnim: boolean
}

function initialVisual(): VisualState {
  return {
    stage: 1,
    narratorText: null,
    periodFell: false,
    titleShake: false,
    screwVisible: false,
    screwPos: { left: 0, top: 0 },
    screwHidden: false,
    screwTargetShow: false,
    panelLoose: false,
    powerOn: false,
    stage1Glitch: false,
    keypadVisible: false,
    keypadShake: false,
    codeValue: '',
    windowPos: null,
    windowPositioned: false,
    fakeWindowShake: false,
    fakeWindowOpacity: 1,
    okButtonOffset: { x: 0, y: 0 },
    leakActive: false,
    folderTrophyVisible: false,
    folderTrophyPos: { left: 0, top: 0, zIndex: 90 },
    folderTrophyDragging: false,
    trophyWaterPct: 0,
    filePhotoDim: false,
    filePlantGlow: false,
    shakingFile: null,
    photoOverlay: false,
    photoFound: new Set(),
    plantOverlay: false,
    plantIsTree: false,
    appleFall: false,
    appleLocation: 'none',
    applePos: { left: 0, top: 0 },
    appleDragging: false,
    chatOverlay: false,
    appleCoreOnScreen: false,
    appleCorePos: { left: 0, top: 0 },
    appleCoreDragging: false,
    mrGlitchVisible: false,
    musicToast: false,
    trophyPos: { left: '50%', top: '45%', transform: 'translate(-50%, -50%)' },
    trophyCaughtAnim: false,
  }
}

interface ChatMessage {
  role: 'user' | 'bot'
  text: string
}

type DragKind = 'screw' | 'folderTrophy' | 'window' | 'apple' | 'appleCore'

interface DragState {
  kind: DragKind
  offsetX: number
  offsetY: number
  startX: number
  startY: number
  winLeft?: number
  winTop?: number
}

const BOT_REPLY = "i'm hungry"
const BOT_CORE_REPLY = "here's your apple core"

function nearPoint(x: number, y: number, el: HTMLElement, pad = 0.55): boolean {
  const r = el.getBoundingClientRect()
  const cx = r.left + r.width / 2
  const cy = r.top + r.height / 2
  return Math.hypot(x - cx, y - cy) < Math.max(r.width, r.height) * pad
}

export default function DefinitelyNoGame() {
  const gameState = useRef<GameState>(createInitialGameState())
  const [visual, setVisual] = useState<VisualState>(initialVisual)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef(visual)
  visualRef.current = visual
  const dragRef = useRef<DragState | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const cornerPanelRef = useRef<HTMLDivElement>(null)
  const desktopRef = useRef<HTMLDivElement>(null)
  const stickyNoteRef = useRef<HTMLDivElement>(null)
  const fakeWindowRef = useRef<HTMLDivElement>(null)
  const leakZoneRef = useRef<HTMLDivElement>(null)
  const plantPotRef = useRef<HTMLDivElement>(null)
  const trophyZoneRef = useRef<HTMLDivElement>(null)
  const chatDropZoneRef = useRef<HTMLDivElement>(null)
  const chatbotFileRef = useRef<HTMLDivElement>(null)
  const trashFileRef = useRef<HTMLDivElement>(null)

  const narrate = useCallback((group: string, index: number) => {
    const lines = NARRATOR[group]
    if (!lines?.[index]) return
    setVisual((v) => ({ ...v, narratorText: lines[index] }))
  }, [])

  const ui = useRef<GameUI>({
    showScene(n) {
      gameState.current.stage = n
      setVisual((v) => ({ ...v, stage: n }))
    },
    narrate,
    showGardenMode() {
      const root = rootRef.current
      const left = root ? Math.round(root.clientWidth / 2 - 28) : 200
      const top = root ? Math.round(root.clientHeight * 0.55) : 300
      setVisual((v) => ({
        ...v,
        leakActive: true,
        filePhotoDim: true,
        folderTrophyVisible: true,
        folderTrophyPos: { left, top, zIndex: 90 },
        trophyWaterPct: 0,
      }))
    },
    hideGardenMode() {
      setVisual((v) => ({
        ...v,
        leakActive: false,
        filePhotoDim: false,
        folderTrophyVisible: false,
        plantOverlay: false,
      }))
    },
    setTrophyWater(pct) {
      setVisual((v) => ({
        ...v,
        trophyWaterPct: pct,
        filePlantGlow: pct >= 100,
      }))
    },
    openPlantView() {
      setVisual((v) => {
        const state = gameState.current
        let folderTrophyPos = v.folderTrophyPos
        let folderTrophyVisible = v.folderTrophyVisible
        if (state.trophyFull && !state.plantWatered) {
          folderTrophyPos = { left: rootRef.current ? rootRef.current.clientWidth * 0.18 : 80, top: rootRef.current ? rootRef.current.clientHeight * 0.72 : 400, zIndex: 150 }
        } else if (state.treeReady) {
          folderTrophyVisible = false
        }
        return { ...v, plantOverlay: true, folderTrophyPos, folderTrophyVisible }
      })
    },
    growTree() {
      setVisual((v) => ({ ...v, plantIsTree: true }))
    },
    dropApple() {
      setVisual((v) => ({ ...v, appleFall: true }))
    },
    setAppleReady() {
      setVisual((v) => ({ ...v, appleLocation: 'plant' }))
    },
    openChatbot() {
      setVisual((v) => ({ ...v, chatOverlay: true }))
    },
    giveAppleToBot() {
      const root = rootRef.current
      const left = root ? Math.round(root.clientWidth / 2 - 18) : 200
      const top = root ? Math.round(root.clientHeight * 0.42) : 280
      setChatMessages((msgs) => [
        ...msgs,
        { role: 'user', text: '🍎' },
        { role: 'bot', text: BOT_CORE_REPLY },
      ])
      setTimeout(() => {
        setVisual((v) => ({
          ...v,
          appleLocation: 'none',
          appleDragging: false,
          chatOverlay: false,
          appleCoreOnScreen: true,
          appleCorePos: { left, top },
        }))
        ui.current.narrate('appleCoreTrash', 0)
      }, 700)
    },
    disposeAppleCore() {
      setVisual((v) => ({
        ...v,
        appleCoreOnScreen: false,
        appleCoreDragging: false,
      }))
    },
    showMrGlitch() {
      setVisual((v) => ({ ...v, mrGlitchVisible: true }))
    },
    shakeTitle() {
      setVisual((v) => ({ ...v, titleShake: true }))
      setTimeout(() => setVisual((v) => ({ ...v, titleShake: false })), 400)
    },
    dropPeriod() {
      setVisual((v) => ({ ...v, periodFell: true }))
    },
    showScrew() {
      const root = rootRef.current
      const left = root ? root.clientWidth / 2 - 24 : 200
      const top = root ? root.clientHeight * 0.58 : 300
      setVisual((v) => ({
        ...v,
        screwVisible: true,
        screwPos: { left, top },
        screwTargetShow: true,
      }))
      narrate('screwFound', 0)
    },
    loosenPanel() {
      setVisual((v) => ({
        ...v,
        panelLoose: true,
        screwTargetShow: false,
        screwHidden: true,
      }))
    },
    glitchToStage2() {
      setVisual((v) => ({ ...v, stage1Glitch: true }))
      setTimeout(() => {
        setVisual((v) => ({ ...v, stage1Glitch: false }))
        GamePuzzles.initStage2(gameState.current, ui.current)
      }, 600)
    },
    resetWindow() {
      const desk = desktopRef.current
      const note = stickyNoteRef.current
      const win = fakeWindowRef.current
      if (!desk || !note || !win) return
      const deskRect = desk.getBoundingClientRect()
      const noteRect = note.getBoundingClientRect()
      const left = noteRect.left - deskRect.left + (noteRect.width - win.offsetWidth) / 2
      const top = noteRect.top - deskRect.top + (noteRect.height - win.offsetHeight) / 2
      setVisual((v) => ({
        ...v,
        windowPos: { left, top },
        windowPositioned: true,
        keypadVisible: false,
        okButtonOffset: { x: 0, y: 0 },
        codeValue: '',
      }))
    },
    fleeOkButton() {
      const x = (Math.random() - 0.5) * 100
      const y = (Math.random() - 0.5) * 60
      setVisual((v) => ({ ...v, okButtonOffset: { x, y } }))
    },
    revealKeypad() {
      setVisual((v) => ({ ...v, keypadVisible: true }))
    },
    shakeKeypad() {
      setVisual((v) => ({ ...v, keypadShake: true }))
      setTimeout(() => setVisual((v) => ({ ...v, keypadShake: false })), 400)
    },
    shakeElement(id) {
      setVisual((v) => ({ ...v, shakingFile: id }))
      setTimeout(() => setVisual((v) => ({ ...v, shakingFile: null })), 400)
    },
    goStage3() {
      GamePuzzles.initStage3(gameState.current, ui.current)
    },
    openPhotoPuzzle() {
      setVisual((v) => ({
        ...v,
        photoOverlay: true,
        photoFound: new Set(),
      }))
    },
    playFakeMusic() {
      setVisual((v) => ({ ...v, musicToast: true }))
      setTimeout(() => setVisual((v) => ({ ...v, musicToast: false })), 2200)
    },
    showTrophyStage() {
      setVisual((v) => ({ ...v, photoOverlay: false }))
      GamePuzzles.initStage4(gameState.current, ui.current)
      setTimeout(() => placeTrophyCenter(), 50)
    },
    catchTrophy() {
      setVisual((v) => ({
        ...v,
        trophyCaughtAnim: true,
        trophyPos: { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' },
      }))
    },
    resetStage1Dom() {
      setVisual(initialVisual())
    },
  })

  const placeTrophyCenter = useCallback(() => {
    setVisual((v) => ({
      ...v,
      trophyPos: { left: '50%', top: '45%', transform: 'translate(-50%, -50%)' },
      trophyCaughtAnim: false,
    }))
  }, [])

  const dodgeTrophy = useCallback(() => {
    const zone = trophyZoneRef.current
    if (!zone) return
    const pad = 48
    const maxX = Math.max(zone.clientWidth - pad * 2, 80)
    const maxY = Math.max(zone.clientHeight - pad * 2, 80)
    setVisual((v) => ({
      ...v,
      trophyPos: {
        left: `${pad + Math.random() * maxX}px`,
        top: `${pad + Math.random() * maxY}px`,
        transform: 'none',
      },
      trophyCaughtAnim: false,
    }))
  }, [])

  const restart = useCallback(() => {
    gameState.current = createInitialGameState()
    setVisual(initialVisual())
    setChatMessages([])
    setChatInput('')
    GamePuzzles.initStage1(gameState.current, ui.current)
  }, [])

  useEffect(() => {
    GamePuzzles.initStage1(gameState.current, ui.current)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const sendChat = () => {
    const text = chatInput.trim()
    if (!text) return
    setChatMessages((msgs) => [
      ...msgs,
      { role: 'user', text },
      { role: 'bot', text: BOT_REPLY },
    ])
    setChatInput('')
  }

  const tryFeedApple = (x: number, y: number) => {
    const state = gameState.current
    if (!state.hasApple || state.appleFedToBot) return false
    const dropZone = chatDropZoneRef.current
    const fileEl = chatbotFileRef.current
    if (
      (visualRef.current.chatOverlay && dropZone && nearPoint(x, y, dropZone, 0.65)) ||
      (!visualRef.current.chatOverlay && fileEl && nearPoint(x, y, fileEl, 0.7))
    ) {
      Garden.onAppleGiven(state, ui.current)
      return true
    }
    return false
  }

  const tryTrashAppleCore = (x: number, y: number) => {
    const state = gameState.current
    if (!state.hasAppleCore || state.appleCoreTrashed) return false
    const trashEl = trashFileRef.current
    if (trashEl && nearPoint(x, y, trashEl, 0.75)) {
      GamePuzzles.onAppleCoreTrashed(state, ui.current)
      return true
    }
    return false
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') restart()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [restart])

  useLayoutEffect(() => {
    if (visual.stage === 2 && visual.windowPos === null) {
      ui.current.resetWindow()
    }
  }, [visual.stage, visual.windowPos])

  const onTitleClick = () => {
    GamePuzzles.onTitleClick(gameState.current, ui.current)
  }

  const onPowerClick = () => {
    if (!gameState.current.screwLoose) return
    setVisual((v) => ({ ...v, powerOn: true }))
    GamePuzzles.onPowerClick(gameState.current, ui.current)
  }

  const startDrag = (kind: DragKind, e: ReactPointerEvent, el: HTMLElement) => {
    e.preventDefault()
    const rect = el.getBoundingClientRect()
    const rootRect = rootRef.current?.getBoundingClientRect()
    dragRef.current = {
      kind,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
    }
    if (kind === 'window' && rootRect && fakeWindowRef.current) {
      const winRect = fakeWindowRef.current.getBoundingClientRect()
      dragRef.current.winLeft = winRect.left - rootRect.left
      dragRef.current.winTop = winRect.top - rootRect.top
      setVisual((v) => ({
        ...v,
        windowPositioned: true,
        windowPos: {
          left: dragRef.current!.winLeft!,
          top: dragRef.current!.winTop!,
        },
      }))
    }
    if (kind === 'folderTrophy') {
      setVisual((v) => ({ ...v, folderTrophyDragging: true }))
    }
    if (kind === 'apple') {
      const rootRect = rootRef.current?.getBoundingClientRect()
      if (rootRect) {
        gameState.current.hasApple = true
        setVisual((v) => ({
          ...v,
          appleLocation: 'carried',
          appleDragging: true,
          applePos: {
            left: e.clientX - rootRect.left - dragRef.current!.offsetX,
            top: e.clientY - rootRect.top - dragRef.current!.offsetY,
          },
        }))
      }
    }
    if (kind === 'appleCore') {
      const rootRect = rootRef.current?.getBoundingClientRect()
      if (rootRect) {
        setVisual((v) => ({
          ...v,
          appleCoreDragging: true,
          appleCorePos: {
            left: e.clientX - rootRect.left - dragRef.current!.offsetX,
            top: e.clientY - rootRect.top - dragRef.current!.offsetY,
          },
        }))
      }
    }
    el.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const rootRect = rootRef.current?.getBoundingClientRect()
    if (!rootRect) return

    if (drag.kind === 'screw') {
      setVisual((v) => ({
        ...v,
        screwPos: {
          left: e.clientX - rootRect.left - drag.offsetX,
          top: e.clientY - rootRect.top - drag.offsetY,
        },
      }))
    } else if (drag.kind === 'folderTrophy') {
      setVisual((v) => ({
        ...v,
        folderTrophyPos: {
          left: e.clientX - rootRect.left - drag.offsetX,
          top: e.clientY - rootRect.top - drag.offsetY,
          zIndex: v.folderTrophyPos.zIndex,
        },
      }))
    } else if (drag.kind === 'window' && drag.winLeft !== undefined && drag.winTop !== undefined) {
      const dx = e.clientX - drag.startX
      const dy = e.clientY - drag.startY
      setVisual((v) => ({
        ...v,
        windowPos: { left: drag.winLeft! + dx, top: drag.winTop! + dy },
      }))
    } else if (drag.kind === 'apple') {
      setVisual((v) => ({
        ...v,
        applePos: {
          left: e.clientX - rootRect.left - drag.offsetX,
          top: e.clientY - rootRect.top - drag.offsetY,
        },
      }))
    } else if (drag.kind === 'appleCore') {
      setVisual((v) => ({
        ...v,
        appleCorePos: {
          left: e.clientX - rootRect.left - drag.offsetX,
          top: e.clientY - rootRect.top - drag.offsetY,
        },
      }))
    }
  }

  const onPointerUp = (e: ReactPointerEvent) => {
    const drag = dragRef.current
    if (!drag) return

    if (drag.kind === 'screw') {
      const panel = cornerPanelRef.current
      if (panel && gameState.current.periodGone) {
        GamePuzzles.onScrewDropped(
          gameState.current,
          ui.current,
          e.clientX,
          e.clientY,
          panel.getBoundingClientRect(),
        )
      }
    } else if (drag.kind === 'folderTrophy') {
      setVisual((v) => ({ ...v, folderTrophyDragging: false }))
      const state = gameState.current
      if (!state.gardenPhase) {
        dragRef.current = null
        return
      }
      if (visualRef.current.plantOverlay) {
        Garden.onPourPlant(state, ui.current, e.clientX, e.clientY, plantPotRef.current)
      } else {
        Garden.onTrophyDropped(state, ui.current, e.clientX, e.clientY, leakZoneRef.current)
      }
    } else if (drag.kind === 'window') {
      const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY)
      GamePuzzles.onWindowDragEnd(gameState.current, ui.current, moved)
    } else if (drag.kind === 'apple') {
      setVisual((v) => ({ ...v, appleDragging: false }))
      if (!tryFeedApple(e.clientX, e.clientY)) {
        gameState.current.hasApple = true
      }
    } else if (drag.kind === 'appleCore') {
      setVisual((v) => ({ ...v, appleCoreDragging: false }))
      tryTrashAppleCore(e.clientX, e.clientY)
    }

    dragRef.current = null
  }

  const onCodeDigit = (d: string) => {
    setVisual((v) => {
      if (v.codeValue.length >= 4) return v
      return { ...v, codeValue: v.codeValue + d }
    })
  }

  const onCodeSubmit = () => {
    const value = visual.codeValue
    GamePuzzles.onCodeSubmit(gameState.current, ui.current, value)
    setVisual((v) => ({ ...v, codeValue: '' }))
  }

  const onHotspotClick = (corner: string) => {
    if (visual.photoFound.has(corner)) return
    const next = new Set(visual.photoFound)
    next.add(corner)
    setVisual((v) => ({ ...v, photoFound: next }))
    if (next.size === 4) {
      setTimeout(() => GamePuzzles.onPhotoSolved(gameState.current, ui.current), 500)
    }
  }

  const onTrophyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (gameState.current.trophyCaught) return
    const shouldDodge = GamePuzzles.onTrophyClick(gameState.current, ui.current)
    if (shouldDodge) dodgeTrophy()
  }

  const onClosePlant = () => {
    setVisual((v) => {
      const state = gameState.current
      if (state.gardenPhase && !state.plantWatered) {
        return {
          ...v,
          plantOverlay: false,
          folderTrophyVisible: true,
          folderTrophyPos: { ...v.folderTrophyPos, zIndex: 90 },
        }
      }
      return { ...v, plantOverlay: false }
    })
  }

  const sceneClass = (n: number, extra: string) =>
    [styles.scene, extra, visual.stage === n ? styles.sceneActive : ''].filter(Boolean).join(' ')

  return (
    <div
      ref={rootRef}
      className={styles.root}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className={styles.hintRestart}>
        <kbd>R</kbd> restart
      </div>

      {/* Stage 1 */}
      <section className={sceneClass(1, `${styles.stage1} ${visual.stage1Glitch ? styles.glitchOut : ''}`)}>
        <div
          ref={cornerPanelRef}
          className={[styles.cornerPanel, visual.panelLoose ? styles.cornerPanelLoose : ''].join(' ')}
        >
          <div className={[styles.screwTargetRing, visual.screwTargetShow ? styles.screwTargetRingShow : ''].join(' ')} />
          <button
            type="button"
            className={[styles.powerBtn, visual.powerOn ? styles.powerBtnOn : ''].join(' ')}
            onClick={onPowerClick}
            title="power"
          />
        </div>
        <div
          className={[styles.titleBlock, visual.titleShake ? styles.titleBlockShake : ''].join(' ')}
          onClick={onTitleClick}
          onKeyDown={(e) => e.key === 'Enter' && onTitleClick()}
          role="button"
          tabIndex={0}
        >
          <h1>
            DEFINITELY
            <br />
            NO GAME
          </h1>
          <p>
            Please go away
            <span className={[styles.period, visual.periodFell ? styles.periodFell : ''].join(' ')}>.</span>
          </p>
        </div>
        {!visual.screwHidden && (
          <div
            className={[
              styles.draggable,
              styles.screw,
              visual.screwVisible ? styles.screwShow : '',
              dragRef.current?.kind === 'screw' ? styles.draggableDragging : '',
            ].join(' ')}
            style={{ left: visual.screwPos.left, top: visual.screwPos.top }}
            title="screw"
            onPointerDown={(e) => startDrag('screw', e, e.currentTarget)}
          >
            🔩
          </div>
        )}
      </section>

      {/* Stage 2 */}
      <section className={sceneClass(2, styles.stage2)}>
        <div ref={desktopRef} className={styles.desktop}>
          <div ref={stickyNoteRef} className={styles.stickyNote}>
            code:
            <br />
            <strong>4040</strong>
            <br />
            <small>there is no end</small>
          </div>
          <div
            className={[
              styles.keypadWrap,
              visual.keypadVisible ? styles.keypadWrapShow : '',
              visual.keypadShake ? styles.keypadWrapShake : '',
            ].join(' ')}
          >
            <div className={styles.keypad}>
              <input type="text" value={visual.codeValue} maxLength={4} placeholder="????" readOnly />
              <div className={styles.keypadKeys}>
                {KEYPAD_DIGITS.map((d) => (
                  <button key={d} type="button" onClick={() => onCodeDigit(d)}>
                    {d}
                  </button>
                ))}
                <button type="button" className={styles.keypadEnter} onClick={onCodeSubmit}>
                  UNLOCK
                </button>
              </div>
            </div>
          </div>
          <div
            ref={fakeWindowRef}
            className={[
              styles.fakeWindow,
              visual.windowPositioned ? styles.fakeWindowPositioned : '',
              visual.fakeWindowShake ? styles.fakeWindowShake : '',
            ].join(' ')}
            style={{
              left: visual.windowPos?.left ?? '50%',
              top: visual.windowPos?.top ?? '42%',
              opacity: visual.fakeWindowOpacity,
            }}
          >
            <div
              className={styles.winTitlebar}
              onPointerDown={(e) => startDrag('window', e, e.currentTarget)}
            >
              Game.exe — Not Found
            </div>
            <div className={styles.winBody}>
              <div className={styles.winBodyIcon}>⚠️</div>
              <p>
                <strong>There is no game.</strong>
                <br />
                There is no end.
              </p>
              <div className={styles.winBtns}>
                <button
                  type="button"
                  className={styles.btnOk}
                  style={{ transform: `translate(${visual.okButtonOffset.x}px, ${visual.okButtonOffset.y}px)` }}
                  onMouseEnter={() => ui.current.fleeOkButton()}
                  onClick={() => {
                    narrate('popup', 1)
                    setVisual((v) => ({ ...v, fakeWindowShake: true }))
                    setTimeout(() => setVisual((v) => ({ ...v, fakeWindowShake: false })), 400)
                  }}
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVisual((v) => ({ ...v, fakeWindowOpacity: 0.5 }))
                    setTimeout(() => setVisual((v) => ({ ...v, fakeWindowOpacity: 1 })), 300)
                  }}
                >
                  Cancel
                </button>
                <button type="button" onClick={() => narrate('popup', 0)}>
                  Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stage 3 */}
      <section className={sceneClass(3, styles.stage3)}>
        <div className={[styles.leakCorner, visual.leakActive ? styles.leakCornerActive : ''].join(' ')}>
          <div className={styles.leakPipe} />
          <div className={styles.dripStream} />
          <div className={styles.leakPuddle} />
          <div ref={leakZoneRef} className={styles.leakZone} title="drip" />
        </div>
        <div className={styles.folderUi}>
          <div className={styles.folderBar}>📁 definitely_not_a_game/</div>
          <div className={styles.fileGrid}>
            <div
              ref={trashFileRef}
              className={[
                styles.file,
                visual.shakingFile === 'file-trash' ? styles.fileShake : '',
                visual.appleCoreOnScreen ? styles.fileTrashTarget : '',
              ].join(' ')}
              onClick={() => GamePuzzles.onFileClick(gameState.current, ui.current, 'trash')}
              onKeyDown={(e) => e.key === 'Enter' && GamePuzzles.onFileClick(gameState.current, ui.current, 'trash')}
              role="button"
              tabIndex={0}
            >
              <span className={styles.fileIco}>🗑️</span>
              <span className={styles.fileName}>empty_trash.exe</span>
            </div>
            <div
              className={styles.file}
              onClick={() => GamePuzzles.onFileClick(gameState.current, ui.current, 'music')}
              onKeyDown={(e) => e.key === 'Enter' && GamePuzzles.onFileClick(gameState.current, ui.current, 'music')}
              role="button"
              tabIndex={0}
            >
              <span className={styles.fileIco}>🎵</span>
              <span className={styles.fileName}>not_music.mp3</span>
            </div>
            <div
              className={styles.file}
              style={visual.filePhotoDim ? { opacity: 0.45 } : undefined}
              onClick={() => GamePuzzles.onFileClick(gameState.current, ui.current, 'photo')}
              onKeyDown={(e) => e.key === 'Enter' && GamePuzzles.onFileClick(gameState.current, ui.current, 'photo')}
              role="button"
              tabIndex={0}
            >
              <span className={styles.fileIco}>🖼️</span>
              <span className={styles.fileName}>totally_blank.png</span>
            </div>
            <div
              className={[styles.file, visual.filePlantGlow ? styles.fileGlow : ''].join(' ')}
              onClick={() => GamePuzzles.onFileClick(gameState.current, ui.current, 'plant')}
              onKeyDown={(e) => e.key === 'Enter' && GamePuzzles.onFileClick(gameState.current, ui.current, 'plant')}
              role="button"
              tabIndex={0}
            >
              <span className={styles.fileIco}>🌱</span>
              <span className={styles.fileName}>my_sapling.plant</span>
            </div>
            <div
              ref={chatbotFileRef}
              className={[
                styles.file,
                visual.shakingFile === 'file-chatbot' ? styles.fileShake : '',
                visual.appleLocation === 'carried' ? styles.fileFeedTarget : '',
              ].join(' ')}
              onClick={() => GamePuzzles.onFileClick(gameState.current, ui.current, 'chatbot')}
              onKeyDown={(e) => e.key === 'Enter' && GamePuzzles.onFileClick(gameState.current, ui.current, 'chatbot')}
              role="button"
              tabIndex={0}
            >
              <span className={styles.fileIco}>🤖</span>
              <span className={styles.fileName}>hungry_chatbot.exe</span>
            </div>
          </div>
        </div>
      </section>

      <div
        className={[
          styles.folderTrophy,
          visual.folderTrophyVisible ? styles.folderTrophyShow : '',
          visual.folderTrophyDragging ? styles.folderTrophyDragging : '',
        ].join(' ')}
        style={{
          left: visual.folderTrophyPos.left,
          top: visual.folderTrophyPos.top,
          zIndex: visual.folderTrophyPos.zIndex,
        }}
        onPointerDown={(e) => startDrag('folderTrophy', e, e.currentTarget)}
      >
        <span className={styles.cup}>
          🏆
          <span className={styles.waterFill} style={{ height: `${visual.trophyWaterPct}%` }} />
        </span>
      </div>

      {visual.appleLocation === 'carried' && (
        <div
          className={[
            styles.draggable,
            styles.carriedApple,
            visual.appleDragging ? styles.draggableDragging : '',
          ].join(' ')}
          style={{ left: visual.applePos.left, top: visual.applePos.top }}
          title="apple"
          onPointerDown={(e) => startDrag('apple', e, e.currentTarget)}
        >
          🍎
        </div>
      )}

      {visual.appleCoreOnScreen && (
        <div
          className={[
            styles.draggable,
            styles.appleCoreItem,
            visual.appleCoreDragging ? styles.draggableDragging : '',
          ].join(' ')}
          style={{ left: visual.appleCorePos.left, top: visual.appleCorePos.top }}
          title="apple core"
          onPointerDown={(e) => startDrag('appleCore', e, e.currentTarget)}
        >
          🍎
        </div>
      )}

      {/* Stage 4 */}
      <section className={sceneClass(4, styles.stage4)}>
        <div ref={trophyZoneRef} className={styles.trophyZone}>
          <div
            className={[styles.runawayTrophy, visual.trophyCaughtAnim ? styles.runawayTrophyCaught : ''].join(' ')}
            style={{
              left: visual.trophyPos.left,
              top: visual.trophyPos.top,
              transform: visual.trophyPos.transform,
            }}
            onClick={onTrophyClick}
            onKeyDown={(e) => e.key === 'Enter' && onTrophyClick(e as unknown as React.MouseEvent)}
            role="button"
            tabIndex={0}
          >
            🏆
          </div>
        </div>
      </section>

      {visual.narratorText && (
        <div className={styles.narrator}>
          <div className={styles.narratorName}>Game</div>
          {visual.narratorText}
        </div>
      )}

      {visual.mrGlitchVisible && (
        <div className={styles.mrGlitch}>
          <img
            src="/games/definitely-no-game/mr-glitch.svg"
            alt="Mr Glitch"
            className={styles.mrGlitchImg}
          />
        </div>
      )}

      <div className={[styles.musicToast, visual.musicToast ? styles.musicToastShow : ''].join(' ')}>
        🎵 Not Music.mp3 — 0:00 / 0:00 (broken)
      </div>

      <div className={[styles.overlay, visual.photoOverlay ? styles.overlayShow : ''].join(' ')}>
        <div className={styles.overlayCard}>
          <h2>totally_blank.png</h2>
          <div className={styles.photoPuzzle}>
            <div className={styles.photoFace}>🫥</div>
            {PHOTO_CORNERS.map((corner) => (
              <div
                key={corner}
                className={[
                  styles.hotspot,
                  HOTSPOT_CLASS[corner],
                  visual.photoFound.has(corner) ? styles.hotspotFound : '',
                ].join(' ')}
                onClick={() => onHotspotClick(corner)}
                onKeyDown={(e) => e.key === 'Enter' && onHotspotClick(corner)}
                role="button"
                tabIndex={0}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={[styles.overlay, visual.plantOverlay ? styles.overlayShow : ''].join(' ')}>
        <div className={styles.overlayCard}>
          <h2>my_sapling.plant</h2>
          <div className={styles.plantScene}>
            <div ref={plantPotRef} className={styles.plantPot}>
              <div
                className={[
                  styles.plantVisual,
                  visual.plantIsTree ? styles.plantTree : styles.plantSapling,
                ].join(' ')}
                onClick={() => Garden.onTreeTap(gameState.current, ui.current)}
                onKeyDown={(e) => e.key === 'Enter' && Garden.onTreeTap(gameState.current, ui.current)}
                role="button"
                tabIndex={0}
              >
                {visual.plantIsTree ? '🌳' : '🌱'}
              </div>
              <div className={styles.potShape} />
            </div>
            <div
              className={[
                styles.droppedApple,
                visual.appleFall ? styles.droppedAppleFall : '',
                visual.appleLocation === 'plant' ? styles.droppedAppleReady : '',
              ].join(' ')}
              onPointerDown={
                visual.appleLocation === 'plant'
                  ? (e) => startDrag('apple', e, e.currentTarget)
                  : undefined
              }
            >
              🍎
            </div>
          </div>
          <button type="button" onClick={onClosePlant}>
            Back to files
          </button>
        </div>
      </div>

      <div className={[styles.overlay, visual.chatOverlay ? styles.overlayShow : ''].join(' ')}>
        <div className={styles.overlayCard}>
          <h2>hungry_chatbot.exe</h2>
          <div className={styles.chatBot}>
            <div className={styles.chatBotHeader}>Chatbot</div>
            <div
              ref={chatDropZoneRef}
              className={[
                styles.chatDropZone,
                visual.appleLocation === 'carried' ? styles.chatDropZoneActive : '',
              ].join(' ')}
            >
              <div className={styles.chatMessages}>
                {chatMessages.length === 0 && (
                  <div className={styles.chatEmpty}>Say something. He&apos;ll respond.</div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleBot}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              {visual.appleLocation === 'carried' && (
                <div className={styles.chatFeedHint}>Drop the apple here</div>
              )}
            </div>
            <form
              className={styles.chatForm}
              onSubmit={(e) => {
                e.preventDefault()
                sendChat()
              }}
            >
              <input
                type="text"
                className={styles.chatInput}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message…"
                maxLength={200}
              />
              <button type="submit" className={styles.chatSend}>
                Send
              </button>
            </form>
          </div>
          <button type="button" onClick={() => setVisual((v) => ({ ...v, chatOverlay: false }))}>
            Back to files
          </button>
        </div>
      </div>
    </div>
  )
}
