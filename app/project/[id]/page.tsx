"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { MoreHorizontal, MessageSquare, Loader2, ArrowLeft, ImagePlus, X, Image } from "lucide-react"
import { getProject } from "@/lib/action/project"
// import { getProjectConversations, createConversation } from "@/lib/actions/conversations"
// import { generateChecklist } from "@/lib/actions/checklist"
// import { toast } from "@/hooks/use-toast"
// import type { Project, Conversation } from "@/lib/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { generateTestCases } from "@/lib/ai/generate-test-case"
import { generateCheckListGemini } from "@/lib/ai/generate-gemini-test-case"
import { createCheckLists, getVersionLastest } from "@/lib/action/check-list"
import { splitArray } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { getContentFromLarkDoc } from "@/lib/lark"
import { createTestSuite, getTestSuite, getTestSuites } from "@/lib/action/test-suite"
import { uploadFileFromBrowser } from "@/lib/action/upload-file"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [project, setProject] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [requirements, setRequirements] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [testSuiteName, setTestSuiteName] = useState("")
  const [larkDocument, setLarkDocument] = useState('')
  const [testSuites, setTestSuites] = useState<any[]>([])
  const [urlFile, setUrlFile] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projectData, testSuit] = await Promise.all([
          getProject(projectId),
          getTestSuites(projectId),
        ])

        setProject(projectData)
        setTestSuites(testSuit)
      } catch (error) {
        console.error("Failed to fetch project data:", error)
        router.push("/project")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [projectId, router])

  useEffect(() => {
    if (!projectId) return;

    const fetchTestSuite = async () => {
      try {
        const testSuites = await getTestSuites(projectId);
        setTestSuites(testSuites || []);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    };

    fetchTestSuite();
  }, [isGenerating]);


  const handleCreateChecklist = useCallback(async () => {
    let documentContent = '';
    let number = 0;
    const pattern = /^https:\/\/[a-zA-Z0-9.-]+\.larksuite\.com\/docx\/[a-zA-Z0-9_-]+$/;
    if (larkDocument?.trim() && pattern.test(larkDocument?.trim())) {
      const documentId = larkDocument?.trim().split('/').pop();
      try {
        // Call Lark API to get document content
        const { data } = await getContentFromLarkDoc(documentId as string);
        documentContent = data || '';
      } catch (error) {
        console.error("Error fetching Lark document content:", error);
        return;
      }
    }

    if (!requirements.trim() || !testSuiteName.trim()) {
      return
    }

    try {
      setIsGenerating(true)

      const testSuite = await createTestSuite(
        testSuiteName,
        projectId,
        requirements,
      );

      number = testSuite.id;

      const response = await generateCheckListGemini({
        document: documentContent,
        checklist: `
          ${requirements}
          Link image screenshot requirement/feature base: ${urlFile.length > 0 ? urlFile.join(', ') : 'No images uploaded'},
        `,
        projectSettings: project?.settings || {},
      });

      console.log("Generated checklist:", response)

      // Save to DB checklist and conversatio

      const dataUpsert: any[] = [];
      response?.map((item: any, index: number) => {
        item?.data?.map((data: any) => {
          dataUpsert.push({
            category: item.category,
            subCategory: item.subcategory || item.subCategory,
            testSuiteId: +testSuite.id,
            number: +data.number,
            priority: data.priority,
            content: data.content,
          });
        })
      });

      // const versionLastest = await getVersionLastest();
      const dataSplit = splitArray(dataUpsert, 5);
      for (const data of dataSplit) {
        let promises = [];
        for (const item of data) {
          promises.push(
            createCheckLists({
              ...item,
              version: 1,
            })
          );
        }
        await Promise.allSettled(promises);
      }

      // router.push(`/checklist-result/${testSuite.id}`)
    } catch (error) {
      console.log("Error creating checklist:", error)
    } finally {
      router.push(`/checklist-result/${number}`)
      setIsGenerating(false)
    }
  }, [requirements, project?.settings, projectId, router, testSuiteName, larkDocument, urlFile]);

  const formatTimeAgo = (input: string) => {
    const date = new Date(input);
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)

    try {

      const { url } = await uploadFileFromBrowser(files[0])
      setUrlFile((prev) => [...prev, url]);
      
    } catch (error) {
      console.error("Upload error:", error)
      
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
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
              <Button onClick={() => router.push("/project")}>Back to Projects</Button>
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
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name Test Suite <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Test Suite Name"
                      value={testSuiteName}
                      onChange={(e) => setTestSuiteName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Link lark document <span className="text-red-500">(Optional)</span>
                    </Label>
                    <Input
                      id="lark-document"
                      placeholder="https://qsgekjhfr3py.sg.larksuite.com/docx/1234567890"
                      value={larkDocument}
                      onChange={(e) => setLarkDocument(e.target.value)}
                      required
                    />
                  </div>

                  <Textarea
                    placeholder="Describe the feature requirement, user flow, expected behavior, and any specific scenarios to test..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />

                  {urlFile.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {urlFile.map((file) => (
                        <div key={file} className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2 border">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                            <img
                              src={file || "/placeholder.svg"}
                              alt={"Uploaded file"}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <button
                            onClick={() => {
                              setUrlFile((prev) => prev.filter((f) => f !== file))
                            }}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Remove file"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />

                    {/* Image upload button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="h-10 w-10"
                      title="Upload image"
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                    </Button>

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
              {testSuites.map((testSuite) => (
                <Card
                  key={testSuite.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/checklist-result/${testSuite.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{testSuite.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{testSuite.description || "No description"}</p>
                          <p className="text-xs text-gray-400 mt-2">{testSuite.created_at ? formatTimeAgo(testSuite.created_at) : 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
              }
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
