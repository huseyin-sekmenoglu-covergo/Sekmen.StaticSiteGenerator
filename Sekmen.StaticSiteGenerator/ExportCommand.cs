namespace Sekmen.StaticSiteGenerator;

public record ExportCommand(
    string SiteUrl,
    string[] AdditionalUrls,
    string TargetUrl,
    string OutputFolder
);