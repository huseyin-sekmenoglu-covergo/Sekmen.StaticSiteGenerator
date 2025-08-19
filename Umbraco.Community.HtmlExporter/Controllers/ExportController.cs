using HtmlAgilityPack;
using Sekmen.StaticSiteGenerator;

namespace Umbraco.Community.HtmlExporter.Controllers;

[VersionedApiBackOfficeRoute("export")]
[AllowAnonymous]
public class ExportController(
    IHttpClientFactory httpClientFactory
) : ManagementApiControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Website([FromForm] ExportDashboardRequest request)
    {
        string sourceUrl = $"https://{request.SiteUrl}/";
        Directory.CreateDirectory(request.OutputFolder);
        using HttpClient client = httpClientFactory.CreateClient();

        string sitemapXml = await client.GetStringAsync(sourceUrl + "sitemap.xml");
        XDocument sitemap = XDocument.Parse(sitemapXml);
        XNamespace ns = sitemap.Root!.GetDefaultNamespace();

        Queue<string> urls = new();
        HashSet<string> visited = new();

        // Add additional manual URLs
        string[] manualPaths = ["sitemap.xml", "/404.html", "/robots.txt", "/humans.txt", "/manifest.json"];
        foreach (string path in manualPaths)
        {
            urls.Enqueue(new Uri(new Uri(sourceUrl), path).ToString());
        }

        // Load sitemap URLs
        foreach (XElement loc in sitemap.Descendants(ns + "loc"))
        {
            urls.Enqueue(loc.Value);
        }

        while (urls.Count > 0)
        {
            string pageUrl = urls.Dequeue();
            // ReSharper disable once CanSimplifySetAddingWithSingleCall
            if (visited.Contains(pageUrl)) continue;
            visited.Add(pageUrl);

            HtmlDocument? htmlDoc = await ExportFunctions.ProcessUrls(client, pageUrl, request.OutputFolder, sourceUrl, request.TargetUrl);
            if (htmlDoc == null) continue;

            // Extract internal links and enqueue them
            if (htmlDoc.DocumentNode.InnerHtml.Contains("<a"))
                foreach (HtmlNode link in htmlDoc.DocumentNode.SelectNodes("//a[@href]")!)
                {
                    string href = link.GetAttributeValue("href", string.Empty);
                    if (string.IsNullOrWhiteSpace(href)) continue;

                    Uri uri = new Uri(pageUrl);
                    Uri newUri = new Uri(uri, href);
                    if (newUri.Host == uri.Host && !visited.Contains(newUri.ToString()))
                        urls.Enqueue(newUri.ToString());
                }
        }

        return Content("Done.");
    }
}

public record ExportDashboardRequest(string SiteUrl, string TargetUrl, string OutputFolder);