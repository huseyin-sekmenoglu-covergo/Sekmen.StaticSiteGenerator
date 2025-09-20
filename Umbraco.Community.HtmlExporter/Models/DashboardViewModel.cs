namespace Umbraco.Community.HtmlExporter.Models;

public record DashboardViewModel(
    DashboardDomains[] Domains,
    ExportHtmlSettings Settings
);

public record DashboardDomains(
    int Id,
    string Name,
    string Url
);
