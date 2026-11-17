using api;
using starter_code;
using starter_code.Middleware;
using StudentApiChecker = ApiChecker.ApiChecker;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

// Register custom API services
builder.RegisterApi(Initialiser.GetDir(builder.Configuration.GetValue<string>("DbFile") ?? ""));


var app = builder.Build();

// Start Tracker Initialiser
Initialiser.Start();


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}


/**
 * Config route example:
 *      api/config?action=reset-database
 *      api/config?action=reset-table:messages
 *      api/config?action=populate-table:messages
 */
app.UseApi();

app.UseHttpsRedirection();
// During development, do not let browsers reuse stale local HTML/CSS/JS
// when the pages are served by this app. (Pages served by VS Code Live
// Server instead use wwwroot/js/css-loader.js for CSS cache-busting.)
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        var extension = Path.GetExtension(context.File.Name);
        if (extension.Equals(".css", StringComparison.OrdinalIgnoreCase) ||
            extension.Equals(".js", StringComparison.OrdinalIgnoreCase) ||
            extension.Equals(".html", StringComparison.OrdinalIgnoreCase))
        {
            context.Context.Response.Headers.CacheControl = "no-store, max-age=0";
        }
    }
});

app.UseRouting();

app.UseAuthorization();

app.UseRedirectRoot();

app.MapRazorPages();

// ── API Checker (self-test for YOUR API endpoints) ───────────────
// The checker calls this app's API endpoints and writes the results
// to api_checker_results.txt. It is disabled because your endpoints
// are not implemented yet. When they are ready, uncomment the block
// below and run the app - the checker will run once at startup.
//
// app.Lifetime.ApplicationStarted.Register(() =>
// {
//     _ = Task.Run(() => StudentApiChecker.RunTests(app.Urls.First()));
// });
app.Run();