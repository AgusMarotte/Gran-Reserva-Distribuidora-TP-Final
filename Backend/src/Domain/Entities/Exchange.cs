using System;

namespace Domain.Entities
{
    public class Exchange
    {
        public int Id { get; set; }              
        public DateTime Date { get; set; }       
        public int PointsUsed { get; set; }      
        public string QrCode { get; set; }       

        public int ClientId { get; set; }        
        public Client Client { get; set; }

        public void QrGenerate()
        {
            QrCode = Guid.NewGuid().ToString();
        }
    }
}
