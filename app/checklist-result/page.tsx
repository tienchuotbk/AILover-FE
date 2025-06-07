"use client"

import { useState, useEffect } from "react"
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditTestCaseModal } from "@/components/edit-test-case-modal"
import { GenerateTestCaseModal } from "@/components/generate-test-case-modal"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
  testData: string
}

export default function ChecklistResultPage() {
  const [checklistItems, setChecklistItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("checklist")
  const [projectTitle, setProjectTitle] = useState("E-commerce Website")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [editingTestCase, setEditingTestCase] = useState<any | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [rightPanelView, setRightPanelView] = useState<"default" | "history" | "changes">("history")
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [generatedTestCases, setGeneratedTestCases] = useState<TestCase[]>([])
  const [requirementInput, setRequirementInput] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Lấy checklist từ sessionStorage
    const storedChecklist = sessionStorage.getItem("generatedChecklist")
    if (storedChecklist) {
      try {
        const items = JSON.parse(storedChecklist) as any[]
        setChecklistItems(items)

        // Group items by category
        const categoryMap: Record<string, any> = {}

        items.forEach((item) => {
          const mainCategory = item.mainCategory || "General"
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

        const sortedCategories = Object.values(categoryMap).sort(
          (a, b) => a.mainCategory.localeCompare(b.mainCategory) || a.subCategory.localeCompare(b.subCategory),
        )

        setCategories(sortedCategories)

        // Initialize all categories as expanded
        const expanded: Record<string, boolean> = {}
        sortedCategories.forEach((category) => {
          expanded[category.id] = true
        })
        setExpandedCategories(expanded)
      } catch (error) {
        console.error("Failed to parse checklist:", error)
        router.push("/dashboard")
      }
    } else {
      // For demo purposes, create mock data
      createMockData()
    }
  }, [router])

  const createMockData = () => {
    const mockItems: any[] = [
      // Authentication & Security
      {
        id: "auth_1",
        title: "Verify user can register with valid email and password",
        priority: "Critical",
        category: "Security Testing",
        mainCategory: "Authentication & Security",
        subCategory: "User Registration",
        completed: true,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "auth_2",
        title: "Verify password strength validation (minimum 8 characters, special characters)",
        priority: "High",
        category: "Security Testing",
        mainCategory: "Authentication & Security",
        subCategory: "User Registration",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "auth_3",
        title: "Verify email verification process works correctly",
        priority: "High",
        category: "Security Testing",
        mainCategory: "Authentication & Security",
        subCategory: "User Registration",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "auth_4",
        title: "Verify user cannot register with already existing email",
        priority: "Medium",
        category: "Security Testing",
        mainCategory: "Authentication & Security",
        subCategory: "User Registration",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "login_1",
        title: "Verify user can login with valid credentials",
        priority: "Critical",
        category: "Security Testing",
        mainCategory: "Authentication & Security",
        subCategory: "User Login",
        completed: true,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "login_2",
        title: "Verify login fails with invalid credentials",
        priority: "Critical",
        category: "Security Testing",
        mainCategory: "Authentication & Security",
        subCategory: "User Login",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "login_3",
        title: "Verify account lockout after multiple failed login attempts",
        priority: "High",
        category: "Security Testing",
        mainCategory: "Authentication & Security",
        subCategory: "User Login",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "login_4",
        title: "Verify 'Remember Me' functionality works correctly",
        priority: "Medium",
        category: "Security Testing",
        mainCategory: "Authentication & Security",
        subCategory: "User Login",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "pwd_1",
        title: "Verify password reset email is sent to valid email address",
        priority: "High",
        category: "Security Testing",
        mainCategory: "Authentication & Security",
        subCategory: "Password Reset",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "pwd_2",
        title: "Verify password reset link expires after specified time",
        priority: "Medium",
        category: "Security Testing",
        mainCategory: "Authentication & Security",
        subCategory: "Password Reset",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },

      // Product Management
      {
        id: "prod_1",
        title: "Verify products are displayed correctly on the homepage",
        priority: "High",
        category: "UI Testing",
        mainCategory: "Product Management",
        subCategory: "Product Display",
        completed: true,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "prod_2",
        title: "Verify product images load correctly and are responsive",
        priority: "High",
        category: "UI Testing",
        mainCategory: "Product Management",
        subCategory: "Product Display",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "prod_3",
        title: "Verify product price is displayed correctly",
        priority: "Critical",
        category: "UI Testing",
        mainCategory: "Product Management",
        subCategory: "Product Display",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "prod_4",
        title: "Verify product availability status (In Stock/Out of Stock)",
        priority: "High",
        category: "UI Testing",
        mainCategory: "Product Management",
        subCategory: "Product Display",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "search_1",
        title: "Verify search functionality returns relevant results",
        priority: "Critical",
        category: "System Testing",
        mainCategory: "Product Management",
        subCategory: "Search & Filter",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "search_2",
        title: "Verify search with no results displays appropriate message",
        priority: "Medium",
        category: "System Testing",
        mainCategory: "Product Management",
        subCategory: "Search & Filter",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "filter_1",
        title: "Verify price filter works correctly",
        priority: "High",
        category: "System Testing",
        mainCategory: "Product Management",
        subCategory: "Search & Filter",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "filter_2",
        title: "Verify category filter works correctly",
        priority: "High",
        category: "System Testing",
        mainCategory: "Product Management",
        subCategory: "Search & Filter",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "filter_3",
        title: "Verify multiple filters can be applied simultaneously",
        priority: "Medium",
        category: "System Testing",
        mainCategory: "Product Management",
        subCategory: "Search & Filter",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },

      // Shopping Cart & Checkout
      {
        id: "cart_1",
        title: "Verify user can add products to cart",
        priority: "Critical",
        category: "System Testing",
        mainCategory: "Shopping Cart & Checkout",
        subCategory: "Cart Management",
        completed: true,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "cart_2",
        title: "Verify user can update product quantity in cart",
        priority: "High",
        category: "System Testing",
        mainCategory: "Shopping Cart & Checkout",
        subCategory: "Cart Management",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "cart_3",
        title: "Verify user can remove products from cart",
        priority: "High",
        category: "System Testing",
        mainCategory: "Shopping Cart & Checkout",
        subCategory: "Cart Management",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "cart_4",
        title: "Verify cart total is calculated correctly",
        priority: "Critical",
        category: "System Testing",
        mainCategory: "Shopping Cart & Checkout",
        subCategory: "Cart Management",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "cart_5",
        title: "Verify cart persists across browser sessions",
        priority: "Medium",
        category: "System Testing",
        mainCategory: "Shopping Cart & Checkout",
        subCategory: "Cart Management",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "checkout_1",
        title: "Verify checkout process with valid payment information",
        priority: "Critical",
        category: "Integration Testing",
        mainCategory: "Shopping Cart & Checkout",
        subCategory: "Payment Processing",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "checkout_2",
        title: "Verify checkout fails with invalid payment information",
        priority: "Critical",
        category: "Integration Testing",
        mainCategory: "Shopping Cart & Checkout",
        subCategory: "Payment Processing",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "checkout_3",
        title: "Verify multiple payment methods are supported (Credit Card, PayPal, etc.)",
        priority: "High",
        category: "Integration Testing",
        mainCategory: "Shopping Cart & Checkout",
        subCategory: "Payment Processing",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "checkout_4",
        title: "Verify order confirmation email is sent after successful payment",
        priority: "High",
        category: "Integration Testing",
        mainCategory: "Shopping Cart & Checkout",
        subCategory: "Payment Processing",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },

      // Performance & Accessibility
      {
        id: "perf_1",
        title: "Verify page load time is under 3 seconds",
        priority: "High",
        category: "Performance Testing",
        mainCategory: "Performance & Accessibility",
        subCategory: "Page Performance",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "perf_2",
        title: "Verify images are optimized and load efficiently",
        priority: "Medium",
        category: "Performance Testing",
        mainCategory: "Performance & Accessibility",
        subCategory: "Page Performance",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "perf_3",
        title: "Verify website performs well under high traffic load",
        priority: "High",
        category: "Performance Testing",
        mainCategory: "Performance & Accessibility",
        subCategory: "Load Testing",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "acc_1",
        title: "Verify website is navigable using keyboard only",
        priority: "Medium",
        category: "Accessibility Testing",
        mainCategory: "Performance & Accessibility",
        subCategory: "Keyboard Navigation",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "acc_2",
        title: "Verify all images have appropriate alt text",
        priority: "Medium",
        category: "Accessibility Testing",
        mainCategory: "Performance & Accessibility",
        subCategory: "Screen Reader Support",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "acc_3",
        title: "Verify color contrast meets WCAG guidelines",
        priority: "Low",
        category: "Accessibility Testing",
        mainCategory: "Performance & Accessibility",
        subCategory: "Visual Accessibility",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },

      // Mobile Responsiveness
      {
        id: "mobile_1",
        title: "Verify website displays correctly on mobile devices (iOS)",
        priority: "High",
        category: "UI Testing",
        mainCategory: "Mobile Responsiveness",
        subCategory: "Mobile Display",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "mobile_2",
        title: "Verify website displays correctly on mobile devices (Android)",
        priority: "High",
        category: "UI Testing",
        mainCategory: "Mobile Responsiveness",
        subCategory: "Mobile Display",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "mobile_3",
        title: "Verify touch interactions work correctly on mobile",
        priority: "High",
        category: "UI Testing",
        mainCategory: "Mobile Responsiveness",
        subCategory: "Touch Interactions",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "mobile_4",
        title: "Verify mobile navigation menu works correctly",
        priority: "High",
        category: "UI Testing",
        mainCategory: "Mobile Responsiveness",
        subCategory: "Mobile Navigation",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },

      // Data Validation
      {
        id: "data_1",
        title: "Verify form validation for required fields",
        priority: "High",
        category: "Data Validation",
        mainCategory: "Data Validation & Error Handling",
        subCategory: "Form Validation",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "data_2",
        title: "Verify email format validation",
        priority: "Medium",
        category: "Data Validation",
        mainCategory: "Data Validation & Error Handling",
        subCategory: "Form Validation",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "data_3",
        title: "Verify phone number format validation",
        priority: "Medium",
        category: "Data Validation",
        mainCategory: "Data Validation & Error Handling",
        subCategory: "Form Validation",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "error_1",
        title: "Verify appropriate error messages are displayed for invalid inputs",
        priority: "High",
        category: "Data Validation",
        mainCategory: "Data Validation & Error Handling",
        subCategory: "Error Messages",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "error_2",
        title: "Verify 404 error page displays correctly for invalid URLs",
        priority: "Medium",
        category: "Data Validation",
        mainCategory: "Data Validation & Error Handling",
        subCategory: "Error Pages",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
      {
        id: "error_3",
        title: "Verify 500 error page displays correctly for server errors",
        priority: "Low",
        category: "Data Validation",
        mainCategory: "Data Validation & Error Handling",
        subCategory: "Error Pages",
        completed: false,
        projectId: "1",
        createdAt: new Date(),
      },
    ]

    setChecklistItems(mockItems)

    // Group items by category
    const categoryMap: Record<string, any> = {}

    mockItems.forEach((item) => {
      const mainCategory = item.mainCategory || "General"
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

    const sortedCategories = Object.values(categoryMap).sort(
      (a, b) => a.mainCategory.localeCompare(b.mainCategory) || a.subCategory.localeCompare(b.subCategory),
    )

    setCategories(sortedCategories)

    // Initialize all categories as expanded
    const expanded: Record<string, boolean> = {}
    sortedCategories.forEach((category) => {
      expanded[category.id] = true
    })
    setExpandedCategories(expanded)
  }

  const handleItemToggle = (id: string, completed: boolean) => {
    setChecklistItems((prev) => prev.map((item) => (item.id === id ? { ...item, completed } : item)))

    // Update categories to reflect the change
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        items: category.items.map((item) => (item.id === id ? { ...item, completed } : item)),
      })),
    )

    toast({
      title: completed ? "Test case marked as completed" : "Test case marked as incomplete",
      description: `Test case has been ${completed ? "checked" : "unchecked"}`,
    })
  }

  const handleTickAllInCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return

    const itemIds = category.items.map((item) => item.id)

    setChecklistItems((prev) => prev.map((item) => (itemIds.includes(item.id) ? { ...item, completed: true } : item)))

    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, items: cat.items.map((item) => ({ ...item, completed: true })) } : cat,
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500"
      case "High":
        return "bg-orange-500"
      case "Medium":
        return "bg-green-500"
      case "Low":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityDot = (priority: string) => {
    const color = getPriorityColor(priority)
    return <span className={`inline-block w-3 h-3 rounded-full ${color} mr-1`}></span>
  }

  const getTotalChecksByCategory = (mainCategory: string) => {
    return categories
      .filter((category) => category.mainCategory === mainCategory)
      .reduce((total, category) => total + category.items.length, 0)
  }

  const getCompletedChecksByCategory = (mainCategory: string) => {
    return categories
      .filter((category) => category.mainCategory === mainCategory)
      .reduce((total, category) => total + category.items.filter((item) => item.completed).length, 0)
  }

  const getTotalChecksBySubCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.items.length : 0
  }

  const getCompletedChecksBySubCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId)
    return category ? category.items.filter((item) => item.completed).length : 0
  }

  const getMainCategories = () => {
    const mainCats = new Set<string>()
    categories.forEach((category) => {
      mainCats.add(category.mainCategory)
    })
    return Array.from(mainCats)
  }

  const getSubCategoriesByMainCategory = (mainCategory: string) => {
    return categories.filter((category) => category.mainCategory === mainCategory)
  }

  const totalChecks = checklistItems.length
  const completedChecks = checklistItems.filter((item) => item.completed).length

  const handleEditTestCase = (testCase: any) => {
    setEditingTestCase(testCase)
    setIsEditModalOpen(true)
  }

  const handleSaveTestCase = (updatedTestCase: any) => {
    setChecklistItems((prev) => prev.map((item) => (item.id === updatedTestCase.id ? updatedTestCase : item)))

    // Update categories to reflect the change
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        items: category.items.map((item) => (item.id === updatedTestCase.id ? updatedTestCase : item)),
      })),
    )

    toast({
      title: "Test case updated",
      description: "Test case has been successfully updated",
    })
  }

  const handleDeleteTestCase = (testCaseId: string) => {
    setChecklistItems((prev) => prev.filter((item) => item.id !== testCaseId))

    // Update categories to remove the item
    setCategories((prev) =>
      prev.map((category) => ({
        ...category,
        items: category.items.filter((item) => item.id !== testCaseId),
      })),
    )

    toast({
      title: "Test case deleted",
      description: "Test case has been successfully deleted",
    })
  }

  const handleGenerateTestCases = (settings: any) => {
    // Mock generated test cases
    const mockTestCases: TestCase[] = [
      {
        id: "TC001",
        checklist: "Xác minh tiêu đề/heading của trang đăng nhập hiển thị đúng.",
        title: "Verify Login Page Title/Heading",
        category: "UI & Layout",
        subCategory: "Static Elements",
        priority: 2,
        preCondition: "User is on the login page.",
        description: "This test case verifies that the main title or heading of the login page is displayed correctly.",
        steps: [
          "1. Navigate to the application's login page.",
          "2. Observe the main heading or title displayed on the page.",
        ],
        expectedResult:
          "The login page loads successfully. The title/heading 'Đăng nhập' or equivalent is displayed prominently at the top of the login form or page.",
        testData: "N/A",
      },
      {
        id: "TC002",
        checklist:
          "Xác minh các label cho trường 'Tên đăng nhập' hoặc 'Email' và 'Mật khẩu' hiển thị chính xác và đúng vị trí.",
        title: "Verify Input Field Labels",
        category: "UI & Layout",
        subCategory: "Static Elements",
        priority: 2,
        preCondition: "User is on the login page.",
        description:
          "This test case verifies that the labels for the 'Tên đăng nhập' or 'Email' field and the 'Mật khẩu' field are displayed correctly and positioned appropriately next to or above their respective input fields.",
        steps: [
          "1. Navigate to the application's login page.",
          "2. Locate the input field intended for username or email.",
          "3. Locate the input field intended for password.",
        ],
        expectedResult:
          "The login page loads successfully. A label with the text 'Tên đăng nhập' or 'Email' is displayed correctly positioned relative to the input field. A label with the text 'Mật khẩu' is displayed correctly positioned relative to the input field.",
        testData: "N/A",
      },
      {
        id: "TC003",
        checklist: "Xác minh nút 'Đăng nhập' hiển thị và có thể click được.",
        title: "Verify Login Button Functionality",
        category: "UI & Layout",
        subCategory: "Interactive Elements",
        priority: 1,
        preCondition: "User is on the login page.",
        description: "This test case verifies that the login button is visible and clickable.",
        steps: [
          "1. Navigate to the application's login page.",
          "2. Locate the login button.",
          "3. Verify the button is visible and enabled.",
          "4. Click the login button.",
        ],
        expectedResult: "The login button is visible, enabled, and responds to click events appropriately.",
        testData: "N/A",
      },
    ]

    setGeneratedTestCases(mockTestCases)
    setActiveTab("testcases")

    toast({
      title: "Test cases generated successfully",
      description: `Generated ${mockTestCases.length} test cases`,
    })
  }

  const handleSendRequirement = () => {
    if (!requirementInput.trim()) return

    toast({
      title: "Requirement sent",
      description: "Your requirement has been sent to AI for processing",
    })

    setRequirementInput("")
  }

  const handleImageUpload = () => {
    // Handle image upload logic
    toast({
      title: "Image upload",
      description: "Image upload functionality",
    })
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.push("/projects/1")} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">{projectTitle}</h1>
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

                <div className="flex items-center space-x-2">
                  <span className="text-sm">Version 3</span>
                  <ChevronDown className="w-4 h-4" />
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
                    <Button variant="outline" size="sm" onClick={handleExportToExcel}>
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

                <div className="space-y-2">
                  {getMainCategories().map((mainCategory, index) => {
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
                                  {subCategory.items.map((item, itemIndex) => (
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
                                        className={`text-sm cursor-pointer flex-1 ${
                                          item.completed ? "line-through text-gray-500" : ""
                                        }`}
                                      >
                                        {itemIndex + 1}. {item.title}
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
                      className={`flex-1 rounded-none border-b-2 ${
                        rightPanelView === "history"
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-600"
                      }`}
                    >
                      History
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRightPanelView("changes")}
                      className={`flex-1 rounded-none border-b-2 ${
                        rightPanelView === "changes"
                          ? "border-blue-500 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-600"
                      }`}
                    >
                      Changes
                    </Button>
                  </div>

                  {rightPanelView === "history" && (
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
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
                      </div>

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
                            <div className="absolute bottom-2 right-2 flex space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={handleImageUpload}
                                title="Upload image"
                              >
                                <Upload className="w-3 h-3" />
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
              {generatedTestCases.length === 0 ? (
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
                        <h2 className="text-lg font-semibold">Màn hình Đăng nhập</h2>
                        <span className="text-sm text-gray-500">Version 1</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <FileSpreadsheet className="w-4 h-4 mr-2" />
                          Export to Excel
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <Grid3X3 className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <List className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="flex items-center space-x-4 mb-4">
                      <Badge className="bg-green-100 text-green-800">{generatedTestCases.length} Test Cases</Badge>
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
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {generatedTestCases.map((testCase, index) => (
                            <tr key={testCase.id} className="border-b hover:bg-gray-50">
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                {testCase.id}
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{testCase.checklist}</div>
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{testCase.title}</div>
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                {testCase.category}
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                {testCase.subCategory}
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top text-center">
                                {testCase.priority}
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{testCase.preCondition}</div>
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{testCase.description}</div>
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words space-y-1">
                                  {testCase.steps.map((step, stepIndex) => (
                                    <div key={stepIndex}>{step}</div>
                                  ))}
                                </div>
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top">
                                <div className="max-w-xs break-words">{testCase.expectedResult}</div>
                              </td>
                              <td className="border border-gray-200 px-3 py-3 text-sm text-gray-900 align-top text-center">
                                {testCase.testData}
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
                        Showing 1 to {generatedTestCases.length} of {generatedTestCases.length} entries
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
