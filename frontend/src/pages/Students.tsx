import { Input } from "@/components/ui/input";
import { useGetActiveStudents } from "@/services/api/bond";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Phone,
  User,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PersonalSemAlunos from "@/assets/personal/PersonalSemAlunos.png";
import { AvatarImage } from "@/components/ui/avatar-image";

export default function Students() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const pageSize = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = useGetActiveStudents(
    page,
    pageSize,
    debouncedSearch
  );

  const students = data?.data?.items || [];
  const totalPages = data?.data?.pagination?.totalPages || 1;
  const totalItems = data?.data?.pagination?.totalCount || 0;

  const handleSearch = (value: string) => {
    setSearchInput(value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-1 py-4 flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl">Alunos</h1>
        <p className="text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? "aluno" : "alunos"}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="w-full max-w-md mx-auto">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              className="border-none bg-neutral-dark-03 pl-10 rounded-lg w-full py-2 text-base focus:ring-2 focus:ring-primary transition-all"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Students List */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center flex-col">
          {!debouncedSearch &&
            <p className="text-muted-foreground pt-4">
              Você ainda não tem alunos ativos
            </p>
          }
          {debouncedSearch &&
            <p>
              Nenhum aluno encontrado
            </p>
          }
          {/* Responsive image: hidden on very small screens */}
          {!debouncedSearch &&
            <img
              src={PersonalSemAlunos}
              alt="Nenhum aluno ativo pt-2"
              className="w-64 object-contain max-w-full xs:hidden sm:block"
            />
          }
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {students.map((student) => (
            <motion.div
              key={student.studentId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/students/${student.studentId}`)}
              className="bg-neutral-dark-03 rounded-lg p-4 cursor-pointer hover:bg-neutral-dark-03 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <AvatarImage
                  imageUrl={student.studentImageUrl}
                  name={student.studentName}
                  email={student.studentEmail}
                  id={student.studentId}
                  size="lg"
                  className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0"
                />

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User size={16} className="text-primary flex-shrink-0" />
                    <h3 className="font-semibold text-base truncate">
                      {student.studentName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Mail size={14} className="flex-shrink-0" />
                    <span className="w-full break-words whitespace-normal block text-xs sm:text-sm">{student.studentEmail}</span>
                  </div>

                  {student.studentPhone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={14} className="flex-shrink-0" />
                      <span>{student.studentPhone}</span>
                    </div>
                  )}

                  {/* Age Badge on mobile (falls below info) */}
                  {student.studentDateOfBirth && calculateAge(student.studentDateOfBirth) > 0 && (
                    <div className="bg-primary/10 w-min whitespace-nowrap text-primary px-3 py-1 rounded-full text-xs font-medium mt-2 block sm:hidden">
                      {calculateAge(student.studentDateOfBirth)} anos
                    </div>
                  )}
                </div>

                {/* Age Badge on desktop (hidden on mobile) */}
                {student.studentDateOfBirth && calculateAge(student.studentDateOfBirth) > 0 && (
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium sm:block hidden">
                    {calculateAge(student.studentDateOfBirth)} anos
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} className="mr-1" />
            Anterior
          </Button>

          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Próxima
            <ChevronRight size={16} className="ml-1" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}

function calculateAge(dateString: string): number {
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}
