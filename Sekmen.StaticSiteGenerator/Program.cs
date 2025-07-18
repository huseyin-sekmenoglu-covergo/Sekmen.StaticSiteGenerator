Console.WriteLine("--- Sekmen.StaticSiteGenerator ---");
const string sourceUrl = "https://localhost:44362/";
const string newDomain = "https://huseyinsekmenoglu.net/";
const string outputFolder = @"D:\Projects";

Directory.CreateDirectory(outputFolder);
var httpClientHandler = new HttpClientHandler();
httpClientHandler.ServerCertificateCustomValidationCallback = (_, _, _, _) => true;
using var client = new HttpClient(httpClientHandler);

Console.WriteLine("Downloading sitemap...");
var sitemapXml = await client.GetStringAsync(sourceUrl + "sitemap.xml");
var sitemap = XDocument.Parse(sitemapXml);
var ns = sitemap.Root!.GetDefaultNamespace();

var urls = new Queue<string>();
var visited = new HashSet<string>();

// Add additional manual URLs
var manualPaths = new[] { "/404.html", "/robots.txt", "/humans.txt", "/manifest.json" };
foreach (var path in manualPaths)
{
    urls.Enqueue(new Uri(new Uri(sourceUrl), path).ToString());
}

// Load sitemap URLs
foreach (var loc in sitemap.Descendants(ns + "loc"))
{
    urls.Enqueue(loc.Value);
}

while (urls.Count > 0)
{
    var pageUrl = urls.Dequeue();
    // ReSharper disable once CanSimplifySetAddingWithSingleCall
    if (visited.Contains(pageUrl)) continue;
    visited.Add(pageUrl);

    var htmlDoc = await Functions.ProcessUrls(client, pageUrl, outputFolder, sourceUrl, newDomain);
    if (htmlDoc == null) continue;

    // Extract internal links and enqueue them
    if (htmlDoc.DocumentNode.InnerHtml.Contains("<a"))
        foreach (var link in htmlDoc.DocumentNode.SelectNodes("//a[@href]")!)
        {
            var href = link.GetAttributeValue("href", string.Empty);
            if (string.IsNullOrWhiteSpace(href)) continue;

            var uri = new Uri(pageUrl);
            var newUri = new Uri(uri, href);
            if (newUri.Host == uri.Host && !visited.Contains(newUri.ToString()))
                urls.Enqueue(newUri.ToString());
        }
}

Console.WriteLine("Done.");