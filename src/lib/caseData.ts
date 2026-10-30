import { MysteryCase, Suspect, Evidence, CCTVFeed, AudioLog, TimelineEntry } from '../types';

export const CASE_DATA: MysteryCase = {
  id: '221814d4-3cbf-42e9-a6cc-13efc373a1ae',
  slug: 'the-74-second-vanishing',
  title: 'CASE ZERO: The 74-Second Vanishing',
  tagline: 'Every Detail Tells a Story. Can You Find the Truth?',
  description: 'During the Meridian Innovation Hall annual tech exhibition, the prize prototype AURORA — a next-generation emergency communication unit — mysteriously vanished from its locked display case during a localized 74-second lighting interruption between 20:14:12 and 20:15:26. Four individuals had physical proximity and motive.',
  incident_time: '20:14:12 – 20:15:26 (74 Seconds Duration)',
  location: 'Meridian Innovation Hall — University Research Centre',
  published: true,
};

export const INITIAL_SUSPECTS: Suspect[] = [
  {
    id: '293c8464-eadd-40c9-8144-c8baef53a57e',
    case_id: '221814d4-3cbf-42e9-a6cc-13efc373a1ae',
    display_name: 'Mira Sen',
    role: 'Project Leader & Lead Hardware Architect',
    portrait_url: '/suspects/mira-sen.jpg',
    display_order: 1,
    public_profile: {
      background: 'Final-year Robotics PhD candidate and principal designer of Project AURORA. Renowned for perfectionism and hardware exclusivity.',
      clothing: 'Tailored navy blazer over crisp white collared shirt, silver university emblem lapel pin, minimalist wristwatch.',
      belongings: 'Silver 15-inch ultra-thin laptop, encrypted biometric drive, presentation clicker.',
      statement: 'I was on the main auditorium stage presenting the AURORA emergency transmission architecture to industry sponsors from 20:05 until 20:22. The stage lighting flickered briefly at 20:14, but my presentation feed never stopped.',
      alibi: 'Main Stage livestream recording shows her on camera continuously from 20:05:30 to 20:21:40 without leaving the podium.',
      possible_motive: 'Speculation that she feared the hardware evaluation benchmarks would fail during live inspection.'
    }
  },
  {
    id: 'e67496a0-9dce-46a9-8a49-758ec188f589',
    case_id: '221814d4-3cbf-42e9-a6cc-13efc373a1ae',
    display_name: 'Kabir Rao',
    role: 'Technical Operations Assistant',
    portrait_url: '/suspects/kabir-rao.jpg',
    display_order: 2,
    public_profile: {
      background: 'Senior electrical engineering technician responsible for exhibition hall power grids, sub-stations, and secondary emergency generators.',
      clothing: 'Charcoal heavy-duty utility jacket with orange high-visibility reflective bands on chest and sleeves, utility belt, two-way radio clip on left shoulder.',
      belongings: 'Digital multimeter, master electrical isolation key, rugged tablet displaying grid telemetry.',
      statement: 'I received a power anomaly notification at 20:11 on sub-grid B. I was in the basement generator room conducting load monitoring on the backup diesel generators between 20:10 and 20:20.',
      alibi: 'Basement power station access log confirms keycard swipe at 20:10:04 and exit at 20:21:15. Generator telemetry logs corroborate manual load testing during that period.',
      possible_motive: 'Had voiced complaints regarding budget cuts to the electrical infrastructure team and previous conflicts with the university administration.'
    }
  },
  {
    id: '2c79ee51-d64e-438f-ab93-60a199c84ce0',
    case_id: '221814d4-3cbf-42e9-a6cc-13efc373a1ae',
    display_name: 'Rhea Das',
    role: 'Event Coordinator',
    portrait_url: '/suspects/rhea-das.jpg',
    display_order: 3,
    public_profile: {
      background: 'Lead Event Coordinator managing facility schedules, guest access, vendor security, and emergency safety protocols across Meridian Innovation Hall.',
      clothing: 'Cream tailored wool jacket, distinctive burgundy silk scarf, dark trousers, low leather boots.',
      belongings: 'Clip-on coordinator lanyard, brass key ring with physical mechanical emergency safety keys (including Key #04), tablet with schedule logs.',
      statement: 'I was stationed at the reception welcome desk near the main glass entrance welcoming VIP guests and answering media inquiries throughout the entire evening.',
      alibi: 'Reception desk CCTV shows her at the desk until 20:12:30. Between 20:13:00 and 20:16:15, the reception desk is vacant in camera coverage.',
      possible_motive: 'High institutional pressure to ensure the exhibition had zero public safety incidents or reputational scandals.'
    }
  },
  {
    id: '84f88770-cdac-43e9-a0eb-783ef6541a90',
    case_id: '221814d4-3cbf-42e9-a6cc-13efc373a1ae',
    display_name: 'Dev Malhotra',
    role: 'Visiting Evaluator & Tech Journalist',
    portrait_url: '/suspects/dev-malhotra.jpg',
    display_order: 4,
    public_profile: {
      background: 'Senior technical evaluator and freelance photojournalist covering emerging innovations for regional tech consortiums.',
      clothing: 'Dark olive green field jacket over a charcoal crewneck sweater, dark denim jeans.',
      belongings: 'Sony A7 IV full-frame mirrorless camera with 24-70mm GM lens on leather cross-body strap, padded ballistic nylon lens bag.',
      statement: 'I was in the main atrium taking architectural and exhibit photos near the central installation. When the lights went out, I stood still near column C-2 to avoid bumping into glass exhibits.',
      alibi: 'Atrium wide-angle camera (CAM-01) timestamped footage shows his camera screen illuminated near column C-2 during the entire 74 seconds of dark lighting.',
      possible_motive: 'Accused in prior industry circles of industrial espionage and attempting to leak proprietary hardware schematics.'
    }
  }
];

export const INITIAL_EVIDENCE: Evidence[] = [
  {
    id: 'e01',
    case_id: CASE_DATA.id,
    code: 'EV-01',
    title: 'AURORA Prototype Thermal Telemetry Log',
    description: 'Internal lithium battery temperature sensor telemetry extracted from the exhibition pedestal receiver. Shows battery cell temperature surging from normal 31.4°C at 20:00 to critical thermal runaway threshold of 58.2°C at 20:13:05, triggering an amber warning indicator on the device chassis.',
    evidence_type: 'telemetry',
    media_url: '/evidence/ev-01-thermal-telemetry.jpg',
    display_order: 1,
    metadata: {
      source: 'AURORA Telemetry Bus 0x4A',
      critical_timestamp: '20:13:05',
      metric: '58.2°C (Safe threshold: < 45.0°C)',
      indicator_state: 'AMBER_PULSE_WARNING'
    }
  },
  {
    id: 'e02',
    case_id: CASE_DATA.id,
    code: 'EV-02',
    title: 'Sub-Panel B-4 Circuit Breaker Isolation Log',
    description: 'Building management electrical system log. At exactly 20:14:12, Breaker switch B-4 controlling the central exhibition pedestal illumination and charging dock was manually toggled OFF, and restored manually at 20:15:26 (elapsed duration: exactly 74 seconds).',
    evidence_type: 'access_log',
    media_url: '/evidence/ev-02-circuit-breaker.jpg',
    display_order: 2,
    metadata: {
      panel: 'Sub-Panel B-4 (Corridor West)',
      trip_time: '20:14:12.108',
      restore_time: '20:15:26.412',
      duration: '74.3 seconds',
      type: 'MANUAL_OVERRIDE_TOGGLE'
    }
  },
  {
    id: 'e03',
    case_id: CASE_DATA.id,
    code: 'EV-03',
    title: 'Primary Backup Generator Load Telemetry',
    description: 'Main power station telemetry verified by Kabir Rao in the basement. Confirms the campus municipal grid and primary transformers never suffered a blackout. The power outage was purely isolated to sub-panel B-4 in the exhibition gallery.',
    evidence_type: 'telemetry',
    media_url: '/evidence/ev-03-generator-load.jpg',
    display_order: 3,
    metadata: {
      station: 'Sub-Station Level -1',
      grid_voltage: '415V 3-Phase Stable',
      diesel_status: 'STANDBY_READY',
      conclusion: 'No building-wide grid failure'
    }
  },
  {
    id: 'e04',
    case_id: CASE_DATA.id,
    code: 'EV-04',
    title: 'CAM-03 Service Corridor CCTV Frame (20:14:48)',
    description: 'Security camera footage from the restricted service corridor during the lighting blackout. Shows an individual wearing a tailored cream jacket and burgundy scarf rapidly walking towards the Emergency Climate Safety Vault carrying a padded thermal protective transport case.',
    evidence_type: 'cctv_frame',
    media_url: '/evidence/ev-04-cctv-corridor.jpg',
    display_order: 4,
    metadata: {
      camera: 'CAM-03 Service Corridor West',
      timecode: '20:14:48',
      apparel_observed: 'Cream wool jacket, burgundy scarf',
      carried_item: 'Padded thermal transport carrier'
    }
  },
  {
    id: 'e05',
    case_id: CASE_DATA.id,
    code: 'EV-05',
    title: 'Emergency Climate Safety Vault Mechanical Key Register',
    description: 'Log book for Room S-102 (Restricted Climate-Controlled Safety Vault). Mechanical lock cylinder #04 was operated at 20:15:02. Physical brass Key #04 was officially assigned and checked out to Event Coordinator Rhea Das for rapid response hazard containment.',
    evidence_type: 'access_log',
    media_url: '/evidence/ev-05-vault-access.jpg',
    display_order: 5,
    metadata: {
      vault_location: 'Room S-102 Climate Vault',
      lock_operated: '20:15:02',
      key_id: 'Brass Key #04',
      authorized_holder: 'Rhea Das (Event Coordinator)'
    }
  },
  {
    id: 'e06',
    case_id: CASE_DATA.id,
    code: 'EV-06',
    title: 'Main Auditorium Stage Livestream Timecode',
    description: 'Official broadcast recording from the university main stage. Proves Mira Sen was on camera speaking to sponsors from 20:05:30 to 20:21:40 without interruption. Her laptop stayed on the lectern projecting slides.',
    evidence_type: 'statement_contradiction',
    media_url: '/evidence/ev-06-stage-livestream.jpg',
    display_order: 6,
    metadata: {
      stage_camera: 'BROADCAST_CAM_A',
      speaker: 'Mira Sen',
      active_timeframe: '20:05:30 – 20:21:40',
      alibi_status: 'CONFIRMED_ALIBI'
    }
  },
  {
    id: 'e07',
    case_id: CASE_DATA.id,
    code: 'EV-07',
    title: 'Photojournalist Camera EXIF & Atrium CCTV Match',
    description: 'Forensic analysis of Dev Malhotra camera memory card. Frame DSC04192 (20:14:05), DSC04193 (20:14:40), and DSC04194 (20:15:15) show continuous long-exposure captures of the dark atrium, matching his position at column C-2 on CAM-01 reflection.',
    evidence_type: 'statement_contradiction',
    media_url: '/evidence/ev-07-camera-exif.jpg',
    display_order: 7,
    metadata: {
      device: 'Sony ILCE-7M4',
      exif_timestamps: '20:14:05, 20:14:40, 20:15:15',
      matching_position: 'Column C-2',
      alibi_status: 'CONFIRMED_ALIBI'
    }
  },
  {
    id: 'e08',
    case_id: CASE_DATA.id,
    code: 'EV-08',
    title: 'Exhibition Pedestal Physical Forensic Trace',
    description: 'Forensic inspection of the AURORA pedestal display case. Reveals microscopic burgundy silk textile fibers on the left acrylic hinge latch, and a hairline brass scuff mark on the base locking screw matching a brass keyring tag.',
    evidence_type: 'physical_trace',
    media_url: '/evidence/ev-08-pedestal-trace.jpg',
    display_order: 8,
    metadata: {
      location: 'Pedestal Case Hinge Latch',
      materials_found: 'Burgundy silk fiber, brass metallic transfer',
      match_source: 'Rhea Das burgundy silk scarf & brass key ring'
    }
  }
];

export const CCTV_FEEDS: CCTVFeed[] = [
  {
    id: 'cctv-1',
    camCode: 'CAM-01',
    title: 'Main Exhibition Atrium',
    location: 'Central Pedestal Zone (Floor 1)',
    videoUrl: '/video/cam-01-atrium.mp4',
    posterUrl: '/cctv/cam-01.jpg',
    timestamp: '20:14:15',
    status: 'RECORDING',
    hotspots: [
      {
        x: 50,
        y: 45,
        title: 'Central Pedestal Dock',
        description: 'Glass acrylic display case. Note the amber flashing LED indicator on prototype top corner before power loss.',
        clueCode: 'EV-01'
      },
      {
        x: 18,
        y: 60,
        title: 'Column C-2 Glass Reflection',
        description: 'Illuminated camera monitor reflection observed during darkness. Matches Dev Malhotra photo gear.',
        clueCode: 'EV-07'
      }
    ]
  },
  {
    id: 'cctv-2',
    camCode: 'CAM-02',
    title: 'Reception & Entrance Lobby',
    location: 'North Glass Concourse',
    videoUrl: '/video/cam-02-reception.mp4',
    posterUrl: '/cctv/cam-02.jpg',
    timestamp: '20:13:30',
    status: 'RECORDING',
    hotspots: [
      {
        x: 50,
        y: 65,
        title: 'Unattended Reception Desk',
        description: 'Reception log book open. Rhea Das departed desk at 20:12:30 and did not return until 20:16:15.',
        clueCode: 'EV-04'
      }
    ]
  },
  {
    id: 'cctv-3',
    camCode: 'CAM-03',
    title: 'Service Corridor West',
    location: 'Corridor B-4 to Climate Vault',
    videoUrl: '/video/cam-03-corridor.mp4',
    posterUrl: '/cctv/cam-03.jpg',
    timestamp: '20:14:48',
    status: 'RECORDING',
    hotspots: [
      {
        x: 42,
        y: 40,
        title: 'Door B-4 (Electrical Sub-Panel)',
        description: 'Corridor access door slightly ajar. Sub-Panel B-4 is located directly inside this door threshold.',
        clueCode: 'EV-02'
      },
      {
        x: 52,
        y: 50,
        title: 'Moving Figure with Padded Case',
        description: 'Individual wearing cream jacket and burgundy scarf rapidly walking toward Vault S-102.',
        clueCode: 'EV-04'
      }
    ]
  },
  {
    id: 'cctv-4',
    camCode: 'CAM-04',
    title: 'Power Distribution & Backup Generator',
    location: 'Basement Sub-Station Level -1',
    videoUrl: '/video/cam-04-substation.mp4',
    posterUrl: '/cctv/cam-04.jpg',
    timestamp: '20:12:00',
    status: 'RECORDING',
    hotspots: [
      {
        x: 35,
        y: 45,
        title: 'Transformer Bank T-01',
        description: 'Primary 3-phase municipal power gauges showing steady 415V with zero building-wide blackout.',
        clueCode: 'EV-03'
      }
    ]
  },
  {
    id: 'cctv-5',
    camCode: 'CAM-05',
    title: 'Restricted Climate Safety Vault Door',
    location: 'Vault Corridor S-102',
    videoUrl: '/video/cam-05-vault.mp4',
    posterUrl: '/cctv/cam-05.jpg',
    timestamp: '20:15:02',
    status: 'RECORDING',
    hotspots: [
      {
        x: 50,
        y: 35,
        title: 'Mechanical Lock Cylinder #04',
        description: 'Physical lock opened at 20:15:02 using authorized brass Key #04 assigned to Event Coordinator.',
        clueCode: 'EV-05'
      }
    ]
  }
];

export const AUDIO_LOGS: AudioLog[] = [
  {
    id: 'aud-1',
    code: 'LOG-01',
    title: 'Reception Intercom Dispatch',
    duration: '0:18',
    timestamp: '20:11:40',
    speaker: 'Rhea Das -> Facility Ops',
    transcript: '“Kabir, can you check sub-grid B? The pedestal telemetry monitor is flashing an amber battery heat alert. We need to prevent any risk to the audience.”',
    synthesizedFrequency: 440
  },
  {
    id: 'aud-2',
    code: 'LOG-02',
    title: 'Sub-Panel B-4 Breaker Disconnect Acoustic Burst',
    duration: '0:12',
    timestamp: '20:14:12',
    speaker: 'Acoustic Sensor Corridor B',
    transcript: '[Heavy mechanical spring latch click. Followed by localized halogen ballast hum dying down. No siren triggered.]',
    synthesizedFrequency: 220
  },
  {
    id: 'aud-3',
    code: 'LOG-03',
    title: 'Stage Broadcast Audio Feed',
    duration: '0:25',
    timestamp: '20:14:30',
    speaker: 'Mira Sen (Auditorium Stage)',
    transcript: '“As you can see on slide 14, our mesh algorithm recalculates dynamically even if peripheral power is interrupted. Moving to slide 15...”',
    synthesizedFrequency: 520
  }
];

export const TIMELINE_EVENTS: TimelineEntry[] = [
  {
    timestamp: '20:05:30',
    timeCodeSeconds: 120530,
    location: 'Main Auditorium',
    title: 'Mira Sen Stage Presentation Commences',
    detail: 'Mira Sen begins keynote address on Project AURORA architecture to industry sponsors. Slides live on projector.',
    involvedParty: 'Mira Sen',
    sourceType: 'access',
    isAnomaly: false
  },
  {
    timestamp: '20:10:04',
    timeCodeSeconds: 121004,
    location: 'Basement Sub-Station Level -1',
    title: 'Kabir Rao Accesses Power Station',
    detail: 'Keycard access logged at basement security door. Kabir commences manual load testing on diesel generators.',
    involvedParty: 'Kabir Rao',
    sourceType: 'access',
    isAnomaly: false
  },
  {
    timestamp: '20:12:45',
    timeCodeSeconds: 121245,
    location: 'Central Pedestal 01',
    title: 'AURORA Lithium Battery Alert: 58.2°C',
    detail: 'Internal thermal sensor reaches critical runaway threshold. Amber warning indicator begins pulsing on chassis.',
    involvedParty: 'Prototype System',
    sourceType: 'telemetry',
    isAnomaly: true
  },
  {
    timestamp: '20:12:55',
    timeCodeSeconds: 121255,
    location: 'Reception Concourse',
    title: 'Rhea Das Departs Reception Desk',
    detail: 'Event Coordinator Rhea Das leaves reception desk carrying master brass key ring and coordinator tablet.',
    involvedParty: 'Rhea Das',
    sourceType: 'cctv',
    isAnomaly: true
  },
  {
    timestamp: '20:14:12',
    timeCodeSeconds: 121412,
    location: 'Service Corridor Door B-4',
    title: 'Sub-Panel B-4 Manually Isolated (Blackout Begins)',
    detail: 'Localized breaker switch B-4 tripped. Lights directly above central exhibition pedestal and charging dock go dark.',
    involvedParty: 'Unknown / Authorized Breaker Operator',
    sourceType: 'grid',
    isAnomaly: true
  },
  {
    timestamp: '20:14:40',
    timeCodeSeconds: 121440,
    location: 'Atrium Column C-2',
    title: 'Dev Malhotra Atrium Photography',
    detail: 'Sony A7 camera LCD screen illuminated near Column C-2. Camera captures long exposure DSC04193 of dark room.',
    involvedParty: 'Dev Malhotra',
    sourceType: 'cctv',
    isAnomaly: false
  },
  {
    timestamp: '20:14:48',
    timeCodeSeconds: 121448,
    location: 'Service Corridor West',
    title: 'Corridor CCTV: Figure in Cream Jacket + Burgundy Scarf',
    detail: 'CAM-03 captures individual carrying padded thermal transport case heading toward Room S-102.',
    involvedParty: 'Cream Jacket + Burgundy Scarf (Rhea Das)',
    sourceType: 'cctv',
    isAnomaly: true
  },
  {
    timestamp: '20:15:02',
    timeCodeSeconds: 121502,
    location: 'Room S-102 Safety Vault',
    title: 'Climate Safety Vault Lock Cylinder #04 Operated',
    detail: 'Mechanical brass Key #04 operates vault lock cylinder. Prototype secured inside temperature-controlled chamber.',
    involvedParty: 'Key #04 Holder (Rhea Das)',
    sourceType: 'access',
    isAnomaly: true
  },
  {
    timestamp: '20:15:26',
    timeCodeSeconds: 121526,
    location: 'Service Corridor Door B-4',
    title: 'Sub-Panel B-4 Restored (Blackout Ends: 74s Elapsed)',
    detail: 'Breaker switch B-4 restored to ON. Pedestal illumination returns. Acrylic case open; AURORA prototype missing.',
    involvedParty: 'Pedestal Zone',
    sourceType: 'grid',
    isAnomaly: true
  },
  {
    timestamp: '20:16:15',
    timeCodeSeconds: 121615,
    location: 'Reception Desk',
    title: 'Rhea Das Returns to Reception',
    detail: 'Rhea Das re-enters reception camera coverage, resuming guest check-in without mentioning vault transfer.',
    involvedParty: 'Rhea Das',
    sourceType: 'cctv',
    isAnomaly: false
  }
];
