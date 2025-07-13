Console.WriteLine("--- Sekmen.StaticSiteGenerator ---");
const string sourceUrl = "http://127.0.0.1:44362/";
const string newDomain = "https://huseyinsekmenoglu.net/";
const string outputFolder = @"D:\Projects";

Directory.CreateDirectory(outputFolder);
using var client = new HttpClient();

Console.WriteLine("Downloading sitemap...");
var sitemapXml = await client.GetStringAsync(sourceUrl + "sitemap.xml");
var sitemap = XDocument.Parse(sitemapXml);
var ns = sitemap.Root!.GetDefaultNamespace();

var urls = new Queue<string>();
var visited = new HashSet<string>();

// Load sitemap URLs
foreach (var loc in sitemap.Descendants(ns + "loc"))
{
    urls.Enqueue(loc.Value);
}

// Add additional manual URLs
var manualPaths = new[] { "/404.html", "/robots.txt", "/humans.txt", "/manifest.json" };
foreach (var path in manualPaths)
{
    urls.Enqueue(new Uri(new Uri(sourceUrl), path).ToString());
}

while (urls.Count > 0)
{
    var pageUrl = urls.Dequeue();
    if (visited.Contains(pageUrl)) continue;
    visited.Add(pageUrl);

    try
    {
        var html = await client.GetStringAsync(pageUrl);
        var htmlDoc = new HtmlDocument();
        htmlDoc.LoadHtml(html);

        var uri = new Uri(pageUrl);
        var pagePath = Path.Combine(outputFolder, uri.Host, uri.AbsolutePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)) + Path.DirectorySeparatorChar;
        if (!Path.HasExtension(pagePath))
            pagePath = Path.Combine(pagePath, "index.html");
        if (!Directory.Exists(Path.GetDirectoryName(pagePath)))
            Directory.CreateDirectory(Path.GetDirectoryName(pagePath)!);
        File.WriteAllText(pagePath, html.Replace("\"/", "\"" + newDomain).Replace("'/", "'" + newDomain).Replace(sourceUrl, newDomain));
        Console.WriteLine($"Page saved: {pagePath}");

        var resourceUrls = Functions.ExtractResourceUrls(htmlDoc, uri);
        foreach (var resourceUrl in resourceUrls)
        {
            try
            {
                var resourceUri = new Uri(uri, resourceUrl);
                var resourcePath = Path.Combine(outputFolder, uri.Host, resourceUri.AbsolutePath.TrimStart('/'));
                Directory.CreateDirectory(Path.GetDirectoryName(resourcePath)!);

                using var headRequest = new HttpRequestMessage(HttpMethod.Head, resourceUri);
                using var headResponse = await client.SendAsync(headRequest);
                headResponse.EnsureSuccessStatusCode();

                var remoteSize = headResponse.Content.Headers.ContentLength ?? -1;
                var shouldDownload = true;

                if (File.Exists(resourcePath) && remoteSize != -1)
                {
                    var localSize = new FileInfo(resourcePath).Length;
                    shouldDownload = localSize != remoteSize;
                }

                if (shouldDownload)
                {
                    var data = await client.GetByteArrayAsync(resourceUri);
                    File.WriteAllBytes(resourcePath, data);
                    Console.WriteLine($"Downloaded: {resourceUri}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed: {resourceUrl} - {ex.Message}");
            }
        }

        // Extract internal links and enqueue them
        foreach (var link in htmlDoc.DocumentNode.SelectNodes("//a[@href]")!)
        {
            var href = link.GetAttributeValue("href", string.Empty);
            if (string.IsNullOrWhiteSpace(href)) continue;

            var newUri = new Uri(uri, href);
            if (newUri.Host == uri.Host && !visited.Contains(newUri.ToString()))
            {
                urls.Enqueue(newUri.ToString());
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error processing {pageUrl}: {ex.Message}");
    }
}
Console.WriteLine("Done.");