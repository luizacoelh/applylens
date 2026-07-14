import { Job as PrismaJob } from "@prisma/client";
import { parseArray } from "@/lib/json";
import { Job } from "@/types/job";

export function mapJob(job: PrismaJob): Job {
  return {
    ...job,
    requirements: parseArray(job.requirements),
    technologies: parseArray(job.technologies),
    questions: parseArray(job.questions),
    checklist: parseArray(job.checklist),
  };
}