import { ProjectDetail } from "@/components/ProjectDetail"

export default function ProjectPage(props: any) {
  const projectId = parseInt(props?.params?.id ?? "", 10)
  return <ProjectDetail projectId={projectId} />
}
