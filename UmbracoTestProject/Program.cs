WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.CreateUmbracoBuilder()
    .AddBackOffice()
    .AddWebsite()
    .AddComposers()
    .Build();

WebApplication app = builder.Build();

await app.BootUmbracoAsync();

// Configure the HTTP request pipeline.
RewriteOptions options = new RewriteOptions()
        .AddRewrite(@"^sitemap.xml", "xmlsitemap", skipRemainingRules: true)
        .AddRewrite(@"^404*", "error", skipRemainingRules: true)
        .AddRewrite(@"^(.+)/page/(\d+)", "$1?page=$2", skipRemainingRules: true);
app.UseRewriter(options);
app.UseHttpsRedirection();

app.UseUmbraco()
    .WithMiddleware(u =>
    {
        u.UseBackOffice();
        u.UseWebsite();
    })
    .WithEndpoints(u =>
    {
        u.UseBackOfficeEndpoints();
        u.UseWebsiteEndpoints();
    });

await app.RunAsync();