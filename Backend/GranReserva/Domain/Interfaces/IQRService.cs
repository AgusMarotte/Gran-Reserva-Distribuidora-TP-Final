namespace Application.Interfaces
{
    public interface IQRService
    {
        byte[] GenerateQRCode(string text);
    }
}