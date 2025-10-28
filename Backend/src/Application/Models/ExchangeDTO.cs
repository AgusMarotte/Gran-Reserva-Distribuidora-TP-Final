using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain.Entities;

namespace Application.ExchangeDTO;

public class ExchangeDTO
{
            public DateTime Date { get; set; }       

            public Client Client { get; set; }
                    public string QrCode { get; set; }       


}

