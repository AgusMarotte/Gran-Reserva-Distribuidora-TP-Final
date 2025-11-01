using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers
{
    public class AuthenticationController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
