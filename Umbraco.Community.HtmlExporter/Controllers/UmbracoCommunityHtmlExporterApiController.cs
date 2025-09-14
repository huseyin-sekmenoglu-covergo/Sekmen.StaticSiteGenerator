namespace Umbraco.Community.HtmlExporter.Controllers;

[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "Umbraco.Community.HtmlExporter")]
[MapToApi(Constants.ApiName)]
public class UmbracoCommunityHtmlExporterApiController(
    IHttpClientFactory httpClientFactory,
    IUmbracoContextFactory umbracoContextFactory,
    IDocumentNavigationQueryService documentNavigationQueryService,
    IDomainService domainService
) : UmbracoCommunityHtmlExporterApiControllerBase
{
    [HttpGet("get-domains")]
    [ProducesResponseType<DashboardViewModel[]>(StatusCodes.Status200OK)]
    public async Task<DashboardViewModel[]> GetDomains()
    {
        IEnumerable<IDomain> domains = await domainService.GetAllAsync(true);
        
        UmbracoContextReference umbracoContextReference = umbracoContextFactory.EnsureUmbracoContext();
        documentNavigationQueryService.TryGetRootKeys(out IEnumerable<Guid> rootKeys);
        DashboardViewModel[] viewModel = rootKeys
            .Select(key => umbracoContextReference.UmbracoContext.Content.GetById(key))
            .WhereNotNull()
            .Select(m => new DashboardViewModel(m.Id, m.Name, domains.First(n => n.RootContentId == m.Id).DomainName))
            .ToArray();

        return viewModel;
    }

    [HttpPost("export-website")]
    [ProducesResponseType<string>(StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportWebsite([FromForm] ExportCommand request)
    {
        using HttpClient client = httpClientFactory.CreateClient();

        await Functions.ExportWebsite(client, request);

        return Content("Done.");
    }
}