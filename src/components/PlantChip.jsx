import { VIZ_CROPS } from '../data/stageData';
import styles from './BedVisualizer.module.css';

export default function PlantChip({ plant, isNew }) {
  const crop = VIZ_CROPS[plant.crop];
  if (!crop) return null;

  const classes = [
    styles.plantChip,
    plant.permanent ? styles.permanent : '',
    isNew ? styles.newPlant : '',
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} style={{ background: crop.color }}>
      {plant.label}
      <span className={styles.tip}>{crop.note}</span>
    </span>
  );
}
