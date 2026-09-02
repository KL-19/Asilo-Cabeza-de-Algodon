using Microsoft.AspNetCore.Identity;
using ApiAsilo.Models;

namespace ApiAsilo.Services
{
    public class AuthService
    {
        private readonly PasswordHasher<Usuario> _hasher = new PasswordHasher<Usuario>();

        public string HashPassword(Usuario usuario, string password)
        {
            return _hasher.HashPassword(usuario, password);
        }

        public bool VerifyPassword(Usuario usuario, string hashGuardado, string passwordIngresada)
        {
            if (string.IsNullOrEmpty(hashGuardado) || string.IsNullOrEmpty(passwordIngresada)) 
                return false;

            try
            {
                // Si la contraseña guardada en BD es exactamente igual al texto plano
                if (hashGuardado == passwordIngresada)
                    return true;

                var result = _hasher.VerifyHashedPassword(usuario, hashGuardado, passwordIngresada);
                return result != PasswordVerificationResult.Failed;
            }
            catch
            {
                return false;
            }
        }
    }
}