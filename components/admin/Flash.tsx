export function Flash({ ok, error, okMessages, errorMessages }: { ok?: string; error?: string; okMessages: Record<string, string>; errorMessages: Record<string, string> }) {
  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-danger-50 p-3 text-sm font-medium text-danger-600">
        {errorMessages[error] ?? "ทำรายการไม่สำเร็จ"}
      </p>
    );
  }
  if (ok && okMessages[ok]) {
    return (
      <p role="status" className="rounded-xl bg-success-50 p-3 text-sm font-medium text-success-700">
        {okMessages[ok]}
      </p>
    );
  }
  return null;
}
