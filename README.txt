STUDIO THAPAS WEBSITE
=====================

Live site:   https://studiothapas.netlify.app/
Photo admin: https://studiothapas.netlify.app/admin/
Repository:  https://github.com/bidheyakthapa/studiothapas (branch: main)

Plain HTML/CSS/JS, no build step. Netlify redeploys automatically on every push to main.


ADDING PHOTOS (PHOTO ADMIN)
1. Open /admin/ and click "Sign In with GitHub".
   Only GitHub accounts with write access to the repository can sign in.
   To give someone access: GitHub repo > Settings > Collaborators > Add people.
2. Gallery > New Album. Enter a title (used as the photo caption), choose a
   category and add one or more photos (you can select many at once).
3. Click Save. The CMS commits the photos and images/gallery/photos.json to
   GitHub, and the live site updates in about a minute.
4. Drag albums in the list to change their order on the website.
   Delete an album to remove it from the website.
5. To remove one photo: open the album, click Remove under that photo, Save.
   The file itself stays in the repository. To delete unused files for good,
   open the Asset Library (image icon, top left), tick the file and click
   Delete. Only delete files that are no longer in any album.

Photo quality: uploads are converted in the browser to WebP at quality 90,
with the long edge capped at 2560px (smaller photos are never enlarged).
Camera EXIF/GPS data is removed. Upload your normal sRGB web exports.

Categories in the admin must match the gallery filter buttons in index.html.
To add a category, add it in both places: the filter buttons in index.html
and the category options in admin/config.yml.


ONE-TIME LOGIN SETUP (ALREADY DONE ONCE, KEEP FOR REFERENCE)
1. GitHub > Settings > Developer settings > OAuth Apps > New OAuth App.
   Application name: Studio Thapas Admin
   Homepage URL: https://studiothapas.netlify.app
   Redirect URI (older form: "Authorization callback URL"):
     https://api.netlify.com/auth/done
   Leave "Allow wildcard matching" and "Enable Device Flow" unticked.
   Untick "Expire user access tokens" (Netlify's login does not refresh
   tokens, so the admin would sign you out every 8 hours).
2. Copy the Client ID and generate a Client Secret.
3. Netlify > Project configuration > Security > OAuth > Install provider >
   GitHub, paste the Client ID and Secret.


FILES
- index.html, style.css, script.js   The website.
- images/gallery/photos.json         Gallery data (written by the admin).
- images/gallery/                    Gallery photos (uploaded by the admin).
- admin/index.html, admin/config.yml The Photo Admin (Sveltia CMS).

photos.json format (one object per album):
  [
    {
      "title": "Sita & Ram Wedding",
      "category": "Wedding",
      "photos": ["/images/gallery/img-0001-3f9a2c1b7d4e.webp"]
    }
  ]

To preview locally, serve the folder over HTTP (e.g. VS Code Live Server or
`python3 -m http.server`); browsers block photos.json when opening the file directly.


IMPORTANT
- Service-section images are sample photos from Unsplash. Replace them with
  Studio Thapas originals.
- Wedding package inclusions are indicative website copy only. Confirm event
  days, crew, deliverables, album details and extras in a written quotation.
- The enquiry form opens WhatsApp; it does not store submissions.

Business contact: +977 9841419161
Website: https://weddingthapas.com
