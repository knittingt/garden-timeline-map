import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { VIZ_CROPS as DEFAULT_VIZ_CROPS } from '../data/stageData';
import styles from './BedVisualizer.module.css';

export default function PlantChip({ plant, isNew, vizCrops }) {
  const cropMap = vizCrops ?? DEFAULT_VIZ_CROPS;
  const crop = cropMap[plant.crop] ?? DEFAULT_VIZ_CROPS[plant.crop];
  if (!crop) return null;

  const [tipPos, setTipPos] = useState(null);
  const chipRef = useRef(null);

  const classes = [
    styles.plantChip,
    plant.permanent ? styles.permanent : '',
    isNew ? styles.newPlant : '',
  ].filter(Boolean).join(' ');

  function handleMouseEnter() {
    if (!crop.note) return;
    const rect = chipRef.current.getBoundingClientRect();
    setTipPos({ x: rect.left + rect.width / 2, y: rect.top });
  }

  return (
    <span
      ref={chipRef}
      className={classes}
      style={{ background: crop.color }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setTipPos(null)}
    >
      {plant.label}
      {tipPos && crop.note && ReactDOM.createPortal(
        <span className={styles.tipFixed} style={{ left: tipPos.x, top: tipPos.y }}>
          {crop.note}
        </span>,
        document.body
      )}
    </span>
  );
}
