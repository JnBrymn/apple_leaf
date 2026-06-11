import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useGameLoop } from '../../shared/hooks/useGameLoop'
import styles from './bomb-simulator.module.css'
import {
  PRESETS,
  START_MONEY,
  calcBomb,
  calcEarnings,
  checkRoundOutcome,
  createArenaState,
  detonateBomb,
  drawArena,
  drawBombGraphic,
  drawPartIcon,
  drawTitleArt,
  drawWorkbench,
  formatTnt,
  generateEarthCity,
  getBombCost,
  getDestructionPct,
  getRepairPct,
  spawnExtraCrews,
  spawnRepairCrews,
  tickArena,
  type ArenaState,
  type BombStats,
  type Casing,
  type Filler,
  type PlacedBomb,
} from './bombSimulatorEngine'

type Screen = 'title' | 'lab' | 'arena'

interface ResultsState {
  show: boolean
  won: boolean
  score: string
  earned: string
  message: string
}

export default function BombSimulatorGame() {
  const [screen, setScreen] = useState<Screen>('title')
  const [money, setMoney] = useState(START_MONEY)
  const [selectedPresetId, setSelectedPresetId] = useState('grenade')
  const [casing, setCasing] = useState<Casing>('metal')
  const [filler, setFiller] = useState<Filler>('tnt')
  const [charge, setCharge] = useState(8)
  const [shrapnel, setShrapnel] = useState(true)
  const [radiation, setRadiation] = useState(false)
  const [arenaBomb, setArenaBomb] = useState<BombStats | null>(null)
  const [bombCostPaid, setBombCostPaid] = useState(0)
  const [fuseSec, setFuseSec] = useState(0)
  const [arenaHud, setArenaHud] = useState('Click Earth to place your bomb')
  const [destructionPct, setDestructionPct] = useState(0)
  const [repairPct, setRepairPct] = useState(0)
  const [crewCount, setCrewCount] = useState(0)
  const [detonateDisabled, setDetonateDisabled] = useState(true)
  const [flashOpacity, setFlashOpacity] = useState(0)
  const [results, setResults] = useState<ResultsState>({
    show: false,
    won: false,
    score: '',
    earned: '',
    message: '',
  })

  const arenaRef = useRef<ArenaState>(createArenaState())
  const fuseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const titleArtRef = useRef<HTMLCanvasElement>(null)
  const workbenchRef = useRef<HTMLCanvasElement>(null)
  const arenaCanvasRef = useRef<HTMLCanvasElement>(null)
  const arenaMainRef = useRef<HTMLDivElement>(null)
  const slotIconRefs = useRef<(HTMLCanvasElement | null)[]>([])
  const presetCanvasRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())

  const bomb = useMemo(() => {
    const preset = PRESETS.find((p) => p.id === selectedPresetId)
    return calcBomb({
      name: preset?.name || 'Custom Bomb',
      type: preset?.type,
      casing,
      filler,
      charge,
      shrapnel,
      radiation,
    })
  }, [selectedPresetId, casing, filler, charge, shrapnel, radiation])

  const cost = getBombCost(bomb, selectedPresetId || null)
  const canAfford = money >= cost
  const powerWidth = Math.min(100, ((bomb.logPower + 6) / 12) * 100)
  const moneyLow = money < 50

  const clearFuseTimer = useCallback(() => {
    if (fuseTimerRef.current) {
      clearInterval(fuseTimerRef.current)
      fuseTimerRef.current = null
    }
  }, [])

  const updateMeters = useCallback(() => {
    const state = arenaRef.current
    setDestructionPct(getDestructionPct(state))
    setRepairPct(getRepairPct(state))
    setCrewCount(state.repairCrews.length)
  }, [])

  const redrawArena = useCallback(() => {
    const canvas = arenaCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawArena(ctx, arenaRef.current, arenaBomb)
  }, [arenaBomb])

  const resizeArena = useCallback(() => {
    const canvas = arenaCanvasRef.current
    const wrap = arenaMainRef.current
    if (!canvas || !wrap) return
    canvas.width = wrap.clientWidth
    canvas.height = wrap.clientHeight
    redrawArena()
  }, [redrawArena])

  const endRound = useCallback(
    (won: boolean) => {
      const state = arenaRef.current
      if (state.roundOver) return
      state.roundOver = true
      clearFuseTimer()

      const earned = calcEarnings(state.lastDestructionPct, bombCostPaid)
      const winBonus = won ? Math.round(bombCostPaid * 0.5) : 0
      const total = earned + winBonus
      setMoney((m) => m + total)

      setResults({
        show: false,
        won,
        score: `${state.lastDestructionPct}% of Earth destroyed`,
        earned: `+$${total}${winBonus ? ' (win bonus!)' : ''}`,
        message: won
          ? 'All repair crews destroyed! Earth cannot fix your damage.'
          : state.lastDestructionPct >= 50
            ? 'Earth repaired some damage. Save up for a bigger bomb!'
            : 'Not enough destruction. Try a bigger bomb next time!',
      })

      window.setTimeout(() => {
        setResults((r) => ({ ...r, show: true }))
      }, 800)
    },
    [bombCostPaid, clearFuseTimer],
  )

  const detonate = useCallback(() => {
    const state = arenaRef.current
    const placed = state.placedBomb
    if (!placed || state.roundOver) return

    clearFuseTimer()
    state.placedBomb = null
    setDetonateDisabled(true)

    const { flash } = detonateBomb(state, placed)
    if (flash) {
      setFlashOpacity(0.92)
      window.setTimeout(() => setFlashOpacity(0), 150)
    }

    updateMeters()

    if (state.lastDestructionPct >= 25) {
      window.setTimeout(() => {
        if (arenaRef.current.roundOver) return
        const canvas = arenaCanvasRef.current
        if (!canvas) return
        spawnExtraCrews(arenaRef.current, canvas.width, canvas.height)
        updateMeters()
      }, 2000)
    }

    redrawArena()
  }, [clearFuseTimer, redrawArena, updateMeters])

  const placeBomb = useCallback(
    (x: number, y: number) => {
      const state = arenaRef.current
      if (!arenaBomb || state.placedBomb || state.roundOver) return

      const canvas = arenaCanvasRef.current
      if (!canvas) return
      const ground = canvas.height * 0.62

      const placed: PlacedBomb = {
        ...arenaBomb,
        x,
        y: Math.min(y, ground - 15),
        fuseLeft: fuseSec,
      }
      state.placedBomb = placed
      setDetonateDisabled(fuseSec === 0)
      setArenaHud(
        fuseSec > 0 ? `Fuse: ${fuseSec}s — DETONATE or wait` : 'Press DETONATE or Spacebar',
      )

      if (fuseSec > 0) {
        clearFuseTimer()
        fuseTimerRef.current = setInterval(() => {
          const s = arenaRef.current
          if (!s.placedBomb) return
          s.placedBomb.fuseLeft -= 1
          setArenaHud(`Fuse: ${s.placedBomb.fuseLeft}s...`)
          if (s.placedBomb.fuseLeft <= 0) {
            clearFuseTimer()
            detonate()
          }
        }, 1000)
      }

      redrawArena()
    },
    [arenaBomb, fuseSec, clearFuseTimer, detonate, redrawArena],
  )

  const startArenaRound = useCallback(() => {
    clearFuseTimer()
    const canvas = arenaCanvasRef.current
    const wrap = arenaMainRef.current
    if (!canvas || !wrap) return

    canvas.width = wrap.clientWidth
    canvas.height = wrap.clientHeight

    const state = createArenaState()
    const city = generateEarthCity(canvas.width, canvas.height)
    state.structures = city.structures
    state.initialStructureHp = city.initialStructureHp
    arenaRef.current = state

    setArenaBomb(bomb)
    setResults((r) => ({ ...r, show: false }))
    setDetonateDisabled(true)
    setArenaHud('Place your bomb — destroy the city AND the green repair trucks!')

    spawnRepairCrews(state, canvas.width, canvas.height)
    setArenaHud('Earth repair crews inbound! Blast them to win!')
    updateMeters()
    redrawArena()
  }, [bomb, clearFuseTimer, redrawArena, updateMeters])

  const applyPreset = useCallback((presetId: string) => {
    const p = PRESETS.find((x) => x.id === presetId)
    if (!p) return
    setSelectedPresetId(p.id)
    setCasing(p.casing)
    setFiller(p.filler)
    setCharge(p.charge)
    setShrapnel(p.shrapnel)
    setRadiation(p.radiation)
  }, [])

  const markCustom = useCallback(() => {
    setSelectedPresetId('')
  }, [])

  const handleDeploy = useCallback(() => {
    if (money < cost) return
    setMoney((m) => m - cost)
    setBombCostPaid(cost)
    setArenaBomb(bomb)
    setScreen('arena')
  }, [money, cost, bomb])

  useEffect(() => {
    const canvas = titleArtRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) drawTitleArt(ctx)
  }, [])

  useEffect(() => {
    PRESETS.forEach((p) => {
      const canvas = presetCanvasRefs.current.get(p.id)
      if (!canvas) return
      drawBombGraphic(canvas.getContext('2d')!, p.type, 24, 26, 1.3)
    })
  }, [screen])

  useEffect(() => {
    slotIconRefs.current.forEach((canvas, i) => {
      if (!canvas) return
      const parts = ['casing', 'filler', 'charge'] as const
      drawPartIcon(canvas.getContext('2d')!, parts[i], bomb.casing, bomb.filler, bomb.charge)
    })
  }, [bomb, screen])

  useGameLoop(() => {
    if (screen !== 'lab') return
    const canvas = workbenchRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) drawWorkbench(ctx, bomb)
  }, screen === 'lab')

  useEffect(() => {
    if (screen === 'arena') startArenaRound()
  }, [screen, startArenaRound])

  useEffect(() => {
    if (screen !== 'arena') return
    resizeArena()
    const observer = new ResizeObserver(resizeArena)
    if (arenaMainRef.current) observer.observe(arenaMainRef.current)
    return () => observer.disconnect()
  }, [screen, resizeArena])

  useGameLoop(() => {
    if (screen !== 'arena') return

    const needsDraw = tickArena(arenaRef.current, arenaCanvasRef.current?.width || 0, arenaCanvasRef.current?.height || 0)
    updateMeters()

    const outcome = checkRoundOutcome(arenaRef.current)
    if (outcome === 'win') endRound(true)
    else if (outcome === 'lose-repair' || outcome === 'lose-timeout') endRound(false)

    if (needsDraw || arenaRef.current.animating || arenaRef.current.placedBomb) redrawArena()
  }, screen === 'arena')

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && screen === 'arena') {
        e.preventDefault()
        detonate()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [screen, detonate])

  useEffect(() => () => clearFuseTimer(), [clearFuseTimer])

  const handleArenaClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = arenaCanvasRef.current
    if (!canvas) return
    const r = canvas.getBoundingClientRect()
    placeBomb(
      (e.clientX - r.left) * (canvas.width / r.width),
      (e.clientY - r.top) * (canvas.height / r.height),
    )
  }

  const handleArenaMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = arenaCanvasRef.current
    const state = arenaRef.current
    if (!canvas || state.placedBomb || state.roundOver) return
    const r = canvas.getBoundingClientRect()
    state.mouseX = (e.clientX - r.left) * (canvas.width / r.width)
    state.mouseY = (e.clientY - r.top) * (canvas.height / r.height)
    redrawArena()
  }

  const screenClass = (id: Screen) =>
    `${styles.screen} ${screen === id ? styles.screenActive : ''}`

  return (
    <div className={styles.root}>
      <div className={styles.flashOverlay} style={{ opacity: flashOpacity }} />

      <div className={`${screenClass('title')} ${styles.titleScreen}`}>
        <canvas ref={titleArtRef} width={360} height={200} />
        <h1>BOMB SIMULATOR</h1>
        <p>Buy bombs. Wreck Earth in the arena. Stop repair crews before they fix everything.</p>
        <div className={`${styles.moneyPill} ${styles.titleMoney} ${moneyLow ? styles.moneyPillLow : ''}`}>
          ${money}
        </div>
        <button type="button" className={styles.bigBtn} onClick={() => setScreen('lab')}>
          ENTER LAB
        </button>
      </div>

      <div className={`${screenClass('lab')} ${styles.labScreen}`}>
        <div className={styles.labHeader}>
          <h2>EXPLOSIVES LAB</h2>
          <div className={styles.labHeaderRight}>
            <div className={`${styles.moneyPill} ${moneyLow ? styles.moneyPillLow : ''}`}>${money}</div>
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setScreen('title')}>
              Back
            </button>
          </div>
        </div>
        <div className={styles.labBody}>
          <div className={styles.workbenchArea}>
            <canvas ref={workbenchRef} className={styles.workbench} width={520} height={320} />
            <div className={styles.presetCarousel}>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`${styles.presetCard} ${selectedPresetId === p.id ? styles.presetCardSelected : ''} ${money < p.cost ? styles.presetCardCantAfford : ''}`}
                  onClick={() => applyPreset(p.id)}
                >
                  <canvas
                    ref={(el) => {
                      if (el) presetCanvasRefs.current.set(p.id, el)
                    }}
                    width={48}
                    height={48}
                  />
                  <span className={styles.pname}>{p.name}</span>
                  <span className={styles.pcost}>${p.cost}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.labPanel}>
            <h3>Custom Assembly</h3>
            <div className={styles.partSlots}>
              <div className={styles.partSlot}>
                <div className={styles.iconWrap}>
                  <canvas ref={(el) => { slotIconRefs.current[0] = el }} width={36} height={36} />
                </div>
                <div>
                  <label htmlFor="casing">Casing</label>
                  <select
                    id="casing"
                    value={casing}
                    onChange={(e) => {
                      markCustom()
                      setCasing(e.target.value as Casing)
                    }}
                  >
                    <option value="paper">Paper tube</option>
                    <option value="metal">Metal shell</option>
                    <option value="stick">Cardboard sticks</option>
                    <option value="steel">Steel casing</option>
                    <option value="heavy">Reinforced mega casing</option>
                  </select>
                </div>
              </div>
              <div className={styles.partSlot}>
                <div className={styles.iconWrap}>
                  <canvas ref={(el) => { slotIconRefs.current[1] = el }} width={36} height={36} />
                </div>
                <div>
                  <label htmlFor="filler">Filler</label>
                  <select
                    id="filler"
                    value={filler}
                    onChange={(e) => {
                      markCustom()
                      setFiller(e.target.value as Filler)
                    }}
                  >
                    <option value="flash">Flash powder</option>
                    <option value="tnt">TNT</option>
                    <option value="rdx">RDX</option>
                    <option value="uranium">Uranium-235</option>
                    <option value="fusion">Fusion fuel</option>
                  </select>
                </div>
              </div>
              <div className={styles.partSlot}>
                <div className={styles.iconWrap}>
                  <canvas ref={(el) => { slotIconRefs.current[2] = el }} width={36} height={36} />
                </div>
                <div>
                  <label htmlFor="charge">Charge</label>
                  <input
                    id="charge"
                    type="range"
                    min={0}
                    max={100}
                    value={charge}
                    onChange={(e) => {
                      markCustom()
                      setCharge(+e.target.value)
                    }}
                  />
                  <div className={styles.chargeDisplay}>{formatTnt(bomb.tntKg)} equiv.</div>
                </div>
              </div>
            </div>
            <div className={styles.toggleRow}>
              <button
                type="button"
                className={`${styles.toggle} ${shrapnel ? styles.toggleOn : ''}`}
                onClick={() => setShrapnel((s) => !s)}
              >
                Shrapnel
              </button>
              <button
                type="button"
                className={`${styles.toggle} ${radiation ? styles.toggleOn : ''}`}
                onClick={() => setRadiation((r) => !r)}
              >
                Radiation
              </button>
            </div>
            <div className={styles.statPanel}>
              <div className={styles.bombTitle}>{bomb.name}</div>
              <div className={`${styles.statLine} ${styles.costLine}`}>
                <span>Bomb cost</span>
                <b>${cost}</b>
              </div>
              <div className={styles.statLine}>
                <span>Blast radius</span>
                <b>{Math.round(bomb.radius * 0.4)} m</b>
              </div>
              <div className={styles.statLine}>
                <span>TNT equivalent</span>
                <b>{formatTnt(bomb.tntKg)}</b>
              </div>
              <div className={styles.statLine}>
                <span>Fireball</span>
                <b>{bomb.fireball}</b>
              </div>
              <div className={styles.statLine}>
                <span>Effects</span>
                <b>{bomb.effects}</b>
              </div>
              <div className={styles.powerMeter}>
                <div className={styles.powerMeterFill} style={{ width: `${powerWidth}%` }} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.labFooter}>
          <span className={styles.deployInfo}>
            {canAfford
              ? `${bomb.name} costs $${cost} — you have $${money}`
              : `Need $${cost}, you only have $${money}. Earn money by destroying Earth!`}
          </span>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={!canAfford}
            onClick={handleDeploy}
          >
            {canAfford ? `BUY & ENTER ARENA ($${cost})` : 'NOT ENOUGH MONEY'}
          </button>
        </div>
      </div>

      <div className={`${screenClass('arena')} ${styles.arenaScreen}`}>
        <div className={styles.arenaHeader}>
          <h2>EARTH ARENA</h2>
          <div className={styles.arenaMeters}>
            <div className={styles.meterWrap}>
              <span>Destruction</span>
              <div className={styles.meterBar}>
                <div className={styles.meterFillDestr} style={{ width: `${destructionPct}%` }} />
              </div>
              <span>{destructionPct}%</span>
            </div>
            <div className={styles.meterWrap}>
              <span>Earth repairs</span>
              <div className={styles.meterBar}>
                <div className={styles.meterFillRepair} style={{ width: `${repairPct}%` }} />
              </div>
              <span>{repairPct}%</span>
            </div>
            <div className={styles.meterWrap}>
              <span>Repair crews</span>
              <b className={crewCount ? styles.crewCountActive : styles.crewCountIdle}>{crewCount}</b>
            </div>
          </div>
          <div className={`${styles.moneyPill} ${moneyLow ? styles.moneyPillLow : ''}`}>${money}</div>
        </div>
        <div className={styles.arenaMain} ref={arenaMainRef}>
          <canvas
            ref={arenaCanvasRef}
            className={styles.arenaCanvas}
            onClick={handleArenaClick}
            onMouseMove={handleArenaMove}
          />
          <div className={styles.arenaHud}>{arenaHud}</div>
        </div>
        <div className={styles.arenaFooter}>
          <div className={styles.fuseBtns}>
            <span className={styles.fuseLabel}>Fuse:</span>
            {[0, 3, 5].map((sec) => (
              <button
                key={sec}
                type="button"
                className={`${styles.fuseBtn} ${fuseSec === sec ? styles.fuseBtnActive : ''}`}
                onClick={() => setFuseSec(sec)}
              >
                {sec === 0 ? 'Instant' : `${sec} sec`}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger}`}
            disabled={detonateDisabled}
            onClick={detonate}
          >
            DETONATE
          </button>
        </div>
      </div>

      <div className={`${styles.resultsOverlay} ${results.show ? styles.resultsOverlayShow : ''}`}>
        <div className={`${styles.resultsCard} ${results.won ? styles.resultsCardWin : ''}`}>
          <h2>{results.won ? 'YOU WIN!' : 'ROUND OVER'}</h2>
          <div className={styles.resultsScore}>{results.score}</div>
          <div className={styles.resultsEarned}>{results.earned}</div>
          <p className={styles.resultsMsg}>{results.message}</p>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => {
              setResults((r) => ({ ...r, show: false }))
              setScreen('lab')
            }}
          >
            Back to Lab
          </button>
        </div>
      </div>
    </div>
  )
}
