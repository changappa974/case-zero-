# VIDEO ASSET SPECIFICATION & PRODUCTION PLAN
## PROJECT: CASE ZERO — THE 74-SECOND VANISHING

**Location:** Meridian Innovation Hall, University Technology Exhibition  
**Incident Window:** 20:14:12 – 20:15:26 (74 Seconds Duration)  
**Missing Asset:** Prototype AURORA (Student Emergency Communication Node)

---

### 1. OVERVIEW & CURRENT STATUS

The platform features a fully functional HTML5 multi-camera surveillance and cinematic replay engine with working zoom lens, speed control (0.5x–2x), rewind, frame inspection hotspots, and synchronized timecode overlays.

The application includes six genuine playable `.mp4` video files generated via OpenCV with authentic CCTV scanlines, camera grain, and HUD overlays. For cinematic AAA / Unreal Engine 5 production rendering, this document establishes the master prompt and sequencing plan.

---

### 2. VIDEO ASSETS SPECIFICATION

#### 1. Main Mystery Video (`/public/video/main-story.mp4`)
* **Duration:** 12 seconds (narrative summary sequence)
* **Aspect Ratio:** 16:9 Letterboxed (2.39:1 cinematic mask)
* **Resolution:** 1080p / 4K UHD 24fps
* **Audio Track:** Low-frequency suspense drone, electrical surge crackle, silence, restoration chime.
* **Timeline Events:**
  * `00:00 - 03:20`: Pedestal 01 in central exhibition hall. High-tech acrylic display housing AURORA. Amber LED pulsing at 58.2°C.
  * `03:21 - 04:20`: Sub-panel B-4 breaker trip. Fluorescent/halogen flicker and total localized blackout.
  * `04:21 - 08:20`: 74-second darkness. Security IR night vision mode. Subtle silhouette movement near corridor door.
  * `08:21 - 12:00`: Power restored. Acrylic casing door unlatched. Prototype missing. Red alert pulse.
* **UE5 Prompt:**
  > *Photorealistic 8k cinematic shot of a university innovation gallery at night. Polished black display pedestal with clear acrylic vitrine holding a sleek titanium electronic communicator. Amber LED pulsing on top panel. Dramatic overhead lighting suddenly flickers, sparks with blue electrical arc, and cuts to darkness. Camera shifts to night vision green-phosphor with motion blur. Power restores showing vitrine door open and empty pedestal. Unreal Engine 5, Lumen global illumination, anamorphic lens flare.*

---

#### 2. CAM-01: Main Exhibition Atrium (`/public/video/cam-01-atrium.mp4`)
* **Camera Location:** Ceiling Corner East, 4.5m elevation, wide 24mm surveillance lens.
* **Coverage:** Central pedestal zone, visitor walkway, Column C-2.
* **Key Visual Clues:**
  * Flashing amber warning indicator on AURORA prototype.
  * Reflection in glass partition showing Dev Malhotra standing stationary at Column C-2 with illuminated Sony camera LCD.
  * Sudden localized blackout at 20:14:12; lights return at 20:15:26.

---

#### 3. CAM-02: Reception & Entrance Lobby (`/public/video/cam-02-reception.mp4`)
* **Camera Location:** Above North Glass Turnstiles, 3.2m elevation.
* **Coverage:** Reception welcome desk, visitor registration log, key cabinet.
* **Key Visual Clues:**
  * Rhea Das (cream jacket, burgundy scarf) seen at counter until 20:12:30.
  * Desk remains vacant throughout the entire 20:14:12 – 20:15:26 outage window.
  * Rhea Das returns at 20:16:15 without addressing the missing prototype.

---

#### 4. CAM-03: Service Corridor West (`/public/video/cam-03-corridor.mp4`)
* **Camera Location:** Junction Corridor B-4, 2.8m elevation.
* **Coverage:** Service Corridor, Door B-4 (Sub-Panel threshold), hallway to Room S-102.
* **Key Visual Clues:**
  * At 20:14:12: Door B-4 slightly ajar.
  * At 20:14:48 (mid-blackout): Person in cream wool jacket and burgundy scarf rapidly walks past camera carrying a black padded thermal transport case.
  * Direct match to Rhea Das attire and belongings.

---

#### 5. CAM-04: Sub-Station & Generator Room (`/public/video/cam-04-substation.mp4`)
* **Camera Location:** Basement Level -1 Industrial Corridor, 3.0m elevation.
* **Coverage:** Backup diesel generators, primary 415V 3-phase switchboard.
* **Key Visual Clues:**
  * Kabir Rao (charcoal utility jacket, orange reflective accents, shoulder radio) visible at primary telemetry console.
  * Main grid voltmeter displays stable 415V with zero drop.
  * Proves the blackout was purely localized to sub-panel B-4, ruling out building-wide grid failure.

---

#### 6. CAM-05: Restricted Safety Vault Door S-102 (`/public/video/cam-05-vault.mp4`)
* **Camera Location:** Vault Vestibule, 2.5m elevation.
* **Coverage:** Heavy steel climate vault door (Room S-102) with mechanical dual lock.
* **Key Visual Clues:**
  * Amber vault status beacon active.
  * At 20:15:02, physical brass Key #04 operates lock cylinder.
  * Confirms prototype was placed safely inside the climate-controlled safety vault to prevent battery explosion.

---

### 3. CHARACTER APPAREL & CONTINUITY MATRIX

| Suspect | Official Role | Attire (Consistent Across All Feeds) | Verified Belongings |
| :--- | :--- | :--- | :--- |
| **Mira Sen** | Project Leader | Tailored navy blazer, white collared shirt, silver lapel pin | 15" silver laptop, presentation clicker |
| **Kabir Rao** | Tech Ops Assistant | Charcoal utility jacket, orange high-vis bands | Digital multimeter, master key, rugged tablet |
| **Rhea Das** | Event Coordinator | Tailored cream wool jacket, burgundy silk scarf | Brass key ring (Key #04), schedule clipboard |
| **Dev Malhotra** | Visiting Evaluator | Dark olive green field jacket, dark sweater | Sony A7 camera with leather cross-body strap |
