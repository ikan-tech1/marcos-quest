import { useCallback, useEffect, useMemo, useState } from 'react';
import { CHARACTERS, type CharacterDefinition } from '../config/characters';
import { Storage } from '../systems/Storage';
import { UISounds } from '../utils/uiSounds';
import { getCharacterPreviewDataUrl } from '../utils/characterPreview';

interface Props {
  selectedId: string;
  onSelect: (characterId: string) => void;
  compact?: boolean;
}

function CharacterPreview({ character, active }: { character: CharacterDefinition; active: boolean }) {
  const src = useMemo(() => getCharacterPreviewDataUrl(character.id), [character.id]);

  return (
    <div
      className={`char-preview${active ? ' char-preview--active' : ''}`}
      aria-hidden="true"
    >
      <div className="char-preview-frame">
        {src ? (
          <img
            className="char-preview-sprite"
            src={src}
            alt=""
            width={72}
            height={144}
            draggable={false}
          />
        ) : (
          <div className={`char-preview-sprite char-preview-sprite--${character.id}`} />
        )}
      </div>
    </div>
  );
}

export function CharacterSelect({ selectedId, onSelect, compact = false }: Props) {
  const [selected, setSelected] = useState(selectedId);

  useEffect(() => {
    setSelected(selectedId);
  }, [selectedId]);

  const pick = useCallback(
    (id: string) => {
      UISounds.click();
      setSelected(id);
      Storage.setSelectedCharacter(id);
      onSelect(id);
    },
    [onSelect],
  );

  const active = CHARACTERS.find((c) => c.id === selected) ?? CHARACTERS[0];

  return (
    <div className={`character-select${compact ? ' character-select--compact' : ''}`}>
      <p className="character-select-label">CHOOSE YOUR HERO</p>
      <div className="character-select-grid">
        {CHARACTERS.map((character) => {
          const isActive = character.id === selected;
          const locked = character.id === 'nova' && !Storage.isNovaUnlocked();
          return (
            <button
              key={character.id}
              type="button"
              className={`character-card${isActive ? ' character-card--active' : ''}${locked ? ' character-card--locked' : ''}`}
              onClick={() => !locked && pick(character.id)}
              disabled={locked}
              aria-pressed={isActive}
              title={locked ? 'Complete all missions to unlock' : character.trait}
            >
              <CharacterPreview character={character} active={isActive} />
              <span className="character-card-name">{locked ? '???' : character.name}</span>
            </button>
          );
        })}
      </div>
      <blockquote className="character-detail">
        <span className="character-detail-name" style={{ color: active.accentColor }}>
          {active.name}
        </span>
        <span className="character-detail-tag">{active.tagline}</span>
        <p className="character-detail-trait">&ldquo;{active.trait}&rdquo;</p>
      </blockquote>
    </div>
  );
}

export function CharacterSelectCabinet({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (characterId: string) => void;
}) {
  const [selected, setSelected] = useState(selectedId);

  useEffect(() => {
    setSelected(selectedId);
  }, [selectedId]);

  const pick = (id: string) => {
    UISounds.click();
    setSelected(id);
    Storage.setSelectedCharacter(id);
    onSelect(id);
  };

  const active = CHARACTERS.find((c) => c.id === selected) ?? CHARACTERS[0];

  return (
    <div className="cabinet-char-select">
      <span className="cabinet-char-label">PLAYER</span>
      <div className="cabinet-char-row">
        {CHARACTERS.map((character) => (
          <button
            key={character.id}
            type="button"
            className={`cabinet-char-btn cabinet-char-btn--${character.id}${character.id === selected ? ' cabinet-char-btn--active' : ''}`}
            onClick={() => pick(character.id)}
            aria-label={`Select ${character.name}`}
            title={character.trait}
          >
            <span className="cabinet-char-dot" />
          </button>
        ))}
      </div>
      <span className="cabinet-char-name" style={{ color: active.accentColor }}>
        {active.name}
      </span>
    </div>
  );
}

