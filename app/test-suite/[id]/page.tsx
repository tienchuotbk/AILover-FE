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
import { generateCheckListGemini } from "@/lib/ai/generate-gemini-test-case"
import { createCheckLists, getCheckLists, getListVersion, getVersionLastest } from "@/lib/action/check-list"
import { splitArray } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { createTestSuite } from "@/lib/action/test-suite"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const testSuiteId = params.id as string;

    const [checkList, setCheckList] = useState<any | null>(null)
    const [listVersion, setListVersion] = useState<any | null>(null)
    const [currentVersion, setCurrentVersion] = useState<number>(1);
    const [activeTab, setActiveTab] = useState("checklist")

    const [project, setProject] = useState<any | null>(null)
    const [conversations, setConversations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [requirements, setRequirements] = useState("")
    const [isGenerating, setIsGenerating] = useState(false)
    const [testSuiteName, setTestSuiteName] = useState("")


    useEffect(() => {
        async function fetchData() {
            try {
                const versionLastest = await getVersionLastest();

                if (!versionLastest) return;
                const [checkListData, listVersion] = await Promise.all([
                    getCheckLists(testSuiteId, versionLastest - 1),
                    getListVersion(),
                ])
                setCheckList(checkListData)
                setListVersion(listVersion)

                setCurrentVersion(listVersion[0])
            } catch (error) {
                console.error("Failed to fetch project data:", error)
                router.push("/project")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [testSuiteId, router])

    const handleChangeVersion = useCallback(async (version: number) => {
        setLoading(true)
        try {
            const checkListData = await getCheckLists(testSuiteId, version);
            setCheckList(checkListData)
            setCurrentVersion(version);
        } catch (error) {
            console.error("Failed to change version:", error)
            // Optionally, you can show an error message to the user
        } finally {
            setLoading(false)
        }
    }, [testSuiteId])

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

    console.log("checkList:", checkList)
    console.log("listVersion:", listVersion)

    if (!checkList || checkList.length === 0) {
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

                <Tabs
                    defaultValue="checklist"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col overflow-hidden"
                >
                    <div className="border-b">
                        <div className="flex justify-between items-center px-4">
                            <TabsList className="h-10">
                                <TabsTrigger
                                    value="checklist"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4"
                                >
                                    Checklist
                                </TabsTrigger>
                                <TabsTrigger
                                    value="testcases"
                                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4"
                                >
                                    Test cases
                                </TabsTrigger>
                            </TabsList>
                            {/* <div className="flex items-center space-x-2">
                                <span className="text-sm">Version 3</span>
                                <ChevronDown className="w-4 h-4" />
                            </div> */}
                            <div className="flex items-center space-x-2">
                                <Select value={currentVersion.toString()} onValueChange={(e) => handleChangeVersion(Number(e))} >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {listVersion && listVersion.map((version: any) => (
                                            <SelectItem key={version} value={version.toString()}>
                                                Version {version}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </Tabs>
            </SidebarInset>
        </SidebarProvider>
    )
}
