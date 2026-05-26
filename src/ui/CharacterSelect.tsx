import { useCallback, useEffect, useState } from 'react';
import { CHARACTERS, type CharacterDefinition } from '../config/characters';
import { Storage } from '../systems/Storage';
import { UISounds } from '../utils/uiSounds';

interface Props {
  selectedId: string;
  onSelect: (characterId: string) => void;
  compact?: boolean;
}

function CharacterPreview({ character, active }: { character: CharacterDefinition; active: boolean }) {
  return (
    <div
      className={`char-preview char-preview--${character.id}${active ? ' char-preview--active' : ''}`}
      aria-hidden="true"
    >
      <div className="char-preview-sprite" />
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
          return (
            <button
              key={character.id}
              type="button"
              className={`character-card${isActive ? ' character-card--active' : ''}`}
              onClick={() => pick(character.id)}
              aria-pressed={isActive}
              title={character.trait}
            >
              <CharacterPreview character={character} active={isActive} />
              <span className="character-card-name">{character.name}</span>
            </button>
          );
        })}
      </div>
      <div className="character-detail">
        <span className="character-detail-name" style={{ color: active.accentColor }}>
          {active.name}
        </span>
        <span className="character-detail-tag">{active.tagline}</span>
        <span className="character-detail-trait">{active.trait}</span>
      </div>
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

