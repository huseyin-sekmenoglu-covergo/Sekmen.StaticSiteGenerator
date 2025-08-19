namespace Umbraco.Community.HtmlExporter.Dashboards;

public class ExportDashboard : SimpleDashboard
{
    public override string Name => "Export";
    public override int Weight => 500;
}
public class ExportDashboardViewComponent(
    IUmbracoContextFactory umbracoContextFactory,
    IDocumentNavigationQueryService documentNavigationQueryService,
    IDomainService domainService
) : DashboardAsyncViewComponent
{
    public override async Task<IViewComponentResult> InvokeAsync(DashboardViewModel model)
    {
        var domains = await domainService.GetAllAsync(true);
        
        var umbracoContextReference = umbracoContextFactory.EnsureUmbracoContext();
        documentNavigationQueryService.TryGetRootKeys(out var rootKeys);
        var viewModel = rootKeys
            .Select(key => umbracoContextReference.UmbracoContext.Content.GetById(key))
            .WhereNotNull()
            .Select(m => new ExportDashboardViewModel(m.Id, m.Name, domains.First(n => n.RootContentId == m.Id).DomainName))
            .ToArray();
        return View("~/Views/Dashboards/ExportDashboard.cshtml", viewModel);
    }
}

public record ExportDashboardViewModel(
    int Id,
    string Name,
    string Url
);
