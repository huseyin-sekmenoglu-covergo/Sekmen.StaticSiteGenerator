# Sitemap Website Exporter (.NET)

A simple application that reads `sitemap.xml`, downloads all listed pages and saves each page's HTML
along with its CSS, JavaScript, image and inline background image resources to a local folder,
preserving the original structure.

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

- .NET 9
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

### 3. Add App Settings

```json
{
  "ExportHtmlSettings": {
    "TargetUrl": "https://huseyinsekmenoglu.net/",
    "OutputFolder": "D:\\Projects",
    "AdditionalUrls": [
      "/sitemap.xml",
      "/thank-you",
      "/404.html",
      "/robots.txt",
      "/humans.txt",
      "/manifest.json"
    ]
  }
}
```

### 4. Add Dependency in Program.cs

```csharp
builder.Services.AddHtmlExporter(builder.Configuration);
```

### 5. Run the app

```bash
dotnet run
```

### 6. Test project credentials

```bash
admin@test.com
123qwe123qwe
```

---

## 🧑‍💻 License

MIT – Free to use, modify, and distribute.
