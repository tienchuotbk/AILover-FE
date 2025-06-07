"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
    id: testCase?.id || "",
    title: testCase?.title || "",
    description: testCase?.content || "",
    priority: testCase?.priority || "M",
    category: testCase?.category || "",
    mainCategory: testCase?.mainCategory || "",
    subCategory: testCase?.subCategory || "",
  })

  console.log('testCase', testCase)

  // Update form data when testCase changes
  useEffect(() => {
    if (testCase) {
      setFormData({
        id: testCase.id,
        title: testCase.title,
        description: testCase.content || "",
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

    try {
      setIsLoading(true)

      const updatedTestCase: any = {
        id: formData.id,
        content: formData.description.trim(),
        priority: formData.priority as "C" | "H" | "M" | "L",
      }

      onSave(updatedTestCase)

      onOpenChange(false)
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const priorityOptions = [
    { value: "C", label: "Critical", color: "bg-red-500" },
    { value: "H", label: "High", color: "bg-orange-500" },
    { value: "M", label: "Medium", color: "bg-green-500" },
    { value: "L", label: "Low", color: "bg-blue-500" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Check List
            {/* <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4" />
            </Button> */}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Content</Label>
            <Textarea
              id="description"
              placeholder="Enter check list description"
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

          {/* <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="e.g., Security Testing, UI Testing"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mainCategory">Main Category</Label>
            <Input
              id="mainCategory"
              placeholder="e.g., Authentication & Security"
              value={formData.mainCategory}
              onChange={(e) => setFormData((prev) => ({ ...prev, mainCategory: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subCategory">Sub Category</Label>
            <Input
              id="subCategory"
              placeholder="e.g., User Registration"
              value={formData.subCategory}
              onChange={(e) => setFormData((prev) => ({ ...prev, subCategory: e.target.value }))}
            />
          </div> */}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.description.trim()}>
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
