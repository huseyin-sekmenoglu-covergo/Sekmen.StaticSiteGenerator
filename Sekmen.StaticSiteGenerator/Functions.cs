namespace Sekmen.StaticSiteGenerator;

public static class Functions
{
    public static async Task ExportWebsite(HttpClient client, ExportCommand request)
    {
        string sourceUrl = $"https://{request.SiteUrl}/";
        Directory.CreateDirectory(request.OutputFolder);
        string sitemapXml = await client.GetStringAsync(sourceUrl + "sitemap.xml");
        XDocument sitemap = XDocument.Parse(sitemapXml);
        XNamespace ns = sitemap.Root!.GetDefaultNamespace();

        HashSet<string> visited = [];
        Queue<string> urls = new();

        // Load sitemap URLs
        urls.Enqueue("sitemap.xml");
        foreach (XElement loc in sitemap.Descendants(ns + "loc")) 
            urls.Enqueue(loc.Value);

        // Add additional manual URLs
        foreach (string path in request.AdditionalUrls) 
            urls.Enqueue(new Uri(new Uri(sourceUrl), path).ToString());

        while (urls.Count > 0)
        {
            string pageUrl = urls.Dequeue();
            if (!visited.Add(pageUrl)) continue;
            Console.WriteLine($"Processing: {pageUrl}");

            // Extract internal links and enqueue them
            HtmlDocument? htmlDoc = await ProcessUrls(client, pageUrl, request.OutputFolder, sourceUrl, request.TargetUrl);
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
    }

    private static async Task<HtmlDocument?> ProcessUrls(HttpClient client, string pageUrl, string outputFolder, string sourceUrl, string newDomain)
    {
        try
        {
            string html = await client.GetStringAsync(pageUrl);
            HtmlDocument htmlDoc = new();
            htmlDoc.LoadHtml(html);

            Uri uri = new Uri(pageUrl);
            string pagePath = Path.Combine(outputFolder, uri.Host, uri.AbsolutePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar).Replace("umbraco-cms", "umbraco"));
            if (!Path.HasExtension(uri.AbsolutePath))
                pagePath = Path.Combine(pagePath, "index.html");
            if (!Directory.Exists(Path.GetDirectoryName(pagePath)))
                Directory.CreateDirectory(Path.GetDirectoryName(pagePath)!);
            await File.WriteAllTextAsync(pagePath, html.Replace("\"/", "\"" + newDomain).Replace("'/", "'" + newDomain).Replace(sourceUrl, newDomain).Replace("umbraco-cms", "umbraco").Replace("Umbraco CMS", "Umbraco"));
            Console.WriteLine($"Page saved: {pagePath}");

            if (pagePath.Contains(".pdf"))
                return null;

            HashSet<string> resourceUrls = ExtractResourceUrls(htmlDoc, uri);
            foreach (string resourceUrl in resourceUrls) 
                await DownloadResource(client, uri, resourceUrl, outputFolder);

            return htmlDoc;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error processing {pageUrl}: {ex.Message}");
        }

        return null;
    }

    private static HashSet<string> ExtractResourceUrls(HtmlDocument doc, Uri baseUri)
    {
        HashSet<string> resources = [];

        foreach (HtmlNode link in doc.DocumentNode.SelectNodes("//link") ?? new HtmlNodeCollection(null!))
        {
            string href = link.GetAttributeValue("href", string.Empty);
            if (!string.IsNullOrWhiteSpace(href) && (href.StartsWith('/') || href.StartsWith(baseUri.AbsoluteUri)) &&
                !href.Equals(baseUri.AbsoluteUri))
                resources.Add(href);
        }

        foreach (HtmlNode script in doc.DocumentNode.SelectNodes("//script[@src]") ?? new HtmlNodeCollection(null!))
        {
            string src = script.GetAttributeValue("src", string.Empty);
            if (!string.IsNullOrWhiteSpace(src) && (src.StartsWith('/') || src.StartsWith(baseUri.AbsoluteUri)))
                resources.Add(src);
        }

        foreach (HtmlNode img in doc.DocumentNode.SelectNodes("//img[@src]") ?? new HtmlNodeCollection(null!))
        {
            string src = img.GetAttributeValue("src", string.Empty);
            if (!string.IsNullOrWhiteSpace(src) && (src.StartsWith('/') || src.StartsWith(baseUri.AbsoluteUri)))
                resources.Add(src);
        }


        // style="background-image: url(...)" inline styles
        foreach (HtmlNode node in doc.DocumentNode.SelectNodes("//*[@style]") ?? new HtmlNodeCollection(null!))
        {
            string style = node.GetAttributeValue("style", string.Empty);
            if (string.IsNullOrEmpty(style)) 
                continue;
            // Extract all urls from the style content using regex
            MatchCollection matches = Regex.Matches(style, @"url\(['""]?(?<url>[^'""\)]+)['""]?\)");
            foreach (Match match in matches)
            {
                string url = match.Groups["url"].Value;
                if (!string.IsNullOrWhiteSpace(url))
                    resources.Add(url);
            }
        }

        return resources;
    }

    private static async Task DownloadResource(HttpClient client, Uri uri, string resourceUrl, string outputFolder)
    {
        try
        {
            Uri resourceUri = new Uri(uri, resourceUrl);
            string resourcePath = Path.Combine(outputFolder, uri.Host, resourceUri.AbsolutePath.TrimStart('/'));
            Directory.CreateDirectory(Path.GetDirectoryName(resourcePath)!);

            using HttpRequestMessage headRequest = new(HttpMethod.Head, resourceUri);
            using HttpResponseMessage headResponse = await client.SendAsync(headRequest);
            headResponse.EnsureSuccessStatusCode();

            long remoteSize = headResponse.Content.Headers.ContentLength ?? -1;
            bool shouldDownload = true;

            if (File.Exists(resourcePath) && remoteSize != -1)
            {
                long localSize = new FileInfo(resourcePath).Length;
                shouldDownload = localSize != remoteSize;
            }

            if (shouldDownload)
            {
                byte[] data = await client.GetByteArrayAsync(resourceUri);
                await File.WriteAllBytesAsync(resourcePath, data);
                Console.WriteLine($"Downloaded: {resourceUri}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed: {resourceUrl} - {ex.Message}");
        }
    }
}