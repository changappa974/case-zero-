-- ==============================================================================
-- CASE ZERO: MURDER AT FROSTPEAK CONSERVATORY
-- Migration: 20261030000002_frostpeak_conservatory_case.sql
-- Description: Replaces the case data with "Murder at Frostpeak Conservatory",
--              four authentic suspects, eight forensic evidence records,
--              and the protected server-side solution and grading stored procedure.
-- ==============================================================================

DO $$
DECLARE
    v_case_id UUID := '221814d4-3cbf-42e9-a6cc-13efc373a1ae';
    v_clara_id UUID := '11111111-2222-3333-4444-555555555501';
    v_victor_id UUID := '11111111-2222-3333-4444-555555555502';
    v_evelyn_id UUID := '11111111-2222-3333-4444-555555555503';
    v_marco_id UUID := '11111111-2222-3333-4444-555555555504';
BEGIN
    -- 1. Update Mystery Case
    UPDATE public.mystery_cases
    SET
        slug = 'murder-at-frostpeak-conservatory',
        title = 'CASE ZERO: Murder at Frostpeak Conservatory',
        tagline = 'Every Detail Tells a Story. Can You Find the Truth?',
        description = 'Late at night inside Frostpeak Conservatory, an isolated glass botanical pavilion surrounded by snow-covered pine forests, founding botanist Dr. Arthur Vance is found dead on the stone floor. Surrounding the body are a cup of tea, shattered glasses, a stopped wristwatch, and a fallen glass container of glowing blue bioluminescent orchid pollen. Four individuals were present on the estate grounds during the critical hours between 10:50 PM and 11:30 PM. Reconstruct the CCTV surveillance feeds, examine forensic evidence, correlate contradictions, and expose who committed the murder.',
        incident_time = '2026-10-30 23:24:00 (Incident Window: 23:12 - 23:24)',
        location = 'Frostpeak Conservatory & B-Wing Laboratory',
        published = true
    WHERE id = v_case_id;

    -- If case did not exist, insert it
    IF NOT FOUND THEN
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
            v_case_id,
            'murder-at-frostpeak-conservatory',
            'CASE ZERO: Murder at Frostpeak Conservatory',
            'Every Detail Tells a Story. Can You Find the Truth?',
            'Late at night inside Frostpeak Conservatory, an isolated glass botanical pavilion surrounded by snow-covered pine forests, founding botanist Dr. Arthur Vance is found dead on the stone floor. Surrounding the body are a cup of tea, shattered glasses, a stopped wristwatch, and a fallen glass container of glowing blue bioluminescent orchid pollen. Four individuals were present on the estate grounds during the critical hours between 10:50 PM and 11:30 PM. Reconstruct the CCTV surveillance feeds, examine forensic evidence, correlate contradictions, and expose who committed the murder.',
            '2026-10-30 23:24:00 (Incident Window: 23:12 - 23:24)',
            'Frostpeak Conservatory & B-Wing Laboratory',
            true
        );
    END IF;

    -- 2. Clear old suspects and evidence for this case
    DELETE FROM public.evidence WHERE case_id = v_case_id;
    DELETE FROM public.case_solutions WHERE case_id = v_case_id;
    DELETE FROM public.suspects WHERE case_id = v_case_id;

    -- 3. Insert The Four Suspects
    INSERT INTO public.suspects (
        id,
        case_id,
        display_name,
        role,
        portrait_url,
        display_order,
        public_profile
    ) VALUES
    (
        v_clara_id,
        v_case_id,
        'Clara Sterling',
        'Botanical Assistant & Research Scholar',
        '/suspects/clara-sterling.jpg',
        1,
        jsonb_build_object(
            'background', 'Dedicated botanical research scholar working under Dr. Vance on cold-climate orchid hybridisation. Passionate about plant genetics.',
            'clothing', 'Red hair neatly tied in a bun, navy blue knitted wool sweater, beige cargo trousers, and brown shearling winter boots.',
            'belongings', 'Field sampling notebook, ballpoint pen, botanical tweezers, and thermal regulator checklist.',
            'statement', 'I checked the conservatory heater at 11:05 PM because the frost on the exterior glass was thickening. Dr. Vance was sitting at the table and waved to me. I adjusted the regulator valve and left by 11:08 PM through the main entrance.',
            'alibi', 'CAM 2 (Main Entrance) confirms her entry at 11:05 PM and shows Dr. Vance alive, waving from his table. Independent heater sensor log confirms temperature reset at 11:06 PM, and she departed at 11:08 PM.',
            'possible_motive', 'Rumors that Dr. Vance had published her breakthrough orchid hybridization findings under his sole name without giving her co-authorship.'
        )
    ),
    (
        v_victor_id,
        v_case_id,
        'Victor Thorne',
        'Rival Rare Flora Collector & Private Investor',
        '/suspects/victor-thorne.jpg',
        2,
        jsonb_build_object(
            'background', 'Wealthy private collector of rare botanical specimens and longtime rival of Dr. Vance. Eager to obtain proprietary Midnight Orchid stock.',
            'clothing', 'Distinguished elderly gentleman with silver hair, trimmed beard and moustache, dark green tartan blazer, white collared shirt, and formal trousers.',
            'belongings', 'Silver pocket lighter, engraved gold pocket watch, leather-bound auction catalog, and personal signet ring.',
            'statement', 'I walked around the conservatory grounds at 10:50 PM hoping to speak to Arthur Vance about purchasing a specimen cutting. I tried the exterior side service door, but it was firmly locked. Frustrated, I returned immediately to the hotel Lobby Bar where I drank until past 11:30 PM.',
            'alibi', 'Tried the locked side service door at 10:50 PM. Hotel Lobby Bar CCTV (supplementary feed on CAM 1) and bartender testimony confirm he was seated at the bar continuously from 11:00 PM to 11:25 PM.',
            'possible_motive', 'Desperately sought to acquire the exclusive patent and live specimen of the rare Midnight Orchid before Vance presented it to the Royal Academy.'
        )
    ),
    (
        v_evelyn_id,
        v_case_id,
        'Dr. Evelyn Hayes',
        'Conservatory Co-Owner & Senior Biochemist',
        '/suspects/evelyn-hayes.jpg',
        3,
        jsonb_build_object(
            'background', 'Co-owner of Frostpeak Conservatory and head of biochemical extraction. Has complete operational access to the B-Wing chemical laboratories.',
            'clothing', 'Short black bob haircut, mustard-yellow cardigan over a white laboratory apron, dark charcoal trousers, and burgundy leather shoes. Left-handed.',
            'belongings', 'B-Wing master electronic keycard, laboratory logbook, digital stopwatch, and latex examination gloves.',
            'statement', 'I was working entirely alone inside the B-Wing Preparation Laboratory from 11:00 PM until 11:25 PM preparing nutrient agar cultures. I never left the lab and saw nobody until staff discovered Arthur at 11:30 PM.',
            'alibi', 'Claims to have been inside B-Wing Prep Lab alone between 11:00 PM and 11:25 PM. Contradicted by digital access logs showing no keyboard or equipment activity between 11:00 PM and 11:22 PM, and CCTV showing corridor movements.',
            'possible_motive', 'Dr. Vance had discovered systematic embezzlement and falsification of university endowment funds in her laboratory accounts and was preparing a formal board audit.'
        )
    ),
    (
        v_marco_id,
        v_case_id,
        'Chef Marco',
        'Conservatory Head Chef & Estate Caterer',
        '/suspects/chef-marco.jpg',
        4,
        jsonb_build_object(
            'background', 'Head chef of the Frostpeak estate dining room and guest conservatory lodge for over eight years. Known for meticulous hospitality standards.',
            'clothing', 'Heavyset build, dark moustache, crisp white double-breasted chef uniform, and bright red neckerchief.',
            'belongings', 'Stainless steel serving tray, fine bone china teacup and teapot, estate pantry keys, and recipe index.',
            'statement', 'I delivered Dr. Vance his nightly pot of Earl Grey tea at 11:00 PM sharp. He was alive, seated at the wooden desk reviewing notes. I placed the cup and saucer before him, wished him good evening, and returned immediately to the kitchen to prep tomorrow morning bread.',
            'alibi', 'CAM 1 shows Chef Marco delivering tea at 11:00 PM. Kitchen service cameras confirm he returned to the kitchen pantry by 11:03 PM and remained there until after 11:35 PM.',
            'possible_motive', 'Dr. Vance had harshly reprimanded him over missing kitchen funds and threatened him with immediate termination without pension.'
        )
    );

    -- 4. Insert The Eight Evidence Items
    INSERT INTO public.evidence (
        id,
        case_id,
        code,
        title,
        description,
        evidence_type,
        media_url,
        display_order,
        metadata
    ) VALUES
    (
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee01',
        v_case_id,
        'EV-01',
        'Poisoned Teacup & Toxic Chemical Screen',
        'Fine porcelain teacup and saucer recovered directly beside the victim. Forensic chemical spectroscopy identified concentrated traces of Cyanocryptin, a lethal neurotoxic glycoside uniquely synthesized from the rare Midnight Orchid.',
        'physical_trace',
        '/evidence/poisoned-teacup.jpg',
        1,
        jsonb_build_object(
            'location', 'Floor tile directly adjacent to Dr. Vance right hand',
            'compound_identified', 'Cyanocryptin (Midnight Orchid Glycoside Derivative)',
            'toxicity_level', 'LETHAL_ACUTE_NEUROTOXIC',
            'brewing_test', 'Kitchen teapot tested 100% pure; toxin added directly into cup post-delivery'
        )
    ),
    (
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee02',
        v_case_id,
        'EV-02',
        'Fallen Bioluminescent Orchid Pollen Container',
        'Shattered glass laboratory container spilled on the conservatory stone floor. Emits an intense bioluminescent blue glow under ambient darkness. The jar belongs to the B-Wing extraction laboratory inventory.',
        'physical_trace',
        '/evidence/fallen-orchid-pollen.jpg',
        2,
        jsonb_build_object(
            'specimen', 'Midnight Orchid (Orchidaceae caerulea nocturna) Pollen',
            'fluorescence', '470nm Bioluminescent Blue',
            'origin', 'B-Wing Laboratory Extraction Bench #2',
            'context', 'Dropped and shattered during the struggle or collapse'
        )
    ),
    (
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee03',
        v_case_id,
        'EV-03',
        'Discarded Latex Gloves & Stained Tissue',
        'Recovered from the waste container inside the B-Wing Preparation Laboratory at 11:35 PM. Contains discarded latex examination gloves and crumpled laboratory tissue glowing vividly with bioluminescent blue orchid pollen.',
        'physical_trace',
        '/evidence/discarded-gloves.jpg',
        3,
        jsonb_build_object(
            'location', 'B-Wing Prep Lab Floor Waste Bin',
            'time_discovered', '23:35:00',
            'substance_detected', 'Bioluminescent Orchid Pollen Residue & Cyanocryptin',
            'glove_size', 'Size Small (Matching Dr. Evelyn Hayes hand size)'
        )
    ),
    (
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee04',
        v_case_id,
        'EV-04',
        'Left-Handed Blue Pollen Smudge on Lab Faucet',
        'Forensic UV inspection of the B-Wing Prep Lab stainless steel sink revealed a clear smudge of glowing blue orchid pollen on the left-side faucet handle. Proves the individual who washed their hands was left-handed.',
        'physical_trace',
        '/evidence/faucet-blue-smudge.jpg',
        4,
        jsonb_build_object(
            'fixture', 'Prep Lab Sink Left Water Valve Handle',
            'orientation', 'Left-handed downward thumb grip',
            'fluorescence_match', 'Midnight Orchid bioluminescent pollen',
            'forensic_significance', 'Dr. Evelyn Hayes is left-handed; write and handle gear with left hand'
        )
    ),
    (
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee05',
        v_case_id,
        'EV-05',
        'B-Wing Lab Terminal Access Log Discrepancy',
        'Digital access log from the B-Wing Preparation Lab workstation. Shows keycard swipe at 10:58 PM by Dr. Evelyn Hayes, followed by complete inactivity: zero keyboard strokes, zero instrument readings between 11:00 PM and 11:22 PM.',
        'access_log',
        '/evidence/lab-keycard-log.jpg',
        5,
        jsonb_build_object(
            'last_keycard_swipe', '22:58:00 (Dr. Evelyn Hayes)',
            'idle_window', '23:00:00 - 23:22:00 (NO ACTIVITY LOGGED)',
            'alibi_status', 'CONTRADICTED: Lab was vacant during the time of murder',
            'corroboration', 'Matches CAM 3 & CAM 4 corridor timestamps'
        )
    ),
    (
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee06',
        v_case_id,
        'EV-06',
        'Unbroken Frost & Inside Deadbolt on Side Service Door',
        'Inspection of the conservatory exterior side service door. A heavy brass deadbolt was locked firmly from the INSIDE. An undisturbed layer of crystalline frost sealed the bottom threshold, proving the door was not opened all evening.',
        'physical_trace',
        '/evidence/brass-deadbolt.jpg',
        6,
        jsonb_build_object(
            'deadbolt_state', 'LOCKED FROM INSIDE (Brass cylinder engaged)',
            'threshold_frost', 'CONTINUOUS UNBROKEN FROST LAYER',
            'deduction', 'Nobody entered or exited through the side service door',
            'red_herring_target', 'Exonerates Victor Thorne of entering the conservatory'
        )
    ),
    (
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee07',
        v_case_id,
        'EV-07',
        'Scrap of Dark Green Tartan Fabric',
        'A shredded piece of wool tartan textile snagged on the OUTSIDE door handle of the conservatory side service door. Matches the dark green tartan blazer worn by Victor Thorne during his 10:50 PM locked attempt.',
        'physical_trace',
        '/evidence/green-tartan-handle.jpg',
        7,
        jsonb_build_object(
            'location', 'Exterior side door brass pull handle',
            'textile_weave', 'Scottish wool dark green tartan twill',
            'suspect_match', 'Victor Thorne blazer fabric',
            'context', 'Snagged when Victor pulled the locked door at 10:50 PM; he never gained entry'
        )
    ),
    (
        'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeee08',
        v_case_id,
        'EV-08',
        'Melted Brown Snow-Boot Footprints',
        'Footprints near the conservatory exterior heater vent. Forensic observation confirms the snow-boot impressions have completely melted and dried at the perimeter edges, indicating they were formed more than 20 minutes before 11:30 PM.',
        'physical_trace',
        '/evidence/melted-footprints.jpg',
        8,
        jsonb_build_object(
            'location', 'Exterior snow path near heater ventilation intake',
            'drying_analysis', 'Edges fully desiccated and evaporated (> 20 mins prior to discovery)',
            'tread_pattern', 'Shearling winter boot (matching Clara Sterling heater check at 11:05 PM)',
            'conclusion', 'Tracks are from earlier routine maintenance; no fresh intrusion tracks'
        )
    );

    -- 5. Insert Protected Server-Side Solution
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
        v_evelyn_id,
        'Dr. Evelyn Hayes',
        ARRAY['EV-01', 'EV-03', 'EV-04', 'EV-05'],
        'Dr. Evelyn Hayes murdered Dr. Arthur Vance by introducing a lethal concentration of toxic Midnight Orchid compound (Cyanocryptin) into his tea. Vance had uncovered that Hayes had systematically embezzled institutional research grant funding and was preparing a formal audit. To silence him, Hayes left the B-Wing Prep Lab at 11:12 PM via the service passage (captured on CAM 3), entered the conservatory, poisoned the tea, causing the blue orchid pollen jar to shatter on the floor, and returned to the B-Wing corridor at 11:18 PM clutching a pollen-stained cloth (captured on CAM 4). She washed her hands in the lab sink, leaving a left-handed pollen smudge on the faucet handle, and discarded the contaminated gloves in the lab bin. Her alibi of working continuously in the lab from 11:00 PM to 11:25 PM is refuted by digital terminal logs showing zero activity between 11:00 PM and 11:22 PM.',
        'Concealing major research grant funding fraud after Dr. Vance uncovered her embezzlement and threatened a board audit.',
        jsonb_build_object(
            'correct_culprit_points', 40,
            'evidence_points_each', 7.5,
            'evidence_max_points', 30,
            'explanation_accuracy_max_points', 30,
            'pass_score_threshold', 70,
            'critical_clues', jsonb_build_array('EV-01', 'EV-03', 'EV-04', 'EV-05'),
            'red_herrings_exonerated', jsonb_build_array('Victor Thorne (Side door deadbolt locked from inside & unbroken frost)', 'Clara Sterling (Heater check at 11:05 PM, left by 11:08 PM)', 'Chef Marco (Tea delivered pure at 11:00 PM, returned to kitchen)')
        )
    );

END $$;

-- -----------------------------------------------------------------------------
-- 6. Update the Server-Side Scoring Function for Frostpeak Conservatory
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_investigation(
    p_session_id UUID,
    p_participant_id UUID,
    p_selected_suspect_id UUID,
    p_selected_evidence JSONB,
    p_incident_explanation TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_case_id UUID;
    v_solution RECORD;
    v_suspect RECORD;
    v_score INT := 0;
    v_suspect_match BOOLEAN := false;
    v_evidence_score INT := 0;
    v_explanation_score INT := 0;
    v_new_submission_id UUID;
    v_explanation_lower TEXT;
    v_eval_details JSONB;
BEGIN
    -- 1. Check if session exists and is active
    SELECT * INTO v_session
    FROM public.investigation_sessions
    WHERE id = p_session_id AND participant_id = p_participant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Investigation session not found or does not belong to participant.';
    END IF;

    IF v_session.status = 'submitted' THEN
        RAISE EXCEPTION 'Investigation has already been submitted and sealed. Modification is not permitted.';
    END IF;

    v_case_id := v_session.case_id;

    -- 2. Fetch the suspect details
    SELECT * INTO v_suspect
    FROM public.suspects
    WHERE id = p_selected_suspect_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Selected suspect not found in case database.';
    END IF;

    -- 3. Read secret solution (accessible only inside this SECURITY DEFINER function)
    SELECT * INTO v_solution
    FROM public.case_solutions
    WHERE case_id = v_case_id;

    -- 4. Calculate Score
    -- Part A: Correct suspect identified: Dr. Evelyn Hayes (40 points)
    IF v_solution.culprit_suspect_id = p_selected_suspect_id THEN
        v_suspect_match := true;
        v_score := v_score + 40;
    END IF;

    -- Part B: Critical evidence identified (up to 30 points)
    -- EV-01 (Poisoned teacup / toxin), EV-03 (Discarded gloves & tissue), EV-04 (Left-handed smudge), EV-05 (Keycard log discrepancy)
    IF p_selected_evidence @> '["EV-01"]'::jsonb OR p_selected_evidence @> '["E-01"]'::jsonb THEN
        v_evidence_score := v_evidence_score + 8;
    END IF;
    IF p_selected_evidence @> '["EV-03"]'::jsonb OR p_selected_evidence @> '["E-03"]'::jsonb THEN
        v_evidence_score := v_evidence_score + 8;
    END IF;
    IF p_selected_evidence @> '["EV-04"]'::jsonb OR p_selected_evidence @> '["E-04"]'::jsonb THEN
        v_evidence_score := v_evidence_score + 7;
    END IF;
    IF p_selected_evidence @> '["EV-05"]'::jsonb OR p_selected_evidence @> '["E-05"]'::jsonb THEN
        v_evidence_score := v_evidence_score + 7;
    END IF;
    IF v_evidence_score > 30 THEN
        v_evidence_score := 30;
    END IF;
    v_score := v_score + v_evidence_score;

    -- Part C: Explanation Analysis (up to 30 points)
    v_explanation_lower := lower(p_incident_explanation);
    
    -- Category 1: Identifies toxin / Midnight Orchid / poison in tea (10 points)
    IF v_explanation_lower ~ '(poison|toxin|orchid|midnight orchid|bioluminescent|blue pollen|cyanocryptin|tea)' THEN
        v_explanation_score := v_explanation_score + 10;
    END IF;

    -- Category 2: Identifies CCTV footage / corridor movements / false alibi (10 points)
    IF v_explanation_lower ~ '(alibi|cctv|cam 3|cam 4|cam3|cam4|corridor|service passage|contradict|11:12|11:18|cloth)' THEN
        v_explanation_score := v_explanation_score + 10;
    END IF;

    -- Category 3: Identifies fraud motive / left-handed smudge / gloves in bin (10 points)
    IF v_explanation_lower ~ '(fraud|fund|embezzle|audit|left-hand|left hand|faucet|gloves|smudge|sink|log|terminal)' THEN
        v_explanation_score := v_explanation_score + 10;
    END IF;

    IF v_explanation_score > 30 THEN
        v_explanation_score := 30;
    END IF;
    v_score := v_score + v_explanation_score;

    -- Cap total score at 100
    IF v_score > 100 THEN
        v_score := 100;
    END IF;

    -- 5. Build Evaluation Details (Safe for organizer inspection)
    v_eval_details := jsonb_build_object(
        'suspect_matched', v_suspect_match,
        'suspect_score', CASE WHEN v_suspect_match THEN 40 ELSE 0 END,
        'evidence_score', v_evidence_score,
        'explanation_score', v_explanation_score,
        'final_score', v_score,
        'evaluated_at', now()
    );

    -- 6. Insert Final Submission Record
    INSERT INTO public.case_zero_submissions (
        session_id,
        participant_id,
        case_id,
        selected_suspect_id,
        selected_suspect_name,
        supporting_evidence_codes,
        incident_explanation,
        score,
        evaluation_details,
        submission_status
    ) VALUES (
        p_session_id,
        p_participant_id,
        v_case_id,
        p_selected_suspect_id,
        v_suspect.display_name,
        p_selected_evidence,
        p_incident_explanation,
        v_score,
        v_eval_details,
        'verified'
    )
    RETURNING id INTO v_new_submission_id;

    -- 7. Lock session status to 'submitted'
    UPDATE public.investigation_sessions
    SET 
        status = 'submitted',
        stage_reached = 5,
        last_activity_at = now()
    WHERE id = p_session_id;

    -- 8. Return confirmation receipt to user
    -- Notice: The complete answer and server-side secret rubric are NEVER returned to participant
    RETURN jsonb_build_object(
        'success', true,
        'submission_id', v_new_submission_id,
        'confirmation_code', 'CZ-FROSTPEAK-' || UPPER(SUBSTRING(v_new_submission_id::text, 1, 8)),
        'submitted_at', now(),
        'status', 'INVESTIGATION SUBMITTED SUCCESSFULLY.'
    );
END;
$$;
