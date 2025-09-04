using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Nutrifit.Services.DTO.Response
{
    public class ApiResponse
    {
        public bool Success { get; set; }   
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }

        public static ApiResponse CreateSuccess(string message, object? data = null)
        {
            return new ApiResponse
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        public static ApiResponse CreateFailure(string message, object? data = null)
        {
            return new ApiResponse
            {
                Success = false,
                Message = message,
                Data = data
            };
        }
    }
}
