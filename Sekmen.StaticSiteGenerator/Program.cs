Console.WriteLine("--- Sekmen.StaticSiteGenerator ---");
const string sourceUrl = "http://127.0.0.1:44362/";
const string newDomain = "https://huseyinsekmenoglu.net/";
var uri = new Uri(sourceUrl);
var outputFolder = Path.Combine(@"D:\Projects", uri.Host) + Path.DirectorySeparatorChar;
Directory.CreateDirectory(outputFolder);

using var client = new HttpClient();

_ = await Functions.DownloadSingleFile(client, sourceUrl, outputFolder, "robots.txt", newDomain);
_ = await Functions.DownloadSingleFile(client, sourceUrl, outputFolder, "manifest.json", newDomain);
_ = await Functions.DownloadSingleFile(client, sourceUrl, outputFolder, "404.html", newDomain);
var sitemapXml = await Functions.DownloadSingleFile(client, sourceUrl, outputFolder, "sitemap.xml", newDomain);

//convert sitemap to xml
var sitemap = XDocument.Parse(sitemapXml);
var ns = sitemap.Root!.GetDefaultNamespace();
var urlLists = sitemap
    .Descendants(ns + "loc")
    .Select(urlElement => urlElement.Value)
    .ToList();
var urlLists2 = new List<string>();

foreach (var urlElement in urlLists)
{
    var urls = await Functions.ProcessUrls(client, urlElement, outputFolder, sourceUrl, newDomain);
    //add urls if they are not in the list
    foreach (var url in urls)
    {
        var urlElement2 = url.GetAttributeValue("href", string.Empty);
        if (!urlLists2.Contains(urlElement2) && !urlLists.Contains(urlElement2))
            urlLists2.Add(urlElement2);
    }
}

foreach (var urlElement in urlLists2)
{
    var urls = await Functions.ProcessUrls(client, urlElement, outputFolder, sourceUrl, newDomain);
}


Console.WriteLine("Done.");

