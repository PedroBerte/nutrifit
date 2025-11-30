import ProfessionalCard from "@/components/ProfessionalCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGetAllUsers, useGetUserById, useGeocodeAllAddresses } from "@/services/api/user";
import { useGetBondAsCustomer } from "@/services/api/bond";
import { AttendanceMode } from "@/types/professional";
import { motion } from "motion/react";
import { Filter, X, MapPin, AlertCircle, Bookmark } from "lucide-react";
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { toast } from "sonner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

export default function ProfessionalsList() {
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
  const { data: currentUserData } = useGetUserById(currentUserId);
  const { data: activeBond } = useGetBondAsCustomer();
  const geocodeMutation = useGeocodeAllAddresses();

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AttendanceMode | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);

  const userHasAddress = useMemo(() => {
    return currentUserData?.address?.latitude !== null &&
      currentUserData?.address?.latitude !== undefined &&
      currentUserData?.address?.longitude !== null &&
      currentUserData?.address?.longitude !== undefined;
  }, [currentUserData]);

  const { data, isLoading, refetch } = useGetAllUsers(
    false,
    false,
    true,
    selectedDistance && userHasAddress ? currentUserData?.address?.latitude! : null,
    selectedDistance && userHasAddress ? currentUserData?.address?.longitude! : null,
    selectedDistance && userHasAddress ? selectedDistance : null
  );

  // Extrair tags únicas e cidades únicas
  const allTags = Array.from(
    new Set(
      data?.flatMap(p => [
        p.professionalDetails?.tag1,
        p.professionalDetails?.tag2,
        p.professionalDetails?.tag3,
      ]).filter(Boolean) as string[]
    )
  ).sort();

  const allCities = Array.from(
    new Set(
      data?.map(p => p.address?.city).filter(Boolean) as string[]
    )
  ).sort();

  // Filtrar profissionais
  const filteredProfessionals = data?.filter(professional => {
    // Filtro de busca por nome
    if (searchTerm && !professional.name.toLowerCase().includes(searchTerm.toLowerCase())) {
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

    // Filtro de cidade (só aplica se não tiver filtro de distância ativo)
    if (selectedCity && !selectedDistance && professional.address?.city !== selectedCity) {
      return false;
    }

    // Filtro de favoritos
    if (showOnlyFavorites && !professional.isFavorite) {
      return false;
    }

    return true;
  });

  const clearFilters = () => {
    setSelectedMode(null);
    setSelectedTag(null);
    setSelectedCity(null);
    setSearchTerm("");
    setShowOnlyFavorites(false);
    setSelectedDistance(null);
  };

  const hasActiveFilters = selectedMode !== null || selectedTag || selectedCity || showOnlyFavorites || selectedDistance !== null;

  const handleGeocodeAll = async () => {
    try {
      toast.loading("Geocodificando endereços... (pode levar ~40s)", { id: "geocode" });
      const result = await geocodeMutation.mutateAsync();
      toast.success(
        `${result.message}: ${result.success} sucessos, ${result.failed} falhas`,
        { id: "geocode", duration: 5000 }
      );
      refetch();
    } catch (error) {
      toast.error("Erro ao geocodificar endereços", { id: "geocode" });
    }
  };

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

      {/* Pills de Filtros Ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {showOnlyFavorites && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
              <Bookmark className="w-3 h-3" />
              <span>Favoritos</span>
              <button
                onClick={() => setShowOnlyFavorites(false)}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {selectedMode !== null && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
              <span>
                {selectedMode === AttendanceMode.Presencial ? "Presencial" : 
                 selectedMode === AttendanceMode.Online ? "Online" : "Híbrido"}
              </span>
              <button
                onClick={() => setSelectedMode(null)}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {selectedTag && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
              <span>{selectedTag}</span>
              <button
                onClick={() => setSelectedTag(null)}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {selectedCity && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
              <MapPin className="w-3 h-3" />
              <span>{selectedCity}</span>
              <button
                onClick={() => setSelectedCity(null)}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          {selectedDistance !== null && (
            <div className="flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
              <MapPin className="w-3 h-3" />
              <span>{selectedDistance} km</span>
              <button
                onClick={() => setSelectedDistance(null)}
                className="ml-1 hover:bg-primary/30 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-sm text-gray-400 hover:text-gray-300 underline"
          >
            Limpar todos
          </button>
        </div>
      )}

      <Drawer open={showFilters} onOpenChange={setShowFilters}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filtros</DrawerTitle>
            <DrawerDescription>
              Refine sua busca por profissionais
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-h-[70vh]">
            {/* Favoritos */}
            <div>
              <Button
                size="sm"
                variant={showOnlyFavorites ? "default" : "outline"}
                onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                className="w-full"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                {showOnlyFavorites ? "Mostrando apenas favoritos" : "Mostrar apenas favoritos"}
              </Button>
            </div>

            {/* Modalidade */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">Modalidade de Atendimento</label>
              <div className="flex flex-wrap gap-2">
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
                <label className="text-sm text-gray-400 block mb-2">
                  Especialidades ({allTags.length})
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      size="sm"
                      variant={selectedTag === tag ? "default" : "outline"}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                      className="flex-shrink-0"
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
                <label className="text-sm text-gray-400 block mb-2">
                  Cidades ({allCities.length})
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allCities.map((city) => (
                    <Button
                      key={city}
                      size="sm"
                      variant={selectedCity === city ? "default" : "outline"}
                      onClick={() => {
                        setSelectedCity(selectedCity === city ? null : city);
                        if (city !== selectedCity) setSelectedDistance(null);
                      }}
                      disabled={selectedDistance !== null}
                      className="flex-shrink-0"
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Distância (geolocalização) */}
            <div>
              <label className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4" />
                Filtrar por distância
              </label>
              {!userHasAddress ? (
                <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-500">
                    Complete seu perfil com endereço para usar este filtro
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 20, 50].map((distance) => (
                    <Button
                      key={distance}
                      size="sm"
                      variant={selectedDistance === distance ? "default" : "outline"}
                      onClick={() => {
                        setSelectedDistance(selectedDistance === distance ? null : distance);
                        if (distance !== selectedDistance) setSelectedCity(null);
                      }}
                    >
                      {distance} km
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant={selectedDistance === null ? "default" : "outline"}
                    onClick={() => {
                      setSelectedDistance(null);
                    }}
                  >
                    Qualquer distância
                  </Button>
                </div>
              )}
            </div>
          </div>

          <DrawerFooter className="border-t pt-4">
            <Button 
              variant="outline" 
              onClick={clearFilters} 
              className="w-full"
              disabled={!hasActiveFilters}
            >
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
            <Button onClick={() => setShowFilters(false)} className="w-full">
              Fechar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {isLoading && <p>Carregando profissionais...</p>}

      {!isLoading && filteredProfessionals && filteredProfessionals.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          Nenhum profissional encontrado com os filtros selecionados.
        </div>
      )}

      {filteredProfessionals?.map((professional) => {
        if (professional.id) {
          const isMyProfessional = activeBond?.professionalId === professional.id && activeBond?.status === "A";
          
          return (
            <ProfessionalCard
              id={professional.id}
              key={professional.id}
              subtitle="Personal Trainer"
              name={professional.name}
              email={professional.email}
              imageUrl={professional.imageUrl}
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
              isFavorite={professional.isFavorite}
              onFavoriteChange={() => refetch()}
              isMyProfessional={isMyProfessional}
            />
          );
        }
      })}
    </motion.div>
  );
}
