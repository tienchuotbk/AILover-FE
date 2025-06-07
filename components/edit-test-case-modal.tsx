"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EditTestCaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  testCase: any
  onSave: (updatedTestCase: any) => void
}

export function EditTestCaseModal({ open, onOpenChange, testCase, onSave }: EditTestCaseModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: testCase?.title || "",
    description: testCase?.description || "",
    priority: testCase?.priority || "Medium",
    category: testCase?.category || "",
    mainCategory: testCase?.mainCategory || "",
    subCategory: testCase?.subCategory || "",
  })

  // Update form data when testCase changes
  useState(() => {
    if (testCase) {
      setFormData({
        title: testCase.title,
        description: testCase.description || "",
        priority: testCase.priority,
        category: testCase.category,
        mainCategory: testCase.mainCategory || "",
        subCategory: testCase.subCategory || "",
      })
    }
  }, [testCase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!testCase) return

    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Tiêu đề test case là bắt buộc",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const updatedTestCase: any = {
        ...testCase,
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority as "Critical" | "High" | "Medium" | "Low",
        category: formData.category.trim(),
        mainCategory: formData.mainCategory.trim(),
        subCategory: formData.subCategory.trim(),
      }

      onSave(updatedTestCase)

      toast({
        title: "Thành công",
        description: "Test case đã được cập nhật",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật test case. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const priorityOptions = [
    { value: "Critical", label: "Critical", color: "bg-red-500" },
    { value: "High", label: "High", color: "bg-orange-500" },
    { value: "Medium", label: "Medium", color: "bg-green-500" },
    { value: "Low", label: "Low", color: "bg-blue-500" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Test Case
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter test case title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter test case description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <span className={`inline-block w-3 h-3 rounded-full ${option.color} mr-2`}></span>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Security Testing, UI Testing"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            />
          </div>

          {/* Main Category */}
          <div className="space-y-2">
            <Label htmlFor="mainCategory">Main Category</Label>
            <Input
              id="mainCategory"
              placeholder="e.g., Authentication & Security"
              value={formData.mainCategory}
              onChange={(e) => setFormData((prev) => ({ ...prev, mainCategory: e.target.value }))}
            />
          </div>

          {/* Sub Category */}
          <div className="space-y-2">
            <Label htmlFor="subCategory">Sub Category</Label>
            <Input
              id="subCategory"
              placeholder="e.g., User Registration"
              value={formData.subCategory}
              onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
