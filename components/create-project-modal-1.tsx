"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X, Loader2 } from "lucide-react"
import { createProject } from "@/lib/action/project"
import { toast } from "@/hooks/use-toast"

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void,
  userId: string
}

export function CreateNewProjectModal({ open, onOpenChange, userId }: CreateProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    checklistLevel: "High",
    testingTypes: {
      uiux: true,
      integration: false,
      system: true,
      security: true,
      performance: true,
      accessibility: false,
      dataValidation: true,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên project là bắt buộc",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await createProject(formData.name, formData.description, formData.settings, userId)

      toast({
        title: "Thành công",
        description: "Project đã được tạo thành công",
      })

      onOpenChange(false)

      // Reset form
      setFormData({
        name: "",
        description: "",
        checklistLevel: "High",
        testingTypes: {
          uiux: true,
          integration: false,
          system: true,
          security: true,
          performance: true,
          accessibility: false,
          dataValidation: true,
        },
      })
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo project. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestingTypeChange = (type: keyof typeof formData.testingTypes, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      testingTypes: {
        ...prev.testingTypes,
        [type]: checked,
      },
    }))
  }

  const priorityLevels = [
    {
      level: "Critical",
      color: "bg-red-500",
      description: "Must be tested first, directly affects core functionality, security, or system stability",
    },
    {
      level: "High",
      color: "bg-orange-500",
      description: "Important but not critical, affects user experience or primary workflow",
    },
    {
      level: "Medium",
      color: "bg-green-500",
      description: "Should be tested when possible, affects secondary functionality or edge cases",
    },
    {
      level: "Low",
      color: "bg-blue-500",
      description: "Nice-to-have, cosmetic issues or rare scenarios with minimal impact",
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create a new project
            {/* <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button> */}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="My project"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Project description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          {/* Checklist Settings */}
          <div className="space-y-3">
            <Label>Checklist Settings</Label>
            <div className="space-y-2">
              <Label htmlFor="detail-level" className="text-sm">
                Detail level
              </Label>
              <Select
                value={formData.checklistLevel}
                onValueChange={(value: "High" | "Medium" | "Low") =>
                  setFormData((prev) => ({ ...prev, checklistLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Testing Types */}
          <div className="space-y-3">
            <Label>Testing Types</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="ui-testing" className="text-sm">
                  UI/UX Testing
                </Label>
                <Switch
                  id="ui-testing"
                  checked={formData.testingTypes.uiux}
                  onCheckedChange={(checked) => handleTestingTypeChange("uiux", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="integration-testing" className="text-sm">
                  Integration Testing
                </Label>
                <Switch
                  id="integration-testing"
                  checked={formData.testingTypes.integration}
                  onCheckedChange={(checked) => handleTestingTypeChange("integration", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="system-testing" className="text-sm">
                  System Testing
                </Label>
                <Switch
                  id="system-testing"
                  checked={formData.testingTypes.system}
                  onCheckedChange={(checked) => handleTestingTypeChange("system", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="security-testing" className="text-sm">
                  Security Testing
                </Label>
                <Switch
                  id="security-testing"
                  checked={formData.testingTypes.security}
                  onCheckedChange={(checked) => handleTestingTypeChange("security", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="performance-testing" className="text-sm">
                  Performance Testing
                </Label>
                <Switch
                  id="performance-testing"
                  checked={formData.testingTypes.performance}
                  onCheckedChange={(checked) => handleTestingTypeChange("performance", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="accessibility-testing" className="text-sm">
                  Accessibility Testing
                </Label>
                <Switch
                  id="accessibility-testing"
                  checked={formData.testingTypes.accessibility}
                  onCheckedChange={(checked) => handleTestingTypeChange("accessibility", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="data-validation" className="text-sm">
                  Data Validation Testing
                </Label>
                <Switch
                  id="data-validation"
                  checked={formData.testingTypes.dataValidation}
                  onCheckedChange={(checked) => handleTestingTypeChange("dataValidation", checked)}
                />
              </div>
            </div>
          </div>

          {/* Priority Levels */}
          <div className="space-y-3">
            <Label>Priority Levels</Label>
            <div className="grid grid-cols-2 gap-3">
              {priorityLevels.map((priority) => (
                <div key={priority.level} className="p-3 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={`${priority.color} text-white`}>{priority.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600">{priority.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
