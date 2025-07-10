public static class Functions
{
    public static async Task<string> DownloadSingleFile(HttpClient httpClient, string url, string outputFolder, string fileName, string newDomain)
    {
        Console.WriteLine("Downloading: " + url + fileName);
        var content = await httpClient.GetStringAsync(url + fileName);

        var pagePath = Path.Combine(outputFolder, fileName);
        await File.WriteAllTextAsync(pagePath, content.Replace(url, newDomain));
        Console.WriteLine("File saved to: " + pagePath);
        return content;
    }
    
    public static async Task ProcessUrls(HttpClient httpClient, XElement xElement, string outputFolder, string url, string newDomain)
    {
        var pageUrl = xElement.Value;
        Console.WriteLine($"Processing: {pageUrl}");

        var html = await httpClient.GetStringAsync(pageUrl);
        var htmlDoc = new HtmlDocument();
        htmlDoc.LoadHtml(html);

        // save the HTML page
        var uri = new Uri(pageUrl);
        var pagePath = Path.Combine(outputFolder, uri.AbsolutePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)) + Path.DirectorySeparatorChar;
        if (!Path.HasExtension(pagePath))
            pagePath = Path.Combine(pagePath, "index.html");
        if (!Directory.Exists(Path.GetDirectoryName(pagePath)))
            Directory.CreateDirectory(Path.GetDirectoryName(pagePath)!);
        await File.WriteAllTextAsync(pagePath, html.Replace("\"/", "\"" + newDomain).Replace("'/", "'" + newDomain).Replace(url, newDomain));
        Console.WriteLine($"Page saved to: {pagePath}");

        var resourceUrls = ExtractResourceUrls(htmlDoc, uri);
        foreach (var resourceUrl in resourceUrls)
        {
            await DownloadResource(httpClient, uri, resourceUrl, outputFolder);
        }
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

    private static async Task DownloadResource(HttpClient httpClient, Uri uri, string resourceUrl, string outputFolder)
    {
        try
        {
            var resourceUri = new Uri(uri, resourceUrl);
            var resourcePath = Path.Combine(outputFolder, resourceUri.AbsolutePath.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
            if (!Directory.Exists(Path.GetDirectoryName(resourcePath)))
                Directory.CreateDirectory(Path.GetDirectoryName(resourcePath)!);

            // Send HEAD request to get content length
            using var headRequest = new HttpRequestMessage(HttpMethod.Head, resourceUri);
            using var headResponse = await httpClient.SendAsync(headRequest);
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
                var data = await httpClient.GetByteArrayAsync(resourceUri);
                await File.WriteAllBytesAsync(resourcePath, data);
                Console.WriteLine($"Downloaded resource: {resourceUrl} to {resourcePath}");
            }
            else
            {
                Console.WriteLine($"Skipped (same size): {resourceUri}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to download resource: {resourceUrl} - {ex.Message}");
        }
    }
}