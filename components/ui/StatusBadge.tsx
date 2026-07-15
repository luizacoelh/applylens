import { JobStatus } from "@prisma/client";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/jobStatus";

export default function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-3 py-1 font-mono text-xs ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
