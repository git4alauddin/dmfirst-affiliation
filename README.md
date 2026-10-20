# DmFirst affiliate landing page

Basic scaffold for a mobile-first, animated affiliate landing page built with
HTML, CSS, and JavaScript. The full visual implementation follows the initial
scaffold commit.

## Structure

```text
dm-first-aff/
├── index.html
├── assets/
│   ├── images/
│   ├── animations/
│   └── fonts/
├── css/
│   ├── styles.css
│   └── animations.css
├── js/
│   ├── config.js
│   ├── main.js
│   └── animations.js
├── future/
│   └── dashboard-flow.md
├── .gitattributes
├── .gitignore
└── README.md
```

## Preview

Serve the project root with a static HTTP server, such as the IDE's built-in
HTML preview server, and open `index.html` through that server. JavaScript uses
ES modules, so use HTTP instead of opening the page with a `file://` URL.
No packages or build step are needed for this scaffold.

## Registration

The starter registration link points to DmFirst with invitation code
`93458117528`. `js/config.js` is the source for registration and deposit
destinations; `js/main.js` applies the registration URL to links marked with
`data-register-link`. Keep the HTML fallback URL synchronized if it changes.

Registration and payments happen on DmFirst. This project does not collect
credentials, create platform accounts, or process deposits.

## Next implementation

- Build the animated opening scene and responsive page layout.
- Add game visuals, category previews, and mobile registration calls to action.
- Provide reduced-motion behavior and optimize visual assets for loading speed.
- Add confirmed affiliate details and offer conditions where applicable.

See `future/dashboard-flow.md` for the later deposit flow and its integration
requirements. Minimum deposit and currency are unset, and the prompt is disabled.

## Git

The initial commit contains the directory structure and starter files. Local
IDE settings, dependencies, environment files, and build output are ignored.
No Git remote is configured by this scaffold.
