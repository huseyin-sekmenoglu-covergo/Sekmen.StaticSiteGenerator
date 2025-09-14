namespace Umbraco.Community.HtmlExporter.Controllers;

[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "Umbraco.Community.HtmlExporter")]
[MapToApi(Constants.ApiName)]
public class UmbracoCommunityHtmlExporterApiController(
    IHttpClientFactory httpClientFactory
) : UmbracoCommunityHtmlExporterApiControllerBase
{
    [HttpPost("export-website")]
    [Produces("text/plain")]
    [ProducesResponseType<string>(StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportWebsite([FromForm] ExportDashboardRequest request)
    {
        string sourceUrl = $"https://{request.SiteUrl}/";
        Directory.CreateDirectory(request.OutputFolder);
        using HttpClient client = httpClientFactory.CreateClient();

        string sitemapXml = await client.GetStringAsync(sourceUrl + "sitemap.xml");
        XDocument sitemap = XDocument.Parse(sitemapXml);
        XNamespace ns = sitemap.Root!.GetDefaultNamespace();

        Queue<string> urls = new();
        HashSet<string> visited = [];

        // Add additional manual URLs
        string[] manualPaths = ["sitemap.xml", "/thank-you", "/404.html", "/robots.txt", "/humans.txt", "/manifest.json"];
        foreach (string path in manualPaths) 
            urls.Enqueue(new Uri(new Uri(sourceUrl), path).ToString());

        // Load sitemap URLs
        foreach (XElement loc in sitemap.Descendants(ns + "loc")) 
            urls.Enqueue(loc.Value);

        while (urls.Count > 0)
        {
            string pageUrl = urls.Dequeue();
            if (!visited.Add(pageUrl)) continue;
            Console.WriteLine($"Processing: {pageUrl}");

            // Extract internal links and enqueue them
            HtmlDocument? htmlDoc = await ExportFunctions.ProcessUrls(client, pageUrl, request.OutputFolder, sourceUrl, request.TargetUrl);
            HtmlNodeCollection? links = htmlDoc?.DocumentNode.SelectNodes("//a[@href]");
            if (links == null) continue;
            foreach (HtmlNode link in links)
            {
                string href = link.GetAttributeValue("href", string.Empty);
                if (string.IsNullOrWhiteSpace(href)) continue;

                Uri uri = new(pageUrl);
                Uri newUri = new(uri, href);
                if (newUri.Host == uri.Host && !visited.Contains(newUri.ToString()))
                    urls.Enqueue(newUri.ToString());
            }
        }

        return Content("Done.");
    }
}