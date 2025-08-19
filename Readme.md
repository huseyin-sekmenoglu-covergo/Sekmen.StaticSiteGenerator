# Sitemap Website Exporter (.NET)

A simple application that reads `sitemap.xml`, downloads all listed pages, and saves each page's HTML along with its CSS, JavaScript, image, and inline background image resources to a local folder — preserving the original structure.

---

## 📦 Features

- Parses URLs from a sitemap XML
- Downloads HTML pages
- Extracts and downloads:
  - `<link rel="stylesheet">` CSS files
  - `<script src="...">` JS files
  - `<img src="...">` image files
  - Inline styles like `style="background-image: url(...)"` in HTML
- Skips downloading if a file already exists with the same size
- Creates local folder structure to match the site

---

## 🛠 Technologies

- .NET 6+
- `HttpClient` for HTTP requests
- `HtmlAgilityPack` for HTML parsing
- `System.Xml.Linq` for reading `sitemap.xml`

---

## 🚀 Getting Started

### 1. Clone the project

```bash
git clone https://github.com/your-repo/sitemap-exporter.git
cd sitemap-exporter
```

### 2. Build the project

```bash
dotnet build
```

### 3. Run the app

```bash
dotnet run
```

### 4. Test project credentials

```bash
admin@test.com
123qwe123qwe
```

By default, it will:

- Load sitemap from `https://example.com/sitemap.xml`
- Save the downloaded content to the `ExportedSite/` folder

To use your own sitemap and output directory, edit these lines in `Program.cs`:

```csharp
string sitemapUrl = "https://yourdomain.com/sitemap.xml";
string outputFolder = "ExportedSite";
```

---

## 📁 Output Structure

The tool saves the website to a folder like this:

```
ExportedSite/
└── yourdomain.com/
    ├── index.html
    ├── styles/
    │   └── main.css
    ├── scripts/
    │   └── app.js
    └── media/
        └── header-bg.jpg
```

---

## ✅ TODO / Improvements

- [ ] Rewrite HTML to point to downloaded assets
- [ ] Parse `@import` and `url(...)` in CSS files
- [ ] CLI argument support (`--sitemap`, `--output`)
- [ ] Parallel downloads
- [ ] Retry and timeout settings
- [ ] Save metadata (ETags, hashes) for smarter caching

---

## 🧑‍💻 License

MIT – Free to use, modify, and distribute.
