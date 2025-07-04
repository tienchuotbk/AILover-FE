"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  MoreHorizontal,
  Check,
  Square,
  Edit,
  Trash2,
  ArrowLeft,
  Upload,
  Send,
  Search,
  Grid3X3,
  List,
  Printer,
  ChevronLeft,
  Loader2,
  ImagePlus,
  X,
} from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditTestCaseModal } from "@/components/edit-test-case-modal"
import { GenerateTestCaseModal } from "@/components/generate-test-case-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCheckLists, deleteCheckList, getCheckLists, getListVersion, getVersionLastest, updateCheckList, updateStatusChecklist } from "@/lib/action/check-list"
import { formatChecklistToMarkdown, splitArray } from "@/lib/utils"
import { generateCheckListGemini, generateTestCases } from "@/lib/ai/generate-gemini-test-case"
import { deleteTestCases, getTestCases } from "@/lib/action/test-case"
import { exportTestCase, exportTestReport } from "@/lib/lark"
import { generateTestReport } from "@/lib/ai/generate-gemini-test-case"
import { Tooltip } from "@/components/ui/tooltip"
import { getTestSuite } from "@/lib/action/test-suite"
import { uploadFileFromBrowser } from "@/lib/action/upload-file"

export enum TestCaseStatus {
  PENDING = 'Pending',
  PASS = 'Pass',
  FAIL = 'Fail'
}

export enum Priority {
  CRITICAL = 'C',
  HIGH = 'H',
  MEDIUM = 'M',
  LOW = 'L',
}

const PriorityByNumber: Record<string, Priority> = {
  '1': Priority.LOW,
  '2': Priority.MEDIUM,
  '3': Priority.HIGH,
  '4': Priority.CRITICAL,
}

const PriorityStringByNumber: Record<string, string> = {
  '1': 'Low',
  '2': 'Medium',
  '3': 'High',
  '4': 'Critical',
}

interface TestCase {
  id: string
  checklist: string
  title: string
  category: string
  subCategory: string
  priority: number
  preCondition: string
  description: string
  steps: string[]
  expectedResult: string
  testData: string,
  status: TestCaseStatus
}

export default function ChecklistResultPage() {
  const params = useParams()
  const testSuiteId = params.id as string;
  const [checklistItems, setChecklistItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("checklist")
  const [testSuiteTitle, setTestSuiteTitle] = useState("Test suite")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [editingTestCase, setEditingTestCase] = useState<any | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [rightPanelView, setRightPanelView] = useState<"default" | "history" | "changes">("history")
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [requirementInput, setRequirementInput] = useState("")

  const [checkList, setCheckList] = useState<any | null>(null)
  const [listVersion, setListVersion] = useState<any | null>(null)
  const [currentVersion, setCurrentVersion] = useState<number>(1);
  const [promptForTestCase, setPromptForTestCase] = useState<string[]>([]);
  const router = useRouter()

  const [isGenerating, setIsGenerating] = useState(false)
  const [testCase, setTestcase] = useState([]);
  const [isUpdateCheckList, setIsUpdateCheckList] = useState(false);
  const [isUploading, setIsUploading] = useState(false)
  const [urlFile, setUrlFile] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null)
  console.log('checkList', checkList)
  console.log('testcase', testCase)

  useEffect(() => {
    async function fetchData() {
      const versionLastest = await getVersionLastest();
      const [checkListData, listVersion] = await Promise.all([
        getCheckLists(testSuiteId, versionLastest - 1),
        getListVersion(testSuiteId),
      ])
      setCheckList(checkListData)
      setListVersion(listVersion)
      setCurrentVersion(listVersion[0])

      const checkListForTestCase = formatChecklistToMarkdown(checkListData);
      setPromptForTestCase(checkListForTestCase)

      // Group items by category
      const categoryMap: Record<string, any> = {}

      checkListData.forEach((item) => {
        const mainCategory = item.category || "General"
        const subCategory = item.subCategory || "Functionality"
        const categoryKey = `${mainCategory}:${subCategory}`

        if (!categoryMap[categoryKey]) {
          categoryMap[categoryKey] = {
            id: categoryKey,
            mainCategory,
            subCategory,
            items: [],
          }
        }

        categoryMap[categoryKey].items.push(item)
      })

      const sortedEntries = Object.entries(categoryMap).sort(
        ([, objA], [, objB]) => objA.items[0]?.id - objB.items[0]?.id
      );
      console.log('sortedEntries', sortedEntries)

      const sortedObject = Object.fromEntries(sortedEntries);
      const categoryObject = Object.values(sortedObject);
      setCategories(Object.values(sortedObject));

      // Initialize all categories as expanded
      const expanded: Record<string, boolean> = {}
      categoryObject.forEach((category) => {
        expanded[category.id] = true
      })
      setExpandedCategories(expanded);
    }
    fetchData();
  }, [router, isGenerating, isUpdateCheckList]);

  useEffect(() => {
    async function fetchTestSuiteData() {
      if (testSuiteId) {
        try {
          const data = await getTestSuite(testSuiteId);
          if (data) {
            setTestSuiteTitle('Testsuit: ' + data.name);
          }
        } catch (e) {
          console.log(e);
        }
      }
    };
    fetchTestSuiteData();
  }, [testSuiteId]);

  useEffect(() => {
    async function fetchData() {
      if (testSuiteId) {
        const tests: any = await getTestCases(testSuiteId);
        if (tests) {
          setTestcase(tests);
        }
      }
    }
    fetchData();
  }, [isGenerateModalOpen, testSuiteId])

  const getStatusStyle = (status: TestCaseStatus) => {
    switch (status) {
      case TestCaseStatus.PASS:
        return "bg-green-100 text-green-800 border-green-200"
      case "Fail":
        return "bg-red-100 text-red-800 border-red-200"
      case "Pending":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handleStatusChange = () => { }

  const combineStatus: any[] = useMemo(() => {
    let temp: any[] = [];
    // title: item.Title,
    //             category: item.Category,
    //             sub_category: item['Sub-Category'],
    //             priority: item.Priority,
    //             pre_condition: item.Precondition,
    //             steps: item.Step.map((step: any) => ({
    //                 step: step.Step,
    //                 action: step.Action,
    //                 expected: step.Expected,
    //                 status: 2,
    //                 testData: step["TestData"]
    //             })),
    //             check_list_id: item.ChecklistId,
    //             test_suit_id: Number(test_suit_id),
    testCase?.map((test: any, index1: number) => {
      test?.steps?.map((step: any, index: number) => {
        temp.push({
          id: index1,
          check_list_id: index > 0 ? '' : test.id,
          category: index > 0 ? '' : test.category,
          priority: index > 0 ? null : test.priority,
          status: index > 0 ? '' : test.status,
          sub_category: index > 0 ? '' : test.sub_category,
          test_suit_id: index > 0 ? '' : test.test_suit_id,
          title: index > 0 ? '' : test.title,
          step: step.step,
          expected: step.expected,
          pre_condition: index > 0 ? '' : test.pre_condition,
          step_status: step.status,
          action: step.action,
          test_data: step.testData,
          description: index > 0 ? '' : test.description,
          span: (test.steps.length && index === 0) ? test.steps.length : 0,
        })
      })
    });
    return temp;
  }, [testCase]);

  const handleItemToggle = async (id: string, completed: boolean) => {
    setCheckList((prev) => prev.map((item) => (item.id === id ? { ...item, completed } : item)))

    // Update categories to reflect the change
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        items: category.items.map((item) => (item.id === id ? { ...item, completed } : item)),
      })),
    )

    const update = await updateStatusChecklist(id);
    console.log(update);

    toast({
      title: completed ? "Test case marked as completed" : "Test case marked as incomplete",
      description: `Test case has been ${completed ? "checked" : "unchecked"}`,
    })
  }

  const handleTickAllInCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const itemIds = category.items.map((item: any) => item.id)

    setChecklistItems((prev) => prev.map((item) => (itemIds.includes(item.id) ? { ...item, completed: true } : item)))

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, items: cat.items.map((item: any) => ({ ...item, completed: true })) } : cat,
      ),
    )

    toast({
      title: "All test cases marked as completed",
      description: `All test cases in "${category.subCategory}" have been checked`,
    })
  }

  const handleUntickAllInCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const itemIds = category.items.map((item) => item.id)

    setChecklistItems((prev) => prev.map((item) => (itemIds.includes(item.id) ? { ...item, completed: false } : item)))

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, items: cat.items.map((item) => ({ ...item, completed: false })) } : cat,
      ),
    )

    toast({
      title: "All test cases marked as incomplete",
      description: `All test cases in "${category.subCategory}" have been unchecked`,
    })
  }

  const handleTickAllInMainCategory = (mainCategory: string) => {
    const subCategories = getSubCategoriesByMainCategory(mainCategory)
    const allItemIds = subCategories.flatMap((cat) => cat.items.map((item) => item.id))

    setChecklistItems((prev) =>
      prev.map((item) => (allItemIds.includes(item.id) ? { ...item, completed: true } : item)),
    )

    setCategories((prev) =>
      prev.map((cat) =>
        subCategories.some((sc) => sc.id === cat.id)
          ? { ...cat, items: cat.items.map((item) => ({ ...item, completed: true })) }
          : cat,
      ),
    )

    toast({
      title: "All test cases marked as completed",
      description: `All test cases in "${mainCategory}" have been checked`,
    })
  }

  const handleUntickAllInMainCategory = (mainCategory: string) => {
    const subCategories = getSubCategoriesByMainCategory(mainCategory)
    const allItemIds = subCategories.flatMap((cat) => cat.items.map((item) => item.id))

    setChecklistItems((prev) =>
      prev.map((item) => (allItemIds.includes(item.id) ? { ...item, completed: false } : item)),
    )

    setCategories((prev) =>
      prev.map((cat) =>
        subCategories.some((sc) => sc.id === cat.id)
          ? { ...cat, items: cat.items.map((item) => ({ ...item, completed: false })) }
          : cat,
      ),
    )

    toast({
      title: "All test cases marked as incomplete",
      description: `All test cases in "${mainCategory}" have been unchecked`,
    })
  }

  const handleTickAll = () => {
    setChecklistItems((prev) => prev.map((item) => ({ ...item, completed: true })))
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({ ...item, completed: true })),
      })),
    )

    toast({
      title: "All test cases marked as completed",
      description: "All test cases in the checklist have been checked",
    })
  }

  const handleUntickAll = () => {
    setChecklistItems((prev) => prev.map((item) => ({ ...item, completed: false })))
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) => ({ ...item, completed: false })),
      })),
    )

    toast({
      title: "All test cases marked as incomplete",
      description: "All test cases in the checklist have been unchecked",
    })
  }

  const handleExportToExcel = () => {
    toast({
      title: "Exporting to Excel",
      description: "Your checklist is being exported to Excel format",
    })
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const toggleCollapseExpand = () => {
    const hasCollapsed = Object.values(expandedCategories).some((expanded) => !expanded)

    if (hasCollapsed) {
      // Expand all
      const expanded: Record<string, boolean> = {}
      categories.forEach((category) => {
        expanded[category.id] = true
      })
      setExpandedCategories(expanded)
    } else {
      // Collapse all
      const collapsed: Record<string, boolean> = {}
      categories.forEach((category) => {
        collapsed[category.id] = false
      })
      setExpandedCategories(collapsed)
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL:
        return "bg-red-500"
      case Priority.HIGH:
        return "bg-orange-500"
      case Priority.MEDIUM:
        return "bg-green-500"
      case Priority.LOW:
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityDot = (priority: Priority) => {
    if (!priority) return null;
    const color = getPriorityColor(priority)
    return <span className={`inline-block w-3 h-3 rounded-full ${color} mr-1`}></span>
  }

  const getTotalChecksByCategory = (mainCategory: string) => {
    return categories
      .filter((category) => category.category === mainCategory)
      .reduce((total, category) => total + category.items.length, 0)
  }

  const getCompletedChecksByCategory = (mainCategory: string) => {
    return categories
      .filter((category) => category.category === mainCategory)
      .reduce((total, category) => total + category.items.filter((item: any) => item.completed).length, 0)
  }

  const getTotalChecksBySubCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.items.length : 0
  }

  const getCompletedChecksBySubCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.items.filter((item: any) => item.completed).length : 0
  }

  const mainCategories = useMemo(() => {
    const mainCats = new Set<string>()
    categories.forEach((category) => {
      mainCats.add(category.mainCategory)
    })
    console.log('categories', categories)
    return Array.from(mainCats)
  }, [categories]);

  console.log('mainCategories', mainCategories)

  const getSubCategoriesByMainCategory = (mainCategory: string) => {
    return categories.filter((category) => category.mainCategory === mainCategory)
  }

  const totalChecks = checkList?.length ?? 0;
  // const completedChecks = categories.filter((item) => item.completed).length
  // console.log('completedChecks', categories);

  const completedChecks = useMemo(() => {
    let count = 0;
    categories.forEach((category) => {
      count += category.items.filter((item: any) => item.completed).length;
    });
    return count;
  }, [categories]);

  const handleEditTestCase = (testCase: any) => {
    setEditingTestCase(testCase)
    setIsEditModalOpen(true)
  }

  const handleSaveTestCase = async (updatedTestCase: any) => {
    setIsUpdateCheckList(true);
    await updateCheckList(updatedTestCase.id, {
      content: updatedTestCase.content,
      priority: updatedTestCase.priority
    });
    setIsUpdateCheckList(false);
  }

  const handleDeleteTestCase = async (testCaseId: string) => {
    setIsUpdateCheckList(true);
    await deleteCheckList(testCaseId);

    setIsUpdateCheckList(false);
  }

  const handleGenerateTestCases = async (settings: any) => {
    // Mock generated test cases

    // setGeneratedTestCases(mockTestCases)
    setActiveTab("testcases")
    try {
      await deleteTestCases(Number(testSuiteId));

      const data = await generateTestCases(checkList, testSuiteId);
      if (data) {
        toast({
          title: "Test cases generated successfully",
          description: `Generated ${data.length} test cases`,
        })
      }
      setTestcase(data);
    } catch (err) {
      setIsGenerateModalOpen(false);
      toast({
        title: "Failed",
        description: `Failed to generate testcase`,
      })

    }

    setIsGenerateModalOpen(false);
  }

  const handleSendRequirement = useCallback(async () => {
    if (!requirementInput.trim()) return

    setIsGenerating(true)

    console.log('Generating new checklist with requirement:', requirementInput);
    const response = await generateCheckListGemini({
      document: '',
      checklist: `
        ${requirementInput}
        Link image screenshot requirement/feature base: ${urlFile.length > 0 ? urlFile.join(', ') : 'No images uploaded'},
      `,
      projectSettings: {},
    });

    const dataUpsert: any[] = [];
    response?.map((item: any, index: number) => {
      item?.data?.map((data: any) => {
        dataUpsert.push({
          category: item.category,
          subCategory: item.subcategory || item.subCategory,
          testSuiteId: +testSuiteId,
          number: +data.number,
          priority: data.priority,
          content: data.content,
        });
      })
    });

    const versionLastest = await getVersionLastest();
    const dataSplit = splitArray(dataUpsert, 5);
    for (const data of dataSplit) {
      let promises = [];
      for (const item of data) {
        promises.push(
          createCheckLists({
            ...item,
            version: versionLastest,
          })
        );
      }
      await Promise.allSettled(promises);
    }

    console.log("Generated checklist:", response)
    setIsGenerating(false)

    setRequirementInput("")
  }, [requirementInput, urlFile]);

  const handleChangeVersion = async (version: number) => {
    const response = await getCheckLists(testSuiteId, version);
    if (response) {
      setCurrentVersion(version);
      setCheckList(response);

      // Group items by category
      const categoryMap: Record<string, any> = {}

      response.forEach((item) => {
        const mainCategory = item.category || "General"
        const subCategory = item.subCategory || "Functionality"
        const categoryKey = `${mainCategory}:${subCategory}`

        if (!categoryMap[categoryKey]) {
          categoryMap[categoryKey] = {
            id: categoryKey,
            mainCategory,
            subCategory,
            items: [],
          }
        }

        categoryMap[categoryKey].items.push(item)
      })

      const categoryObject = Object.values(categoryMap);
      setCategories(Object.values(categoryMap));

      const expanded: Record<string, boolean> = {}
      categoryObject.forEach((category) => {
        expanded[category.id] = true
      })
      setExpandedCategories(expanded);
    }
  }

  const handleImageUpload = () => {
    // Handle image upload logic
    toast({
      title: "Image upload",
      description: "Image upload functionality",
    })
  }

  const handleExportTestCase = useCallback(async () => {
    try {

      // Create file sheet on lark
      const { data } = await exportTestCase(testCase);
      if (data) {
        window.open(data, "_blank");
      }
    } catch (error) {
      console.error("Error exporting report:", error);
    }
  }, [testCase]);


  const handleExportTestReport = useCallback(async () => {
    const response = await generateTestReport(testCase);

    if (response) {
      const { data } = await exportTestReport(response);
      if (data) {
        window.open(data, "_blank", "noopener,noreferrer");
      }
    }
  }, [testCase]);

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">{testSuiteTitle}</h1>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="checklist"
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="border-b">
              <div className="flex justify-between items-center px-4">
                <div className="flex items-center">
                  <TabsList className="h-10 bg-transparent">
                    <TabsTrigger
                      value="checklist"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 bg-transparent"
                    >
                      Checklist
                    </TabsTrigger>
                    <TabsTrigger
                      value="testcases"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-4 bg-transparent"
                    >
                      Test cases
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </div>

            <TabsContent value="checklist" className="flex-1 overflow-hidden flex">
              <div className="flex-1 overflow-auto p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-200">
                      {completedChecks}/{totalChecks} Checks
                    </Badge>
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                      onClick={() => setIsGenerateModalOpen(true)}
                    >
                      Generate testcases
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={toggleCollapseExpand}>
                      {Object.values(expandedCategories).some((expanded) => !expanded) ? "Expand All" : "Collapse All"}
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

                <div className="space-y-2">
                  {mainCategories.map((mainCategory, index) => {
                    const totalChecksInCategory = getTotalChecksByCategory(mainCategory)
                    const completedChecksInCategory = getCompletedChecksByCategory(mainCategory)
                    const mainCategoryId = `main-${index}`

                    return (
                      <div key={mainCategoryId} className="border rounded-md">
                        <div className="flex items-center p-3 hover:bg-gray-50">
                          <button
                            className="flex items-center flex-1 cursor-pointer"
                            onClick={() => {
                              // Toggle all subcategories of this main category
                              const newExpandedState = { ...expandedCategories }
                              const subCategories = getSubCategoriesByMainCategory(mainCategory)
                              const allExpanded = subCategories.every((sc) => expandedCategories[sc.id])

                              subCategories.forEach((sc) => {
                                newExpandedState[sc.id] = !allExpanded
                              })

                              setExpandedCategories(newExpandedState)
                            }}
                          >
                            <ChevronDown className="w-5 h-5 mr-2 text-gray-500" />
                            <span className="font-medium">
                              {index + 1}. {mainCategory}
                            </span>
                            <Badge className="ml-2 bg-gray-100 text-gray-700 hover:bg-gray-100">
                              {completedChecksInCategory}/{totalChecksInCategory} checks
                            </Badge>
                          </button>

                          <div className="flex items-center space-x-1 ml-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleTickAllInMainCategory(mainCategory)}>
                                  <Check className="w-4 h-4 mr-2" />
                                  Tick All
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUntickAllInMainCategory(mainCategory)}>
                                  <Square className="w-4 h-4 mr-2" />
                                  Untick All
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {getSubCategoriesByMainCategory(mainCategory).map((subCategory) => {
                          const totalChecksInSubCategory = getTotalChecksBySubCategory(subCategory.id)
                          const completedChecksInSubCategory = getCompletedChecksBySubCategory(subCategory.id)
                          const isExpanded = expandedCategories[subCategory.id]

                          return (
                            <div key={subCategory.id} className="border-t">
                              <div className="flex items-center p-3 pl-6 hover:bg-gray-50">
                                <button
                                  className="flex items-center flex-1 cursor-pointer"
                                  onClick={() => toggleCategory(subCategory.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 mr-2 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 mr-2 text-gray-500" />
                                  )}
                                  <span className="font-medium">
                                    {index + 1}.{getSubCategoriesByMainCategory(mainCategory).indexOf(subCategory) + 1}.{" "}
                                    {subCategory.subCategory}
                                  </span>
                                  <Badge className="ml-2 bg-gray-100 text-gray-700 hover:bg-gray-100">
                                    {completedChecksInSubCategory}/{totalChecksInSubCategory} checks
                                  </Badge>
                                </button>

                                <div className="flex items-center space-x-1 ml-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <MoreHorizontal className="w-3 h-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleTickAllInCategory(subCategory.id)}>
                                        <Check className="w-4 h-4 mr-2" />
                                        Tick All
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleUntickAllInCategory(subCategory.id)}>
                                        <Square className="w-4 h-4 mr-2" />
                                        Untick All
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="pl-14 pr-4 pb-3 space-y-3">
                                  {subCategory.items?.map((item: any, itemIndex: number) => (
                                    <div
                                      key={item.id}
                                      className="flex items-start group hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors"
                                    >
                                      <div className="flex items-center mt-0.5">
                                        <Checkbox
                                          id={`item-${item.id}`}
                                          checked={item.completed}
                                          onCheckedChange={(checked) => handleItemToggle(item.id, checked as boolean)}
                                          className="mr-2"
                                        />
                                        {getPriorityDot(item.priority)}
                                      </div>
                                      <label
                                        htmlFor={`item-${item.id}`}
                                        className={`text-sm cursor-pointer flex-1 ${item.completed ? "line-through text-gray-500" : ""
                                          }`}
                                      >
                                        {itemIndex + 1}. {item.content}
                                      </label>

                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex items-center space-x-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleEditTestCase(item)
                                          }}
                                          title="Edit test case"
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            if (confirm("Are you sure you want to delete this test case?")) {
                                              handleDeleteTestCase(item.id)
                                            }
                                          }}
                                          title="Delete test case"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right sidebar with feature details */}
              <div className="w-80 border-l overflow-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {/* History and Changes tab buttons */}
                  <div className="flex border-b">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRightPanelView("history")}
                      className={`flex-1 rounded-none border-b-2 ${rightPanelView === "history"
                        ? "border-blue-500 text-blue-600 bg-blue-50"
                        : "border-transparent text-gray-600"
                        }`}
                    >
                      History
                    </Button>
                  </div>

                  {rightPanelView === "history" && (
                    <div className="space-y-3">
                      {/* <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <ChevronRight className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Version 3 (Current)</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-blue-500">
                            View
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Updated checklist with mobile responsiveness tests</p>
                        <p className="text-xs text-gray-400 mt-1">2:15 PM 25/05/2025</p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <ChevronRight className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Version 2</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-blue-500">
                            View
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Added security testing and performance checks</p>
                        <p className="text-xs text-gray-400 mt-1">10:30 AM 24/05/2025</p>
                      </div>

                      <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <ChevronRight className="w-4 h-4 mr-1" />
                            <span className="text-sm font-medium">Version 1</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-blue-500">
                            View
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Initial checklist generation</p>
                        <p className="text-xs text-gray-400 mt-1">2:15 PM 23/05/2025</p>
                      </div> */}

                      {listVersion?.map((version: any) => (
                        <div key={version} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-sm font-medium">Version {version} {currentVersion === version ? "(Current version)" : ""}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-blue-500"
                              onClick={() => handleChangeVersion(Number(version))}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      ))}


                      {/* Requirement input section */}
                      <div className="border-t pt-4 mt-4">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-gray-900">Update Checklist</h4>
                          <div className="relative">
                            <Textarea
                              placeholder="Enter your requirements to update the checklist..."
                              value={requirementInput}
                              onChange={(e) => setRequirementInput(e.target.value)}
                              className="min-h-[80px] pr-20"
                            />

                            {urlFile.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {urlFile.map((file) => (
                                  <div key={file} className="flex items-center gap-2 bg-gray-50 rounded-md px-3 py-2 border">
                                    <div className="w-4 h-4 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
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

                            <div className="absolute bottom-2 right-2 flex space-x-1">
                              <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                              />

                              {/* Image upload button */}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="h-6 w-6"
                                title="Upload image"
                              >
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleSendRequirement}
                                disabled={!requirementInput.trim()}
                                title="Send requirement"
                              >
                                <Send className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {rightPanelView === "changes" && (
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-700">Added</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Verify website displays correctly on mobile devices (iOS)
                            </p>
                            <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-700">Modified</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Updated priority for "Verify cart total is calculated correctly" from High to Critical
                            </p>
                            <p className="text-xs text-gray-400 mt-1">5 hours ago</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-700">Removed</p>
                            <p className="text-xs text-gray-600 mt-1">Verify social media login integration</p>
                            <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-3">
                        <div className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-700">Added</p>
                            <p className="text-xs text-gray-600 mt-1">Verify color contrast meets WCAG guidelines</p>
                            <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="testcases" className="flex-1 overflow-hidden">
              {checkList && checkList.length === 0 ? (
                // Empty state
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <h3 className="text-lg font-medium mb-2">No test cases generated yet</h3>
                    <p className="text-gray-500 mb-4">Generate test cases from your checklist to see them here</p>
                    <Button className="bg-blue-500 hover:bg-blue-600" onClick={() => setIsGenerateModalOpen(true)}>
                      Generate test cases
                    </Button>
                  </div>
                </div>
              ) : (
                // Populated state
                <div className="flex flex-col h-full">
                  {/* Header section */}
                  <div className="border-b p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <h2 className="text-lg font-semibold">Test case</h2>
                        <span className="text-sm text-gray-500">Version 1</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm"
                          onClick={handleExportTestCase}
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Export Test Cases
                        </Button>
                        <Button variant="outline" size="sm"
                          onClick={handleExportTestReport}
                        >
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Export Test Report
                        </Button>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge className="bg-green-100 text-green-800">10 Test Cases</Badge>
                      <Badge className="bg-blue-100 text-blue-800">208 Steps</Badge>
                    </div>

                    {/* Search and filters */}
                    <div className="flex items-center space-x-4">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input placeholder="Search by title, description, checklist..." className="pl-10" />
                      </div>
                      <Select defaultValue="all-categories">
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-categories">All Categories</SelectItem>
                          <SelectItem value="ui-layout">UI & Layout</SelectItem>
                          <SelectItem value="functionality">Functionality</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all-sub-categories">
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All Sub-Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all-sub-categories">All Sub-Categories</SelectItem>
                          <SelectItem value="static-elements">Static Elements</SelectItem>
                          <SelectItem value="interactive-elements">Interactive Elements</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Table section */}
                  <div className="flex-1 overflow-auto">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                              ID
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                              CHECKLIST
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                              TITLE
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                              CATEGORY
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                              SUB-CATEGORY
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                              PRIORITY
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                              PRE-CONDITION
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                              DESCRIPTION
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                              STEP
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                              EXPECTED RESULT
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                              TEST DATA
                            </th>
                            <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                              STATUS
                            </th>

                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {combineStatus?.map((data: any, index: number) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              {data.span ? <td rowSpan={data.span} className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                {index}
                              </td> : null}
                              {data.span ? <td rowSpan={data.span} className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{data.title}</div>
                              </td> : null}
                              {data.span ? <td rowSpan={data.span} className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{data.title ?? 'title'}</div>
                              </td> : null}
                              {data.span ? <td rowSpan={data.span} className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                {data.category}
                              </td> : null}
                              {data.span ? <td rowSpan={data.span} className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                {data.sub_category}
                              </td> : null}
                              {data.span ? <td rowSpan={data.span} className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top text-center">
                                {getPriorityDot(PriorityByNumber[data.priority.toString() as string])} {PriorityStringByNumber[data.priority.toString()]}
                              </td> : null}
                              {data.span ? <td rowSpan={data.span} className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{data.pre_condition ?? 'N/A'}</div>
                              </td> : null}
                              {data.span ? <td rowSpan={data.span} className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{data.description ?? 'N/A'}</div>
                              </td> : null}
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{data.step ?? 'N/A'}</div>
                              </td>


                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{data.expected ?? 'N/A'}</div>
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{data.test_data ?? 'N/A'}</div>
                              </td>

                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <Select
                                  value={data.step_status?.toString() ?? '2'}
                                  onValueChange={(value: TestCaseStatus) =>
                                    handleStatusChange()
                                  }
                                >
                                  <SelectTrigger
                                    className={`w-20 h-7 text-xs border ${getStatusStyle(data.status)}`}
                                  >
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">
                                      <div className="flex items-center">
                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                        Pass
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="0">
                                      <div className="flex items-center">
                                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                                        Fail
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="2">
                                      <div className="flex items-center">
                                        <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                                        Pending
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                            </tr>

                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination */}
                  <div className="border-t p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Showing 1 to {checkList?.length ?? 0} of {checkList?.length ?? 0} entries
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" disabled>
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <Button variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                          1
                        </Button>
                        <Button variant="outline" size="sm" disabled>
                          Next
                          <ChevronLeft className="w-4 h-4 rotate-180" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Modals */}
        <EditTestCaseModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          testCase={editingTestCase}
          onSave={handleSaveTestCase}
        />

        <GenerateTestCaseModal
          open={isGenerateModalOpen}
          onOpenChange={setIsGenerateModalOpen}
          onGenerate={handleGenerateTestCases}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
