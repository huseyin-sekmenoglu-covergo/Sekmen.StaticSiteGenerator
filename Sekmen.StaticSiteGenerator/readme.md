# Sekmen.StaticSiteGenerator

High‑level, flexible static site export utility for .NET and Umbraco.

This library (NuGet package: `Sekmen.StaticSiteGenerator`) crawls a dynamic Umbraco (or any standard HTML) website, follows internal links, downloads referenced assets, rewrites domain references, and produces a portable static snapshot you can deploy to any static host (Azure Static Web Apps, GitHub Pages, Netlify, S3, Cloudflare Pages, etc.).

It is also shipped together with an Umbraco backoffice plugin (NuGet: `Umbraco.Community.HtmlExporter`) that adds a dashboard UI & API endpoints so editors can trigger an export without touching code.

---
## Packages
| Package | Purpose |
|---------|---------|
| `Sekmen.StaticSiteGenerator` | Core export logic (crawler + downloader + rewriting). |
| `Umbraco.Community.HtmlExporter` | Umbraco backoffice dashboard + API wrapper around the core. |

---
## Key Features
- Sitemap + on‑the‑fly discovery (loads `sitemap.xml` then continues via internal `<a>` links)
- Recursive asset collection (CSS, JS, images, inline style `background-image: url(...)` references)
- Intelligent resource re-download check via HEAD (skips unchanged assets where size matches)
- Domain & path rewriting (replaces the original origin with a target/static domain you specify)
- Additional manual URL injection (export pages not linked or not in sitemap)
- Automatic `index.html` generation for folder style URLs
- Basic normalization for Umbraco specific paths (`umbraco-cms` → `umbraco`)
- MIT licensed & simple, dependency-light (only HtmlAgilityPack)

---
## How It Works (Core Flow)
1. Build a queue: seed with `sitemap.xml` entries + any `AdditionalUrls` you provide.
2. Pop a URL, download HTML, rewrite & save.
3. Parse internal `<a href>` links, enqueue new same‑host URLs.
4. Extract asset URLs (link/script/img/inline style url()).
5. Download assets (only if new or changed size).
6. Repeat until queue is empty.

---
## Installation
### Core Library
```
dotnet add package Sekmen.StaticSiteGenerator
```
### Umbraco Plugin (Dashboard)
```
dotnet add package Umbraco.Community.HtmlExporter
```
(Requires an Umbraco 16+ style project with backoffice extensions; ensure you restore & rebuild so client assets are generated.)

---
## Public API (Core)
### ExportCommand
| Property | Type | Description |
|----------|------|-------------|
| `SiteUrl` | `string` | Host *without* protocol (e.g. `example.com`). `https://` is automatically prepended in current implementation. |
| `AdditionalUrls` | `string[]` | Extra absolute or relative URLs/paths to ensure export even if not linked/sitemap. |
| `TargetUrl` | `string` | Replacement origin (e.g. `https://static.example.com/`). Used for rewriting references in saved HTML. Include trailing slash for consistency. |
| `OutputFolder` | `string` | Local folder where the static site will be generated. Created if missing. |

### Method
`await Functions.ExportWebsite(HttpClient client, ExportCommand command);`

#### Minimal Example (Console)
```csharp
using Sekmen.StaticSiteGenerator;

var http = new HttpClient();
var cmd = new ExportCommand(
    SiteUrl: "myumbracosite.com",          // no protocol
    AdditionalUrls: new[] { "/404", "/health" },
    TargetUrl: "https://static.myumbracosite.com/", // will replace absolute refs
    OutputFolder: Path.Combine(Environment.CurrentDirectory, "export")
);

await Functions.ExportWebsite(http, cmd);
Console.WriteLine("Export complete.");
```

---
## Umbraco Plugin
After installing `Umbraco.Community.HtmlExporter`, the package adds:
- Backoffice dashboard (App_Plugins) bundling a UI allowing you to enter export parameters.
- API endpoints (secured by backoffice auth & content section policy):
  - `GET /umbracocommunityhtmlexporter/api/v1.0/get-data` → dashboard config & domains
  - `POST /umbracocommunityhtmlexporter/api/v1.0/export-website` (multipart/form-data for the `ExportCommand` fields)

### Sample cURL
```bash
curl -X POST \
  -H "Cookie: auth cookie here" \
  -F SiteUrl=mysite.local \
  -F AdditionalUrls=/custom-page \
  -F AdditionalUrls=/another-page \
  -F TargetUrl=https://static.mysite.local/ \
  -F OutputFolder=C:\\exports\\mysite \
  https://mysite.local/umbracocommunityhtmlexporter/api/v1.0/export-website
```
(You must be an authenticated backoffice user; obtain cookies via normal login.)

---
## Rewriting Behavior Details
The exporter currently applies simple string replacements:
- `"/` → `"{TargetUrl}` and `'/'` → `'{TargetUrl}` (prefixing root-relative paths)
- Original `https://{SiteUrl}/` fully replaced with `{TargetUrl}`
- `umbraco-cms` → `umbraco` and `Umbraco CMS` → `Umbraco`
Future enhancements may introduce a structured HTML DOM rewrite to avoid accidental matches inside scripts or data attributes.

---
## Limitations / Known Gaps
- Assumes sitemap lives at `https://{SiteUrl}/sitemap.xml` and is reachable.
- Currently forces HTTPS when constructing source URL.
- No parallel throttling controls (a burst of sequential requests; could be slower for large sites).
- Does not parse JS-generated navigation or SPA routes.
- Asset change detection only by Content-Length (size) not hash.
- No exclusion / allow lists yet.

---
## Roadmap Ideas
- [ ] Protocol support in `SiteUrl` (respect http/https as provided)
- [ ] Configurable concurrency (degree of parallelism)
- [ ] Exclude / include glob patterns
- [ ] Hash-based unchanged asset detection
- [ ] Export manifest JSON (list of pages & assets)
- [ ] CLI tool wrapper (`dotnet tool install`)
- [ ] Stronger URL normalization & canonicalization
- [ ] Structured HTML rewrite (DOM aware) for safer replacements

Feel free to open issues or PRs to discuss and contribute.

---
## Development (Repo)
1. Clone & restore
```
git clone https://github.com/sekmenhuseyin/Sekmen.StaticSiteGenerator.git
cd Sekmen.StaticSiteGenerator
 dotnet restore
```
2. Build solution
```
dotnet build
```
3. (Plugin only) Build client assets – the MSBuild targets automatically run `npm i` + `npm run build` in `Umbraco.Community.HtmlExporter/Client` during pack/build. To trigger manually:
```
cd Umbraco.Community.HtmlExporter/Client
npm install
npm run build
```
4. Run test Umbraco site: open `UmbracoTestProject` (configure connection strings etc.)

---
## Packaging
```
dotnet pack -c Release
```
Outputs `.nupkg` for both packages (with embedded README & icon). Ensure the signing key path is valid or update `AssemblyOriginatorKeyFile` properties if forking.

---
## Extensibility Ideas
You can wrap `Functions.ExportWebsite` to:
- Inject custom headers (User-Agent, auth tokens)
- Add retry logic / resilience policies (Polly)
- Preprocess/postprocess HTML (minification, analytics injection)
- Generate a search index or RSS/JSON feed

---
## Troubleshooting
| Symptom | Possible Cause | Action |
|---------|----------------|-------|
| Empty export folder | Exception early (check console output) | Run under debugger / add logging |
| Some pages missing | Not linked internally nor in sitemap | Add to `AdditionalUrls` |
| Broken relative links | Missing trailing slash in `TargetUrl` | Ensure `TargetUrl` ends with `/` |
| Assets 404 on host | Rewritten to wrong domain | Verify `TargetUrl` correctness |
| Slow export | Large asset count, sequential fetch | Future: add parallelism (or fork & add tasks) |

---
## Security Notes
- Do not expose the export POST endpoint publicly without auth; it can be abused for bandwidth & disk usage.
- Validate / sanitize the `OutputFolder` if exposing in multi-tenant scenarios to avoid path traversal.

---
## Contributing
1. Fork & create a feature branch
2. Make changes (+ optional unit / integration tests)
3. Run build & manual smoke export
4. Open PR with clear description

---
## License
MIT © Hüseyin Sekmenoğlu

---
## Quick Start TL;DR
```csharp
await Functions.ExportWebsite(new HttpClient(), new ExportCommand(
    SiteUrl: "example.com",
    AdditionalUrls: Array.Empty<string>(),
    TargetUrl: "https://static.example.com/",
    OutputFolder: "./out"
));
```
Deploy the ./out folder to any static host – done.

