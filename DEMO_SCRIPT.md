# AgriLens Demo Video Walkthrough Script (3–5 Minutes)

**Theme:** Computer Vision & Visual Intelligence  
**Product:** AgriLens: AI Crop Advisory Assistant  
**Presenter:** Agronomy Product Lead / Principal Engineer  

---

### [0:00 - 0:30] The Agricultural Problem Hook
- **Visual:** Close-up of smallholder field or diseased leaf photo.
- **Narrator:** 
  > *"Every harvest season, smallholder farmers lose up to 40% of their crop yield to visual foliar diseases, pest infestations, and nutrient deficiencies. Today, visual inspection is slow, highly subjective between inspectors, and expert agronomists are scarce. Farmers either wait too long—suffering total plot losses—or misapply broad-spectrum chemical pesticides, creating runoff and pest resistance.*
  > *This is AgriLens: an AI-powered visual intelligence system that brings agronomic computer vision directly to any mobile device in under 30 seconds."*

---

### [0:30 - 1:00] Landing Experience & 3D Farmland
- **Visual:** Landing page showing the interactive 3D terraced farmland with crops swaying under the morning sun. Cursor moving to demonstrate parallax.
- **Narrator:**
  > *"Here on the AgriLens platform, we designed an earthy, calm aesthetic—strictly free of neon or AI gimmicks. Notice the 3D procedural terraced field scene, reacting smoothly to mouse motion while remaining lightweight with zero external 3D asset downloads.*
  > *Let's log in to our field station using our demo credentials or register a new farmer account."*
- **Action:** Click "Demo Account", auto-fills credentials, signs in.

---

### [1:00 - 1:20] Field Parcel Management
- **Visual:** Fields page displaying registered plots (e.g., "North Wheat Field").
- **Narrator:**
  > *"AgriLens isn't just a generic image classifier—it understands spatial field context. Users organize their farm into distinct parcels with soil classifications, acreage, and irrigation methods. This contextual ground truth gives our AI models the clinical foundation needed to distinguish look-alike diseases."*
- **Action:** Click "New Crop Scan" on the wheat field.

---

### [1:20 - 2:00] Image Capture & Grounded Advisory Form
- **Visual:** New Scan 4-Step Wizard.
- **Narrator:**
  > *"Farmers can drag-and-drop up to four photos or capture directly with their mobile camera in natural field lighting. Notice that our client-side pipeline automatically normalizes the images, while the backend strips sensitive EXIF GPS metadata for farmer privacy.*
  > *Next, we fill out the agronomy context: growth stage, recent weather, and estimated affected area percentage. We can also specify 'Prioritize Organic & Cultural' and select from six regional languages including Hindi and Bengali."*
- **Action:** Select wheat photos, choose 'Vegetative', weather 'High Humidity / Fog', click "Launch Computer Vision Diagnosis".

---

### [2:00 - 2:40] AI Scanning Loader & Annotated Visual Results
- **Visual:** The 3D rotating leaf loader sweeps with a golden wheat scan bar, followed by the scan result screen.
- **Narrator:**
  > *"In under 30 seconds, server-side Google Gemini vision models analyze texture and chlorosis. The result is immediate:*
  > *First, normalized bounding boxes localize every distinct lesion directly over the crop photo. Hovering over any pathology card highlights the exact lesion.*
  > *Our semi-circular Health Gauge scores canopy vigor at 68/100, highlighting moderate spread risk.*
  > *The Image Quality Hint also confirms diagnostic sharpness and lighting."*

---

### [2:40 - 3:20] Prioritized Treatment Plan & 3D Leaf Hotspot Inspector
- **Visual:** Switch between 2D annotated viewer and 3D Foliage Inspector with clickable disease pins; scroll down to Treatment Plan tabs.
- **Narrator:**
  > *"In the 3D Foliage Inspector, farmers can rotate a procedural plant model with clickable disease hotspots tied directly to findings.*
  > *Below, AgriLens delivers a prioritized treatment protocol: Immediate 0–48 hour cultural sanitation first, biological sprays second, and chemical options strictly as a last resort—complete with active ingredient classifications, PPE warnings, and pre-harvest intervals.*
  > *Users can even use the grounded Follow-Up Chat to ask: 'Can I apply organic spray before tomorrow's rain?' and receive cautious, instant answers."*

---

### [3:20 - 4:00] Re-Scan & Visual Progression Comparison
- **Visual:** Compare page showing split before/after slider and AI Progression Report.
- **Narrator:**
  > *"Two weeks later, the farmer re-scans the same plot. AgriLens runs a multimodal comparison between the baseline and current photos.*
  > *With our interactive before/after split slider, the user can observe lesion boundaries receding.*
  > *The AI Progression Report reports a +14 point vigor recovery, confirms that organic interventions were effective, and alerts the farmer if any new pest pressures are emerging."*

---

### [4:00 - 4:30] Dashboard & Weekly AI Insights
- **Visual:** Main Dashboard displaying severity donut, top recurring issues bar, and the Weekly AI Insight card.
- **Narrator:**
  > *"Returning to the dashboard, farm operators see cumulative health trends across all parcels, severity distributions, and an AI-generated weekly agronomy insight highlighting the best-performing field and concrete prevention tips for the upcoming week."*

---

### [4:30 - 5:00] Security & Architecture Recap
- **Visual:** Architectural summary slide / terminal.
- **Narrator:**
  > *"Architecturally, AgriLens is built for resilience: Google Gemini API keys are strictly server-side and never exposed to the client. PostgreSQL enforces Row Level Security (RLS) so no farmer can ever access another user's plots. And the entire application is mobile-responsive and accessible.*
  > *AgriLens turns every smartphone into an agronomist's eye—bringing computer vision intelligence to the fields that feed our world. Thank you."*
