namespace Umbraco.Community.HtmlExporter.Controllers;

[ApiController]
[BackOfficeRoute("umbracocommunityhtmlexporter/api/v{version:apiVersion}")]
[Authorize(Policy = AuthorizationPolicies.SectionAccessContent)]
[MapToApi(Constants.ApiName)]
public class UmbracoCommunityHtmlExporterApiControllerBase : ControllerBase;