namespace Sekmen.StaticSiteGenerator;

public static class ExportFunctions
{
    public static async Task<HtmlDocument?> ProcessUrls(HttpClient client, string pageUrl, string outputFolder, string sourceUrl, string newDomain)
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