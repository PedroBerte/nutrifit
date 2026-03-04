export const ok = <T>(data: T, message = "OK") => ({ success: true, message, data });

export const toPagination = (total: number, page: number, pageSize: number) => ({
  currentPage: page,
  pageSize,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
  totalCount: total,
});
