export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function applyPattern(digits: string, pattern: string, ph = "#") {
  let i = 0;
  return pattern
    .split("")
    .map((ch) => (ch === ph ? digits[i++] ?? "" : ch))
    .join("")
    .slice(0, pattern.length);
}

export function formatPhoneBR(raw: string) {
  const d = onlyDigits(raw).slice(0, 11);
  if (d.length <= 10) {
    return applyPattern(d, "(##) ####-####");
  }
  return applyPattern(d, "(##) #####-####");
}

export function formatCEP(raw: string) {
  const d = onlyDigits(raw).slice(0, 8);
  return applyPattern(d, "#####-###");
}

export function formatCPF(raw: string) {
  const d = onlyDigits(raw).slice(0, 11);
  return applyPattern(d, "###.###.###-##");
}

export function formatCNPJ(raw: string) {
  const d = onlyDigits(raw).slice(0, 14);
  return applyPattern(d, "##.###.###/####-##");
}

export function formatCpfCnpj(raw: string) {
  const d = onlyDigits(raw);
  return d.length <= 11 ? formatCPF(d) : formatCNPJ(d);
}

export function formatDateBR(raw: string) {
  const d = onlyDigits(raw).slice(0, 8);
  return applyPattern(d, "##/##/####");
}

export function formatCurrencyBRL(raw: string) {
  const d = onlyDigits(raw).slice(0, 15);
  const value = Number(d) / 100;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
