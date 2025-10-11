namespace Domain.Entities
{
    public abstract class User
    {
        public int Id { get; private set; }
        public string ClientName { get; private set; }
        public string LastName { get; private set; } 
        public string Email { get; private set; } 
        public string Password { get; private set; }

        protected User() { }

        protected User(string clientName, string lastName, string email, string password)
        {
            ClientName = clientName;
            LastName = lastName;
            Email = email;
            Password = password;
        }

        public void SetPassword(string newPassword)
        {
            Password = newPassword;
        }
        
        public void UpdateInfo(string clientName, string lastName, string email)
        {
            ClientName = clientName;
            LastName = lastName;
            Email = email;
        }

    }

}
