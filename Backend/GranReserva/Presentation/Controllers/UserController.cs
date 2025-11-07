using Application.Interfaces;
using Application.Models.Request;
using Application.Models.Request.UserDTO;
using Domain.Enums;
using Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAllUsers([FromQuery] bool includesoftdeleted = false)
        {
            var users = await _userService.GetAllUsersAsync(includesoftdeleted);
            return Ok(users);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, SuperAdmin")]
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
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> GetUsersByNameOrLastName([FromQuery] string? name, [FromQuery] string? lastName)
        {
            var users = await _userService.GetUsersByNameOrLastNameAsync(name, lastName);
            return Ok(users);
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

        [HttpPost("admin")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreationUserDTO userdto, [FromQuery] AdminCreationRole role = AdminCreationRole.Admin)
        {
            if (userdto == null)
            {
                return BadRequest();
            }

            UserRole domainRole = role switch
            {
                AdminCreationRole.SuperAdmin => UserRole.SuperAdmin,
                AdminCreationRole.Admin => UserRole.Admin
            };

            var newUser = await _userService.CreateAdminAsync(userdto, domainRole);
            return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, newUser);
        }

        [HttpPut("{id}")]
        [Authorize]
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
        [Authorize]
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
        [Authorize]
        public async Task<IActionResult> DeleteUser(int id, [FromQuery] bool permanently = false)
        {
            var result = await _userService.DeleteUserAsync(id, permanently);
            if (!result)
            {
                return NotFound("Usuario no encontrado.");
            }
            return NoContent();
        }

        [HttpPatch("{id}/points")]
        [Authorize(Roles = "Admin, SuperAdmin")]
        public async Task<IActionResult> UpdatePoints(int id, [FromBody] UpdatePointsDTO dto)
        {
            if (dto == null)
            {
                return BadRequest("Datos inválidos.");
            }

            var updatedUser = await _userService.UpdateClientPointsAsync(id, dto);

            if (updatedUser == null)
            {
                throw new NotFoundException($"Usuario con id {id} no encontrado o no está activo.");
            }

            return Ok(updatedUser);
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO changePasswordDTO)
        {
            var userIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized();
            }

            var result = await _userService.ChangePasswordAsync(userId, changePasswordDTO);
            if (!result)
            {
                return NotFound("Usuario no encontrado.");
            }

            return NoContent();
        }
    }
}