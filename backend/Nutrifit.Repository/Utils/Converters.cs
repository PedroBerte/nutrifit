using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Nutrifit.Repository.Utils
{
    public sealed class UnspecifiedDateTimeConverter
    : ValueConverter<DateTime, DateTime>
    {
        public UnspecifiedDateTimeConverter()
            : base(
                v => DateTime.SpecifyKind(v, DateTimeKind.Unspecified), // grava
                v => DateTime.SpecifyKind(v, DateTimeKind.Unspecified)  // leitura
            )
        { }
    }

    public sealed class NullableUnspecifiedDateTimeConverter
        : ValueConverter<DateTime?, DateTime?>
    {
        public NullableUnspecifiedDateTimeConverter()
            : base(
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Unspecified) : v,
                v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Unspecified) : v
            )
        { }
    }

}
