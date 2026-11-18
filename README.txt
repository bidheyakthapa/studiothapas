STUDIO THAPAS WEBSITE
=====================

Live site:   https://studiothapas.com.np/
Admin:       https://studiothapas.com.np/admin/
Repository:  https://github.com/bidheyakthapa/studiothapas (branch: main)

Plain HTML/CSS/JS with no build step. Every save in the admin is a commit to
`main`, and the host redeploys the site automatically (about a minute).


PAGES
- /                       Home: hero, services, packages, gallery preview, contact
- /service/?s=<address>   One page per service: description, packages, photos, related services
- /gallery/               Full gallery with filters and pagination (?service=<address>&page=2)
- /404.html               Not-found page


USING THE ADMIN (/admin/)
Sign in with GitHub. Only GitHub accounts with write access to the repository
can sign in (GitHub repo > Settings > Collaborators > Add people).

Home Page
  Hero heading, intro text and hero photos (at least one; with two or more
  they fade from one to the next), the "Also available" note, and the
  packages intro and note.

Contact & Social Links
  Phone, WhatsApp number (enquiries open WhatsApp to it), address, opening
  hours and the footer links (Facebook, Instagram, ...). Links open in a new tab.

Services
  Add, edit, remove and drag to reorder. Each service has a name, a page
  address (e.g. "wedding"; set it once, because albums and packages are
  linked to it), a short name for the gallery buttons, a small label, a short
  description, a cover photo, a full description and "What's included".

Gallery Albums
  New Album > title (the caption), service, date, photos (select many at
  once; drag to reorder). Newest albums (by date) appear first. To remove a
  single photo: open the album, click Remove under it, Save. To remove the
  file for good, delete it in the Asset Library (image icon, top left), but
  only if it is not used in any album.

Packages
  Add, edit, remove and drag to reorder. Optionally link a package to a
  service so it also appears on that service's page. "Highlight as Popular
  choice" adds the gold tag.

Photo quality: uploads are converted in the browser to WebP at quality 92,
long edge up to 4096px (smaller photos are never enlarged), and camera
EXIF/GPS data is removed. Upload camera or Lightroom exports in sRGB. Do not
upload photos that were sent through WhatsApp or Messenger: those apps shrink
them (WhatsApp to 1600px), and the website cannot restore the lost detail.


MOVING TO CLOUDFLARE (one-time setup, all on the free plan)
Why: Netlify's free plan is 300 credits/month (each deploy 15, each GB of
traffic 20) and can pause the site. Cloudflare Pages has unlimited traffic and
500 deploys/month; R2 stores 10 GB of photos free with free traffic.

 1. Create a Cloudflare account. Add the site studiothapas.com.np (Free plan).
    Cloudflare shows two nameservers. Do NOT change them yet.
 2. Workers & Pages > Create > Pages > Connect to Git > choose the
    bidheyakthapa/studiothapas repository.
    Production branch: main. Framework preset: None.
    Build command: exit 0. Build output directory: /
    Deploy. It gets a studiothapas.pages.dev address; check that it works.
 3. At register.com.np, replace the Netlify nameservers with Cloudflare's two.
    Wait until Cloudflare shows the site as Active (hours to ~2 days).
 4. Pages project > Custom domains > add studiothapas.com.np and
    www.studiothapas.com.np. Cloudflare creates the DNS records and HTTPS.
 5. R2 > Create bucket "studiothapas-photos" (R2 may ask for a card even on the
    free plan; nothing is charged under 10 GB).
    Bucket > Settings > Custom Domains > add photos.studiothapas.com.np.
    Bucket > Settings > CORS policy > paste:
      [{"AllowedOrigins":["https://studiothapas.com.np","https://www.studiothapas.com.np"],
        "AllowedMethods":["GET","PUT","DELETE","HEAD"],"AllowedHeaders":["*"],
        "ExposeHeaders":["ETag"],"MaxAgeSeconds":3000}]
    R2 > Manage API tokens > Create API token > "Object Read & Write",
    only this bucket. Keep the Access Key ID and Secret Access Key.
 6. Images > Transformations > enable for studiothapas.com.np (free: 5,000
    new thumbnails a month; if exceeded, the site shows the full photo instead).
 7. Admin sign-in: deploy the Sveltia CMS Authenticator to Workers
    (https://github.com/sveltia/sveltia-cms-auth, "Deploy to Cloudflare Workers"),
    register its GitHub App (Redirect URI: <worker URL>/callback), install the
    app on the studiothapas repository, and set the Worker variables
    GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET (as a secret) and
    ALLOWED_DOMAINS = studiothapas.com.np, www.studiothapas.com.np
 8. Then update the code (admin/config.yml: `base_url` and the `cloudflare_r2`
    block with the account ID, bucket and Access Key ID; script.js:
    CLOUDFLARE_IMAGES = true). The Secret Access Key is never put in the
    code: the admin asks for it once per browser.
 9. When everything works on Cloudflare, delete the Netlify site.


FILES
- index.html, service/index.html, gallery/index.html, 404.html   Pages
- style.css, script.js                                           Design and behaviour
- content/home.json, settings.json, services.json,
  gallery.json, packages.json                                    Content (written by the admin)
- images/gallery/                                                Photos uploaded so far
- admin/index.html, admin/config.yml                             The admin (Sveltia CMS 0.256.1, pinned)
- favicon.svg, favicon.ico, apple-touch-icon.png                 Browser and phone icons

To preview locally, serve this folder over HTTP, e.g. `python3 -m http.server`,
then open http://localhost:8000/ (opening index.html directly will not load content).


IMPORTANT
- Service cover photos and the wedding feature photo are Unsplash samples.
  Replace them with Studio Thapas originals in the admin.
- Wedding package inclusions are indicative website copy only. Confirm event
  days, crew, deliverables, album details and extras in a written quotation.
- The enquiry form opens WhatsApp; it does not store submissions.
