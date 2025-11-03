using Application.Interfaces;
using Application.Models;
using Application.Models.Request;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] bool includesoftdeleted = false)
        {
            var users = await _userService.GetAllUsersAsync(includesoftdeleted);
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id, [FromQuery] bool includesoftdeleted = false)
        {
            var user = await _userService.GetUserByIdAsync(id, includesoftdeleted);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }
        
        [HttpGet("search")]
        public async Task<IActionResult> GetUserByNameAndLastName([FromQuery] string name, [FromQuery] string lastName)
        {
            var user = await _userService.GetUserByNameAndLastNameAsync(name, lastName);
            if (user == null)
            {
                return NotFound("Usuario no encontrado.");
            }
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreationUserDTO userdto)
        {
            if (userdto == null)
            {
                return BadRequest();
            }
            var newUser = await _userService.CreateUserAsync(userdto);
            return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, newUser);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDTO userdto)
        {
            if (userdto == null)
            {
                return BadRequest("Datos de usuario inválidos.");
            }
            var result = await _userService.UpdateUserAsync(id, userdto);
            if (!result)
            {
                return NotFound("Usuario no encontrado.");
            }
            return NoContent();
        }

        [HttpPatch("{id}/restore")]
        public async Task<IActionResult> RestoreUser(int id)
        {
            var user = await _userService.RestoreUserAsync(id);
            if (user == null)
            {
                return NotFound("No se pudo restaurar el usuario. Es posible que no exista o que ya esté activo.");
            }
            return Ok(user);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id, [FromQuery] bool permanently = false)
        {
            var result = await _userService.DeleteUserAsync(id, permanently);
            if (!result)
            {
                return NotFound("Usuario no encontrado.");
            }
            return NoContent();
        }
    }
}