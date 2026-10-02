using System;
using System.Security.Cryptography;
using System.Text;

namespace InternalJobPortal.Api.Helpers
{
    public static class PasswordHelper
    {
        public static string HashPassword(string password)
        {
            using (var sha = SHA256.Create())
            {
                // Add a salt prefix for basic security
                var salted = "IJP_SALT_2024_" + password;
                var bytes = Encoding.UTF8.GetBytes(salted);
                var hash = sha.ComputeHash(bytes);
                return BitConverter.ToString(hash).Replace("-", "").ToLower();
            }
        }

        public static bool Verify(string password, string hash)
        {
            return HashPassword(password) == hash;
        }
    }
}
