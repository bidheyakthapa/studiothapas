STUDIO THAPAS WEBSITE DEMO - VERSION 2
======================================

HOW TO OPEN OFFLINE
1. Download this ZIP file.
2. Right-click the ZIP and choose Extract All.
3. Open the extracted studio_thapas_website folder.
4. Double-click index.html to view the website in your browser. For folder-manifest photos, open the folder with VS Code and use the Live Server extension; browsers may block local JSON loading from file:// pages.
5. An internet connection is needed for the online sample photos and Google Fonts. The page layout itself opens offline.

WHAT IS INCLUDED
- Premium black and gold Studio Thapas website design.
- Photography, wedding, cinematography, video production, printing, frames and creative service sections.
- Five wedding package cards with Studio Thapas prices: Basic Rs. 30,000; Elite Rs. 35,000; Luxury Rs. 45,000; Premium Rs. 80,000; Diamond Rs. 1,20,000.
- WhatsApp enquiry form with service and package selection.
- Responsive layout for desktop and mobile.
- Photo Admin page for saving selected photos in the same browser on the same computer.
- Folder-based gallery manifest at images/gallery/photos.json.

ADD PHOTOS USING THE ADMIN PAGE
1. Open index.html in your browser.
2. Click Photo Admin in the top menu (or open admin.html).
3. Choose photos and a category, then click Save to this browser.
4. Open the website in the same browser on the same computer. Those locally saved photos can be displayed from that browser's local storage.

IMPORTANT ABOUT ADMIN UPLOADS
The Admin page in this demo stores photos in the browser on your computer only. It is NOT a secure login system and does NOT upload photos to hosting or make them visible to other visitors. To publish photos for all website visitors, upload them to the website hosting and add entries to images/gallery/photos.json, or later connect a proper server/database and secure admin login.

ADD PHOTOS THROUGH THE WEBSITE FOLDER
1. Copy your photo files into images/gallery/.
2. Open images/gallery/photos.json in Notepad or VS Code.
3. Add entries like this (use your exact file names):
   [
     {"file":"wedding-01.jpg","alt":"Studio Thapas wedding photography","category":"Wedding"},
     {"file":"maternity-01.jpg","alt":"Studio Thapas maternity photography","category":"Maternity"}
   ]
4. Save photos.json and refresh index.html.

IMPORTANT
- Current gallery photos are demo/sample images. Replace them with Studio Thapas original photographs before publishing.
- Wedding package inclusions are indicative website copy only. Confirm the exact number of event days, crew, deliverables, album details and extras in a written quotation before accepting bookings.
- This is a front-end demo. It does not include a live booking calendar, payment gateway, server database, cloud photo uploads or secure staff/admin authentication.
- Domain and hosting are not included. This demo can be previewed locally before publishing.

Business contact: +977 9841419161
Website: https://weddingthapas.com


GALLERY UPDATE (V2.1)
- Gallery photos are grouped by category: Wedding, Pre-wedding, Maternity, Newborn, Family, Graduation, Portrait, Product, Corporate, Event, Photo Printing and Other.
- Use the filter buttons on the Gallery section to show one category only.
- Portrait and landscape photos keep their original aspect ratio. The gallery uses a masonry layout and does not crop the image.
- In Photo Admin, choose the correct category before saving photos. A Wedding photo saved under Wedding will not appear in Graduation.
- For public website gallery photos, put image files in images/gallery/ and add records to images/gallery/photos.json, for example:
  [{"file":"wedding-01.jpg","name":"Wedding Story 01","category":"Wedding","alt":"Wedding photography"}]
- The offline Admin upload uses this browser's local storage and is not automatically published to hosting.
