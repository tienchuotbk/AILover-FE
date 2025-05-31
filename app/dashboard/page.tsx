"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageIcon, Upload } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { CreateProjectModal } from "@/components/create-project-modal"

export default async function DashboardPage() {
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [requirements, setRequirements] = useState("")

  return (
    <SidebarProvider>
      <AppSidebar
        onCreateProject={() => setIsCreateProjectOpen(true)}
      />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="text-center w-full">
              <h1 className="text-4xl font-bold text-blue-600 mb-2">Test Case Generator</h1>
              <p className="text-gray-600 text-lg">
                Convert your UI and requirements into comprehensive test scenarios
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Main Form */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe the feature requirement, user flow, expected behavior, and any specific scenarios to test..."
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button variant="outline" size="sm">
                        <ImageIcon className="w-4 h-4 mr-2" />1
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Attach Image
                      </Button>
                      <Button variant="outline" size="sm">
                        Select Project
                      </Button>
                    </div>

                    <Button className="bg-blue-500 hover:bg-blue-600">Create checklist in</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Steps */}
            <div className="flex items-center justify-center space-x-8 py-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <span className="font-medium">Input requirement</span>
              </div>

              <div className="w-16 h-0.5 bg-blue-500"></div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <span className="font-medium">Create checklist</span>
              </div>

              <div className="w-16 h-0.5 bg-blue-500"></div>

              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <span className="font-medium">Create testcase</span>
              </div>
            </div>

            {/* Tips Section */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Effective Prompts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Be specific about the feature or functionality you want to test</p>
                  <p>• Include user flows and expected behaviors</p>
                  <p>• Mention any edge cases or error scenarios</p>
                  <p>• Specify the testing environment or constraints</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>

      <CreateProjectModal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen} />
    </SidebarProvider>
  )
}
