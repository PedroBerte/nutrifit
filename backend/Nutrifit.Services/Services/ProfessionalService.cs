using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Nutrifit.Repository;
using Nutrifit.Repository.Entities;
using Nutrifit.Services.Constants;
using Nutrifit.Services.DTO;
using Nutrifit.Services.Services.Interfaces;

namespace Nutrifit.Services.Services
{
    public class ProfessionalService : IProfessionalService
    {
        private readonly IMapper _mapper;
        private readonly NutrifitContext _context;
        public ProfessionalService(IMapper mapper, NutrifitContext context) 
        {
            _mapper = mapper;
            _context = context;
        }

        public async Task<List<ProfessionalDto>> GetAllProfessionalsAsync()
        {
            var response = new List<ProfessionalDto>();
            var users = await _context.User
                .Include(x => x.Address)
                .Where(x => x.ProfileId == Guid.Parse(ProfilesConstants.PERSONAL))
                .ToListAsync();

            foreach (var user in users) 
            { 
                var professional = await _context.ProfessionalCredential
                    .FirstOrDefaultAsync(p => p.ProfessionalId == user.Id);

                var userDto = _mapper.Map<UserDto>(user);
                var professionalDto = _mapper.Map<ProfessionalCredentialDto>(professional);

                response.Add(new ProfessionalDto { Credentials = professionalDto, User = userDto });
            }

            return response;
        }

        public async Task<ProfessionalCredentialDto> CreateProfessionalCredentialAsync(ProfessionalCredentialDto professionalCredentialDto)
        {
            if (professionalCredentialDto == null)
                throw new ArgumentNullException(nameof(professionalCredentialDto));

            var existingCredential = await _context.ProfessionalCredential
                .FirstOrDefaultAsync(pc => pc.ProfessionalId == professionalCredentialDto.ProfessionalId);

            if (existingCredential != null)
                throw new InvalidOperationException("Credencial profissional já existe para este profissional.");

            var credentialEntity = _mapper.Map<ProfessionalCredential>(professionalCredentialDto);

            var added = _context.ProfessionalCredential.Add(credentialEntity);
            await _context.SaveChangesAsync();

            return added.Entity != null ? _mapper.Map<ProfessionalCredentialDto>(added.Entity) : null;
        }
    }
}
