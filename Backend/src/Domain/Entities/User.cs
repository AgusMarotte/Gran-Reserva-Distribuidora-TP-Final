namespace Domain.Entities
{
    public abstract class User
    {
        public int Id { get; set; }
        public string ClientName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

    }

}
