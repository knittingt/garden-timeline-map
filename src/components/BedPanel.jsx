import PlantChip from './PlantChip';
import styles from './BedVisualizer.module.css';

export default function BedPanel({ bedNum, zones, bedData, prevBedData, sunTag }) {
  function getPrevLabels(zoneId) {
    if (!prevBedData) return new Set();
    return new Set((prevBedData[zoneId] || []).map(p => p.label));
  }

  return (
    <div className={styles.bedWrapper}>
      <div className={styles.bedTitle}>Bed {bedNum}</div>
      <div className={styles.bedRow}>
        <div className={styles.dirNs}>← N</div>
        <div className={styles.bedColumn}>
          {zones.map(zone => {
            const plants = bedData[zone.id] || [];
            const prev = getPrevLabels(zone.id);
            return (
              <div
                key={zone.id}
                className={`${styles.zone} ${zone.trellis ? styles.trellisZone : ''}`}
                style={{ width: zone.h }}
              >
                {zone.trellis && <span className={styles.trellisBadge}>[ trellis ]</span>}
                <div className={styles.zoneLabel}>{zone.label}</div>
                <div className={styles.plantsRow}>
                  {plants.map((plant, i) => (
                    <PlantChip key={i} plant={plant} isNew={!prev.has(plant.label)} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.dirNs}>S →</div>
      </div>
      <div className={styles.sunTag}>{sunTag}</div>
    </div>
  );
}
