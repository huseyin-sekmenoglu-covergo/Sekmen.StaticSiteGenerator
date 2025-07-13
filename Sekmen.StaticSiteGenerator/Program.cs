Console.WriteLine("--- Sekmen.StaticSiteGenerator ---");
const string url = "http://127.0.0.1:44362/";
const string newDomain = "https://huseyinsekmenoglu.net/";
var uri = new Uri(url);
var outputFolder = Path.Combine(@"D:\Projects", uri.Host) + Path.DirectorySeparatorChar;
Directory.CreateDirectory(outputFolder);

using var client = new HttpClient();

_ = await Functions.DownloadSingleFile(client, url, outputFolder, "robots.txt", newDomain);
_ = await Functions.DownloadSingleFile(client, url, outputFolder, "manifest.json", newDomain);
_ = await Functions.DownloadSingleFile(client, url, outputFolder, "404.html", newDomain);
var sitemapXml = await Functions.DownloadSingleFile(client, url, outputFolder, "sitemap.xml", newDomain);

//add 404 and articles pages
var urls = new StringBuilder();
for (var i = 2; i <= 4; i++)
    urls.Append("<url><loc>" + url + "articles/page/" + i + "</loc></url>");
sitemapXml = sitemapXml.Replace("</urlset>", urls + "</urlset>");

//convert sitemap tp xml
var sitemap = XDocument.Parse(sitemapXml);
var ns = sitemap.Root!.GetDefaultNamespace();
var xElements = sitemap.Descendants(ns + "loc").ToArray();

foreach (var urlElement in xElements)
    await Functions.ProcessUrls(client, urlElement, outputFolder, url, newDomain);

Console.WriteLine("Done.");

