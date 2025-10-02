using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using Core.Entities;

namespace Web.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private static List<User> Users = new List<User>();
        // ----------- LOGIN -----------
        [HttpPost("login")]
       public ActionResult<string> Login([FromQuery] string email, [FromQuery] string password)
        {
            try
            {
                var user = Users.FirstOrDefault(u => u.Email == email && u.Password == password);

                if (user == null)
                    return Unauthorized("Email o contraseña incorrectos");

                return Ok($"Bienvenido {user.ClientName} {user.LastName}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }
        }

        // ----------- REGISTER -----------
        [HttpPost("register")]
        public ActionResult<string> Register([FromQuery] string name, [FromQuery] string lastName, [FromQuery] string email, [FromQuery] string password)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                    return BadRequest("el nombre es requerido");

                if (string.IsNullOrWhiteSpace(lastName))
                    return BadRequest("el apellido es requerido");

                if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
                    return BadRequest("el email ingresado no es valido");

                if (string.IsNullOrWhiteSpace(password) || password.Length < 6)
                    return BadRequest("la contraseña ingresada no es valida");

                if (Users.Any(u => u.Email == email))
                    return BadRequest("Ya existe un usuario con ese email");

                var newUser = new User
                {
                    ClientName = name,
                    LastName = lastName,
                    Email = email,
                    Password = password
                };

                Users.Add(newUser);

                return Ok($"Usuario {newUser.ClientName} {newUser.LastName} registrado con éxito con el email {newUser.Email}");
            }

            catch (Exception ex)
            {
                return StatusCode(500, $"internal server error: {ex.Message}");

            }

        }
    }

    
}
