using System.Text.Json.Serialization;

namespace Application.Models.Request
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum AdminCreationRole
    {
        Admin,
        SuperAdmin
    }
}