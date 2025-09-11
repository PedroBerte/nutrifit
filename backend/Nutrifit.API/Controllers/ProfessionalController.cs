using Microsoft.AspNetCore.Mvc;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;
using System.Reflection.Metadata.Ecma335;

namespace Nutrifit.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfessionalController : ControllerBase
    {
        private readonly IProfessionalService _professionalService;
        public ProfessionalController(IProfessionalService professionalService)
        {
            _professionalService = professionalService;
        }

        [HttpGet]
        [Route("GetAllProfessionals")]
        public async Task<ActionResult<List<ProfessionalDto>>> Get() 
        {
            try
            {
                var professionals = await _professionalService.GetAllProfessionalsAsync();
                return Ok(professionals);
            }
            catch (Exception)
            {
                return StatusCode(500, "Erro ao buscar profissionais.");
            }
        }

        [HttpPost]
        [Route("CreateProfessionalCredential")]
        public async Task<ActionResult<ProfessionalCredentialDto>> CreateProfissionalCredential([FromBody] ProfessionalCredentialDto professionalCredential)
        {
            try
            {
                var addedProfessionalCredential = await _professionalService.CreateProfessionalCredentialAsync(professionalCredential);
                return Ok(addedProfessionalCredential);
            }
            catch (Exception)
            {
                return BadRequest(
                    "Erro ao criar credencial profissional. Verifique se o profissional já possui uma credencial cadastrada ou se os dados estão corretos."
                );
            }
        }
    }
}
