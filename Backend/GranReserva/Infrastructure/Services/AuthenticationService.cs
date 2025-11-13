using Application.Interfaces;
using Application.Models.Request;
using Domain.Entities;
using Domain.Exceptions;
using Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Infrastructure.Services
{
    public class AuthenticationService : ICustomAuthenticationService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _config;

        public AuthenticationService(IUserRepository userRepository, IConfiguration config)
        {
            _config = config;
            _userRepository = userRepository;
        }

        public string ComputeSha256Hash(string rawData)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));

                StringBuilder builder = new StringBuilder();
                foreach (byte b in bytes)
                {
                    builder.Append(b.ToString("x2"));
                }

                return builder.ToString();
            }
        }

        private async Task<User> ValidateUser(string email, string password)
        {

            var hashedPassword = ComputeSha256Hash(password);

            User? user = await _userRepository.GetActiveByEmailAsync(email);
            if (user is null)
            {
                return null;
            }
            if (user.Password != hashedPassword)
            {
                return null;
            }
            return user;
        }

        public async Task<string> Authenticate(AuthenticationRequestDTO authenticationRequestDTO)
        {
            var validatedUser = await ValidateUser(authenticationRequestDTO.Email, authenticationRequestDTO.Password);

            if (validatedUser is null)
            {
                throw new InvalidCredentialsException("Credenciales inválidas");
            }

            var securityPassword = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_config["Authentication:SecretForKey"]!));

            var signature = new SigningCredentials(securityPassword, SecurityAlgorithms.HmacSha256);

            var claimsForToken = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, validatedUser.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, validatedUser.Id.ToString()),
                new Claim("role", validatedUser.Role.ToString())
            };

            var jwtSecurityToken = new JwtSecurityToken(
                _config["Authentication:Issuer"],
                _config["Authentication:Audience"],
                claimsForToken,
                DateTime.UtcNow,
                DateTime.UtcNow.AddMinutes(15),
                signature
            );

            var tokenToReturn = new JwtSecurityTokenHandler().WriteToken(jwtSecurityToken);

            return tokenToReturn.ToString();
        }
    }
}