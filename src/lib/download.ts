export function exportRows(rows: readonly object[], filename: string) {
  const values = rows as readonly Record<string, unknown>[];
  const keys = Array.from(
    new Set(
      values.flatMap((row) =>
        Object.keys(row).filter((key) => !key.startsWith("_")),
      ),
    ),
  );
  const cell = (value: unknown) => {
    const raw =
      typeof value === "object" ? JSON.stringify(value) : String(value ?? "");
    const safe = /^[=+@\-\t\r]/.test(raw) ? "'" + raw : raw;
    return '"' + safe.replace(/"/g, '""') + '"';
  };
  const csv = [
    keys.map(cell).join(","),
    ...values.map((row) => keys.map((key) => cell(row[key])).join(",")),
  ].join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
