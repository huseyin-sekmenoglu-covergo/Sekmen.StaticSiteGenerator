using Umbraco.Cms.Core;
using Umbraco.Cms.Core.Models;

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
        IEnumerable<IDomain> domains = await domainService.GetAllAsync(true);
        
        UmbracoContextReference umbracoContextReference = umbracoContextFactory.EnsureUmbracoContext();
        documentNavigationQueryService.TryGetRootKeys(out IEnumerable<Guid> rootKeys);
        ExportDashboardViewModel[] viewModel = rootKeys
            .Select(key => umbracoContextReference.UmbracoContext.Content.GetById(key))
            .WhereNotNull()
            .Select(m => new ExportDashboardViewModel(m.Id, m.Name, domains.FirstOrDefault(n => n.RootContentId == m.Id)?.DomainName ?? "Domain not found"))
            .ToArray();
        return View("~/Views/Dashboards/ExportDashboard.cshtml", viewModel);
    }
}

public record ExportDashboardViewModel(
    int Id,
    string Name,
    string Url
);
