/**
 * Gera URL de avatar usando UI Avatars API
 * @param name - Nome do usuário para gerar avatar
 * @returns URL do avatar
 */
export function generateAvatarUrl(name: string): string {
  const encodedName = encodeURIComponent(name.trim());
  return `https://ui-avatars.com/api/?name=${encodedName}&size=200&background=10b981&color=fff`;
}

/**
 * Obtém URL do avatar do usuário
 * @param user - Objeto do usuário com imageUrl, email e/ou name
 * @returns URL do avatar (custom ou gerado)
 */
export function getUserAvatarUrl(user: {
  imageUrl?: string | null;
  email?: string | null;
  name?: string | null;
  id?: string | null;
}): string {
  // Se tiver imagem customizada, adiciona timestamp para evitar cache
  if (user.imageUrl) {
    const url = new URL(user.imageUrl, window.location.origin);
    url.searchParams.set('t', Date.now().toString());
    return url.toString();
  }

  // Usa nome como preferência (UI Avatars funciona melhor com nomes)
  // Se não tiver nome, usa email ou ID como fallback
  const displayName = user.name || user.email || user.id || 'User';
  
  return generateAvatarUrl(displayName);
}

/**
 * Obtém iniciais do nome para fallback
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
