import { useQuery } from "@tanstack/react-query";

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

async function fetchViaCep(cep: string): Promise<ViaCepResponse> {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) throw new Error("CEP inválido");
  const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
  if (!res.ok) throw new Error("Erro ao buscar CEP");
  const data = await res.json();
  if (data.erro) throw new Error("CEP não encontrado");
  return data;
}

export function useViaCep(cep: string, enabled: boolean = true) {
  return useQuery<ViaCepResponse, Error>({
    queryKey: ["viacep", cep],
    queryFn: () => fetchViaCep(cep),
    enabled: enabled && !!cep && cep.replace(/\D/g, "").length === 8,
    staleTime: 1000 * 60 * 5,
  });
}
