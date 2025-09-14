namespace Umbraco.Community.HtmlExporter.Models;

public record ExportDashboardRequest(string SiteUrl, string TargetUrl, string OutputFolder);