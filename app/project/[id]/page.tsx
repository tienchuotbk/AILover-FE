"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MoreHorizontal, MessageSquare, Loader2, ArrowLeft } from "lucide-react"
import { getProject } from "@/lib/action/project"
// import { getProjectConversations, createConversation } from "@/lib/actions/conversations"
// import { generateChecklist } from "@/lib/actions/checklist"
// import { toast } from "@/hooks/use-toast"
// import type { Project, Conversation } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { generateTestCases } from "@/lib/ai/generate-test-case"
import { generateTestCasesGemini } from "@/lib/ai/generate-gemini-test-case"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string;

  const [project, setProject] = useState<any | null>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [requirements, setRequirements] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectData] = await Promise.all([
          getProject(projectId),
          //   getProjectConversations(projectId),
        ])
        setProject(projectData)
        // setConversations(conversationsData)
      } catch (error) {
        console.error("Failed to fetch project data:", error)
        // toast({
        //   title: "Lỗi",
        //   description: "Không thể tải thông tin project",
        //   variant: "destructive",
        // })
        router.push("/project")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId, router])

  const handleCreateChecklist = useCallback(async () => {
    // if (!requirements.trim()) {
    // //   toast({
    // //     title: "Lỗi",
    // //     description: "Vui lòng nhập yêu cầu trước khi tạo checklist",
    // //     variant: "destructive",
    // //   })
    //   return
    // }

    // try {
    //   setIsGenerating(true)

    //   // Tạo conversation mới
    // //   const conversation = await createConversation({
    // //     projectId,
    // //     title: requirements.slice(0, 50) + (requirements.length > 50 ? "..." : ""),
    // //     content: requirements,
    // //   })

    //   // Generate checklist
    // //   const result = await generateChecklist({
    // //     content: requirements,
    // //     images: [],
    // //     testingTypes: project?.testingTypes || {},
    // //   })

    // //   if (result.success) {
    //     // Store checklist và conversation ID
    //     // sessionStorage.setItem("generatedChecklist", JSON.stringify(result.items))
    //     // sessionStorage.setItem("currentConversationId", conversation.id)
    //     // router.push("/checklist-result")
    // //   }
    // } catch (error) {
    // //   toast({
    // //     title: "Lỗi",
    // //     description: "Không thể tạo checklist. Vui lòng thử lại.",
    // //     variant: "destructive",
    // //   })
    // } finally {
    //   setIsGenerating(false)
    // }

    if (!requirements.trim()) {
      return
    }

    try {
      setIsGenerating(true)

      const response = await generateTestCasesGemini({
        checklist: requirements,
        projectSettings: project?.settings || {},
      });

      console.log("Generated checklist:", response)

    } catch (error) {
      console.log("Error creating checklist:", error)
    } finally {
      setIsGenerating(false)
    }
  }, [requirements, project?.settings, projectId, router]);

const handleConversationClick = (conversation: any) => {
  // Load conversation và redirect đến checklist result
  sessionStorage.setItem("generatedChecklist", JSON.stringify(conversation.checklistItems || []))
  sessionStorage.setItem("currentConversationId", conversation.id)
  router.push("/checklist-result")
}

const handleDeleteConversation = async (conversationId: string) => {
  try {
    // Mock delete - trong thực tế sẽ call API
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
    //   toast({
    //     title: "Thành công",
    //     description: "Đã xóa conversation",
    //   })
  } catch (error) {
    //   toast({
    //     title: "Lỗi",
    //     description: "Không thể xóa conversation",
    //     variant: "destructive",
    //   })
  }
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

  if (diffInMinutes < 1) return "Just now"
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
  return `${Math.floor(diffInMinutes / 1440)} days ago`
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

if (!project) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Project not found</p>
            <Button onClick={() => router.push("/projects")}>Back to Projects</Button>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/project")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {/* Back to Projects */}
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
              <p className="text-gray-600">{project.description || "No description"}</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input Form */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe the feature requirement, user flow, expected behavior, and any specific scenarios to test..."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="min-h-[120px] resize-none"
                />

                <div className="flex justify-end">
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={handleCreateChecklist}
                    disabled={isGenerating || !requirements.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create checklist"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversations List */}
          <div className="space-y-3">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{conversation.description || "No description"}</p>
                          <p className="text-xs text-gray-400 mt-2">{formatTimeAgo(conversation.updatedAt)}</p>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleConversationClick(conversation)}>
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteConversation(conversation.id)
                            }}
                            className="text-red-600"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No conversations yet</p>
                <p className="text-sm text-gray-400">
                  Start by describing your feature requirements above to create your first checklist
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
)
}
