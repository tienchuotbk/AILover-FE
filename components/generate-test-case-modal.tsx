"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface GenerateTestCaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: (settings: any) => void
}

export function GenerateTestCaseModal({ open, onOpenChange, onGenerate }: GenerateTestCaseModalProps) {
  const [idTestcase, setIdTestcase] = useState("TC")
  const [language, setLanguage] = useState("English")
  const [testDataExample, setTestDataExample] = useState("")

  const handleGenerate = () => {
    onGenerate({
      idTestcase,
      language,
      testDataExample,
    })
    onOpenChange(false)
    // Reset form
    setIdTestcase("TC")
    setLanguage("English")
    setTestDataExample("")
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset form
    setIdTestcase("TC")
    setLanguage("English")
    setTestDataExample("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Generate Test Case Settings</DialogTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="id-testcase">ID Testcase</Label>
            <Select value={idTestcase} onValueChange={setIdTestcase}>
              <SelectTrigger>
                <SelectValue placeholder="Select ID format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TC">TC001, TC002, TC003, ...</SelectItem>
                <SelectItem value="TEST">TEST001, TEST002, TEST003, ...</SelectItem>
                <SelectItem value="T">T001, T002, T003, ...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="language">Language:</Label>
              <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                <span className="text-xs">?</span>
              </div>
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Vietnamese">Vietnamese</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="test-data">Test Data Example:</Label>
              <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center">
                <span className="text-xs">?</span>
              </div>
            </div>
            <Textarea
              id="test-data"
              placeholder="Enter test data examples..."
              value={testDataExample}
              onChange={(e) => setTestDataExample(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} className="bg-blue-500 hover:bg-blue-600">
            Save & Generate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
