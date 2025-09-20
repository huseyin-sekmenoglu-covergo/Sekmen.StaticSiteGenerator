namespace Umbraco.Community.HtmlExporter.Startup;

public class ExportHtmlSettings
{
    public string TargetUrl { get; init; }
    public string OutputFolder { get; init; }
    public string[] AdditionalUrls { get; set; }
}