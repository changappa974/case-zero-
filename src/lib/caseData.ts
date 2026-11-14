import { MysteryCase, Suspect, Evidence, CCTVFeed, AudioLog, TimelineEntry } from '../types';

export const CASE_DATA: MysteryCase = {
  id: '221814d4-3cbf-42e9-a6cc-13efc373a1ae',
  slug: 'murder-at-frostpeak-conservatory',
  title: 'CASE ZERO: Murder at Frostpeak Conservatory',
  tagline: 'Every Detail Tells a Story. Can You Find the Truth?',
  description: 'Late at night inside Frostpeak Conservatory, an isolated glass botanical pavilion surrounded by snow-covered pine forests, founding botanist Dr. Arthur Vance is found dead on the stone floor. Surrounding the body are a cup of tea, shattered glasses, a stopped wristwatch, and a fallen glass container of glowing blue bioluminescent orchid pollen. Four individuals were present on the estate grounds during the critical hours between 10:50 PM and 11:30 PM. Reconstruct the CCTV surveillance feeds, examine forensic evidence, correlate contradictions, and expose who committed the murder.',
  incident_time: '2026-10-30 23:24:00 (Incident Window: 23:12 – 23:24)',
  location: 'Frostpeak Conservatory & B-Wing Laboratory',
  published: true,
};

export const INITIAL_SUSPECTS: Suspect[] = [
  {
    id: '11111111-2222-3333-4444-555555555501',
    case_id: '221814d4-3cbf-42e9-a6cc-13efc373a1ae',
    display_name: 'Clara Sterling',
    role: 'Botanical Assistant & Research Scholar',
    portrait_url: '/suspects/clara-sterling.jpg',
    display_order: 1,
    public_profile: {
      background: 'Dedicated botanical research scholar working under Dr. Vance on cold-climate orchid hybridisation. Passionate about plant genetics.',
      clothing: 'Red hair neatly tied in a bun, navy blue knitted wool sweater, beige cargo trousers, and brown shearling winter boots.',
      belongings: 'Field sampling notebook, ballpoint pen, botanical tweezers, and thermal regulator checklist.',
      statement: 'I checked the conservatory heater at 11:05 PM because the frost on the exterior glass was thickening. Dr. Vance was sitting at the table and waved to me. I adjusted the regulator valve and left by 11:08 PM through the main entrance.',
      alibi: 'CAM 2 (Main Entrance) confirms her entry at 11:05 PM and shows Dr. Vance alive, waving from his table. Independent heater sensor log confirms temperature reset at 11:06 PM, and she departed at 11:08 PM.',
      possible_motive: 'Rumors that Dr. Vance had published her breakthrough orchid hybridization findings under his sole name without giving her co-authorship.'
    }
  },
  {
    id: '11111111-2222-3333-4444-555555555502',
    case_id: '221814d4-3cbf-42e9-a6cc-13efc373a1ae',
    display_name: 'Victor Thorne',
    role: 'Rival Rare Flora Collector & Private Investor',
    portrait_url: '/suspects/victor-thorne.jpg',
    display_order: 2,
    public_profile: {
      background: 'Wealthy private collector of rare botanical specimens and longtime rival of Dr. Vance. Eager to obtain proprietary Midnight Orchid stock.',
      clothing: 'Distinguished elderly gentleman with silver hair, trimmed beard and moustache, dark green tartan blazer, white collared shirt, and formal trousers.',
      belongings: 'Silver pocket lighter, engraved gold pocket watch, leather-bound auction catalog, and personal signet ring.',
      statement: 'I walked around the conservatory grounds at 10:50 PM hoping to speak to Arthur Vance about purchasing a specimen cutting. I tried the exterior side service door, but it was firmly locked. Frustrated, I returned immediately to the hotel Lobby Bar where I drank until past 11:30 PM.',
      alibi: 'Tried the locked side service door at 10:50 PM. Hotel Lobby Bar CCTV (supplementary feed on CAM 1) and bartender testimony confirm he was seated at the bar continuously from 11:00 PM to 11:25 PM.',
      possible_motive: 'Desperately sought to acquire the exclusive patent and live specimen of the rare Midnight Orchid before Vance presented it to the Royal Academy.'
    }
  },
  {
    id: '11111111-2222-3333-4444-555555555503',
    case_id: '221814d4-3cbf-42e9-a6cc-13efc373a1ae',
    display_name: 'Dr. Evelyn Hayes',
    role: 'Conservatory Co-Owner & Senior Biochemist',
    portrait_url: '/suspects/evelyn-hayes.jpg',
    display_order: 3,
    public_profile: {
      background: 'Co-owner of Frostpeak Conservatory and head of biochemical extraction. Has complete operational access to the B-Wing chemical laboratories.',
      clothing: 'Short black bob haircut, mustard-yellow cardigan over a white laboratory apron, dark charcoal trousers, and burgundy leather shoes. Left-handed.',
      belongings: 'B-Wing master electronic keycard, laboratory logbook, digital stopwatch, and latex examination gloves.',
      statement: 'I was working entirely alone inside the B-Wing Preparation Laboratory from 11:00 PM until 11:25 PM preparing nutrient agar cultures. I never left the lab and saw nobody until staff discovered Arthur at 11:30 PM.',
      alibi: 'Claims to have been inside B-Wing Prep Lab alone between 11:00 PM and 11:25 PM. Contradicted by digital access logs showing no keyboard or equipment activity between 11:00 PM and 11:22 PM, and CCTV showing corridor movements.',
      possible_motive: 'Dr. Vance had discovered systematic embezzlement and falsification of university endowment funds in her laboratory accounts and was preparing a formal board audit.'
    }
  },
  {
    id: '11111111-2222-3333-4444-555555555504',
    case_id: '221814d4-3cbf-42e9-a6cc-13efc373a1ae',
    display_name: 'Chef Marco',
    role: 'Conservatory Head Chef & Estate Caterer',
    portrait_url: '/suspects/chef-marco.jpg',
    display_order: 4,
    public_profile: {
      background: 'Head chef of the Frostpeak estate dining room and guest conservatory lodge for over eight years. Known for meticulous hospitality standards.',
      clothing: 'Heavyset build, dark moustache, crisp white double-breasted chef uniform, and bright red neckerchief.',
      belongings: 'Stainless steel serving tray, fine bone china teacup and teapot, estate pantry keys, and recipe index.',
      statement: 'I delivered Dr. Vance his nightly pot of Earl Grey tea at 11:00 PM sharp. He was alive, seated at the wooden desk reviewing notes. I placed the cup and saucer before him, wished him good evening, and returned immediately to the kitchen to prep tomorrow morning bread.',
      alibi: 'CAM 1 shows Chef Marco delivering tea at 11:00 PM. Kitchen service cameras confirm he returned to the kitchen pantry by 11:03 PM and remained there until after 11:35 PM.',
      possible_motive: 'Dr. Vance had harshly reprimanded him over missing kitchen funds and threatened him with immediate termination without pension.'
    }
  }
];

export const INITIAL_EVIDENCE: Evidence[] = [
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee01',
    case_id: CASE_DATA.id,
    code: 'EV-01',
    title: 'Poisoned Teacup & Toxic Chemical Screen',
    description: 'Fine porcelain teacup and saucer recovered directly beside the victim. Forensic chemical spectroscopy identified concentrated traces of Cyanocryptin, a lethal neurotoxic glycoside uniquely synthesized from the rare Midnight Orchid.',
    evidence_type: 'physical_trace',
    media_url: '/evidence/poisoned-teacup.jpg',
    display_order: 1,
    metadata: {
      location: 'Floor tile directly adjacent to Dr. Vance right hand',
      compound_identified: 'Cyanocryptin (Midnight Orchid Glycoside Derivative)',
      toxicity_level: 'LETHAL_ACUTE_NEUROTOXIC',
      brewing_test: 'Kitchen teapot tested 100% pure; toxin added directly into cup post-delivery'
    }
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee02',
    case_id: CASE_DATA.id,
    code: 'EV-02',
    title: 'Fallen Bioluminescent Orchid Pollen Container',
    description: 'Shattered glass laboratory container spilled on the conservatory stone floor. Emits an intense bioluminescent blue glow under ambient darkness. The jar belongs to the B-Wing extraction laboratory inventory.',
    evidence_type: 'physical_trace',
    media_url: '/evidence/fallen-orchid-pollen.jpg',
    display_order: 2,
    metadata: {
      specimen: 'Midnight Orchid (Orchidaceae caerulea nocturna) Pollen',
      fluorescence: '470nm Bioluminescent Blue',
      origin: 'B-Wing Laboratory Extraction Bench #2',
      context: 'Dropped and shattered during the struggle or collapse'
    }
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee03',
    case_id: CASE_DATA.id,
    code: 'EV-03',
    title: 'Discarded Latex Gloves & Stained Tissue',
    description: 'Recovered from the waste container inside the B-Wing Preparation Laboratory at 11:35 PM. Contains discarded latex examination gloves and crumpled laboratory tissue glowing vividly with bioluminescent blue orchid pollen.',
    evidence_type: 'physical_trace',
    media_url: '/evidence/discarded-gloves.jpg',
    display_order: 3,
    metadata: {
      location: 'B-Wing Prep Lab Floor Waste Bin',
      time_discovered: '23:35:00',
      substance_detected: 'Bioluminescent Orchid Pollen Residue & Cyanocryptin',
      glove_size: 'Size Small (Matching Dr. Evelyn Hayes hand size)'
    }
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee04',
    case_id: CASE_DATA.id,
    code: 'EV-04',
    title: 'Left-Handed Blue Pollen Smudge on Lab Faucet',
    description: 'Forensic UV inspection of the B-Wing Prep Lab stainless steel sink revealed a clear smudge of glowing blue orchid pollen on the left-side faucet handle. Proves the individual who washed their hands was left-handed.',
    evidence_type: 'physical_trace',
    media_url: '/evidence/faucet-blue-smudge.jpg',
    display_order: 4,
    metadata: {
      fixture: 'Prep Lab Sink Left Water Valve Handle',
      orientation: 'Left-handed downward thumb grip',
      fluorescence_match: 'Midnight Orchid bioluminescent pollen',
      forensic_significance: 'Dr. Evelyn Hayes is left-handed; writes and handles gear with left hand'
    }
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee05',
    case_id: CASE_DATA.id,
    code: 'EV-05',
    title: 'B-Wing Lab Terminal Access Log Discrepancy',
    description: 'Digital access log from the B-Wing Preparation Lab workstation. Shows keycard swipe at 10:58 PM by Dr. Evelyn Hayes, followed by complete inactivity: zero keyboard strokes, zero instrument readings between 11:00 PM and 11:22 PM.',
    evidence_type: 'access_log',
    media_url: '/evidence/lab-keycard-log.jpg',
    display_order: 5,
    metadata: {
      last_keycard_swipe: '22:58:00 (Dr. Evelyn Hayes)',
      idle_window: '23:00:00 - 23:22:00 (NO ACTIVITY LOGGED)',
      alibi_status: 'CONTRADICTED: Lab was vacant during the time of murder',
      corroboration: 'Matches CAM 3 & CAM 4 corridor timestamps'
    }
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee06',
    case_id: CASE_DATA.id,
    code: 'EV-06',
    title: 'Unbroken Frost & Inside Deadbolt on Side Service Door',
    description: 'Inspection of the conservatory exterior side service door. A heavy brass deadbolt was locked firmly from the INSIDE. An undisturbed layer of crystalline frost sealed the bottom threshold, proving the door was not opened all evening.',
    evidence_type: 'physical_trace',
    media_url: '/evidence/brass-deadbolt.jpg',
    display_order: 6,
    metadata: {
      deadbolt_state: 'LOCKED FROM INSIDE (Brass cylinder engaged)',
      threshold_frost: 'CONTINUOUS UNBROKEN FROST LAYER',
      deduction: 'Nobody entered or exited through the side service door',
      red_herring_target: 'Exonerates Victor Thorne of entering the conservatory'
    }
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee07',
    case_id: CASE_DATA.id,
    code: 'EV-07',
    title: 'Scrap of Dark Green Tartan Fabric',
    description: 'A shredded piece of wool tartan textile snagged on the OUTSIDE door handle of the conservatory side service door. Matches the dark green tartan blazer worn by Victor Thorne during his 10:50 PM locked attempt.',
    evidence_type: 'physical_trace',
    media_url: '/evidence/green-tartan-handle.jpg',
    display_order: 7,
    metadata: {
      location: 'Exterior side door brass pull handle',
      textile_weave: 'Scottish wool dark green tartan twill',
      suspect_match: 'Victor Thorne blazer fabric',
      context: 'Snagged when Victor pulled the locked door at 10:50 PM; he never gained entry'
    }
  },
  {
    id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee08',
    case_id: CASE_DATA.id,
    code: 'EV-08',
    title: 'Melted Brown Snow-Boot Footprints',
    description: 'Footprints near the conservatory exterior heater vent. Forensic observation confirms the snow-boot impressions have completely melted and dried at the perimeter edges, indicating they were formed more than 20 minutes before 11:30 PM.',
    evidence_type: 'physical_trace',
    media_url: '/evidence/melted-footprints.jpg',
    display_order: 8,
    metadata: {
      location: 'Exterior snow path near heater ventilation intake',
      drying_analysis: 'Edges fully desiccated and evaporated (> 20 mins prior to discovery)',
      tread_pattern: 'Shearling winter boot (matching Clara Sterling heater check at 11:05 PM)',
      conclusion: 'Tracks are from earlier routine maintenance; no fresh intrusion tracks'
    }
  }
];

export const CCTV_FEEDS: CCTVFeed[] = [
  {
    id: 'cctv-1',
    camCode: 'CAM-01',
    title: 'Conservatory Hall & Lobby Bar Inset',
    location: 'Conservatory Main Hall / Lobby Bar',
    videoUrl: '/video/cam1-tea-delivery.mp4',
    posterUrl: '/cctv/cam1-conservatory-hall.jpg',
    timestamp: '23:00:00',
    status: 'RECORDING',
    hotspots: [
      {
        x: 32,
        y: 45,
        title: 'Chef Marco Tea Service (11:00 PM)',
        description: 'Chef Marco carries fresh Earl Grey tea on a tray to Dr. Vance. Tea was brewed pure in kitchen.',
        clueCode: 'EV-01'
      },
      {
        x: 62,
        y: 35,
        title: 'Lobby Bar Camera Inset (11:00–11:25 PM)',
        description: 'Victor Thorne seated at the hotel Lobby Bar with a whiskey, confirming his presence away from the crime scene.',
        clueCode: 'EV-06'
      }
    ]
  },
  {
    id: 'cctv-2',
    camCode: 'CAM-02',
    title: 'Main Entrance & Heater Check',
    location: 'Conservatory South Entrance',
    videoUrl: '/video/cam2-heater-check.mp4',
    posterUrl: '/cctv/cam2-main-entrance.jpg',
    timestamp: '23:05:00',
    status: 'RECORDING',
    hotspots: [
      {
        x: 48,
        y: 50,
        title: 'Clara Sterling Entry (11:05 PM)',
        description: 'Clara enters wearing navy sweater and winter boots to inspect the heater radiator valve.',
        clueCode: 'EV-08'
      },
      {
        x: 82,
        y: 42,
        title: 'Dr. Arthur Vance Alive (11:05 PM)',
        description: 'Dr. Vance seated at table, conscious and waving to Clara. Proves victim was alive and healthy at 11:05 PM.',
        clueCode: 'EV-01'
      }
    ]
  },
  {
    id: 'cctv-3',
    camCode: 'CAM-03',
    title: 'B-Wing Corridor North',
    location: 'B-Wing Corridor to Service Passage',
    videoUrl: '/video/cam3-bwing-passage.mp4',
    posterUrl: '/cctv/cam3-b-wing-corridor.jpg',
    timestamp: '23:12:00',
    status: 'RECORDING',
    hotspots: [
      {
        x: 45,
        y: 48,
        title: 'Dr. Evelyn Hayes Corridor Transit (11:12 PM)',
        description: 'Evelyn wearing mustard cardigan and apron walking rapidly toward the Conservatory Service Passage.',
        clueCode: 'EV-05'
      },
      {
        x: 75,
        y: 40,
        title: 'Conservatory Service Passage Door',
        description: 'Connecting doorway giving direct internal access from B-Wing chemical labs into the conservatory rear.',
        clueCode: 'EV-04'
      }
    ]
  },
  {
    id: 'cctv-4',
    camCode: 'CAM-04',
    title: 'B-Wing Corridor South',
    location: 'B-Wing Corridor from Service Passage',
    videoUrl: '/video/cam4-bwing-return.mp4',
    posterUrl: '/cctv/cam4-b-wing-corridor.jpg',
    timestamp: '23:18:00',
    status: 'RECORDING',
    hotspots: [
      {
        x: 52,
        y: 46,
        title: 'Evelyn Returning with Glowing Blue Bundle (11:18 PM)',
        description: 'Dr. Evelyn Hayes hurrying back from the Service Passage clutching a cloth glowing with bioluminescent orchid pollen.',
        clueCode: 'EV-03'
      },
      {
        x: 28,
        y: 35,
        title: 'B-Wing Prep Lab Door',
        description: 'Evelyn re-enters the Prep Lab at 11:18 PM to dispose of contaminated items and wash her hands.',
        clueCode: 'EV-05'
      }
    ]
  },
  {
    id: 'cctv-5',
    camCode: 'CAM-05',
    title: 'Side Service Door & Heater Vent',
    location: 'Conservatory Exterior West Wall',
    videoUrl: '/video/cam5-side-door.mp4',
    posterUrl: '/evidence/side-door-overview.jpg',
    timestamp: '23:25:00',
    status: 'RECORDING',
    hotspots: [
      {
        x: 68,
        y: 35,
        title: 'Heavy Brass Deadbolt',
        description: 'Heavy brass deadbolt engaged from the INSIDE. Door could not be opened from the outside.',
        clueCode: 'EV-06'
      },
      {
        x: 85,
        y: 38,
        title: 'Tartan Fabric on Outside Handle',
        description: 'Tartan scrap snagged on exterior handle when Victor tried the door at 10:50 PM. He never entered.',
        clueCode: 'EV-07'
      },
      {
        x: 75,
        y: 72,
        title: 'Melted Snow-Boot Footprints',
        description: 'Footprints dried and evaporated at edges >20 minutes before discovery. Matches Clara earlier maintenance.',
        clueCode: 'EV-08'
      }
    ]
  }
];

export const AUDIO_LOGS: AudioLog[] = [
  {
    id: 'aud-1',
    code: 'LOG-01',
    title: 'Tea Delivery Intercom (11:00 PM)',
    duration: '0:18',
    timestamp: '23:00:15',
    speaker: 'Chef Marco -> Dr. Vance',
    transcript: '“Your midnight Earl Grey tea, Dr. Vance.” “Thank you, Marco. Leave it on the saucer by the ledger.” [Porcelain cup placed on table; tea is pure].',
    synthesizedFrequency: 440
  },
  {
    id: 'aud-2',
    code: 'LOG-02',
    title: 'Heater Regulator Calibration (11:06 PM)',
    duration: '0:14',
    timestamp: '23:06:20',
    speaker: 'Clara Sterling (Acoustic Sensor)',
    transcript: '[Acoustic hum of hot-water radiator valve clicking into low-fan mode]. Clara: “Thermostat calibrated to 21°C. Have a good evening, Arthur.” “Goodnight, Clara.”',
    synthesizedFrequency: 330
  },
  {
    id: 'aud-3',
    code: 'LOG-03',
    title: 'Service Passage Mechanical Latch (11:14 PM)',
    duration: '0:12',
    timestamp: '23:14:05',
    speaker: 'Corridor Acoustic Sensor',
    transcript: '[Heavy steel service latch softly clicking open and shut between B-Wing corridor and conservatory rear flower beds].',
    synthesizedFrequency: 220
  },
  {
    id: 'aud-4',
    code: 'LOG-04',
    title: 'Shattered Glass & Wristwatch Impact (11:24 PM)',
    duration: '0:20',
    timestamp: '23:24:18',
    speaker: 'Conservatory Hall Acoustic Sensor',
    transcript: '[Muffled gasp. Teacup clattering against saucer. Glass pollen container shattering on stone tiles. Wristwatch crystal cracking against floor. Silence follows].',
    synthesizedFrequency: 520
  }
];

export const TIMELINE_EVENTS: TimelineEntry[] = [
  {
    timestamp: '22:50:00',
    timeCodeSeconds: 105000,
    location: 'Conservatory Exterior Path',
    title: 'Victor Thorne Attempts Side Service Door',
    detail: 'Victor attempts to open the exterior side door to speak with Dr. Vance. Finding it locked, his tartan jacket snags on the outer brass handle. He heads directly to the hotel bar.',
    involvedParty: 'Victor Thorne',
    sourceType: 'access',
    isAnomaly: false
  },
  {
    timestamp: '22:58:00',
    timeCodeSeconds: 105800,
    location: 'B-Wing Prep Lab Door',
    title: 'Dr. Evelyn Hayes Keycard Access',
    detail: 'Electronic keycard swipe registered for Dr. Evelyn Hayes at the B-Wing Preparation Lab entrance.',
    involvedParty: 'Dr. Evelyn Hayes',
    sourceType: 'access',
    isAnomaly: false
  },
  {
    timestamp: '23:00:00',
    timeCodeSeconds: 110000,
    location: 'Conservatory Hall & Lobby Bar',
    title: 'Tea Delivery & Lobby Bar Arrival (CAM 1)',
    detail: 'Chef Marco delivers a freshly brewed cup of Earl Grey tea to Dr. Vance. Simultaneously, Victor Thorne arrives at the hotel Lobby Bar (confirmed on supplementary camera feed).',
    involvedParty: 'Chef Marco / Victor Thorne',
    sourceType: 'cctv',
    isAnomaly: false
  },
  {
    timestamp: '23:03:00',
    timeCodeSeconds: 110300,
    location: 'Estate Kitchen Pantry',
    title: 'Chef Marco Returns to Kitchen',
    detail: 'Kitchen service security camera records Chef Marco returning to the kitchen prep area, where he remains for the night.',
    involvedParty: 'Chef Marco',
    sourceType: 'cctv',
    isAnomaly: false
  },
  {
    timestamp: '23:05:00',
    timeCodeSeconds: 110500,
    location: 'Conservatory Main Entrance',
    title: 'Clara Sterling Enters to Check Heater (CAM 2)',
    detail: 'Clara Sterling arrives through the main glass entrance to inspect the heating radiator. Dr. Vance is seen alive and conscious at his table, waving to her.',
    involvedParty: 'Clara Sterling / Dr. Arthur Vance',
    sourceType: 'cctv',
    isAnomaly: false
  },
  {
    timestamp: '23:08:00',
    timeCodeSeconds: 110800,
    location: 'Conservatory Main Entrance',
    title: 'Clara Sterling Exits via Main Entrance',
    detail: 'Having adjusted the temperature regulator to 21°C, Clara departs through the main entrance. No orchid pollen or disturbance observed.',
    involvedParty: 'Clara Sterling',
    sourceType: 'cctv',
    isAnomaly: false
  },
  {
    timestamp: '23:12:00',
    timeCodeSeconds: 111200,
    location: 'B-Wing Corridor North',
    title: 'Dr. Evelyn Hayes Approaches Service Passage (CAM 3)',
    detail: 'Dr. Evelyn Hayes is recorded walking down the B-Wing corridor toward the restricted Conservatory Service Passage, contradicting her statement of being in the lab.',
    involvedParty: 'Dr. Evelyn Hayes',
    sourceType: 'cctv',
    isAnomaly: true
  },
  {
    timestamp: '23:14:00',
    timeCodeSeconds: 111400,
    location: 'Conservatory Interior',
    title: 'Poison Introduced into Teacup',
    detail: 'Lethal Midnight Orchid toxic compound (Cyanocryptin) is introduced into Dr. Vance’s tea cup. During the tampering or sudden struggle, the pollen jar is knocked off the table.',
    involvedParty: 'Perpetrator / Dr. Arthur Vance',
    sourceType: 'telemetry',
    isAnomaly: true
  },
  {
    timestamp: '23:18:00',
    timeCodeSeconds: 111800,
    location: 'B-Wing Corridor South',
    title: 'Evelyn Returns with Glowing Orchid Cloth (CAM 4)',
    detail: 'CAM 4 captures Dr. Evelyn Hayes hurrying back from the Service Passage into the B-Wing Prep Lab clutching a cloth stained with glowing blue orchid material.',
    involvedParty: 'Dr. Evelyn Hayes',
    sourceType: 'cctv',
    isAnomaly: true
  },
  {
    timestamp: '23:20:00',
    timeCodeSeconds: 112000,
    location: 'B-Wing Prep Lab Sink & Waste Bin',
    title: 'Hand Washing & Glove Disposal',
    detail: 'Contaminated latex gloves and tissue are discarded into the lab waste bin. Hands washed at sink, leaving a left-handed blue pollen smudge on the left-side faucet handle.',
    involvedParty: 'Dr. Evelyn Hayes',
    sourceType: 'access',
    isAnomaly: true
  },
  {
    timestamp: '23:22:00',
    timeCodeSeconds: 112200,
    location: 'B-Wing Lab Workstation',
    title: 'Lab Workstation Activity Resumes',
    detail: 'Terminal log registers keyboard activity after 22 minutes of complete inactivity between 11:00 PM and 11:22 PM.',
    involvedParty: 'Dr. Evelyn Hayes',
    sourceType: 'access',
    isAnomaly: true
  },
  {
    timestamp: '23:24:00',
    timeCodeSeconds: 112400,
    location: 'Conservatory Floor',
    title: 'Dr. Arthur Vance Collapses (Fatal Toxin Reaction)',
    detail: 'Acute neurotoxic shock causes Dr. Vance to collapse. His wristwatch crystal shatters upon impacting the stone floor, freezing the hands at exactly 11:24 PM.',
    involvedParty: 'Dr. Arthur Vance (Victim)',
    sourceType: 'telemetry',
    isAnomaly: true
  },
  {
    timestamp: '23:30:00',
    timeCodeSeconds: 113000,
    location: 'Conservatory Main Entrance',
    title: 'Discovery of Deceased Victim by Staff',
    detail: 'Night security and estate staff discover Dr. Vance unresponsive on the floor. Wall clock shows 11:30 PM. Conservatory sealed for forensic investigation.',
    involvedParty: 'Staff / Emergency Personnel',
    sourceType: 'cctv',
    isAnomaly: true
  }
];
