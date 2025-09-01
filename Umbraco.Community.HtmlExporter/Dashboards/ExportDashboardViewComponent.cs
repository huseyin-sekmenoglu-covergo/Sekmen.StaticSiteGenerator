namespace Umbraco.Community.HtmlExporter.Dashboards;

public class ExportDashboardViewComponent: DashboardViewComponent
{
    public override IViewComponentResult Invoke(DashboardViewModel model)
    {
        return View("Dashboards/Export", model);
    }
}