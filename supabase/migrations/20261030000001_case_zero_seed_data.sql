-- ==============================================================================
-- CASE ZERO: THE VISUAL MYSTERY CHALLENGE — SEED DATA
-- Migration: 20261030000001_case_zero_seed_data.sql
-- Description: Seeds the core mystery case, four suspects, full evidence registry,
--              and the protected server-side solution record.
-- ==============================================================================

DO $$
DECLARE
    v_case_id UUID;
    v_mira_id UUID := gen_random_uuid();
    v_kabir_id UUID := gen_random_uuid();
    v_rhea_id UUID := gen_random_uuid();
    v_dev_id UUID := gen_random_uuid();
BEGIN
    -- 1. Insert Mystery Case
    INSERT INTO public.mystery_cases (
        id,
        slug,
        title,
        tagline,
        description,
        incident_time,
        location,
        published
    ) VALUES (
        gen_random_uuid(),
        'the-74-second-vanishing',
        'CASE ZERO: The 74-Second Vanishing',
        'Every Detail Tells a Story. Can You Find the Truth?',
        'During the Meridian Innovation Hall annual tech exhibition, the prize prototype AURORA — a next-generation emergency communication unit — vanished from its locked display case during a localized 74-second lighting interruption between 20:14:12 and 20:15:26. Four individuals had physical proximity and motive.',
        '20:14:12 – 20:15:26 (74 Seconds Duration)',
        'Meridian Innovation Hall — University Research Centre',
        true
    ) RETURNING id INTO v_case_id;

    -- 2. Insert Suspects
    -- Suspect 1: Mira Sen
    INSERT INTO public.suspects (
        id,
        case_id,
        display_name,
        role,
        portrait_url,
        public_profile,
        display_order
    ) VALUES (
        v_mira_id,
        v_case_id,
        'Mira Sen',
        'Project Leader & Lead Hardware Architect',
        '/suspects/mira-sen.jpg',
        jsonb_build_object(
            'background', 'Final-year Robotics PhD candidate and principal designer of Project AURORA. Extremely protective of the hardware architecture.',
            'clothing', 'Tailored navy blazer over crisp collared shirt, silver university emblem lapel pin, minimalist wristwatch.',
            'belongings', 'Silver 15-inch ultra-thin laptop, encrypted biometric drive, presentation clicker.',
            'statement', 'I was on the main auditorium stage presenting the AURORA emergency transmission architecture to industry sponsors from 20:05 until 20:22. The stage lighting flickered briefly at 20:14, but my presentation feed never stopped.',
            'alibi', 'Main Stage livestream recording shows her on camera continuously from 20:05:30 to 20:21:40 without leaving the podium.',
            'possible_motive', 'Speculation that she feared the hardware evaluation benchmarks would fail during live inspection.'
        ),
        1
    );

    -- Suspect 2: Kabir Rao
    INSERT INTO public.suspects (
        id,
        case_id,
        display_name,
        role,
        portrait_url,
        public_profile,
        display_order
    ) VALUES (
        v_kabir_id,
        v_case_id,
        'Kabir Rao',
        'Technical Operations Assistant',
        '/suspects/kabir-rao.jpg',
        jsonb_build_object(
            'background', 'Senior electrical engineering technician responsible for exhibition hall power grids, sub-stations, and secondary emergency generators.',
            'clothing', 'Charcoal heavy-duty utility jacket with orange high-visibility reflective bands on chest and sleeves, utility belt, two-way radio clip on left shoulder.',
            'belongings', 'Digital multimeter, master electrical isolation key, rugged tablet displaying grid telemetry.',
            'statement', 'I received a power anomaly notification at 20:11 on sub-grid B. I was in the basement generator room conducting load monitoring on the backup diesel generators between 20:10 and 20:20.',
            'alibi', 'Basement power station access log confirms keycard swipe at 20:10:04 and exit at 20:21:15. Generator telemetry logs corroborate manual load testing during that period.',
            'possible_motive', 'Had voiced complaints regarding budget cuts to the electrical infrastructure team and previous conflicts with the university administration.'
        ),
        2
    );

    -- Suspect 3: Rhea Das
    INSERT INTO public.suspects (
        id,
        case_id,
        display_name,
        role,
        portrait_url,
        public_profile,
        display_order
    ) VALUES (
        v_rhea_id,
        v_case_id,
        'Rhea Das',
        'Event Coordinator',
        '/suspects/rhea-das.jpg',
        jsonb_build_object(
            'background', 'Lead Event Coordinator managing facility schedules, guest access, vendor security, and emergency safety protocols across Meridian Innovation Hall.',
            'clothing', 'Cream tailored wool jacket, distinctive burgundy silk scarf, dark trousers, low leather boots.',
            'belongings', 'Clip-on coordinator lanyard, brass key ring with physical mechanical emergency safety keys (including Key #04), tablet with schedule logs.',
            'statement', 'I was stationed at the reception welcome desk near the main glass entrance welcoming VIP guests and answering media inquiries throughout the entire evening.',
            'alibi', 'Reception desk CCTV shows her at the desk until 20:12:30. Between 20:13:00 and 20:16:15, the reception desk is vacant in camera coverage.',
            'possible_motive', 'High institutional pressure to ensure the exhibition had zero public safety incidents or reputational scandals.'
        ),
        3
    );

    -- Suspect 4: Dev Malhotra
    INSERT INTO public.suspects (
        id,
        case_id,
        display_name,
        role,
        portrait_url,
        public_profile,
        display_order
    ) VALUES (
        v_dev_id,
        v_case_id,
        'Dev Malhotra',
        'Visiting Evaluator & Tech Journalist',
        '/suspects/dev-malhotra.jpg',
        jsonb_build_object(
            'background', 'Senior technical evaluator and freelance photojournalist covering emerging innovations for regional tech consortiums.',
            'clothing', 'Dark olive green field jacket over a charcoal crewneck sweater, dark denim jeans.',
            'belongings', 'Sony A7 IV full-frame mirrorless camera with 24-70mm GM lens on leather cross-body strap, padded ballistic nylon lens bag.',
            'statement', 'I was in the main atrium taking architectural and exhibit photos near the central installation. When the lights went out, I stood still near column C-2 to avoid bumping into glass exhibits.',
            'alibi', 'Atrium wide-angle camera (CAM-01) timestamped footage shows his camera screen illuminated near column C-2 during the entire 74 seconds of dark lighting.',
            'possible_motive', 'Accused in prior industry circles of industrial espionage and attempting to leak proprietary hardware schematics.'
        ),
        4
    );

    -- 3. Insert Evidence Registry
    -- EV-01: Thermal Telemetry Log
    INSERT INTO public.evidence (
        case_id,
        code,
        title,
        description,
        evidence_type,
        media_url,
        metadata,
        display_order
    ) VALUES (
        v_case_id,
        'EV-01',
        'AURORA Prototype Thermal Telemetry Log',
        'Internal lithium battery temperature sensor telemetry extracted from the exhibition pedestal receiver. Shows battery cell temperature surging from normal 31.4°C at 20:00 to critical thermal runaway threshold of 58.2°C at 20:13:05, triggering an amber warning indicator on the device chassis.',
        'telemetry',
        '/evidence/ev-01-thermal-telemetry.jpg',
        jsonb_build_object(
            'source', 'AURORA Telemetry Bus 0x4A',
            'critical_timestamp', '20:13:05',
            'metric', '58.2°C (Safe threshold: < 45.0°C)',
            'indicator_state', 'AMBER_PULSE_WARNING'
        ),
        1
    );

    -- EV-02: Circuit Breaker Sub-Panel B-4 Log
    INSERT INTO public.evidence (
        case_id,
        code,
        title,
        description,
        evidence_type,
        media_url,
        metadata,
        display_order
    ) VALUES (
        v_case_id,
        'EV-02',
        'Sub-Panel B-4 Circuit Breaker Isolation Log',
        'Building management electrical system log. At exactly 20:14:12, Breaker switch B-4 controlling the central exhibition pedestal illumination and charging dock was manually toggled OFF, and restored manually at 20:15:26 (elapsed duration: exactly 74 seconds).',
        'access_log',
        '/evidence/ev-02-circuit-breaker.jpg',
        jsonb_build_object(
            'panel', 'Sub-Panel B-4 (Corridor West)',
            'trip_time', '20:14:12.108',
            'restore_time', '20:15:26.412',
            'duration', '74.3 seconds',
            'type', 'MANUAL_OVERRIDE_TOGGLE'
        ),
        2
    );

    -- EV-03: Primary Generator Load Telemetry
    INSERT INTO public.evidence (
        case_id,
        code,
        title,
        description,
        evidence_type,
        media_url,
        metadata,
        display_order
    ) VALUES (
        v_case_id,
        'EV-03',
        'Primary Backup Generator Load Telemetry',
        'Main power station telemetry verified by Kabir Rao in the basement. Confirms the campus municipal grid and primary transformers never suffered a blackout. The power outage was purely isolated to sub-panel B-4 in the exhibition gallery.',
        'telemetry',
        '/evidence/ev-03-generator-load.jpg',
        jsonb_build_object(
            'station', 'Sub-Station Level -1',
            'grid_voltage', '415V 3-Phase Stable',
            'diesel_status', 'STANDBY_READY',
            'conclusion', 'No building-wide grid failure'
        ),
        3
    );

    -- EV-04: CAM-03 Corridor CCTV Frame (20:14:48)
    INSERT INTO public.evidence (
        case_id,
        code,
        title,
        description,
        evidence_type,
        media_url,
        metadata,
        display_order
    ) VALUES (
        v_case_id,
        'EV-04',
        'CAM-03 Service Corridor CCTV Frame (20:14:48)',
        'Security camera footage from the restricted service corridor during the lighting blackout. Shows an individual wearing a tailored cream jacket and burgundy scarf rapidly walking towards the Emergency Climate Safety Vault carrying a padded thermal protective transport case.',
        'cctv_frame',
        '/evidence/ev-04-cctv-corridor.jpg',
        jsonb_build_object(
            'camera', 'CAM-03 Service Corridor West',
            'timecode', '20:14:48',
            'apparel_observed', 'Cream wool jacket, burgundy scarf',
            'carried_item', 'Padded thermal transport carrier'
        ),
        4
    );

    -- EV-05: Climate Safety Vault Access & Key Register
    INSERT INTO public.evidence (
        case_id,
        code,
        title,
        description,
        evidence_type,
        media_url,
        metadata,
        display_order
    ) VALUES (
        v_case_id,
        'EV-05',
        'Emergency Climate Safety Vault Mechanical Key Register',
        'Log book for Room S-102 (Restricted Climate-Controlled Safety Vault). Mechanical lock cylinder #04 was operated at 20:15:02. Physical brass Key #04 was officially assigned and checked out to Event Coordinator Rhea Das for rapid response hazard containment.',
        'access_log',
        '/evidence/ev-05-vault-access.jpg',
        jsonb_build_object(
            'vault_location', 'Room S-102 Climate Vault',
            'lock_operated', '20:15:02',
            'key_id', 'Brass Key #04',
            'authorized_holder', 'Rhea Das (Event Coordinator)'
        ),
        5
    );

    -- EV-06: Main Auditorium Stage Livestream Recording
    INSERT INTO public.evidence (
        case_id,
        code,
        title,
        description,
        evidence_type,
        media_url,
        metadata,
        display_order
    ) VALUES (
        v_case_id,
        'EV-06',
        'Main Auditorium Stage Livestream Timecode',
        'Official broadcast recording from the university main stage. Proves Mira Sen was on camera speaking to sponsors from 20:05:30 to 20:21:40 without interruption. Her laptop stayed on the lectern projecting slides.',
        'statement_contradiction',
        '/evidence/ev-06-stage-livestream.jpg',
        jsonb_build_object(
            'stage_camera', 'BROADCAST_CAM_A',
            'speaker', 'Mira Sen',
            'active_timeframe', '20:05:30 – 20:21:40',
            'alibi_status', 'CONFIRMED_ALIBI'
        ),
        6
    );

    -- EV-07: Dev Malhotra Sony A7 Timestamped Camera Metadata
    INSERT INTO public.evidence (
        case_id,
        code,
        title,
        description,
        evidence_type,
        media_url,
        metadata,
        display_order
    ) VALUES (
        v_case_id,
        'EV-07',
        'Photojournalist Camera EXIF & Atrium CCTV Match',
        'Forensic analysis of Dev Malhotra camera memory card. Frame DSC04192 (20:14:05), DSC04193 (20:14:40), and DSC04194 (20:15:15) show continuous long-exposure captures of the dark atrium, matching his position at column C-2 on CAM-01 reflection.',
        'statement_contradiction',
        '/evidence/ev-07-camera-exif.jpg',
        jsonb_build_object(
            'device', 'Sony ILCE-7M4',
            'exif_timestamps', '20:14:05, 20:14:40, 20:15:15',
            'matching_position', 'Column C-2',
            'alibi_status', 'CONFIRMED_ALIBI'
        ),
        7
    );

    -- EV-08: Pedestal Glass Micro-Fiber Trace & Brass Key Scuff
    INSERT INTO public.evidence (
        case_id,
        code,
        title,
        description,
        evidence_type,
        media_url,
        metadata,
        display_order
    ) VALUES (
        v_case_id,
        'EV-08',
        'Exhibition Pedestal Physical Forensic Trace',
        'Forensic inspection of the AURORA pedestal display case. Reveals microscopic burgundy silk textile fibers on the left acrylic hinge latch, and a hairline brass scuff mark on the base locking screw matching a brass keyring tag.',
        'physical_trace',
        '/evidence/ev-08-pedestal-trace.jpg',
        jsonb_build_object(
            'location', 'Pedestal Case Hinge Latch',
            'materials_found', 'Burgundy silk fiber, brass metallic transfer',
            'match_source', 'Rhea Das burgundy silk scarf & brass key ring'
        ),
        8
    );

    -- 4. Insert Protected Server-Side Solution (IN ACCORDANCE WITH SECTION 6)
    -- NEVER EXPOSED VIA PUBLIC API OR FRONTEND CODE
    INSERT INTO public.case_solutions (
        case_id,
        culprit_suspect_id,
        culprit_name,
        required_evidence_codes,
        solution_explanation,
        motive_summary,
        scoring_rubric
    ) VALUES (
        v_case_id,
        v_rhea_id,
        'Rhea Das',
        ARRAY['EV-01', 'EV-02', 'EV-04', 'EV-05', 'EV-08'],
        'Rhea Das discovered at 20:13 that the AURORA prototype battery telemetry had surged to 58.2°C (exceeding safe operating threshold of 45°C), risking catastrophic thermal runaway and explosion. As Event Coordinator responsible for venue safety, she decided to rapidly secure the device. To safely decouple the charging current without triggering loud hall alarms, she manually tripped isolated Sub-Panel B-4 at 20:14:12, creating a 74-second blackout around the central exhibition pedestal. She used her assigned brass Key #04 to unlock the display case and transported the prototype in a padded thermal case into the emergency climate-controlled safety vault (Room S-102) at 20:15:02, before returning and restoring the breaker at 20:15:26. She did not intend to steal the prototype, but concealed her involvement to avoid panic, embarrassment, and disruption to the high-stakes exhibition.',
        'Preemptive safety containment of overheating lithium battery without causing public panic or disrupting the annual exhibition.',
        jsonb_build_object(
            'suspect_points', 40,
            'evidence_points_max', 30,
            'explanation_points_max', 30,
            'passing_score', 60
        )
    );

END $$;
