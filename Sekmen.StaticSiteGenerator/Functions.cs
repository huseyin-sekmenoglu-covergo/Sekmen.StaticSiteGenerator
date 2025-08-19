namespace Sekmen.StaticSiteGenerator;

public static class ExportFunctions
{
    public static async Task<HtmlDocument?> ProcessUrls(HttpClient client, string pageUrl, string outputFolder, string sourceUrl, string newDomain)
    {
        try
        {
            var html = await client.GetStringAsync(pageUrl);
            var htmlDoc = new HtmlDocument();
            htmlDoc.LoadHtml(html);

            var uri = new Uri(pageUrl);
            var pagePath = Path.Combine(outputFolder, uri.Host, uri.AbsolutePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar).Replace("umbraco-cms", "umbraco"));
            if (!Path.HasExtension(uri.AbsolutePath))
                pagePath = Path.Combine(pagePath, "index.html");
            if (!Directory.Exists(Path.GetDirectoryName(pagePath)))
                Directory.CreateDirectory(Path.GetDirectoryName(pagePath)!);
            await File.WriteAllTextAsync(pagePath, html.Replace("\"/", "\"" + newDomain).Replace("'/", "'" + newDomain).Replace(sourceUrl, newDomain).Replace("umbraco-cms", "umbraco").Replace("Umbraco CMS", "Umbraco"));
            Console.WriteLine($"Page saved: {pagePath}");

            if (pagePath.Contains(".pdf"))
                return null;

            var resourceUrls = ExtractResourceUrls(htmlDoc, uri);
            foreach (var resourceUrl in resourceUrls) 
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
        var resources = new HashSet<string>();

        foreach (var link in doc.DocumentNode.SelectNodes("//link") ?? new HtmlNodeCollection(null!))
        {
            var href = link.GetAttributeValue("href", string.Empty);
            if (!string.IsNullOrWhiteSpace(href) && (href.StartsWith('/') || href.StartsWith(baseUri.AbsoluteUri)) &&
                !href.Equals(baseUri.AbsoluteUri))
                resources.Add(href);
        }

        foreach (var script in doc.DocumentNode.SelectNodes("//script[@src]") ?? new HtmlNodeCollection(null!))
        {
            var src = script.GetAttributeValue("src", string.Empty);
            if (!string.IsNullOrWhiteSpace(src) && (src.StartsWith('/') || src.StartsWith(baseUri.AbsoluteUri)))
                resources.Add(src);
        }

        foreach (var img in doc.DocumentNode.SelectNodes("//img[@src]") ?? new HtmlNodeCollection(null!))
        {
            var src = img.GetAttributeValue("src", string.Empty);
            if (!string.IsNullOrWhiteSpace(src) && (src.StartsWith('/') || src.StartsWith(baseUri.AbsoluteUri)))
                resources.Add(src);
        }


        // style="background-image: url(...)" inline styles
        foreach (var node in doc.DocumentNode.SelectNodes("//*[@style]") ?? new HtmlNodeCollection(null!))
        {
            var style = node.GetAttributeValue("style", string.Empty);
            if (string.IsNullOrEmpty(style)) 
                continue;
            // Extract all urls from the style content using regex
            var matches = Regex.Matches(style, @"url\(['""]?(?<url>[^'""\)]+)['""]?\)");
            foreach (Match match in matches)
            {
                var url = match.Groups["url"].Value;
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