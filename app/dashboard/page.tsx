"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ArrowRight, BarChart3, Calendar, CheckCircle2, ClipboardList, Clock, FolderOpen, ImageIcon, Loader2, Maximize2, MessageSquare, Minimize2, Plus, Target, TrendingUp, Upload, X, Zap } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useUser } from "@supabase/auth-helpers-react"
import { Badge } from "@/components/ui/badge"
import { CreateNewProjectModal } from "@/components/create-project-modal-1"

export default function DashboardPage() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [requirements, setRequirements] = useState("")
  const router = useRouter();
  const [isQuickFormMinimized, setIsQuickFormMinimized] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [isQuickFormOpen, setIsQuickFormOpen] = useState(false)

  const user = useUser();

  const stats = {
    projects: 5,
    features: 12,
    testReports: 28,
    completedTests: 87,
    totalTests: 124,
    successRate: 87,
    recentActivity: [
      {
        id: 1,
        action: "Test report generated",
        project: "E-commerce Website",
        time: "2 hours ago",
        type: "success",
      },
      {
        id: 2,
        action: "Feature updated",
        project: "Banking Mobile App",
        time: "5 hours ago",
        type: "update",
      },
      {
        id: 3,
        action: "Test case completed",
        project: "Healthcare Dashboard",
        time: "Yesterday",
        type: "complete",
      },
    ],
    topProjects: [
      { name: "E-commerce Website", tests: 45, completion: 85, status: "active" },
      { name: "Banking Mobile App", tests: 32, completion: 72, status: "active" },
      { name: "Healthcare Dashboard", tests: 28, completion: 95, status: "completed" },
    ],
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {

  }

  const removeImage = (index: number) => {
  }

  const handleQuickGenerate = async () => {
  }


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-8 p-8 pt-6 bg-gradient-to-br from-slate-50 to-white min-h-screen relative">
          {/* Hero Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {getGreeting()}, {user?.email || ''}! 👋
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Here's what's happening with your testing projects today
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setIsCreateProjectOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="mr-2 h-5 w-5" />
                New Project
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-1">Total Projects</p>
                    <h3 className="text-3xl font-bold text-blue-900">{stats.projects}</h3>
                    <p className="text-xs text-blue-600 mt-1">+2 this month</p>
                  </div>
                  <div className="p-3 bg-blue-600 rounded-full">
                    <FolderOpen className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-700 mb-1">Active Features</p>
                    <h3 className="text-3xl font-bold text-emerald-900">{stats.features}</h3>
                    <p className="text-xs text-emerald-600 mt-1">+5 this week</p>
                  </div>
                  <div className="p-3 bg-emerald-600 rounded-full">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700 mb-1">Test Reports</p>
                    <h3 className="text-3xl font-bold text-purple-900">{stats.testReports}</h3>
                    <p className="text-xs text-purple-600 mt-1">+8 this week</p>
                  </div>
                  <div className="p-3 bg-purple-600 rounded-full">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-orange-50 to-orange-100/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700 mb-1">Success Rate</p>
                    <h3 className="text-3xl font-bold text-orange-900">{stats.successRate}%</h3>
                    <p className="text-xs text-orange-600 mt-1">+3% from last month</p>
                  </div>
                  <div className="p-3 bg-orange-600 rounded-full">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Quick Actions */}
            <Card className="lg:col-span-1 border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Activity className="mr-2 h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                  onClick={() => setIsCreateProjectOpen(true)}
                >
                  <Plus className="mr-3 h-4 w-4" />
                  Create New Project
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                  onClick={() => router.push("/projects")}
                >
                  <FolderOpen className="mr-3 h-4 w-4" />
                  View All Projects
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-purple-50 hover:border-purple-200 transition-colors"
                >
                  <ClipboardList className="mr-3 h-4 w-4" />
                  Generate Report
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start h-12 hover:bg-orange-50 hover:border-orange-200 transition-colors"
                  onClick={() => setIsQuickFormOpen(true)}
                >
                  <MessageSquare className="mr-3 h-4 w-4" />
                  Quick Test Generation
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="lg:col-span-2 border-0 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg">
                  <Clock className="mr-2 h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${activity.type === "success"
                            ? "bg-emerald-500"
                            : activity.type === "update"
                              ? "bg-blue-500"
                              : "bg-orange-500"
                          }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.project}</p>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Overview */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Top Projects
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/projects")}>
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.topProjects.map((project, index) => (
                  <div
                    key={project.name}
                    className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-500">{project.tests} test cases</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{project.completion}% Complete</p>
                        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${project.completion}%` }}
                          />
                        </div>
                      </div>

                      <Badge
                        variant={project.status === "completed" ? "default" : "secondary"}
                        className={
                          project.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                        }
                      >
                        {project.status === "completed" ? (
                          <>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Activity className="mr-1 h-3 w-3" />
                            Active
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100/30">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-600 mb-4">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-900 mb-1">{stats.completedTests}</h3>
                <p className="text-sm text-emerald-700">Tests Passed</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-red-50 to-red-100/30">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600 mb-4">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-900 mb-1">{stats.totalTests - stats.completedTests}</h3>
                <p className="text-sm text-red-700">Tests Pending</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/30">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-1">{stats.successRate}%</h3>
                <p className="text-sm text-blue-700">Success Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Requirement Form - Fixed Position */}
          {isQuickFormOpen && (
            <div className="fixed bottom-6 right-6 z-50">
              <Card
                className={`w-96 border-0 shadow-2xl transition-all duration-300 ${isQuickFormMinimized ? "h-14" : "h-auto"
                  }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                      Quick Test Generation
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setIsQuickFormMinimized(!isQuickFormMinimized)}
                      >
                        {isQuickFormMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsQuickFormOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {!isQuickFormMinimized && (
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Describe your feature requirements, user flow, expected behavior, and any specific scenarios to test..."
                        value={requirements}
                        onChange={(e) => setRequirements(e.target.value)}
                        className="min-h-[120px] resize-none"
                      />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="file"
                          id="image-upload"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("image-upload")?.click()}
                          className="flex items-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Images
                        </Button>
                        <span className="text-xs text-gray-500">
                          {uploadedImages.length > 0 && `${uploadedImages.length} file(s) selected`}
                        </span>
                      </div>

                      {/* Image Preview */}
                      {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {uploadedImages.map((file, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={URL.createObjectURL(file) || "/placeholder.svg"}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-16 object-cover rounded border"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleQuickGenerate}
                        disabled={isGenerating || !requirements.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Generate Checklist"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}
        </div>
      </SidebarInset>

      <CreateNewProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} userId={user?.id || ''} />
    </SidebarProvider>
  )
}
