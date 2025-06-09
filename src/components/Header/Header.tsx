import React from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  season: number;
  availableSeasons: number[];
  onSeasonChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBack?: () => void;
  selectedCrop?: string;
  selectedFarm?: string;
  onSettingsClick?: () => void;
  hasChanges?: boolean;
  onApplyChanges?: () => void;
  onCropFilterClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  season,
  availableSeasons,
  onSeasonChange,
  onBack,
  selectedCrop,
  selectedFarm,
  onSettingsClick,
  hasChanges = false,
  onApplyChanges,
  onCropFilterClick,
}) => {
  const backLabel = selectedFarm
    ? '← Назад к хозяйствам'
    : selectedCrop
    ? '← Назад к культурам'
    : '';

  return (
    <header className={styles.header}>
      {hasChanges && onApplyChanges && (
        <div className={styles.topControls}>
          <button className={styles.applyButton} onClick={onApplyChanges}>
            Применить изменения
          </button>
        </div>
      )}

      {onBack && backLabel && (
        <div className={styles.backWithCrop}>
          <button className={styles.settingsButton} onClick={onSettingsClick}>
            Настройки
          </button>
          <button className={styles.backButton} onClick={onBack}>
            {backLabel}
          </button>
          {selectedCrop && <span className={styles.selectedCrop}>{selectedCrop}</span>}
          {selectedFarm && <span className={styles.selectedCrop}>в {selectedFarm}</span>}
        </div>
      )}

      <div className={styles.seasonSelector}>
        <label className={styles.seasonLable} htmlFor="season">Сезон: </label>
        <select id="season" className={styles.select} value={season} onChange={onSeasonChange}>
          {availableSeasons.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <button className={styles.filterButton} onClick={onCropFilterClick}>
          Фильтр культур
        </button>
      </div>
    </header>
  );
};
