import React, { useState } from 'react';
import { 
  Eye, Film, ZoomIn, ZoomOut, CheckCircle2, Search, X, Sparkles, ArrowRight, Shield 
} from 'lucide-react';
import { CinematicVideoPlayer } from '../components/CinematicVideoPlayer';
import { soundFX } from '../lib/audioService';
import { useLanguage } from '../lib/i18n';

interface Stage1StoryProps {
  onProceed: () => void;
  collectedEvidence?: string[];
  onCollectEvidence?: (code: string) => void;
}

interface CrimeSceneHotspot {
  id: string;
  name: string;
  category: string;
  x: number; // percentage coordinates on Image 1
  y: number;
  previewImg: string;
  evidenceCode?: string;
  shortDesc: string;
  detailedAnalysis: string;
  forensicPoints: string[];
}

export const Stage1Story: React.FC<Stage1StoryProps> = ({ 
  onProceed,
  collectedEvidence = [],
  onCollectEvidence 
}) => {
  const { t, isKannada } = useLanguage();

  // Crime Scene Interactive View State
  const [sceneZoom, setSceneZoom] = useState(1);
  const [selectedHotspot, setSelectedHotspot] = useState<CrimeSceneHotspot | null>(null);
  const [inspectedHotspots, setInspectedHotspots] = useState<string[]>([]);
  const [hoveredHotspot, setHoveredHotspot] = useState<CrimeSceneHotspot | null>(null);

  const crimeSceneHotspots: CrimeSceneHotspot[] = [
    {
      id: 'victim',
      name: 'Deceased Victim: Dr. Arthur Vance',
      category: 'PRIMARY FORENSIC SUBJECT',
      x: 58,
      y: 72,
      previewImg: '/reference/crime-scene.jpg',
      shortDesc: 'Elderly founding botanist wearing a burgundy dressing jacket, discovered unresponsive on the cold stone conservatory floor.',
      detailedAnalysis: 'Dr. Arthur Vance (age 68) lies prone on the stone floor tiles. No outward trauma or blunt force impact detected. Pupils show acute miosis and lips exhibit distinct cyanotic discoloration, strongly pointing to rapid neurotoxic respiratory collapse.',
      forensicPoints: [
        'Time of death estimated between 11:20 PM and 11:28 PM.',
        'Right hand rests inches away from an overturned fine porcelain teacup.',
        'Shattered glasses and wristwatch found directly beside the outstretched arms.',
        'No defensive wounds or external blunt-force lacerations.'
      ]
    },
    {
      id: 'pollen',
      name: 'Fallen Container of Glowing Orchid Pollen',
      category: 'BIO-HAZARD / LAB SPECIMEN',
      x: 41,
      y: 86,
      previewImg: '/evidence/fallen-orchid-pollen.jpg',
      evidenceCode: 'EV-02',
      shortDesc: 'Shattered pharmaceutical-grade glass jar emitting an intense 470nm bioluminescent blue glow across the stone tiles.',
      detailedAnalysis: 'Pharmaceutical borosilicate jar shattered upon floor impact. The glowing blue powdery granules are pure Midnight Orchid (Orchidaceae caerulea nocturna) pollen, known to contain rare bioluminescent pigment complexes and toxic precursor alkaloid glycosides.',
      forensicPoints: [
        'Inventory serial number links the container to B-Wing Extraction Lab Bench #2.',
        'The container was deliberately moved from the locked B-Wing preparation facility.',
        'Impact scatter pattern indicates the jar struck the floor tile vertically, consistent with being dropped during a sudden struggle or seizure.'
      ]
    },
    {
      id: 'teacup',
      name: 'Poisoned Teacup & Fine Saucer',
      category: 'TOXICOLOGICAL EVIDENCE',
      x: 50,
      y: 84,
      previewImg: '/evidence/poisoned-teacup.jpg',
      evidenceCode: 'EV-01',
      shortDesc: 'Fine bone china teacup containing remnants of Earl Grey tea steeped with a concentrated toxic blue compound.',
      detailedAnalysis: 'Rapid field spectroscopy detected lethal concentrations of Cyanocryptin, an acute neurotoxic glycoside synthesized from the rare Midnight Orchid. The kitchen tea pot tested completely pure, proving the toxin was directly added into the cup here in the conservatory.',
      forensicPoints: [
        'Earl Grey tea served at 11:00 PM by Chef Marco was originally pure.',
        'Concentration of Cyanocryptin in cup exceeds lethal threshold by 400%.',
        'Faint blue luminescence visible at the bottom of the teacup rim.'
      ]
    },
    {
      id: 'watch',
      name: 'Shattered Wristwatch & Eyeglasses',
      category: 'TIMING TRACE / IMPACT CHRONOLOGY',
      x: 62,
      y: 91,
      previewImg: '/evidence/wristwatch-and-glasses.jpg',
      shortDesc: 'Mechanical wristwatch with cracked crystal glass stopped at exactly 11:24 PM, alongside Vance reading glasses.',
      detailedAnalysis: 'The high-impact shock of hitting the hard granite floor sheared the internal balance wheel pin of Dr. Vance mechanical wristwatch, freezing the hands at precisely 23:24:18 (11:24 PM). This anchors the exact moment of physical collapse.',
      forensicPoints: [
        'Watch hands stopped frozen at 11:24 PM.',
        'Reading glasses undamaged except for one detached hinge pin.',
        'Correlates with acoustic sensor LOG-04 recording a sharp floor impact at 11:24 PM.'
      ]
    },
    {
      id: 'clock',
      name: 'Conservatory Wall Clock',
      category: 'ENVIRONMENTAL CHRONOMETER',
      x: 51,
      y: 20,
      previewImg: '/evidence/wall-clock.jpg',
      shortDesc: 'Industrial brass clock mounted on the central brick pillar showing the approximate discovery time of 11:30 PM.',
      detailedAnalysis: 'Operational wall clock indicating 11:30 PM, matching the moment night security and estate staff arrived to discover the deceased victim and sound the emergency alarm.',
      forensicPoints: [
        'Synchronized to the estate master electrical clock grid.',
        'Discovery logged by staff at 11:30 PM sharp.'
      ]
    },
    {
      id: 'door',
      name: 'Conservatory Side Service Door & Deadbolt',
      category: 'ACCESS RESTRICTION TRACE',
      x: 88,
      y: 46,
      previewImg: '/evidence/brass-deadbolt.jpg',
      evidenceCode: 'EV-06',
      shortDesc: 'Heavy brass sliding deadbolt locked securely from the INSIDE with an unbroken layer of frost across the bottom threshold.',
      detailedAnalysis: 'Physical inspection confirms the side service door deadbolt was securely shot from the interior. Furthermore, an undisturbed crystalline frost layer spans the exterior sill. Proves conclusively that nobody entered or escaped through this exterior door during the night.',
      forensicPoints: [
        'Deadbolt locked from the interior: cannot be operated from outside.',
        'Unbroken threshold frost proves door was unopened during the storm.',
        'Conclusively exonerates exterior entry attempts as the murder vector.'
      ]
    },
    {
      id: 'tartan',
      name: 'Dark Green Tartan Fabric Snag',
      category: 'PHYSICAL TRACE / RED HERRING',
      x: 90,
      y: 52,
      previewImg: '/evidence/green-tartan-handle.jpg',
      evidenceCode: 'EV-07',
      shortDesc: 'Shred of dark green wool tartan fabric caught on the exterior brass handle of the side service door.',
      detailedAnalysis: 'Tartan twill fibers match the tailored blazer worn by Victor Thorne. However, since the door was deadbolted from the inside and frost was unbroken, this fabric snag is the result of Victor unsuccessful 10:50 PM attempt to try the handle before walking to the bar.',
      forensicPoints: [
        'Matches Victor Thorne green tartan blazer.',
        'Snagged on the OUTSIDE handle during 10:50 PM attempted access.',
        'Door was deadbolted; Victor never breached the conservatory interior.'
      ]
    },
    {
      id: 'onlookers',
      name: 'Four Suspects at Entrance Archway',
      category: 'WITNESS & SUSPECT GROUP',
      x: 25,
      y: 52,
      previewImg: '/reference/suspects-sheet.jpg',
      shortDesc: 'The four individuals present on estate grounds: Clara Sterling, Victor Thorne, Dr. Evelyn Hayes, and Chef Marco.',
      detailedAnalysis: 'The four individuals stand at the perimeter archway after the alarm was raised. Each individual has documented proximity to the conservatory between 10:50 PM and 11:30 PM, distinct motives, and differing alibis requiring forensic verification.',
      forensicPoints: [
        'Clara Sterling: Checked heater at 11:05 PM.',
        'Victor Thorne: Seen at Lobby Bar 11:00–11:25 PM.',
        'Dr. Evelyn Hayes: Claims continuous presence in B-Wing Lab 11:00–11:25 PM.',
        'Chef Marco: Delivered tea to Dr. Vance at 11:00 PM.'
      ]
    },
    {
      id: 'puddle',
      name: 'Melted Puddle & Drainage Grate',
      category: 'ENVIRONMENTAL RUNOFF TRACE',
      x: 10,
      y: 86,
      previewImg: '/reference/crime-scene.jpg',
      shortDesc: 'Drainage grate and melted snow puddle near the main glass archway showing boot runoff from earlier entries.',
      detailedAnalysis: 'Puddle formed by snow tracked in from boots. Salinity test matches exterior snow pack. Fully melted and settled over a 25-minute period.',
      forensicPoints: [
        'Corresponds to boot tracks deposited prior to 11:10 PM.',
        'Drainage grate flows to conservatory subsurface greywater.'
      ]
    }
  ];

  const getTranslatedHotspots = (): CrimeSceneHotspot[] => {
    if (!isKannada) return crimeSceneHotspots;
    return crimeSceneHotspots.map(h => {
      switch (h.id) {
        case 'victim':
          return {
            ...h,
            name: 'ಮೃತ ವ್ಯಕ್ತಿ: ಡಾ. ಆರ್ಥರ್ ವ್ಯಾನ್ಸ್',
            category: 'ಮುಖ್ಯ ವಿಧಿವಿಜ್ಞಾನ ವಿಷಯ',
            shortDesc: 'ಬರ್ಗಂಡಿ ಗೌನ್ ಧರಿಸಿದ ಹಿರಿಯ ಸಸ್ಯಶಾಸ್ತ್ರಜ್ಞ ಶವವಾಗಿ ನೆಲದ ಮೇಲೆ ಪತ್ತೆಯಾಗಿದ್ದಾರೆ.',
            detailedAnalysis: 'ಡಾ. ಆರ್ಥರ್ ವ್ಯಾನ್ಸ್ (೬೮ ವರ್ಷ) ನೆಲದ ಮೇಲೆ ಬಿದ್ದಿದ್ದಾರೆ. ಯಾವುದೇ ಬಾಹ್ಯ ಗಾಯಗಳಿಲ್ಲ. ಕಣ್ಣುಗಳು ಮತ್ತು ನೀಲಿ ತುಟಿಗಳು ತೀವ್ರ ನರವಿಷ ಉಸಿರಾಟದ ವೈಫಲ್ಯವನ್ನು ಸೂಚಿಸುತ್ತವೆ.',
            forensicPoints: [
              'ಸಾವಿನ ಅಂದಾಜು ಸಮಯ ರಾತ್ರಿ ೧೧:೨೦ ರಿಂದ ೧೧:೨೮ ರ ನಡುವೆ.',
              'ಬಲಗೈ ಬಿದ್ದಿರುವ ಚಹಾ ಕಪ್‌ನಿಂದ ಕೆಲವೇ ಇಂಚುಗಳ ದೂರದಲ್ಲಿದೆ.',
              'ಒಡೆದ ಕನ್ನಡಕ ಮತ್ತು ಕೈಗಡಿಯಾರ ದೇಹದ ಪಕ್ಕದಲ್ಲಿ ಪತ್ತೆಯಾಗಿದೆ.',
              'ಯಾವುದೇ ರಕ್ಷಣಾತ್ಮಕ ಗಾಯಗಳಿಲ್ಲ.'
            ]
          };
        case 'pollen':
          return {
            ...h,
            name: 'ನೆಲಕ್ಕೆ ಬಿದ್ದಿರುವ ಹೊಳೆಯುವ ಆರ್ಕಿಡ್ ಪರಾಗದ ಜಾರ್',
            category: 'ಜೈವಿಕ ಅಪಾಯ / ಲ್ಯಾಬ್ ಮಾದರಿ',
            shortDesc: 'ನೆಲದ ಮೇಲೆ ಒಡೆದು ಬಿದ್ದಿರುವ ಗಾಜಿನ ಜಾರ್, ತೀವ್ರವಾದ ೪೭೦nm ನೀಲಿ ಬೆಳಕನ್ನು ಹೊರಸೂಸುತ್ತದೆ.',
            detailedAnalysis: 'ನೆಲಕ್ಕೆ ಬಿದ್ದು ಒಡೆದ ಬೊರೊಸಿಲಿಕೇಟ್ ಜಾರ್. ನೀಲಿ ಪುಡಿ ಕಣಗಳು ಶುದ್ಧ ಮಿಡ್‌ನೈಟ್ ಆರ್ಕಿಡ್ ಪರಾಗವಾಗಿದ್ದು, ಮಾರಕ ನರವಿಷ ಗ್ಲೈಕೋಸೈಡ್‌ಗಳನ್ನು ಒಳಗೊಂಡಿದೆ.',
            forensicPoints: [
              'ಸರಣಿ ಸಂಖ್ಯೆಯು ಇದನ್ನು ಬಿ-ವಿಂಗ್ ಲ್ಯಾಬ್ ಬೆಂಚ್ #೨ ಗೆ ಲಿಂಕ್ ಮಾಡುತ್ತದೆ.',
              'ಈ ಜಾರ್ ಅನ್ನು ಲಾಕ್ ಆಗಿದ್ದ ಬಿ-ವಿಂಗ್ ಲ್ಯಾಬ್‌ನಿಂದ ಉದ್ದೇಶಪೂರ್ವಕವಾಗಿ ತರಲಾಗಿದೆ.',
              'ನೆಲಕ್ಕೆ ನೇರವಾಗಿ ಬಿದ್ದಿರುವ ಮಾದರಿಯು ಹಠಾತ್ ಹೋರಾಟ ಅಥವಾ ಕುಸಿತದ ವೇಳೆ ಬಿದ್ದಿದ್ದನ್ನು ಸೂಚಿಸುತ್ತದೆ.'
            ]
          };
        case 'teacup':
          return {
            ...h,
            name: 'ವಿಷಪೂರಿತ ಚಹಾ ಕಪ್ ಮತ್ತು ಸಾಸರ್',
            category: 'ಟಾಕ್ಸಿಕಾಲಾಜಿಕಲ್ ಪುರಾವೆ',
            shortDesc: 'ಸಾಂದ್ರೀಕೃತ ವಿಷಕಾರಿ ನೀಲಿ ಸಂಯುಕ್ತದೊಂದಿಗೆ ಬೆರೆತ ಅರ್ಲ್ ಗ್ರೇ ಚಹಾದ ಅವಶೇಷಗಳು.',
            detailedAnalysis: 'ಫೀಲ್ಡ್ ಸ್ಪೆಕ್ಟ್ರೋಸ್ಕೋಪಿ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಮಿಡ್‌ನೈಟ್ ಆರ್ಕಿಡ್‌ನಿಂದ ತಯಾರಿಸಲಾದ ಸೈನೋಕ್ರಿಪ್ಟಿನ್ ವಿಷ ಪತ್ತೆಯಾಗಿದೆ. ಅಡುಗೆಮನೆಯ ಟೀಪಾಟ್ ಸಂಪೂರ್ಣ ಶುದ್ಧವಾಗಿದ್ದು, ವಿಷವನ್ನು ಇಲ್ಲಿಯೇ ಕಪ್‌ಗೆ ಬೆರೆಸಲಾಗಿದೆ.',
            forensicPoints: [
              'ರಾತ್ರಿ ೧೧:೦೦ ಕ್ಕೆ ಚೆಫ್ ಮಾರ್ಕೊ ತಂದಿದ್ದ ಚಹಾ ಮೂಲತಃ ಶುದ್ಧವಾಗಿತ್ತು.',
              'ಕಪ್‌ನಲ್ಲಿರುವ ಸೈನೋಕ್ರಿಪ್ಟಿನ್ ಸಾಂದ್ರತೆಯು ಮಾರಕ ಮಿತಿಗಿಂತ ೪೦೦% ಹೆಚ್ಚಾಗಿದೆ.',
              'ಕಪ್‌ನ ಅಂಚಿನಲ್ಲಿ ನೀಲಿ ಹೊಳಪು ಗೋಚರಿಸುತ್ತದೆ.'
            ]
          };
        case 'watch':
          return {
            ...h,
            name: 'ಒಡೆದ ಕೈಗಡಿಯಾರ ಮತ್ತು ಕನ್ನಡಕ',
            category: 'ಸಮಯದ ದಾಖಲೆ / ಇಂಪ್ಯಾಕ್ಟ್ ಕಾಲಾನುಕ್ರಮ',
            shortDesc: 'ಸರಿಯಾಗಿ ರಾತ್ರಿ ೧೧:೨೪ ಕ್ಕೆ ನಿಂತಿರುವ ಮೆಕ್ಯಾನಿಕಲ್ ವಾಚ್ ಮತ್ತು ವ್ಯಾನ್ಸ್ ಅವರ ಕನ್ನಡಕ.',
            detailedAnalysis: 'ನೆಲಕ್ಕೆ ಅಪ್ಪಳಿಸಿದ ರಭಸಕ್ಕೆ ಡಾ. ವ್ಯಾನ್ಸ್ ಅವರ ವಾಚ್‌ನ ಆಂತರಿಕ ಬ್ಯಾಲೆನ್ಸ್ ವ್ಹೀಲ್ ಮುರಿದು, ಸರಿಯಾಗಿ ರಾತ್ರಿ ೨೩:೨೪:೧೮ (೧೧:೨೪) ಕ್ಕೆ ಮುಳ್ಳುಗಳು ನಿಂತಿವೆ.',
            forensicPoints: [
              'ವಾಚ್‌ನ ಮುಳ್ಳುಗಳು ರಾತ್ರಿ ೧೧:೨೪ ಕ್ಕೆ ನಿಂತಿವೆ.',
              'ಕನ್ನಡಕದ ಒಂದು ಹಿಂಜ್ ಪಿನ್ ಕಳಚಿದೆ.',
              'ಧ್ವನಿ ಸಂವೇದಕ LOG-04 ನಲ್ಲಿ ರಾತ್ರಿ ೧೧:೨೪ ಕ್ಕೆ ನೆಲಕ್ಕೆ ಬಿದ್ದ ಸದ್ದು ದಾಖಲಾಗಿದೆ.'
            ]
          };
        case 'clock':
          return {
            ...h,
            name: 'ಕನ್ಸರ್ವೇಟರಿ ಗೋಡೆ ಗಡಿಯಾರ',
            category: 'ಪರಿಸರ ಕಾಲಮಾಪಕ',
            shortDesc: 'ಇಟ್ಟಿಗೆಯ ಕಂಬದ ಮೇಲಿನ ಗಡಿಯಾರವು ಶವ ಪತ್ತೆಯಾದ ಸಮಯವಾದ ೧೧:೩೦ ಅನ್ನು ತೋರಿಸುತ್ತಿದೆ.',
            detailedAnalysis: '೧೧:೩೦ ಕ್ಕೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿರುವ ಗೋಡೆ ಗಡಿಯಾರ, ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ ಆಗಮಿಸಿ ತುರ್ತು ಅಲಾರಂ ಬಾರಿಸಿದ ಕ್ಷಣವನ್ನು ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.',
            forensicPoints: [
              'ಎಸ್ಟೇಟ್‌ನ ಮಾಸ್ಟರ್ ಎಲೆಕ್ಟ್ರಿಕಲ್ ಕ್ಲಾಕ್ ಗ್ರಿಡ್‌ಗೆ ಸಿಂಕ್ ಆಗಿದೆ.',
              'ಸಿಬ್ಬಂದಿ ರಾತ್ರಿ ಸರಿಯಾಗಿ ೧೧:೩೦ ಕ್ಕೆ ಶವವನ್ನು ಪತ್ತೆಹಚ್ಚಿದ್ದಾರೆ.'
            ]
          };
        case 'door':
          return {
            ...h,
            name: 'ಬದಿಯ ಸರ್ವಿಸ್ ಬಾಗಿಲು ಮತ್ತು ಡೆಡ್‌ಬೋಲ್ಟ್',
            category: 'ಪ್ರವೇಶ ನಿರ್ಬಂಧ ಪುರಾವೆ',
            shortDesc: 'ಒಳಗಿನಿಂದ ಗಟ್ಟಿಯಾಗಿ ಲಾಕ್ ಆಗಿದ್ದ ಹಿತ್ತಾಳೆಯ ಡೆಡ್‌ಬೋಲ್ಟ್ ಮತ್ತು ಕರಗದ ಮಂಜು.',
            detailedAnalysis: 'ಬದಿಯ ಬಾಗಿಲು ಒಳಗಿನಿಂದ ಲಾಕ್ ಆಗಿದ್ದು, ಕೆಳಗಿನ ಮಂಜು ಅಖಂಡವಾಗಿದೆ. ರಾತ್ರಿ ಯಾರೂ ಈ ಬಾಗಿಲಿನ ಮೂಲಕ ಪ್ರವೇಶಿಸಿಲ್ಲ ಅಥವಾ ಪರಾರಿಯಾಗಿಲ್ಲ ಎಂಬುದನ್ನು ಇದು ದೃಢೀಕರಿಸುತ್ತದೆ.',
            forensicPoints: [
              'ಡೆಡ್‌ಬೋಲ್ಟ್ ಒಳಗಿನಿಂದ ಲಾಕ್ ಆಗಿದೆ: ಹೊರಗಿನಿಂದ ತೆರೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ.',
              'ಕರಗದ ಮಂಜು ಬಾಗಿಲು ತೆರೆಯಲಾಗಿಲ್ಲ ಎಂದು ಸಾಬೀತುಪಡಿಸುತ್ತದೆ.',
              'ಹೊರಗಿನಿಂದ ಯಾರೂ ಪ್ರವೇಶಿಸಿಲ್ಲ ಎಂದು ಖಚಿತಪಡಿಸುತ್ತದೆ.'
            ]
          };
        case 'tartan':
          return {
            ...h,
            name: 'ಹಸಿರು ಟಾರ್ಟನ್ ಬಟ್ಟೆಯ ತುಂಡು',
            category: 'ಭೌತಿಕ ಕುರುಹು / ತಪ್ಪು ದಾರಿಯ ಸುಳಿವು',
            shortDesc: 'ಬದಿಯ ಸರ್ವಿಸ್ ಬಾಗಿಲಿನ ಹೊರ ಹಿಡಿಕೆಗೆ ಸಿಲುಕಿದ್ದ ಗಾಢ ಹಸಿರು ಉಣ್ಣೆಯ ಬಟ್ಟೆಯ ತುಂಡು.',
            detailedAnalysis: 'ವಿಕ್ಟರ್ ಥೋರ್ನ್ ಧರಿಸಿದ್ದ ಬ್ಲೇಜರ್‌ಗೆ ಬಟ್ಟೆಯ ಎಳೆಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತವೆ. ಬಾಗಿಲು ಒಳಗಿನಿಂದ ಲಾಕ್ ಆಗಿದ್ದರಿಂದ, ರಾತ್ರಿ ೧೦:೫೦ ಕ್ಕೆ ವಿಕ್ಟರ್ ಬಾಗಿಲು ತೆರೆಯಲು ವಿಫಲ ಪ್ರಯತ್ನ ನಡೆಸಿದ್ದರ ಪರಿಣಾಮವಿದು.',
            forensicPoints: [
              'ವಿಕ್ಟರ್ ಥೋರ್ನ್ ಅವರ ಹಸಿರು ಟಾರ್ಟನ್ ಬ್ಲೇಜರ್‌ಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.',
              'ರಾತ್ರಿ ೧೦:೫೦ ಕ್ಕೆ ಹೊರಗಿನ ಹಿಡಿಕೆಗೆ ಸಿಲುಕಿಕೊಂಡಿದೆ.',
              'ಬಾಗಿಲು ಲಾಕ್ ಆಗಿತ್ತು; ವಿಕ್ಟರ್ ಒಳಗೆ ಪ್ರವೇಶಿಸಲಿಲ್ಲ.'
            ]
          };
        case 'onlookers':
          return {
            ...h,
            name: 'ಪ್ರವೇಶ ದ್ವಾರದಲ್ಲಿ ನಾಲ್ವರು ಶಂಕಿತರು',
            category: 'ಸಾಕ್ಷಿಗಳು ಮತ್ತು ಶಂಕಿತರ ಗುಂಪು',
            shortDesc: 'ಎಸ್ಟೇಟ್‌ನಲ್ಲಿ ಉಪಸ್ಥಿತರಿದ್ದ ನಾಲ್ವರು: ಕ್ಲಾರಾ ಸ್ಟರ್ಲಿಂಗ್, ವಿಕ್ಟರ್ ಥೋರ್ನ್, ಡಾ. ಎವೆಲಿನ್ ಹೇಯ್ಸ್, ಮತ್ತು ಚೆಫ್ ಮಾರ್ಕೊ.',
            detailedAnalysis: 'ಅಲಾರಂ ಮೊಳಗಿದ ನಂತರ ನಾಲ್ವರು ಕಮಾನು ಬಾಗಿಲ ಬಳಿ ನಿಂತಿದ್ದಾರೆ. ಪ್ರತಿಯೊಬ್ಬರೂ ರಾತ್ರಿ ೧೦:೫೦ ರಿಂದ ೧೧:೩೦ ರ ನಡುವೆ ಸ್ಥಳದಲ್ಲಿದ್ದರು.',
            forensicPoints: [
              'ಕ್ಲಾರಾ ಸ್ಟರ್ಲಿಂಗ್: ೧೧:೦೫ ಕ್ಕೆ ಹೀಟರ್ ಪರಿಶೀಲಿಸಿದ್ದಾರೆ.',
              'ವಿಕ್ಟರ್ ಥೋರ್ನ್: ೧೧:೦೦–೧೧:೨೫ ರವರೆಗೆ ಲಾಬಿ ಬಾರ್‌ನಲ್ಲಿದ್ದರು.',
              'ಡಾ. ಎವೆಲಿನ್ ಹೇಯ್ಸ್: ೧೧:೦೦–೧೧:೨೫ ರವರೆಗೆ ಬಿ-ವಿಂಗ್ ಲ್ಯಾಬ್‌ನಲ್ಲಿದ್ದೆ ಎಂದು ಹೇಳುತ್ತಾರೆ.',
              'ಚೆಫ್ ಮಾರ್ಕೊ: ೧೧:೦೦ ಕ್ಕೆ ಡಾ. ವ್ಯಾನ್ಸ್‌ಗೆ ಚಹಾ ತಲುಪಿಸಿದ್ದಾರೆ.'
            ]
          };
        case 'puddle':
          return {
            ...h,
            name: 'ಕರಗಿದ ಹಿಮದ ನೀರು ಮತ್ತು ಡ್ರೈನೇಜ್ ಗ್ರೇಟ್',
            category: 'ಪರಿಸರ ಕುರುಹು',
            shortDesc: 'ಮುಖ್ಯ ಗಾಜಿನ ಕಮಾನಿನ ಬಳಿ ಕರಗಿದ ಹಿಮದ ನೀರು ಮತ್ತು ಬೂಟುಗಳ ಹೆಜ್ಜೆಗುರುತುಗಳು.',
            detailedAnalysis: 'ಬೂಟುಗಳಿಂದ ಬಂದ ಹಿಮ ಕರಗಿ ಉಂಟಾದ ನೀರು. ಇದು ೨೫ ನಿಮಿಷಗಳ ಅವಧಿಯಲ್ಲಿ ಕರಗಿ ನೆಲೆಗೊಂಡಿದೆ.',
            forensicPoints: [
              'ರಾತ್ರಿ ೧೧:೧೦ ಕ್ಕಿಂತ ಮುಂಚಿನ ಹೆಜ್ಜೆಗುರುತುಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.',
              'ಡ್ರೈನೇಜ್ ಗ್ರೇಟ್ ಮೂಲಕ ನೀರು ಹೊರಹೋಗುತ್ತದೆ.'
            ]
          };
        default:
          return h;
      }
    });
  };

  const activeHotspots = getTranslatedHotspots();

  const englishSubtitles = [
    { start: 0, end: 3, text: '23:24:00 — Frostpeak Conservatory. Founding botanist Dr. Arthur Vance is found dead on the stone tiles.' },
    { start: 3, end: 6, text: 'Spilled glowing blue bioluminescent orchid pollen and an overturned cup of Earl Grey tea surround the victim.' },
    { start: 6, end: 9, text: 'A shattered wristwatch freezes the moment of collapse at 11:24 PM. Four individuals were present on the estate grounds.' },
    { start: 9, end: 12, text: 'Every detail tells a story. Inspect the crime scene, examine the CCTV recordings, and discover what truly happened.' }
  ];

  const kannadaSubtitles = [
    { start: 0, end: 3, text: '೨೩:೨೪:೦೦ — ಫ್ರಾಸ್ಟ್‌ಪೀಕ್ ಕನ್ಸರ್ವೇಟರಿ. ಮುಖ್ಯ ಸಸ್ಯಶಾಸ್ತ್ರಜ್ಞ ಡಾ. ಆರ್ಥರ್ ವ್ಯಾನ್ಸ್ ನೆಲದ ಮೇಲೆ ಶವವಾಗಿ ಪತ್ತೆಯಾಗಿದ್ದಾರೆ.' },
    { start: 3, end: 6, text: 'ಚೆಲ್ಲಾಪಿಲ್ಲಿಯಾದ ಹೊಳೆಯುವ ನೀಲಿ ಆರ್ಕಿಡ್ ಪರಾಗ ಮತ್ತು ಬಿದ್ದಿರುವ ಅರ್ಲ್ ಗ್ರೇ ಚಹಾ ಕಪ್ ದೇಹದ ಸುತ್ತಲೂ ಕಂಡುಬಂದಿದೆ.' },
    { start: 6, end: 9, text: 'ಒಡೆದ ಕೈಗಡಿಯಾರವು ರಾತ್ರಿ ೧೧:೨೪ ಕ್ಕೆ ಸಾವು ಸಂಭವಿಸಿದ್ದನ್ನು ದೃಢೀಕರಿಸುತ್ತದೆ. ಎಸ್ಟೇಟ್‌ನಲ್ಲಿ ನಾಲ್ಕು ವ್ಯಕ್ತಿಗಳು ಉಪಸ್ಥಿತರಿದ್ದರು.' },
    { start: 9, end: 12, text: 'ಪ್ರತಿಯೊಂದು ವಿವರವೂ ಒಂದು ಕಥೆ ಹೇಳುತ್ತದೆ. ಅಪರಾಧ ಸ್ಥಳ ಪರಿಶೀಲಿಸಿ, ಸಿಸಿಟಿವಿ ದೃಶ್ಯಗಳನ್ನು ವೀಕ್ಷಿಸಿ ನಿಜವಾದ ಕೊಲೆಗಾರನನ್ನು ಪತ್ತೆಹಚ್ಚಿ.' }
  ];

  const subtitles = isKannada ? kannadaSubtitles : englishSubtitles;

  const handleSelectHotspot = (hotspot: CrimeSceneHotspot) => {
    soundFX.playCameraSwitch();
    setSelectedHotspot(hotspot);
    if (!inspectedHotspots.includes(hotspot.id)) {
      setInspectedHotspots([...inspectedHotspots, hotspot.id]);
    }
  };

  const handleCollectClue = (code: string) => {
    if (onCollectEvidence) {
      onCollectEvidence(code);
      soundFX.playClueFound();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cfc7b7] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-900 font-mono text-xs tracking-wider font-bold">
            <span>{t('stage_1_badge_text', 'STAGE 01 OF 05 // THE CRIME SCENE')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1c1917] mt-1">
            {t('stage_1_heading', 'CASE ZERO: MURDER AT FROSTPEAK CONSERVATORY')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 mt-1 max-w-3xl font-sans">
            {t('stage_1_desc', 'Explore Frostpeak Conservatory and inspect the victim’s surroundings. Click on suspicious objects, fallen pollen, teacups, door locks, and environmental traces to uncover forensic leads.')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-red-100/90 border border-red-300 text-red-900 font-mono text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            <span>{t('crime_scene_sealed', 'CRIME SCENE SEALED')}</span>
          </span>
        </div>
      </div>

      {/* 1. Cinematic Video Player Container */}
      <div className="space-y-3 bg-[#f5f0e6] p-5 rounded-2xl border border-[#cfc7b7] shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono text-stone-700">
          <span className="flex items-center space-x-2 text-blue-900 font-bold">
            <Film className="w-4 h-4 text-blue-800" />
            <span>{t('cinematic_overview', 'INCIDENT OVERVIEW CINEMATIC RECORDING')}</span>
          </span>
          <span className="text-[11px] text-stone-500 font-semibold">FORMAT: 1080P IR SURVEILLANCE</span>
        </div>

        <CinematicVideoPlayer
          posterUrl="/reference/crime-scene.jpg"
          camCode="INCIDENT ARCHIVE"
          title={isKannada ? 'ಫ್ರಾಸ್ಟ್‌ಪೀಕ್ ಕನ್ಸರ್ವೇಟರಿ ಅಪರಾಧ ಸ್ಥಳ' : 'Frostpeak Conservatory Crime Scene'}
          timestamp="23:24:00"
          duration={12}
          panMode="pan_right"
          subtitles={subtitles}
          autoPlay={true}
        />
      </div>

      {/* 2. Explorable Interactive 3D Crime Scene Canvas */}
      <div className="space-y-4 pt-2 bg-[#f5f0e6] p-5 rounded-2xl border border-[#cfc7b7] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-display font-bold text-[#1c1917] flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-800" />
              <span>{t('explore_scene', 'EXPLORE THE CRIME SCENE: INTERACTIVE INVESTIGATION')}</span>
            </h3>
            <p className="text-xs text-stone-600 font-sans">
              {t('explore_scene_desc', 'Click on the glowing forensic markers to inspect individual objects, zoom into suspicious items, and extract evidence.')}
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-stone-700 font-medium">
              {t('inspected_label', 'INSPECTED:')} <span className="text-blue-900 font-bold">{inspectedHotspots.length}</span> / {activeHotspots.length}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setSceneZoom((prev) => Math.min(prev + 0.25, 2.0))}
                className="p-1.5 rounded-lg bg-[#e6dfd2] hover:bg-[#ded6c7] text-stone-800 border border-[#cfc7b7] transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSceneZoom((prev) => Math.max(prev - 0.25, 1.0))}
                className="p-1.5 rounded-lg bg-[#e6dfd2] hover:bg-[#ded6c7] text-stone-800 border border-[#cfc7b7] transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSceneZoom(1.0)}
                className="px-2.5 py-1 rounded-lg bg-[#e6dfd2] hover:bg-[#ded6c7] text-stone-800 border border-[#cfc7b7] text-[11px] font-bold transition"
              >
                100%
              </button>
            </div>
          </div>
        </div>

        {/* Crime Scene Graphic with Interactive Pulsing Hotspots */}
        <div className="relative rounded-xl overflow-hidden bg-slate-900 border-2 border-[#b8b09f] shadow-lg">
          
          <div 
            className="relative w-full aspect-[16/9] overflow-hidden transition-transform duration-300"
            style={{ transform: `scale(${sceneZoom})`, transformOrigin: 'center center' }}
          >
            <img
              src="/reference/crime-scene.jpg"
              alt="Frostpeak Conservatory Crime Scene"
              className="w-full h-full object-contain pointer-events-none select-none"
            />

            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none"></div>

            {/* Hotspot Markers */}
            {activeHotspots.map((spot) => {
              const isInspected = inspectedHotspots.includes(spot.id);
              const isSelected = selectedHotspot?.id === spot.id;

              return (
                <div
                  key={spot.id}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onClick={() => handleSelectHotspot(spot)}
                  onMouseEnter={() => setHoveredHotspot(spot)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                >
                  {/* Ping Animation */}
                  <span className={`absolute -inset-1 rounded-full animate-ping opacity-75 ${
                    isSelected
                      ? 'bg-amber-400'
                      : isInspected
                      ? 'bg-emerald-400'
                      : 'bg-red-500'
                  }`}></span>

                  {/* Icon Button */}
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-transform transform group-hover:scale-125 shadow-lg ${
                    isSelected
                      ? 'bg-amber-500 border-white text-slate-900 scale-110 shadow-lg'
                      : isInspected
                      ? 'bg-emerald-600 border-white text-white'
                      : 'bg-red-600 border-white text-white'
                  }`}>
                    {isInspected ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-30">
                    <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-[11px] shadow-xl border border-slate-700">
                      {spot.name}
                    </div>
                    <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700"></div>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Quick Clue Discovery Shortcuts (Find Everything Instantly) */}
        <div className="bg-[#f5f0e6] border-t border-[#cfc7b7] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-amber-950 font-bold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-800" />
              <span>{t('quick_shortcuts', 'QUICK EVIDENCE SHORTCUTS (1-CLICK INSPECT):')}</span>
            </span>
            <span className="text-stone-600 text-[11px] font-semibold">
              {activeHotspots.length} {t('scene_objects_count', 'SCENE OBJECTS')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 font-mono text-xs">
            {activeHotspots.map((spot) => {
              const isInspected = inspectedHotspots.includes(spot.id);
              const isSelected = selectedHotspot?.id === spot.id;

              return (
                <button
                  key={spot.id}
                  onClick={() => handleSelectHotspot(spot)}
                  className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-800 text-white border-blue-900 shadow-sm font-bold'
                      : isInspected
                      ? 'bg-[#fbf9f5] text-stone-900 border-[#cfc7b7] font-semibold hover:border-blue-700'
                      : 'bg-[#e6dfd2] text-stone-800 border-[#cfc7b7] hover:border-stone-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase truncate opacity-80">{spot.id}</span>
                    {isInspected ? (
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-emerald-700'}`} />
                    ) : (
                      <Search className="w-3 h-3 opacity-60" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold line-clamp-1">{spot.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick HUD Legend */}
          <div className="bg-[#e6dfd2] border-t border-[#cfc7b7] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs font-mono text-stone-700">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span>{t('unexamined_obj', 'Unexamined Object')}</span>
              </span>
              <span className="flex items-center space-x-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span>{t('inspected_trace', 'Inspected Trace')}</span>
              </span>
              <span className="flex items-center space-x-1.5 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>{t('active_target', 'Active Target')}</span>
              </span>
            </div>
            <span className="text-[11px] text-stone-600 font-semibold">
              LOCATION: FROSTPEAK CONSERVATORY // 23:30:00
            </span>
          </div>
        </div>

        {/* Hotspot Inspection Modal / Detail Panel */}
        {selectedHotspot && (
          <div className="bg-[#f5f0e6] border-2 border-[#b8b09f] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 animate-fade-in mt-4">
            <div className="flex items-start justify-between border-b border-[#cfc7b7] pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/90 border border-amber-400 text-amber-950 font-mono text-[10px] tracking-wider uppercase font-bold">
                  {selectedHotspot.category}
                </span>
                <h4 className="text-xl font-display font-black text-[#1c1917] mt-1">
                  {selectedHotspot.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedHotspot(null)}
                className="p-1.5 rounded-lg bg-[#e6dfd2] hover:bg-[#ded6c7] text-stone-600 hover:text-stone-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-xl overflow-hidden bg-[#e6dfd2] border border-[#cfc7b7] aspect-video md:aspect-square flex items-center justify-center">
                <img
                  src={selectedHotspot.previewImg}
                  alt={selectedHotspot.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:col-span-2 space-y-3 font-mono text-xs">
                <p className="text-stone-800 text-sm leading-relaxed font-sans font-medium">
                  {selectedHotspot.detailedAnalysis}
                </p>

                <div className="bg-[#e6dfd2] p-3.5 rounded-xl border border-[#cfc7b7] space-y-1.5">
                  <span className="text-amber-900 font-bold block text-[11px]">
                    {t('critical_obs', 'CRITICAL FORENSIC OBSERVATIONS:')}
                  </span>
                  <ul className="space-y-1 text-stone-800 list-disc list-inside font-sans text-xs">
                    {selectedHotspot.forensicPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>

                {selectedHotspot.evidenceCode && (
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-stone-700 font-semibold">
                      {t('identified_code', 'IDENTIFIED EVIDENCE CODE:')} <span className="text-blue-900 font-bold">{selectedHotspot.evidenceCode}</span>
                    </span>

                    {collectedEvidence.includes(selectedHotspot.evidenceCode) ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>{t('added_to_dossier', 'ADDED TO EVIDENCE DOSSIER')}</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCollectClue(selectedHotspot.evidenceCode!)}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold transition shadow-md"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{t('add_to_inventory', 'ADD TO EVIDENCE INVENTORY')}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Stage Completion Banner */}
      <div className="bg-[#f5f0e6] border border-[#cfc7b7] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-display font-bold text-[#1c1917] flex items-center space-x-2">
            <span>{t('ready_to_advance', 'READY TO ADVANCE INVESTIGATION')}</span>
          </h4>
          <p className="text-xs text-stone-600 mt-0.5 font-sans">
            {t('ready_to_advance_desc', 'You have surveyed the crime scene. Next, analyze the multi-camera CCTV recordings and cross-examine the surveillance timeline.')}
          </p>
        </div>

        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-mono font-bold text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <span>{t('proceed_cctv_btn', 'PROCEED TO STAGE 02: CCTV RECORDINGS')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
