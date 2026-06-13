import type { CharacterAppearance, FacialHairStyle, GlassesStyle, HairStyle, HatStyle } from './characterAppearance'
import {
  BOOT_COLORS,
  HAIR_COLORS,
  HAT_COLORS,
  sanitizeSoldierName,
  SKIN_TONES,
} from './characterAppearance'
import CharacterPreview from './CharacterPreview'
import styles from './team-war.module.css'

interface CharacterDesignerProps {
  appearance: CharacterAppearance
  onChange: (next: CharacterAppearance) => void
  onEnterBattle: () => void
}

function Swatches({
  colors,
  value,
  onPick,
}: {
  colors: string[]
  value: string
  onPick: (color: string) => void
}) {
  return (
    <div className={styles.swatchRow}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          className={`${styles.swatch} ${value === color ? styles.swatchActive : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onPick(color)}
          aria-label={`Color ${color}`}
        />
      ))}
    </div>
  )
}

function OptionRow<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string
  options: { id: T; label: string }[]
  value: T
  onPick: (id: T) => void
}) {
  return (
    <div className={styles.designerField}>
      <span className={styles.designerLabel}>{label}</span>
      <div className={styles.optionRow}>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`${styles.optionBtn} ${value === opt.id ? styles.optionBtnActive : ''}`}
            onClick={() => onPick(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const HAIR_OPTIONS: { id: HairStyle; label: string }[] = [
  { id: 'bald', label: 'Bald' },
  { id: 'buzz', label: 'Buzz' },
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
  { id: 'spiky', label: 'Spiky' },
  { id: 'curly', label: 'Curly' },
]

const HAT_OPTIONS: { id: HatStyle; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'cap', label: 'Cap' },
  { id: 'helmet', label: 'Helmet' },
  { id: 'beanie', label: 'Beanie' },
  { id: 'beret', label: 'Beret' },
]

const GLASSES_OPTIONS: { id: GlassesStyle; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'shades', label: 'Shades' },
]

const FACIAL_HAIR_OPTIONS: { id: FacialHairStyle; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'stubble', label: 'Stubble' },
  { id: 'mustache', label: 'Stache' },
  { id: 'beard', label: 'Beard' },
]

export default function CharacterDesigner({ appearance, onChange, onEnterBattle }: CharacterDesignerProps) {
  const patch = (partial: Partial<CharacterAppearance>) => onChange({ ...appearance, ...partial })

  return (
    <div className={styles.designer}>
      <div className={styles.designerPreview}>
        <CharacterPreview appearance={appearance} />
        {appearance.name && <p className={styles.designerSoldierName}>{appearance.name}</p>}
        <p className={styles.designerNote}>Blue uniform is fixed for your team.</p>
      </div>

      <div className={styles.designerPanel}>
        <h2 className={styles.designerTitle}>Design Your Soldier</h2>

        <div className={styles.designerField}>
          <span className={styles.designerLabel}>Soldier name</span>
          <input
            type="text"
            className={styles.nameInput}
            value={appearance.name}
            onChange={(event) => patch({ name: sanitizeSoldierName(event.target.value) })}
            placeholder="Name your soldier"
            maxLength={24}
            spellCheck={false}
          />
        </div>

        <div className={styles.designerField}>
          <span className={styles.designerLabel}>Skin tone</span>
          <Swatches colors={SKIN_TONES} value={appearance.skinTone} onPick={(skinTone) => patch({ skinTone })} />
        </div>

        <OptionRow label="Hair style" options={HAIR_OPTIONS} value={appearance.hairStyle} onPick={(hairStyle) => patch({ hairStyle })} />

        <div className={styles.designerField}>
          <span className={styles.designerLabel}>Hair color</span>
          <Swatches colors={HAIR_COLORS} value={appearance.hairColor} onPick={(hairColor) => patch({ hairColor })} />
        </div>

        <OptionRow label="Hat" options={HAT_OPTIONS} value={appearance.hat} onPick={(hat) => patch({ hat })} />

        {appearance.hat !== 'none' && (
          <div className={styles.designerField}>
            <span className={styles.designerLabel}>Hat color</span>
            <Swatches colors={HAT_COLORS} value={appearance.hatColor} onPick={(hatColor) => patch({ hatColor })} />
          </div>
        )}

        <OptionRow label="Glasses" options={GLASSES_OPTIONS} value={appearance.glasses} onPick={(glasses) => patch({ glasses })} />

        <OptionRow
          label="Facial hair"
          options={FACIAL_HAIR_OPTIONS}
          value={appearance.facialHair}
          onPick={(facialHair) => patch({ facialHair })}
        />

        {appearance.facialHair !== 'none' && (
          <div className={styles.designerField}>
            <span className={styles.designerLabel}>Facial hair color</span>
            <Swatches
              colors={HAIR_COLORS}
              value={appearance.facialHairColor}
              onPick={(facialHairColor) => patch({ facialHairColor })}
            />
          </div>
        )}

        <div className={styles.designerField}>
          <span className={styles.designerLabel}>Boot color</span>
          <Swatches colors={BOOT_COLORS} value={appearance.bootColor} onPick={(bootColor) => patch({ bootColor })} />
        </div>

        <button type="button" className={styles.enterBattleBtn} onClick={onEnterBattle}>
          Enter Battle
        </button>
        <p className={styles.designerControls}>WASD move · Mouse look · Click shoot · Space jump</p>
      </div>
    </div>
  )
}
