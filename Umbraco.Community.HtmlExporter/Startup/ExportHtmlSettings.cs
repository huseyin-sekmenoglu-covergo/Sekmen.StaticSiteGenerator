namespace Umbraco.Community.HtmlExporter.Startup;

public class ExportHtmlSettings
{
    public string TargetUrl { get; init; } = string.Empty;
    public string OutputFolder { get; init; } = string.Empty;
    public string[] AdditionalUrls { get; init; } = [];
    public StringReplacements[] StringReplacements { get; init; } = [];
}