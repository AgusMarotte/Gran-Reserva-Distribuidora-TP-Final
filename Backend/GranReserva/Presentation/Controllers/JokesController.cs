using Application.Interfaces;
using Application.Models;
using Microsoft.AspNetCore.Mvc;

namespace Presentation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JokesController : ControllerBase
    {
        private readonly IJokeService _jokeService;

        public JokesController(IJokeService jokeService)
        {
            _jokeService = jokeService;
        }

        [HttpGet("random")]
        public async Task<ActionResult<JokeDTO>> GetRandomJokeAsync()
        {
            var randomJoke = await _jokeService.GetRandomJokeAsync();
            return randomJoke;
        }

        [HttpGet("types")]
        public async Task<ActionResult<List<string>>> GetJokeTypesAsync()
        {
            var jokeTypes = await _jokeService.GetJokeTypesAsync();
            return jokeTypes;
        }

        [HttpGet("random/{amount}")]
        public async Task<ActionResult<List<JokeDTO>>> GetSeveralRandomJokesAsync([FromRoute] int amount)
        {
            var randomJokeList = await _jokeService.GetSeveralRandomJokesAsync(amount);
            return randomJokeList;
        }

        [HttpGet("random-by-type")]
        public async Task<ActionResult<List<JokeDTO>>> GetRandomJokeByTypeAsync([FromQuery] string jokeType)
        {
            var jokeObtained = await _jokeService.GetRandomJokeByTypeAsync(jokeType);
            return jokeObtained;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<JokeDTO>> GetJokeById([FromRoute] int id)
        {
            var jokeObtained = await _jokeService.GetJokeById(id);
            return jokeObtained;
        }
    }
}