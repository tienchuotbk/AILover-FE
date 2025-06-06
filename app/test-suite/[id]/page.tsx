"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { FileSpreadsheet, Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
// import { getProjectConversations, createConversation } from "@/lib/actions/conversations"
// import { generateChecklist } from "@/lib/actions/checklist"
// import { toast } from "@/hooks/use-toast"
// import type { Project, Conversation } from "@/lib/types";
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCheckLists, getListVersion, getVersionLastest } from "@/lib/action/check-list"
import { formatChecklistToMarkdown } from "@/lib/utils"
import { generateTestCases } from "@/lib/ai/generate-gemini-test-case"


export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const testSuiteId = params.id as string;

    const [checkList, setCheckList] = useState<any | null>(null)
    const [listVersion, setListVersion] = useState<any | null>(null)
    const [currentVersion, setCurrentVersion] = useState<number>(1);
    const [activeTab, setActiveTab] = useState("checklist")

    const [promptForTestCase, setPromptForTestCase] = useState<string[]>([]);
    const [loading, setLoading] = useState(true)
    const [testCase, setTestCase] = useState<any[]>([])


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


                const checkListForTestCase = formatChecklistToMarkdown(checkListData);
                setPromptForTestCase(checkListForTestCase)
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

    const handleGenerateTestCases = useCallback(async () => {
        try {
            const testCases = [];

            for (const prompt of promptForTestCase) {
                const response = await generateTestCases(prompt);

                console.log("Generated test case:", response);
                testCases.push(response);
                break;
            }

            setTestCase(testCases);
        } catch (error) {

        }
    }, [promptForTestCase])


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
    console.log('promptForTestCase:', promptForTestCase)
    console.log('testCase:', testCase)

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

                    <TabsContent value="checklist" className="flex-1 overflow-hidden flex">
                        <div className="flex-1 overflow-auto p-4">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-200">
                                        Checks
                                    </Badge>
                                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600"
                                        onClick={handleGenerateTestCases}
                                    >
                                        Generate testcases
                                    </Button>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => { }}>
                                        Collapse All
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => { }}>
                                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                                        Export to Excel
                                    </Button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-sm font-medium">Priority:</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center">
                                            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
                                            <span className="text-sm">Critical</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-1"></span>
                                            <span className="text-sm">High</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
                                            <span className="text-sm">Medium</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
                                            <span className="text-sm">Low</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </TabsContent>
                </Tabs>
            </SidebarInset>
        </SidebarProvider>
    )
}
