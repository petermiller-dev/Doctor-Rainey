# Photo & Video Guide

_This file is generated from `content/photos.json` by `node scripts/build.mjs`. Edit the JSON, not this file._

Every image slot on the site is listed below. Until a file exists at the path shown, the site displays an outlined wireframe placeholder in the exact size and position the photo will occupy.

## How to replace a placeholder

1. Export the photo as **JPG** (quality ~80) at the recommended size. Keep files under ~400 KB where possible ([squoosh.app](https://squoosh.app) works well).
2. Save it with **exactly** the filename and folder listed below, inside `assets/images/`.
3. Run `node scripts/build.mjs` (or just push — the GitHub Action rebuilds the site). The placeholder is replaced automatically; no layout changes are needed.
4. If the photo differs from the description, update its `alt` text in `content/photos.json`.

**Never** use stock photographs presented as Dr. Rainey, his family, his patients, or his office. Patient photographs require a signed release from a parent or guardian.

| # | Slot | File (in `assets/images/`) | Ratio | Recommended size | Used on |
|---|---|---|---|---|---|
| 1 | Texas Landscape — Hero Backdrop (Optional) | `hero/texas-landscape.jpg` | 16:9 | 2400 × 1350 px (minimum 1920 × 1080) | Home (hero). Until supplied, an illustrated landscape is shown. |
| 2 | Dr. Rainey — Professional Portrait | `about/rainey-portrait.jpg` | 4:5 | 1600 × 2000 px | Home (Meet Dr. Rainey), About |
| 3 | Dr. Rainey at Work in His Office | `about/rainey-office.jpg` | 3:2 | 2100 × 1400 px | About |
| 4 | Dr. Rainey with His Family — Photography Needed | `about/rainey-family.jpg` | 3:2 | 2400 × 1600 px | Home (More Than a Physician), About |
| 5 | Dr. Rainey with a Young Patient | `care/rainey-with-patient.jpg` | 4:3 | 2000 × 1500 px | Pediatric Care |
| 6 | Waiting Room | `office/waiting-room.jpg` | 3:2 | 2100 × 1400 px | New Patients |
| 7 | Examination Room | `office/exam-room.jpg` | 3:2 | 2100 × 1400 px | New Patients |
| 8 | Office Exterior & Entrance | `office/exterior.jpg` | 4:3 | 2000 × 1500 px | Home (Location), Contact |
| 9 | Quiet Detail — Office or Outdoors | `details/quiet-detail.jpg` | 4:5 | 1600 × 2000 px | Articles & Resources |
| 10 | A Personal Introduction — Video | `video/rainey-introduction.mp4` | 16:9 | 1920 × 1080 px MP4 (H.264), under 25 MB; poster image 1920 × 1080 JPG; captions as WebVTT | Home (A Personal Introduction), About |

## 1. Texas Landscape — Hero Backdrop (Optional)

- **Slot id:** `hero-landscape`
- **File:** `assets/images/hero/texas-landscape.jpg`
- **Aspect ratio:** 16:9
- **Recommended size:** 2400 × 1350 px (minimum 1920 × 1080)
- **What to capture:** A wide, softly lit North Texas landscape: live oaks, open grassland or a quiet field at early morning or golden hour. Must be our own photograph or properly licensed.
- **Cropping:** Keep the horizon in the lower third and the left half calm — the headline sits over the left side. Avoid people and buildings. On phones the image is cropped to the centre.
- **Alt text:** "Live oak trees in soft morning light across open North Texas grassland"
- **Used on:** Home (hero). Until supplied, an illustrated landscape is shown.
- **Permission:** Licence or photographer release required.
- **Status:** Supplied ✔

## 2. Dr. Rainey — Professional Portrait

- **Slot id:** `portrait-professional`
- **File:** `assets/images/about/rainey-portrait.jpg`
- **Aspect ratio:** 4:5
- **Recommended size:** 1600 × 2000 px
- **What to capture:** Natural, approachable portrait of Dr. Rainey in soft window light. Waist-up, looking toward the camera. Warm neutral background; white coat optional.
- **Cropping:** Vertical 4:5. Eyes roughly one-third from the top, a little space above the head. Keep shoulders inside the frame.
- **Alt text:** "Portrait of Shane Rainey, DO, pediatrician in Fort Worth, Texas"
- **Used on:** Home (Meet Dr. Rainey), About
- **Permission:** Dr. Rainey's approval of the final selection.
- **Status:** Needed

## 3. Dr. Rainey at Work in His Office

- **Slot id:** `portrait-office`
- **File:** `assets/images/about/rainey-office.jpg`
- **Aspect ratio:** 3:2
- **Recommended size:** 2100 × 1400 px
- **What to capture:** Candid, editorial photograph of Dr. Rainey at his desk or reviewing notes in his office. Natural light, uncluttered. No patient information visible on screens or paper.
- **Cropping:** Horizontal 3:2. Dr. Rainey slightly off-centre; leave breathing room on one side.
- **Alt text:** "Shane Rainey, DO, working at his desk in his Fort Worth office"
- **Used on:** About
- **Permission:** Confirm no patient information is visible.
- **Status:** Needed

## 4. Dr. Rainey with His Family — Photography Needed

- **Slot id:** `family`
- **File:** `assets/images/about/rainey-family.jpg`
- **Aspect ratio:** 3:2
- **Recommended size:** 2400 × 1600 px
- **What to capture:** A relaxed, natural family photograph of Dr. Rainey with his wife and children, ideally outdoors in soft light. Only with the family's explicit permission for public use.
- **Cropping:** Horizontal 3:2. Keep everyone inside the central 80% — edges may be cropped on phones.
- **Alt text:** "Shane Rainey, DO, with his wife and children"
- **Used on:** Home (More Than a Physician), About
- **Permission:** Written approval from Dr. Rainey and his family. Children's names are never published.
- **Status:** Needed

## 5. Dr. Rainey with a Young Patient

- **Slot id:** `with-patient`
- **File:** `assets/images/care/rainey-with-patient.jpg`
- **Aspect ratio:** 4:3
- **Recommended size:** 2000 × 1500 px
- **What to capture:** A gentle, candid moment of Dr. Rainey with a child (and parent) during a visit — listening, explaining, or a stethoscope check. Warm, unposed.
- **Cropping:** Horizontal 4:3. Faces may be turned away if preferred.
- **Alt text:** "Shane Rainey, DO, gently examining a young patient while a parent looks on"
- **Used on:** Pediatric Care
- **Permission:** Signed photo release from the parent/guardian is REQUIRED before use.
- **Status:** Needed

## 6. Waiting Room

- **Slot id:** `waiting-room`
- **File:** `assets/images/office/waiting-room.jpg`
- **Aspect ratio:** 3:2
- **Recommended size:** 2100 × 1400 px
- **What to capture:** The waiting area as families will experience it: calm, tidy, naturally lit. No people, or only staff who have approved. Avoid signage belonging to other businesses.
- **Cropping:** Horizontal 3:2, shot from the entry looking in at standing eye level.
- **Alt text:** "The calm, naturally lit waiting room at Dr. Rainey's Fort Worth office"
- **Used on:** New Patients
- **Permission:** Building owner approval if shared space is visible.
- **Status:** Needed

## 7. Examination Room

- **Slot id:** `exam-room`
- **File:** `assets/images/office/exam-room.jpg`
- **Aspect ratio:** 3:2
- **Recommended size:** 2100 × 1400 px
- **What to capture:** A clean, welcoming exam room. Straightened, with no patient information visible.
- **Cropping:** Horizontal 3:2. Include the exam table and a window if possible.
- **Alt text:** "A bright, welcoming pediatric examination room"
- **Used on:** New Patients
- **Permission:** Confirm no patient information is visible.
- **Status:** Needed

## 8. Office Exterior & Entrance

- **Slot id:** `office-exterior`
- **File:** `assets/images/office/exterior.jpg`
- **Aspect ratio:** 4:3
- **Recommended size:** 2000 × 1500 px
- **What to capture:** The building entrance at 4927 Byers Avenue as a family would see it on arrival, helping visitors recognise the right door. Avoid making another business's signage the focus.
- **Cropping:** Horizontal 4:3, from the parking area or sidewalk. Entrance near the centre.
- **Alt text:** "Entrance to Dr. Rainey's office building at 4927 Byers Avenue, Fort Worth"
- **Used on:** Home (Location), Contact
- **Permission:** Building owner approval recommended.
- **Status:** Needed

## 9. Quiet Detail — Office or Outdoors

- **Slot id:** `detail-texture`
- **File:** `assets/images/details/quiet-detail.jpg`
- **Aspect ratio:** 4:5
- **Recommended size:** 1600 × 2000 px
- **What to capture:** A calm detail image: a stethoscope on a wooden desk, sunlight across oak leaves, or a children's book on a shelf. Used as a supporting image beside article listings.
- **Cropping:** Vertical 4:5. Subject centred.
- **Alt text:** "Morning light across the leaves of a Texas live oak"
- **Used on:** Articles & Resources
- **Permission:** Our own photograph or licensed.
- **Status:** Needed

## 10. A Personal Introduction — Video

- **Slot id:** `intro-video`
- **File:** `assets/images/video/rainey-introduction.mp4`  
- **Poster image:** `assets/images/video/rainey-introduction-poster.jpg`  
- **Captions:** `assets/images/video/rainey-introduction.vtt`
- **Aspect ratio:** 16:9
- **Recommended size:** 1920 × 1080 px MP4 (H.264), under 25 MB; poster image 1920 × 1080 JPG; captions as WebVTT
- **What to capture:** A 60–90 second video of Dr. Rainey introducing himself, his philosophy of care, and how families can become patients. Filmed in his office or outdoors in natural light, with captions.
- **Cropping:** 16:9 landscape. Poster frame: Dr. Rainey looking toward the camera, mid-sentence, warm light.
- **Alt text:** "Video: Shane Rainey, DO, introduces himself and his approach to pediatric care"
- **Used on:** Home (A Personal Introduction), About
- **Permission:** Dr. Rainey's approval of the final edit. Captions required for accessibility.
- **Status:** Needed
