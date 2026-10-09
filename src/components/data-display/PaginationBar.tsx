import { Button } from "@/components/ui/Button";

export function PaginationBar({
  page,
  totalPages,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        {total} {total === 1 ? "registro" : "registros"}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            Anterior
          </Button>
          <span className="text-sm">
            Página {page} de {totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
            Próxima
          </Button>
        </div>
      ) : null}
    </div>
  );
}
