"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Calendar, Plus, Loader2 } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { CreateProjectModal } from "@/components/create-project-modal"
import { getProject, getProjects } from "@/lib/action/project"
import { useUser } from "@supabase/auth-helpers-react"
import { useRouter } from "next/navigation"
// import { getProjects } from "@/lib/actions/projects"
// import type { Project } from "@/lib/types"


export default function ProjectsPage() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter();

  const user = useUser();

  useEffect(() => {
    async function fetchProjects() {
      if(!user?.id){
        setLoading(false);
        return;
      }
      try {
        const data = await getProjects(user?.id)

        console.log('data:', data)

        setProjects(data)
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        setLoading(false);
      }
    }

    fetchProjects()
  }, [user?.id])

//   const filteredProjects = projects.filter(
//     (project) =>
//       project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
//   )

  const handleViewProject = async (id: number) => {
    router.push('/project/'+ id);
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <Button onClick={() => setIsCreateProjectOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Tabs */}
          <div className="flex space-x-1">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              onClick={() => setActiveTab("all")}
              className="rounded-full"
            >
              All projects
            </Button>
            {/* <Button
              variant={activeTab === "deleted" ? "default" : "ghost"}
              onClick={() => setActiveTab("deleted")}
              className="rounded-full"
            >
              Deleted
            </Button> */}
          </div>

          {/* Projects Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.filter((project) => project.name?.includes(searchQuery)).map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>Created at</span>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(project.created_at)}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => handleViewProject(project.id)}>
                    View project
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* {filteredProjects.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                {searchQuery ? "No projects found matching your search" : "No projects found"}
              </p>
              <Button onClick={() => setIsCreateProjectOpen(true)}>Create your first project</Button>
            </div>
          )} */}
        </div>

        <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} user={user} />
      </SidebarInset>
    </SidebarProvider>
  )
}
