using System.Web.Http;

namespace InternalJobPortal.Api
{
    public class WebApiApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            GlobalConfiguration.Configure(WebApiConfig.Register);

            // Auto-seed the admin account on first startup
            try
            {
                var db = new Data.Db();
                db.SeedAdmin();
            }
            catch
            {
                // Ignore seeding errors (e.g., DB not yet created)
            }
        }
    }
}
