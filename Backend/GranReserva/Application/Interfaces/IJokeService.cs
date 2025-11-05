using Application.Models;

namespace Application.Interfaces
{
    public interface IJokeService
    {
        Task<JokeDTO> GetRandomJokeAsync();
        Task<List<string>> GetJokeTypesAsync();
        Task<List<JokeDTO>> GetSeveralRandomJokesAsync(int amount);
        Task<List<JokeDTO>> GetRandomJokeByTypeAsync(string jokeType);
        Task<JokeDTO> GetJokeById(int id);
    }
}