import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

OUTPUT_DIR = r"C:\Users\pramod kumar\.gemini\antigravity\scratch\case-zero\public"

def ensure_dirs():
    for d in ["suspects", "evidence", "cctv", "audio", "video"]:
        os.makedirs(os.path.join(OUTPUT_DIR, d), exist_ok=True)

def add_cinematic_noise(img, amount=0.04):
    arr = np.array(img).astype(np.float32)
    noise = np.random.normal(0, amount * 255, arr.shape)
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr)

def add_scanlines(img, line_spacing=4, opacity=25):
    draw = ImageDraw.Draw(img, "RGBA")
    w, h = img.size
    for y in range(0, h, line_spacing):
        draw.line([(0, y), (w, y)], fill=(0, 0, 0, opacity))
    return img

def create_cctv_overlay(draw, w, h, cam_id, label, timestamp, rec_dot=True):
    # Timecode and camera tag
    font_large = ImageFont.load_default()
    
    # Dark semi-transparent top bar
    draw.rectangle([(0, 0), (w, 38)], fill=(10, 10, 12, 180))
    draw.rectangle([(0, h - 30), (w, h)], fill=(10, 10, 12, 180))
    
    # REC blinking dot
    if rec_dot:
        draw.ellipse([(16, 13), (26, 23)], fill=(220, 38, 38, 255))
        draw.text((32, 12), "REC [LIVE 1080p 30fps]", fill=(240, 240, 240, 255), font=font_large)
    
    # Cam title
    draw.text((w // 2 - 120, 12), f"{cam_id} // {label.upper()}", fill=(245, 158, 11, 255), font=font_large)
    
    # Timestamp
    draw.text((w - 180, 12), f"2026-10-30 {timestamp}", fill=(240, 240, 240, 255), font=font_large)
    
    # Bottom tech info
    draw.text((16, h - 22), "MERIDIAN INNOVATION HALL SECURITY SYS V4.2 // ENCRYPTED NODE 08", fill=(156, 163, 175, 255), font=font_large)
    draw.text((w - 140, h - 22), "FEED ID: SEC-CAM-0" + cam_id[-1], fill=(156, 163, 175, 255), font=font_large)
    
    # Corner brackets
    col = (245, 158, 11, 160)
    b_len = 24
    # Top Left
    draw.line([(12, 46), (12 + b_len, 46)], fill=col, width=2)
    draw.line([(12, 46), (12, 46 + b_len)], fill=col, width=2)
    # Top Right
    draw.line([(w - 12, 46), (w - 12 - b_len, 46)], fill=col, width=2)
    draw.line([(w - 12, 46), (w - 12, 46 + b_len)], fill=col, width=2)
    # Bottom Left
    draw.line([(12, h - 38), (12 + b_len, h - 38)], fill=col, width=2)
    draw.line([(12, h - 38), (12, h - 38 - b_len)], fill=col, width=2)
    # Bottom Right
    draw.line([(w - 12, h - 38), (w - 12 - b_len, h - 38)], fill=col, width=2)
    draw.line([(w - 12, h - 38), (w - 12, h - 38 - b_len)], fill=col, width=2)

def generate_dev_malhotra_portrait():
    w, h = 800, 1000
    img = Image.new("RGB", (w, h), (18, 20, 24))
    draw = ImageDraw.Draw(img)
    
    # Background: moody dark exhibition hall with bokeh gradient
    for y in range(h):
        r = int(14 + (y / h) * 12)
        g = int(18 + (y / h) * 16)
        b = int(24 + (y / h) * 20)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
        
    # Subtle bokeh circles in background
    for _ in range(14):
        bx = random.randint(50, w - 50)
        by = random.randint(50, 400)
        br = random.randint(40, 120)
        col = random.choice([
            (30, 50, 45, 40),
            (210, 160, 40, 30),
            (25, 40, 60, 40)
        ])
        b_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        b_draw = ImageDraw.Draw(b_img)
        b_draw.ellipse([(bx - br, by - br), (bx + br, by + br)], fill=col)
        b_img = b_img.filter(ImageFilter.GaussianBlur(18))
        img.paste(b_img, (0, 0), b_img)
    
    # Shoulders / Olive green jacket
    # Torso
    draw.polygon([
        (160, 1000), (220, 680), (320, 600), (480, 600), (580, 680), (640, 1000)
    ], fill=(32, 44, 34)) # dark olive green
    
    # Jacket lapels and collar
    draw.polygon([(310, 600), (400, 780), (490, 600), (400, 660)], fill=(24, 34, 26))
    # Inner charcoal sweater
    draw.polygon([(360, 640), (440, 640), (400, 730)], fill=(36, 38, 42))
    
    # Camera leather strap diagonal
    draw.polygon([
        (260, 620), (290, 610), (540, 1000), (510, 1000)
    ], fill=(88, 52, 28)) # leather brown strap
    draw.polygon([
        (268, 625), (282, 618), (532, 1000), (518, 1000)
    ], fill=(110, 68, 36)) # strap highlight
    
    # Neck
    draw.rectangle([(365, 480), (435, 620)], fill=(168, 124, 96)) # skin tone
    
    # Head contour
    draw.ellipse([(290, 220), (510, 520)], fill=(188, 142, 112)) # base face skin
    
    # Forehead shadow / lighting
    f_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    f_draw = ImageDraw.Draw(f_img)
    # Rim light on left cheek and hair
    f_draw.ellipse([(285, 215), (420, 480)], fill=(215, 175, 140, 90))
    # Ambient shadow on right
    f_draw.ellipse([(430, 260), (520, 520)], fill=(60, 35, 20, 80))
    f_img = f_img.filter(ImageFilter.GaussianBlur(12))
    img.paste(f_img, (0, 0), f_img)
    
    # Modern styled dark hair
    draw = ImageDraw.Draw(img)
    draw.polygon([
        (280, 310), (275, 240), (320, 180), (400, 165), (480, 185), (515, 240), (520, 310),
        (500, 260), (440, 230), (360, 235), (300, 270)
    ], fill=(22, 22, 24))
    
    # Trimmed beard & jawline
    draw.polygon([
        (310, 420), (330, 490), (400, 540), (470, 490), (490, 420),
        (470, 450), (440, 485), (400, 500), (360, 485), (330, 450)
    ], fill=(30, 28, 28))
    # Stubble gradient
    draw.ellipse([(340, 450), (460, 530)], fill=(50, 40, 35))
    
    # Mustache
    draw.polygon([(365, 442), (400, 440), (435, 442), (400, 452)], fill=(28, 26, 26))
    
    # Eyebrows
    draw.polygon([(325, 335), (380, 328), (385, 338), (330, 345)], fill=(26, 24, 24))
    draw.polygon([(415, 328), (470, 335), (465, 345), (420, 338)], fill=(26, 24, 24))
    
    # Eyes - analytical and observant
    # Sclera
    draw.ellipse([(335, 348), (375, 368)], fill=(228, 226, 224))
    draw.ellipse([(420, 348), (460, 368)], fill=(228, 226, 224))
    # Iris dark brown
    draw.ellipse([(348, 350), (368, 367)], fill=(55, 38, 28))
    draw.ellipse([(428, 350), (448, 367)], fill=(55, 38, 28))
    # Pupils
    draw.ellipse([(354, 354), (362, 362)], fill=(12, 10, 10))
    draw.ellipse([(434, 354), (442, 362)], fill=(12, 10, 10))
    # Eye catchlights
    draw.ellipse([(357, 354), (360, 357)], fill=(255, 255, 255))
    draw.ellipse([(437, 354), (440, 357)], fill=(255, 255, 255))
    
    # Nose
    draw.line([(400, 345), (395, 415)], fill=(145, 100, 75), width=3)
    draw.ellipse([(385, 410), (415, 424)], fill=(160, 115, 88))
    
    # Lips
    draw.ellipse([(375, 458), (425, 470)], fill=(148, 92, 80))
    
    # Forensic tag badge at bottom
    draw.rectangle([(20, h - 85), (w - 20, h - 20)], fill=(12, 14, 18, 220))
    draw.rectangle([(20, h - 85), (w - 20, h - 20)], outline=(245, 158, 11, 200), width=1)
    font_sub = ImageFont.load_default()
    draw.text((40, h - 75), "SUSPECT PROFILE 04 // DEV MALHOTRA", fill=(245, 158, 11, 255), font=font_sub)
    draw.text((40, h - 55), "ROLE: Visiting Evaluator & Photojournalist | LOCATION AT INCIDENT: Main Atrium (Column C-2)", fill=(209, 213, 219, 255), font=font_sub)
    draw.text((40, h - 38), "ATTIRE: Dark Olive Green Jacket, Cross-Body Camera Strap | STATUS: Alibi Under Verification", fill=(156, 163, 175, 255), font=font_sub)
    
    img = add_cinematic_noise(img, 0.025)
    img.save(os.path.join(OUTPUT_DIR, "suspects", "dev-malhotra.jpg"), "JPEG", quality=95)
    print("Dev Malhotra portrait created.")

def generate_evidence_images():
    w, h = 900, 600
    
    # EV-01: Thermal Telemetry Log
    img1 = Image.new("RGB", (w, h), (10, 14, 20))
    draw1 = ImageDraw.Draw(img1)
    # Grid lines
    for x in range(60, w - 40, 60):
        draw1.line([(x, 60), (x, h - 60)], fill=(20, 32, 45))
    for y in range(60, h - 60, 50):
        draw1.line([(60, y), (w - 40, y)], fill=(20, 32, 45))
    # Temperature graph curve (normal ~31C then sharp spike at 20:13 to 58.2C)
    points = [
        (60, 420), (120, 418), (180, 415), (240, 420), (300, 416), (360, 412),
        (420, 405), (480, 395), (540, 340), (600, 240), (660, 140), (720, 110), (780, 105), (840, 104)
    ]
    # Warning threshold line at 45C (y=260)
    draw1.line([(60, 260), (w - 40, 260)], fill=(220, 38, 38, 255), width=2)
    draw1.text((70, 242), "MAX SAFE THRESHOLD: 45.0 DEG C", fill=(220, 38, 38, 255))
    # Draw graph line
    for i in range(len(points) - 1):
        draw1.line([points[i], points[i+1]], fill=(245, 158, 11), width=4)
        draw1.ellipse([(points[i][0]-4, points[i][1]-4), (points[i][0]+4, points[i][1]+4)], fill=(255, 255, 255))
    # Critical alert badge
    draw1.rectangle([(620, 70), (840, 150)], fill=(40, 18, 18), outline=(220, 38, 38), width=2)
    draw1.text((630, 80), "[!] THERMAL RUNAWAY RISK", fill=(239, 68, 68))
    draw1.text((630, 100), "PEAK: 58.2 DEG C @ 20:13:05", fill=(255, 255, 255))
    draw1.text((630, 120), "STATUS: AMBER WARNING BLINK", fill=(245, 158, 11))
    create_cctv_overlay(draw1, w, h, "TEL-01", "AURORA BATTERY TELEMETRY BUS", "20:13:05", False)
    img1 = add_cinematic_noise(img1, 0.03)
    img1.save(os.path.join(OUTPUT_DIR, "evidence", "ev-01-thermal-telemetry.jpg"), "JPEG", quality=92)
    
    # EV-02: Sub-Panel B-4 Circuit Breaker
    img2 = Image.new("RGB", (w, h), (16, 18, 22))
    draw2 = ImageDraw.Draw(img2)
    # Industrial metal panel look
    draw2.rectangle([(100, 60), (w - 100, h - 60)], fill=(30, 33, 38), outline=(60, 64, 72), width=3)
    # Switches row
    for idx, name in enumerate(["B-1 (Atrium West)", "B-2 (Stage Audio)", "B-3 (Lobby Desk)", "B-4 (Pedestal Dock)", "B-5 (HVAC)"]):
        sy = 120 + idx * 75
        draw2.rectangle([(140, sy), (w - 140, sy + 55)], fill=(22, 24, 28), outline=(45, 48, 54))
        draw2.text((160, sy + 20), f"BREAKER SWITCH {name}", fill=(209, 213, 219))
        if idx == 3: # B-4 TRIPPED
            draw2.rectangle([(w - 280, sy + 10), (w - 160, sy + 45)], fill=(185, 28, 28))
            draw2.text((w - 265, sy + 20), "OFF / ISOLATED", fill=(255, 255, 255))
            draw2.text((160, sy + 38), "TRIP: 20:14:12 | RESET: 20:15:26 (ELAPSED: 74 SECONDS)", fill=(245, 158, 11))
        else:
            draw2.rectangle([(w - 280, sy + 10), (w - 160, sy + 45)], fill=(22, 101, 52))
            draw2.text((w - 250, sy + 20), "ON / ACTIVE", fill=(255, 255, 255))
    create_cctv_overlay(draw2, w, h, "SUB-B4", "ELECTRICAL SUB-PANEL LOG", "20:14:12", False)
    img2 = add_cinematic_noise(img2, 0.03)
    img2.save(os.path.join(OUTPUT_DIR, "evidence", "ev-02-circuit-breaker.jpg"), "JPEG", quality=92)
    
    # EV-03: Generator Telemetry
    img3 = Image.new("RGB", (w, h), (12, 15, 18))
    draw3 = ImageDraw.Draw(img3)
    draw3.rectangle([(80, 80), (w - 80, h - 80)], fill=(24, 28, 34), outline=(40, 50, 60))
    # Round gauges
    for g_idx, (g_title, g_val) in enumerate([("GRID 3-PHASE", "415 V"), ("LOAD CURRENT", "284 A"), ("DIESEL GEN-1", "STANDBY"), ("FREQUENCY", "50.02 Hz")]):
        gx = 180 + (g_idx % 2) * 360
        gy = 160 + (g_idx // 2) * 180
        draw3.ellipse([(gx - 70, gy - 70), (gx + 70, gy + 70)], fill=(16, 20, 24), outline=(245, 158, 11), width=2)
        draw3.text((gx - 45, gy - 18), g_title, fill=(156, 163, 175))
        draw3.text((gx - 35, gy + 4), g_val, fill=(245, 158, 11))
    draw3.rectangle([(w // 2 - 200, h - 130), (w // 2 + 200, h - 85)], fill=(16, 36, 22), outline=(34, 197, 94))
    draw3.text((w // 2 - 180, h - 114), "VERIFIED: ZERO GRID-WIDE POWER FAILURE DETECTED", fill=(74, 222, 128))
    create_cctv_overlay(draw3, w, h, "GEN-01", "PRIMARY GENERATOR TELEMETRY", "20:14:30", False)
    img3 = add_cinematic_noise(img3, 0.03)
    img3.save(os.path.join(OUTPUT_DIR, "evidence", "ev-03-generator-load.jpg"), "JPEG", quality=92)

    # EV-04: CAM-03 Corridor CCTV Frame (Cream jacket + burgundy scarf walking with padded case)
    img4 = Image.new("RGB", (w, h), (10, 12, 14))
    draw4 = ImageDraw.Draw(img4)
    # Corridor vanishing perspective
    draw4.polygon([(0, 0), (w, 0), (520, 220), (380, 220)], fill=(20, 22, 26)) # ceiling
    draw4.polygon([(0, h), (w, h), (520, 360), (380, 360)], fill=(25, 26, 30)) # floor
    draw4.polygon([(0, 0), (380, 220), (380, 360), (0, h)], fill=(16, 18, 20)) # left wall
    draw4.polygon([(w, 0), (520, 220), (520, 360), (w, h)], fill=(18, 20, 22)) # right wall
    # Distant door (Emergency Safety Vault)
    draw4.rectangle([(420, 240), (480, 360)], fill=(32, 34, 40), outline=(245, 158, 11), width=1)
    draw4.text((430, 225), "ROOM S-102", fill=(245, 158, 11))
    # Figure in cream jacket + burgundy scarf carrying padded case at time 20:14:48
    fx, fy = 410, 260
    # Cream jacket body
    draw4.polygon([(fx, fy + 30), (fx + 35, fy + 30), (fx + 40, fy + 80), (fx - 5, fy + 80)], fill=(225, 220, 205))
    # Burgundy scarf
    draw4.polygon([(fx + 8, fy + 24), (fx + 26, fy + 24), (fx + 30, fy + 48), (fx + 14, fy + 52)], fill=(136, 19, 55))
    # Head contour
    draw4.ellipse([(fx + 8, fy + 8), (fx + 26, fy + 28)], fill=(160, 120, 95))
    # Carrying padded equipment case
    draw4.rectangle([(fx + 32, fy + 55), (fx + 56, fy + 82)], fill=(40, 42, 45), outline=(180, 100, 20))
    # Forensic highlight box
    draw4.rectangle([(fx - 15, fy), (fx + 70, fy + 95)], outline=(220, 38, 38), width=2)
    draw4.text((fx - 15, fy - 18), "MATCH: CREAM JACKET + BURGUNDY SCARF", fill=(239, 68, 68))
    create_cctv_overlay(draw4, w, h, "CAM-03", "SERVICE CORRIDOR WEST", "20:14:48", True)
    img4 = add_scanlines(img4, line_spacing=3, opacity=30)
    img4 = add_cinematic_noise(img4, 0.05)
    img4.save(os.path.join(OUTPUT_DIR, "evidence", "ev-04-cctv-corridor.jpg"), "JPEG", quality=90)

    # EV-05: Vault Access Log & Key Register
    img5 = Image.new("RGB", (w, h), (18, 20, 24))
    draw5 = ImageDraw.Draw(img5)
    # Clipboard / forensic log ledger sheet
    draw5.rectangle([(80, 60), (w - 80, h - 60)], fill=(245, 243, 238), outline=(60, 60, 60), width=2)
    # Header
    draw5.rectangle([(80, 60), (w - 80, 120)], fill=(35, 40, 48))
    draw5.text((105, 82), "RESTRICTED CLIMATE SAFETY VAULT (ROOM S-102) // ACCESS REGISTER", fill=(245, 158, 11))
    
    # Rows
    headers = ["LOCK CYLINDER", "KEY ID", "AUTHORIZED HOLDER", "TIME UNLOCKED", "PURPOSE"]
    hx_pos = [105, 240, 360, 580, 700]
    for i, h_text in enumerate(headers):
        draw5.text((hx_pos[i], 135), h_text, fill=(80, 80, 80))
    draw5.line([(95, 155), (w - 95, 155)], fill=(180, 180, 180), width=1)
    
    rows = [
        ("CYL-01", "Key #01", "Campus Safety Lead", "08:15:20", "Morning Inspection"),
        ("CYL-04", "Key #04", "Rhea Das (Event Coord)", "20:15:02", "Hazard Isolation Protocol"),
        ("CYL-02", "Key #02", "Facility Manager", "21:30:00", "Post-Event Lockup")
    ]
    for r_idx, r_data in enumerate(rows):
        ry = 175 + r_idx * 55
        is_rhea = r_idx == 1
        if is_rhea:
            draw5.rectangle([(95, ry - 8), (w - 95, ry + 40)], fill=(254, 243, 199))
            # Red forensic stamp
            draw5.rectangle([(w - 260, ry - 4), (w - 110, ry + 36)], outline=(220, 38, 38), width=2)
            draw5.text((w - 245, ry + 8), "CRITICAL MATCH", fill=(220, 38, 38))
        for c_idx, val in enumerate(r_data):
            draw5.text((hx_pos[c_idx], ry + 8), val, fill=(185, 28, 28) if is_rhea and c_idx==1 else (30, 30, 30))
    create_cctv_overlay(draw5, w, h, "SEC-REG", "VAULT MECHANICAL LOG", "20:15:02", False)
    img5 = add_cinematic_noise(img5, 0.02)
    img5.save(os.path.join(OUTPUT_DIR, "evidence", "ev-05-vault-access.jpg"), "JPEG", quality=92)

    # EV-06: Stage Livestream (Mira Sen Alibi)
    img6 = Image.new("RGB", (w, h), (14, 16, 22))
    draw6 = ImageDraw.Draw(img6)
    # Stage curtain and podium
    draw6.rectangle([(160, 240), (320, h - 80)], fill=(28, 32, 40), outline=(60, 70, 80)) # podium
    # Projector screen in background
    draw6.rectangle([(380, 80), (w - 100, 380)], fill=(20, 30, 48), outline=(59, 130, 246))
    draw6.text((410, 110), "PROJECT AURORA: ARCHITECTURE PRESENTATION", fill=(147, 197, 253))
    draw6.text((410, 140), "Presenter: Mira Sen (Lead Hardware Architect)", fill=(209, 213, 219))
    draw6.text((410, 170), "Slide 14: Mesh Routing under Emergency Power", fill=(156, 163, 175))
    # Figure representing Mira at podium
    draw6.ellipse([(215, 140), (265, 190)], fill=(180, 140, 110)) # face
    draw6.polygon([(185, 190), (295, 190), (310, 340), (170, 340)], fill=(20, 30, 60)) # Navy blazer
    # Alibi confirmed banner
    draw6.rectangle([(120, h - 140), (w - 120, h - 80)], fill=(12, 36, 22), outline=(34, 197, 94), width=2)
    draw6.text((150, h - 124), "CONFIRMED ALIBI: MIRA SEN CONTINUOUSLY BROADCAST FROM 20:05:30 TO 20:21:40", fill=(74, 222, 128))
    create_cctv_overlay(draw6, w, h, "AV-MAIN", "AUDITORIUM LIVESTREAM BROADCAST", "20:14:40", True)
    img6 = add_cinematic_noise(img6, 0.03)
    img6.save(os.path.join(OUTPUT_DIR, "evidence", "ev-06-stage-livestream.jpg"), "JPEG", quality=92)

    # EV-07: Dev Malhotra Camera EXIF & Atrium CCTV Match
    img7 = Image.new("RGB", (w, h), (14, 16, 20))
    draw7 = ImageDraw.Draw(img7)
    draw7.rectangle([(60, 60), (420, h - 60)], fill=(22, 26, 32), outline=(50, 60, 70))
    draw7.text((80, 80), "EXIF METADATA DUMP // SONY ILCE-7M4", fill=(245, 158, 11))
    draw7.text((80, 120), "FILE: DSC04192.ARW\nTIME: 20:14:05.120\nSHUTTER: 1/60s f/2.8 ISO 3200", fill=(209, 213, 219))
    draw7.text((80, 200), "FILE: DSC04193.ARW\nTIME: 20:14:40.400\nSHUTTER: 1.5s f/4.0 ISO 1600\nNOTE: Long exposure of dark atrium", fill=(209, 213, 219))
    draw7.text((80, 300), "FILE: DSC04194.ARW\nTIME: 20:15:15.890\nSHUTTER: 2.0s f/4.0 ISO 1600", fill=(209, 213, 219))
    # Atrium CCTV frame thumbnail on right showing column C-2
    draw7.rectangle([(460, 60), (w - 60, h - 60)], fill=(18, 20, 24), outline=(245, 158, 11))
    draw7.text((480, 80), "CAM-01 ATRIUM WIDE (20:14:40)", fill=(245, 158, 11))
    # Column C-2
    draw7.rectangle([(620, 120), (700, h - 100)], fill=(40, 44, 52))
    # Silhouette with glowing camera LCD
    draw7.ellipse([(645, 280), (675, 310)], fill=(30, 30, 30))
    draw7.rectangle([(650, 320), (670, 340)], fill=(59, 130, 246)) # glowing blue camera LCD screen
    draw7.text((580, 400), "CONFIRMED: DEV AT COLUMN C-2", fill=(74, 222, 128))
    create_cctv_overlay(draw7, w, h, "EXIF-07", "PHOTOJOURNALIST FORENSIC MATCH", "20:14:40", False)
    img7 = add_cinematic_noise(img7, 0.03)
    img7.save(os.path.join(OUTPUT_DIR, "evidence", "ev-07-camera-exif.jpg"), "JPEG", quality=92)

    # EV-08: Pedestal Forensic Trace (Burgundy silk fiber + brass scuff)
    img8 = Image.new("RGB", (w, h), (18, 18, 22))
    draw8 = ImageDraw.Draw(img8)
    # Microscope / macro lens simulation
    draw8.ellipse([(w // 2 - 220, h // 2 - 220), (w // 2 + 220, h // 2 + 220)], fill=(35, 38, 44), outline=(245, 158, 11), width=3)
    # Pedestal latch metallic surface
    draw8.rectangle([(w // 2 - 140, h // 2 - 80), (w // 2 + 140, h // 2 + 80)], fill=(75, 80, 90), outline=(120, 125, 135))
    # Brass hairline scratch
    draw8.line([(w // 2 - 90, h // 2 - 20), (w // 2 + 60, h // 2 + 40)], fill=(234, 179, 8), width=3)
    draw8.text((w // 2 + 70, h // 2 + 42), "BRASS KEY SCRATCH (KEY #04)", fill=(234, 179, 8))
    # Burgundy silk fiber thread
    points_fiber = [(w // 2 - 110, h // 2 - 60), (w // 2 - 70, h // 2 - 40), (w // 2 - 30, h // 2 - 70), (w // 2, h // 2 - 50)]
    for f_i in range(len(points_fiber)-1):
        draw8.line([points_fiber[f_i], points_fiber[f_i+1]], fill=(136, 19, 55), width=4)
    draw8.text((w // 2 - 180, h // 2 - 75), "BURGUNDY SILK FIBER TRACE", fill=(244, 63, 94))
    create_cctv_overlay(draw8, w, h, "LAB-08", "PEDESTAL CASE MACRO FORENSIC TRACE", "20:25:00", False)
    img8 = add_cinematic_noise(img8, 0.03)
    img8.save(os.path.join(OUTPUT_DIR, "evidence", "ev-08-pedestal-trace.jpg"), "JPEG", quality=92)
    print("All 8 evidence forensic images generated.")

def generate_cctv_frames():
    w, h = 960, 540
    cameras = [
        ("cam-01", "CAM-01", "MAIN EXHIBITION ATRIUM", "20:14:15", (25, 30, 40)),
        ("cam-02", "CAM-02", "RECEPTION & LOBBY ENTRANCE", "20:13:30", (20, 22, 28)),
        ("cam-03", "CAM-03", "SERVICE CORRIDOR WEST", "20:14:48", (18, 20, 24)),
        ("cam-04", "CAM-04", "SUB-STATION POWER DISTRIBUTION", "20:12:00", (22, 25, 20)),
        ("cam-05", "CAM-05", "SAFETY VAULT ACCESS DOOR S-102", "20:15:02", (24, 20, 22)),
    ]
    for cid, tag, label, t_str, bg_col in cameras:
        img = Image.new("RGB", (w, h), bg_col)
        draw = ImageDraw.Draw(img)
        # Perspective architectural lines
        draw.line([(0, 80), (w, 80)], fill=(40, 45, 55))
        draw.line([(0, h - 80), (w, h - 80)], fill=(40, 45, 55))
        draw.line([(w // 4, 80), (w // 4, h - 80)], fill=(40, 45, 55))
        draw.line([(3 * w // 4, 80), (3 * w // 4, h - 80)], fill=(40, 45, 55))
        
        # Specific scene content per camera
        if cid == "cam-01":
            # Central pedestal with prototype & acrylic case
            draw.rectangle([(w // 2 - 60, h // 2 - 40), (w // 2 + 60, h // 2 + 100)], fill=(12, 14, 18), outline=(60, 65, 75))
            # Acrylic case outline
            draw.rectangle([(w // 2 - 50, h // 2 - 110), (w // 2 + 50, h // 2 - 40)], outline=(120, 140, 160), width=2)
            # Glowing amber warning dot on prototype inside
            draw.ellipse([(w // 2 - 6, h // 2 - 80), (w // 2 + 6, h // 2 - 68)], fill=(245, 158, 11))
            draw.text((w // 2 - 120, h // 2 - 135), "[PEDESTAL 01: AURORA PROTOTYPE]", fill=(245, 158, 11))
        elif cid == "cam-02":
            # Reception desk
            draw.rectangle([(180, h // 2), (w - 180, h // 2 + 120)], fill=(32, 36, 44), outline=(60, 65, 75))
            draw.text((w // 2 - 80, h // 2 + 30), "RECEPTION WELCOME COUNTER [UNATTENDED]", fill=(239, 68, 68))
        elif cid == "cam-03":
            # Corridor with Door B-4 slightly ajar
            draw.polygon([(w // 3, 100), (w // 2, 100), (w // 2, h - 100), (w // 3, h - 100)], fill=(35, 38, 45))
            draw.line([(w // 2 - 15, 100), (w // 2 - 15, h - 100)], fill=(245, 158, 11), width=2)
            draw.text((w // 3 + 10, 120), "DOOR B-4 (AJAR)", fill=(245, 158, 11))
        elif cid == "cam-04":
            # Generator room with Kabir checking meters
            draw.rectangle([(180, 120), (450, h - 100)], fill=(28, 32, 28), outline=(45, 55, 45))
            draw.text((200, 140), "PRIMARY TRANSFORMER T-01 [ACTIVE]", fill=(34, 197, 94))
        elif cid == "cam-05":
            # Vault door
            draw.rectangle([(w // 2 - 90, 90), (w // 2 + 90, h - 90)], fill=(26, 28, 34), outline=(245, 158, 11), width=2)
            draw.text((w // 2 - 75, 110), "ROOM S-102 SAFETY VAULT", fill=(245, 158, 11))
            draw.text((w // 2 - 75, 130), "LOCK STATUS: UNLOCKED (KEY #04)", fill=(239, 68, 68))
            
        create_cctv_overlay(draw, w, h, tag, label, t_str, True)
        img = add_scanlines(img, line_spacing=3, opacity=25)
        img = add_cinematic_noise(img, 0.04)
        img.save(os.path.join(OUTPUT_DIR, "cctv", f"{cid}.jpg"), "JPEG", quality=90)
    print("All 5 CCTV camera stills generated.")

def generate_aurora_prototype_shot():
    w, h = 960, 600
    img = Image.new("RGB", (w, h), (14, 16, 20))
    draw = ImageDraw.Draw(img)
    # Pedestal in dark gallery
    draw.polygon([(w // 2 - 180, h), (w // 2 + 180, h), (w // 2 + 120, h // 2), (w // 2 - 120, h // 2)], fill=(20, 22, 26))
    # Acrylic case
    draw.polygon([(w // 2 - 140, h // 2), (w // 2 + 140, h // 2), (w // 2 + 100, 140), (w // 2 - 100, 140)], outline=(100, 130, 160), width=2)
    # Prototype chassis
    draw.rectangle([(w // 2 - 80, h // 2 - 80), (w // 2 + 80, h // 2 - 10)], fill=(45, 50, 58), outline=(90, 95, 105), width=2)
    # Telemetry screen on device
    draw.rectangle([(w // 2 - 60, h // 2 - 65), (w // 2 + 20, h // 2 - 25)], fill=(15, 25, 35))
    draw.text((w // 2 - 55, h // 2 - 58), "AURORA v3.2", fill=(147, 197, 253))
    draw.text((w // 2 - 55, h // 2 - 42), "58.2 C TEMP ALERT", fill=(239, 68, 68))
    # Prominent glowing amber LED indicator
    draw.ellipse([(w // 2 + 40, h // 2 - 65), (w // 2 + 65, h // 2 - 40)], fill=(245, 158, 11))
    draw.ellipse([(w // 2 + 46, h // 2 - 59), (w // 2 + 59, h // 2 - 46)], fill=(255, 255, 200))
    
    # Glow halo
    glow_img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow_img)
    g_draw.ellipse([(w // 2 + 20, h // 2 - 85), (w // 2 + 85, h // 2 - 20)], fill=(245, 158, 11, 70))
    glow_img = glow_img.filter(ImageFilter.GaussianBlur(15))
    img.paste(glow_img, (0, 0), glow_img)
    
    draw = ImageDraw.Draw(img)
    create_cctv_overlay(draw, w, h, "SPEC-01", "AURORA PROTOTYPE TELEMETRY VIEW", "20:13:50", False)
    img = add_cinematic_noise(img, 0.03)
    img.save(os.path.join(OUTPUT_DIR, "evidence", "aurora-prototype.jpg"), "JPEG", quality=92)
    print("AURORA Prototype shot generated.")

if __name__ == "__main__":
    ensure_dirs()
    generate_dev_malhotra_portrait()
    generate_evidence_images()
    generate_cctv_frames()
    generate_aurora_prototype_shot()
    print("All visual assets successfully generated!")
