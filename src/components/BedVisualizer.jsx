import { useState, useEffect } from 'react';
import { STAGES, BED1_ZONES, BED2_ZONES, VIZ_CROPS } from '../data/stageData';
import { computeBedsAtDate } from '../utils/stageUtils';
import BedPanel from './BedPanel';
import styles from './BedVisualizer.module.css';

const SEASON_LABELS = { year: 'Year-Round', spring: 'Spring', summer: 'Summer', fall: 'Fall' };
const BADGE_CLASS = { year: styles.badgeYear, spring: styles.badgeSpring, summer: styles.badgeSummer, fall: styles.badgeFall };

export default function BedVisualizer({
  events,
  crops,
  stages = STAGES,
  bed1Zones = BED1_ZONES,
  bed2Zones = BED2_ZONES,
  vizCrops = VIZ_CROPS,
  permanentHerbs,
  cropIdToVizKey,
  harvestBuffer,
  gardenMeta,
}) {
  const [currentStage, setCurrentStage] = useState(0);
  const [prevStage, setPrevStage] = useState(-1);

  // Reset to stage 0 when stages change (new plan generated)
  useEffect(() => {
    setCurrentStage(0);
    setPrevStage(-1);
  }, [stages]);

  function goTo(idx) {
    if (idx < 0 || idx >= stages.length) return;
    setPrevStage(currentStage);
    setCurrentStage(idx);
  }

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowLeft')  goTo(currentStage - 1);
      if (e.key === 'ArrowRight') goTo(currentStage + 1);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentStage, stages]);

  const stage = stages[currentStage];
  const prevStageData = prevStage >= 0 ? stages[prevStage] : null;

  const vizOptions = { bed1Zones, bed2Zones, permanentHerbs, cropIdToVizKey, harvestBuffer };
  const { bed1, bed2 } = computeBedsAtDate(events, crops, stage.stageDate, vizOptions);
  const prev = prevStageData
    ? computeBedsAtDate(events, crops, prevStageData.stageDate, vizOptions)
    : null;

  const title = gardenMeta?.description ?? '2026 4236 Garden';
  const subtitle = gardenMeta
    ? `Zone ${gardenMeta.zone} · ${gardenMeta.bedCount} raised bed${gardenMeta.bedCount !== 1 ? 's' : ''} · ${gardenMeta.year}`
    : 'Zone 7b · Two Raised Beds, 33″ × 108″ · NE Orientation';

  const allBedZones = [bed1Zones, bed2Zones].filter(Boolean);
  const allBedData = [bed1, bed2];

  const sunTags = gardenMeta?.bedSunTags ?? [
    'Full sun all day',
    'SW tree (PM shade on south end)',
  ];

  return (
    <div className={styles.vizRoot}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerSpacer} />
        <div className={styles.headerCenter}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.subtitle}>{subtitle}</div>
          <div className={`${styles.seasonBadge} ${BADGE_CLASS[stage.season]}`}>
            {SEASON_LABELS[stage.season] || stage.season}
          </div>
        </div>
        <div className={styles.compass}>
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="24" stroke="#9b7055" strokeWidth="1.5" fill="rgba(245,237,224,0.6)"/>
            <polygon points="26,4 29,26 26,22 23,26" fill="#3d2b1f"/>
            <polygon points="26,48 29,26 26,30 23,26" fill="#9b7055"/>
            <polygon points="4,26 26,23 22,26 26,29" fill="#9b7055"/>
            <polygon points="48,26 26,23 30,26 26,29" fill="#9b7055"/>
            <circle cx="26" cy="26" r="3" fill="#9b7055"/>
            <text x="26" y="14" textAnchor="middle" fontSize="7" fill="#3d2b1f" fontFamily="serif" fontWeight="bold">N</text>
            <text x="26" y="46" textAnchor="middle" fontSize="6" fill="#9b7055" fontFamily="serif">S</text>
            <text x="8"  y="29" textAnchor="middle" fontSize="6" fill="#9b7055" fontFamily="serif">W</text>
            <text x="44" y="29" textAnchor="middle" fontSize="6" fill="#9b7055" fontFamily="serif">E</text>
          </svg>
          <div className={styles.compassLabel}>NE facing</div>
        </div>
      </header>

      <div className={styles.divider}>— ✦ —</div>

      {/* Stage Navigator */}
      <div className={styles.stageNav}>
        <button
          className={styles.navBtn}
          onClick={() => goTo(currentStage - 1)}
          disabled={currentStage === 0}
          title="Previous stage (←)"
        >←</button>
        <div className={styles.stageInfo}>
          <div className={styles.stageLabel}>{stage.label}</div>
          <div className={styles.stageDate}>{stage.dateDisplay}</div>
        </div>
        <button
          className={styles.navBtn}
          onClick={() => goTo(currentStage + 1)}
          disabled={currentStage === stages.length - 1}
          title="Next stage (→)"
        >→</button>
      </div>

      {/* Dots */}
      <div className={styles.dotsRow}>
        {stages.map((s, i) => (
          <span
            key={i}
            className={`${styles.stageDot} ${i === currentStage ? styles.active : ''}`}
            onClick={() => goTo(i)}
            title={`${s.label} — ${s.dateDisplay}`}
          />
        ))}
      </div>

      <p className={styles.stageNotes}>{stage.notes}</p>

      {/* Beds */}
      <div className={styles.bedsOuter}>
        {allBedZones.map((zones, i) => (
          <BedPanel
            key={i}
            bedNum={i + 1}
            zones={zones}
            bedData={allBedData[i] ?? {}}
            prevBedData={prev ? [prev.bed1, prev.bed2][i] : null}
            sunTag={sunTags[i] ?? ''}
            vizCrops={vizCrops}
          />
        ))}
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendTitle}>Crop Legend</div>
        <div className={styles.legendGrid}>
          {Object.entries(vizCrops).map(([key, c]) => (
            <div key={key} className={styles.legendItem}>
              <div className={styles.legendSwatch} style={{ background: c.color }} />
              <span>{c.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
