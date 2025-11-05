namespace Application.Models
{
    public class JokeDTO
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Setup { get; set; } = string.Empty;
        public string Punchline { get; set; } = string.Empty;
    }
}