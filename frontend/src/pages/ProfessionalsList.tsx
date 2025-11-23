import ProfessionalCard from "@/components/ProfessionalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetAllUsers } from "@/services/api/user";
import { AttendanceMode } from "@/types/professional";
import { motion } from "motion/react";
import { Filter, X } from "lucide-react";
import { useState } from "react";

export default function ProfessionalsList() {
  const { data, isLoading } = useGetAllUsers(false, false, true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [selectedMode, setSelectedMode] = useState<AttendanceMode | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Extrair tags únicas e cidades únicas
  const allTags = Array.from(
    new Set(
      data?.flatMap(p => [
        p.professionalDetails?.tag1,
        p.professionalDetails?.tag2,
        p.professionalDetails?.tag3,
      ]).filter(Boolean) as string[]
    )
  );

  const allCities = Array.from(
    new Set(
      data?.map(p => p.address?.city).filter(Boolean) as string[]
    )
  );

  // Filtrar profissionais
  const filteredProfessionals = data?.filter(professional => {
    // Filtro de busca por nome
    if (searchTerm && !professional.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro de rating mínimo
    if (minRating && (professional.averageRating || 0) < minRating) {
      return false;
    }

    // Filtro de modalidade
    if (selectedMode !== null && professional.professionalDetails?.attendanceMode !== selectedMode) {
      return false;
    }

    // Filtro de tag
    if (selectedTag) {
      const hasTags = [
        professional.professionalDetails?.tag1,
        professional.professionalDetails?.tag2,
        professional.professionalDetails?.tag3,
      ];
      if (!hasTags.includes(selectedTag)) {
        return false;
      }
    }

    // Filtro de cidade
    if (selectedCity && professional.address?.city !== selectedCity) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setMinRating(null);
    setSelectedMode(null);
    setSelectedTag(null);
    setSelectedCity(null);
    setSearchTerm("");
  };

  const hasActiveFilters = minRating || selectedMode !== null || selectedTag || selectedCity;

  return (
    <motion.div
      className="flex flex-1 flex-col gap-4 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex gap-2">
        <Input
          placeholder="Pesquisar por nome..."
          className="border-none bg-neutral-dark-03"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          variant={showFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {showFilters && (
        <motion.div
          className="bg-neutral-dark-03 p-4 rounded-xl space-y-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Filtros</h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Rating Mínimo</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  size="sm"
                  variant={minRating === rating ? "default" : "outline"}
                  onClick={() => setMinRating(minRating === rating ? null : rating)}
                >
                  {rating}★
                </Button>
              ))}
            </div>
          </div>

          {/* Modalidade */}
          <div>
            <label className="text-sm text-gray-400 block mb-2">Modalidade de Atendimento</label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={selectedMode === AttendanceMode.Presencial ? "default" : "outline"}
                onClick={() => setSelectedMode(selectedMode === AttendanceMode.Presencial ? null : AttendanceMode.Presencial)}
              >
                Presencial
              </Button>
              <Button
                size="sm"
                variant={selectedMode === AttendanceMode.Online ? "default" : "outline"}
                onClick={() => setSelectedMode(selectedMode === AttendanceMode.Online ? null : AttendanceMode.Online)}
              >
                Online
              </Button>
              <Button
                size="sm"
                variant={selectedMode === AttendanceMode.Hibrido ? "default" : "outline"}
                onClick={() => setSelectedMode(selectedMode === AttendanceMode.Hibrido ? null : AttendanceMode.Hibrido)}
              >
                Híbrido
              </Button>
            </div>
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div>
              <label className="text-sm text-gray-400 block mb-2">Especialidades</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    variant={selectedTag === tag ? "default" : "outline"}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Cidade */}
          {allCities.length > 0 && (
            <div>
              <label className="text-sm text-gray-400 block mb-2">Localização</label>
              <div className="flex flex-wrap gap-2">
                {allCities.map((city) => (
                  <Button
                    key={city}
                    size="sm"
                    variant={selectedCity === city ? "default" : "outline"}
                    onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {isLoading && <p>Carregando profissionais...</p>}

      {!isLoading && filteredProfessionals && filteredProfessionals.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Nenhum profissional encontrado com os filtros selecionados.
        </div>
      )}

      {filteredProfessionals?.map((professional) => {
        if (professional.id) {
          return (
            <ProfessionalCard
              id={professional.id}
              key={professional.id}
              subtitle="Personal Trainer"
              name={professional.name}
              description={
                professional.professionalCredential?.biography ||
                "Sem descrição"
              }
              rating={professional.averageRating}
              totalFeedbacks={professional.totalFeedbacks}
              tags={[
                professional.professionalDetails?.tag1,
                professional.professionalDetails?.tag2,
                professional.professionalDetails?.tag3,
              ]}
              attendanceMode={professional.professionalDetails?.attendanceMode}
              city={professional.address?.city}
              state={professional.address?.state}
            />
          );
        }
      })}
    </motion.div>
  );
}
