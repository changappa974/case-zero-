import os
import cv2
import numpy as np

OUTPUT_DIR = r"C:\Users\pramod kumar\.gemini\antigravity\scratch\case-zero\public\video"
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH = 854
HEIGHT = 480
FPS = 24

def draw_hud(frame, cam_name, timecode_str, status="REC [LIVE]", color=(245, 158, 11)):
    h, w = frame.shape[:2]
    # Header bar
    cv2.rectangle(frame, (0, 0), (w, 36), (10, 10, 12), -1)
    cv2.rectangle(frame, (0, h - 28), (w, h), (10, 10, 12), -1)
    
    # Blinking red dot
    cv2.circle(frame, (20, 18), 5, (0, 0, 220), -1)
    cv2.putText(frame, status, (32, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (240, 240, 240), 1, cv2.LINE_AA)
    
    # Camera tag
    cv2.putText(frame, cam_name, (w // 2 - 140, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (11, 158, 245), 1, cv2.LINE_AA)
    
    # Timestamp
    cv2.putText(frame, f"2026-10-30 {timecode_str}", (w - 220, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (240, 240, 240), 1, cv2.LINE_AA)
    
    # Footer
    cv2.putText(frame, "MERIDIAN INNOVATION HALL SECURITY NETWORK // NODE 04B", (20, h - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (150, 150, 150), 1, cv2.LINE_AA)
    cv2.putText(frame, "1080P // AUTO-IR", (w - 140, h - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (150, 150, 150), 1, cv2.LINE_AA)
    
    # Corner brackets
    col_b = (11, 158, 245)
    cv2.line(frame, (15, 45), (35, 45), col_b, 1)
    cv2.line(frame, (15, 45), (15, 65), col_b, 1)
    cv2.line(frame, (w - 15, 45), (w - 35, 45), col_b, 1)
    cv2.line(frame, (w - 15, 45), (w - 15, 65), col_b, 1)
    cv2.line(frame, (15, h - 35), (35, h - 35), col_b, 1)
    cv2.line(frame, (15, h - 35), (15, h - 55), col_b, 1)
    cv2.line(frame, (w - 15, h - 35), (w - 35, h - 35), col_b, 1)
    cv2.line(frame, (w - 15, h - 35), (w - 15, h - 55), col_b, 1)

def add_noise_and_scanlines(frame, noise_level=8):
    noise = np.random.normal(0, noise_level, frame.shape).astype(np.int16)
    frame = np.clip(frame.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    # Subtle scanlines
    frame[::3, :, :] = (frame[::3, :, :].astype(np.float32) * 0.88).astype(np.uint8)
    return frame

def render_main_mystery_video():
    filepath = os.path.join(OUTPUT_DIR, "main-story.mp4")
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filepath, fourcc, FPS, (WIDTH, HEIGHT))
    
    total_seconds = 12
    total_frames = total_seconds * FPS
    
    for f in range(total_frames):
        t_sec = f / FPS
        frame = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
        
        # Incident time calculation: starts at 20:13:55, blackout occurs at 20:14:12, restored at 20:15:26
        # In our 12-second dramatic sequence:
        # 0s - 3s: Normal lighting, AURORA on pedestal, amber light blinking (20:13:58 - 20:14:11)
        # 3s - 4s: Electrical surge flicker / blackout transition (20:14:12)
        # 4s - 8s: 74-second darkness / security IR mode / shadow movement (20:14:13 - 20:15:25)
        # 8s - 12s: Lights return, empty pedestal, alarm pulse (20:15:26 - 20:15:35)
        
        if t_sec < 3.2:
            # Normal lighting
            frame[:] = (24, 28, 36)
            # Gallery background columns
            cv2.rectangle(frame, (120, 40), (160, HEIGHT - 30), (32, 36, 48), -1)
            cv2.rectangle(frame, (WIDTH - 160, 40), (WIDTH - 120, HEIGHT - 30), (32, 36, 48), -1)
            # Pedestal
            cv2.rectangle(frame, (WIDTH // 2 - 70, HEIGHT // 2 - 10), (WIDTH // 2 + 70, HEIGHT - 30), (18, 20, 24), -1)
            # Acrylic case
            cv2.rectangle(frame, (WIDTH // 2 - 60, HEIGHT // 2 - 100), (WIDTH // 2 + 60, HEIGHT // 2 - 10), (120, 140, 160), 2)
            # AURORA Prototype chassis
            cv2.rectangle(frame, (WIDTH // 2 - 40, HEIGHT // 2 - 70), (WIDTH // 2 + 40, HEIGHT // 2 - 20), (50, 55, 65), -1)
            cv2.putText(frame, "AURORA", (WIDTH // 2 - 28, HEIGHT // 2 - 40), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (220, 230, 240), 1)
            # Amber blinking LED (pulsing every 0.6s)
            if int(f / 7) % 2 == 0:
                cv2.circle(frame, (WIDTH // 2 + 25, HEIGHT // 2 - 60), 6, (11, 158, 245), -1) # BGR amber
                cv2.circle(frame, (WIDTH // 2 + 25, HEIGHT // 2 - 60), 2, (200, 255, 255), -1)
            
            # Subtitle
            cv2.rectangle(frame, (WIDTH // 2 - 260, HEIGHT - 70), (WIDTH // 2 + 260, HEIGHT - 40), (10, 10, 14), -1)
            cv2.putText(frame, "STAGE 1 // CASE ZERO: THE 74-SECOND VANISHING", (WIDTH // 2 - 240, HEIGHT - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (245, 158, 11), 1, cv2.LINE_AA)
            time_str = f"20:14:{int(t_sec * 3):02d}"
            
        elif t_sec < 4.2:
            # Electrical Flicker & Blackout (Sub-Panel B-4 Trips at 20:14:12)
            flicker = np.random.choice([0, 20, 60, 12, 180, 0])
            frame[:] = (flicker, flicker, flicker)
            if flicker > 30:
                cv2.rectangle(frame, (WIDTH // 2 - 70, HEIGHT // 2 - 10), (WIDTH // 2 + 70, HEIGHT - 30), (18, 20, 24), -1)
            cv2.putText(frame, ">> POWER INTERRUPTION: SUB-PANEL B-4 ISOLATED <<", (WIDTH // 2 - 220, HEIGHT // 2), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (0, 0, 255), 1, cv2.LINE_AA)
            time_str = "20:14:12"
            
        elif t_sec < 8.2:
            # Blackout / Low-light IR camera mode
            frame[:] = (8, 10, 12)
            # IR monochrome look
            # Dim silhouette of pedestal
            cv2.rectangle(frame, (WIDTH // 2 - 70, HEIGHT // 2 - 10), (WIDTH // 2 + 70, HEIGHT - 30), (14, 16, 20), -1)
            # Dim silhouette moving in corridor reflection
            shift_x = int((t_sec - 4.2) * 45)
            cv2.ellipse(frame, (280 + shift_x, HEIGHT // 2 - 40), (22, 50), 0, 0, 360, (22, 24, 28), -1)
            # Emergency exit amber glow in background
            cv2.rectangle(frame, (60, 80), (100, 100), (0, 80, 160), -1) # dim amber exit sign
            
            # HUD Status
            cv2.putText(frame, "EMERGENCY IR MODE // LIGHTING DOCKED [74s ELAPSED]", (WIDTH // 2 - 210, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 180, 255), 1, cv2.LINE_AA)
            sec_count = int(12 + (t_sec - 4.2) * 18)
            time_str = f"20:14:{sec_count:02d}"
            
        else:
            # 20:15:26: Power Restored. Case is empty!
            frame[:] = (24, 28, 36)
            cv2.rectangle(frame, (120, 40), (160, HEIGHT - 30), (32, 36, 48), -1)
            cv2.rectangle(frame, (WIDTH - 160, 40), (WIDTH - 120, HEIGHT - 30), (32, 36, 48), -1)
            # Pedestal
            cv2.rectangle(frame, (WIDTH // 2 - 70, HEIGHT // 2 - 10), (WIDTH // 2 + 70, HEIGHT - 30), (18, 20, 24), -1)
            # Acrylic case OPEN / HINGE AJAR
            cv2.line(frame, (WIDTH // 2 - 60, HEIGHT // 2 - 10), (WIDTH // 2 - 90, HEIGHT // 2 - 90), (140, 160, 180), 2)
            cv2.line(frame, (WIDTH // 2 + 60, HEIGHT // 2 - 10), (WIDTH // 2 + 60, HEIGHT // 2 - 100), (140, 160, 180), 2)
            # PEDESTAL IS EMPTY!
            cv2.circle(frame, (WIDTH // 2, HEIGHT // 2 - 20), 4, (0, 0, 220), -1) # Empty dock contact
            
            # Red Alert Box
            cv2.rectangle(frame, (WIDTH // 2 - 200, 65), (WIDTH // 2 + 200, 115), (10, 10, 30), -1)
            cv2.rectangle(frame, (WIDTH // 2 - 200, 65), (WIDTH // 2 + 200, 115), (0, 0, 220), 2)
            cv2.putText(frame, "[!] INCIDENT DETECTED: AURORA PROTOTYPE VANISHED", (WIDTH // 2 - 185, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1, cv2.LINE_AA)
            time_str = f"20:15:{int(26 + (t_sec - 8.2) * 2):02d}"

        draw_hud(frame, "CAM-01 // CENTRAL EXHIBITION ATRIUM", time_str)
        frame = add_noise_and_scanlines(frame, 6)
        out.write(frame)
        
    out.release()
    print("Main mystery video generated.")

def render_camera_clip(filename, cam_tag, cam_title, duration_sec=8):
    filepath = os.path.join(OUTPUT_DIR, filename)
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filepath, fourcc, FPS, (WIDTH, HEIGHT))
    total_frames = duration_sec * FPS
    
    for f in range(total_frames):
        t_sec = f / FPS
        frame = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
        
        if "cam-01" in filename:
            # Central Atrium feed
            frame[:] = (20, 24, 30)
            cv2.rectangle(frame, (WIDTH // 2 - 70, HEIGHT // 2), (WIDTH // 2 + 70, HEIGHT - 40), (16, 18, 22), -1)
            # Prototype amber blinking
            if int(f / 6) % 2 == 0:
                cv2.circle(frame, (WIDTH // 2, HEIGHT // 2 - 30), 5, (11, 158, 245), -1)
            # Column C-2 in background with Dev's camera LED
            cv2.rectangle(frame, (140, 60), (190, HEIGHT - 40), (30, 34, 42), -1)
            cv2.circle(frame, (165, HEIGHT // 2 - 10), 3, (245, 120, 40), -1) # camera LCD dot
            cv2.putText(frame, "COL C-2 (DEV M.)", (135, HEIGHT // 2 - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (180, 180, 180), 1)
            time_str = f"20:14:{int(10 + t_sec):02d}"
            
        elif "cam-02" in filename:
            # Reception desk feed
            frame[:] = (22, 22, 26)
            cv2.rectangle(frame, (160, HEIGHT // 2), (WIDTH - 160, HEIGHT - 40), (32, 34, 40), -1)
            cv2.putText(frame, "RECEPTION DESK // STATUS: UNATTENDED (20:13:00 - 20:16:15)", (180, HEIGHT // 2 + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 100, 245), 1)
            time_str = f"20:14:{int(20 + t_sec):02d}"
            
        elif "cam-03" in filename:
            # Corridor feed (Cream jacket + burgundy scarf at 20:14:48)
            frame[:] = (16, 18, 20)
            # Corridor walls
            cv2.line(frame, (0, 60), (WIDTH // 2, 200), (40, 44, 50), 1)
            cv2.line(frame, (WIDTH, 60), (WIDTH // 2, 200), (40, 44, 50), 1)
            # Figure moving down corridor
            pos_x = int(WIDTH // 2 - 30 + t_sec * 8)
            cv2.rectangle(frame, (pos_x, 180), (pos_x + 35, 290), (220, 215, 200), -1) # cream jacket
            cv2.rectangle(frame, (pos_x + 6, 185), (pos_x + 28, 220), (55, 19, 136), -1) # burgundy scarf (BGR)
            cv2.rectangle(frame, (pos_x + 30, 240), (pos_x + 50, 275), (45, 45, 50), -1) # padded case
            cv2.putText(frame, "[!] SUBJECT IN CREAM JACKET + BURGUNDY SCARF WITH CASE", (WIDTH // 2 - 220, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 0, 245), 1)
            time_str = f"20:14:{int(45 + t_sec):02d}"
            
        elif "cam-04" in filename:
            # Sub-station generator feed
            frame[:] = (18, 24, 20)
            cv2.rectangle(frame, (120, 80), (380, HEIGHT - 40), (26, 32, 28), -1)
            cv2.putText(frame, "GRID TRANSFORMER A: 415V STABLE", (140, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (70, 220, 70), 1)
            cv2.putText(frame, "KABIR R. LOGGED IN SUB-STATION", (140, 160), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (180, 180, 180), 1)
            time_str = f"20:14:{int(15 + t_sec):02d}"
            
        elif "cam-05" in filename:
            # Safety vault entry feed
            frame[:] = (20, 18, 22)
            cv2.rectangle(frame, (WIDTH // 2 - 80, 80), (WIDTH // 2 + 80, HEIGHT - 40), (30, 28, 34), -1)
            cv2.putText(frame, "ROOM S-102 SAFETY VAULT", (WIDTH // 2 - 75, 110), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (11, 158, 245), 1)
            # Amber lock beacon
            cv2.circle(frame, (WIDTH // 2 + 60, 140), 6, (11, 158, 245), -1)
            cv2.putText(frame, "KEY #04 LOGGED AT 20:15:02", (WIDTH // 2 - 80, HEIGHT - 60), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 200, 255), 1)
            time_str = f"20:15:{int(0 + t_sec):02d}"
            
        draw_hud(frame, cam_title, time_str)
        frame = add_noise_and_scanlines(frame, 7)
        out.write(frame)
        
    out.release()
    print(f"Generated CCTV clip: {filename}")

if __name__ == "__main__":
    render_main_mystery_video()
    render_camera_clip("cam-01-atrium.mp4", "CAM-01", "CAM-01 // EXHIBITION ATRIUM")
    render_camera_clip("cam-02-reception.mp4", "CAM-02", "CAM-02 // RECEPTION DESK")
    render_camera_clip("cam-03-corridor.mp4", "CAM-03", "CAM-03 // SERVICE CORRIDOR WEST")
    render_camera_clip("cam-04-substation.mp4", "CAM-04", "CAM-04 // SUB-STATION POWER")
    render_camera_clip("cam-05-vault.mp4", "CAM-05", "CAM-05 // ROOM S-102 SAFETY VAULT")
    print("All cinematic video feeds generated successfully!")
