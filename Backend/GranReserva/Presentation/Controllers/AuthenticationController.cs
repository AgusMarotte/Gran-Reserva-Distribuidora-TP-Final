using Application.Interfaces;
using Application.Models.Request;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private readonly ICustomAuthenticationService _customAuthenticationService;

        public AuthenticationController(ICustomAuthenticationService customAuthenticationService)
        {
            _customAuthenticationService = customAuthenticationService;
        }

        [HttpPost]
        public async Task<ActionResult<string>> Authenticate([FromBody] AuthenticationRequestDTO authenticationRequestDTO)
        {
            string newToken = await _customAuthenticationService.Authenticate(authenticationRequestDTO);
            return newToken;
        }
    }
}