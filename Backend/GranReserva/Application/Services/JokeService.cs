using Application.Interfaces;
using Application.Models;
using System.Net.Http.Json;
using System.Text.Json;

namespace Infrastructure.Services
{
    public class JokeService : IJokeService
    {
        private readonly HttpClient _jokesClient;

        public JokeService(IHttpClientFactory httpClientFactory)
        {
            _jokesClient = httpClientFactory.CreateClient("jokesHttpClient");
        }

        public async Task<JokeDTO> GetRandomJokeAsync()
        {
            var response = await _jokesClient.GetAsync("random_joke");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var randomJoke = JsonSerializer.Deserialize<JokeDTO>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return randomJoke!;
        }

        public async Task<List<string>> GetJokeTypesAsync()
        {
            var response = await _jokesClient.GetFromJsonAsync<List<string>>("types");
            return response!;
        }

        public async Task<List<JokeDTO>> GetSeveralRandomJokesAsync(int amount)
        {
            var response = await _jokesClient.GetAsync($"jokes/random/{amount}");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var randomJokesList = JsonSerializer.Deserialize<List<JokeDTO>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return randomJokesList!;
        }

        public async Task<List<JokeDTO>> GetRandomJokeByTypeAsync(string jokeType)
        {
            var response = await _jokesClient.GetAsync($"jokes/{jokeType}/random");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var jokeObtained = JsonSerializer.Deserialize<List<JokeDTO>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return jokeObtained!;
        }

        public async Task<JokeDTO> GetJokeById(int id)
        {
            var response = await _jokesClient.GetAsync($"jokes/{id}");
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var jokeObtained = JsonSerializer.Deserialize<JokeDTO>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return jokeObtained!;
        }
    }
}