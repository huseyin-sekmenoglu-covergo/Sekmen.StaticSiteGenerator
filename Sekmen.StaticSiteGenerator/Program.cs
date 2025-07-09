Console.WriteLine("--- Sekmen.StaticSiteGenerator ---");
const string url = "http://127.0.0.1:44362/";
var uri = new Uri(url);
var outputFolder = Path.Combine(@"d:\Desktop\_", uri.Host) + Path.DirectorySeparatorChar;
Directory.CreateDirectory(outputFolder);

using var client = new HttpClient();

_ = await Functions.DownloadSingleFile(client, url, outputFolder, "robots.txt");
_ = await Functions.DownloadSingleFile(client, url, outputFolder, "manifest.json");
var sitemapXml = await Functions.DownloadSingleFile(client, url, outputFolder, "sitemap.xml");
var sitemap = XDocument.Parse(sitemapXml);
var ns = sitemap.Root!.GetDefaultNamespace();
var xElements = sitemap.Descendants(ns + "loc").ToArray();

foreach (var urlElement in xElements)
{
    await Functions.ProcessUrls(client, urlElement, outputFolder);
}

Console.WriteLine("Done.");

