"use client"

import { useState } from "react"
import Link from "next/link"
import { redirect, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TestTube, Users, FolderOpen, MessageSquare, Plus, ChevronDown, BarChart3, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from '@supabase/auth-helpers-react'

interface AppSidebarProps {
  onCreateProject: () => void
}

export function AppSidebar() {
  const pathname = usePathname()
  const user = useUser()

  const [isProjectsHovered, setIsProjectsHovered] = useState(false)

  const mainNavItems = [
    {
      title: "New testcase",
      url: "/dashboard",
      icon: TestTube,
    },
    {
      title: "Projects",
      url: "/project",
      icon: FolderOpen,
      hasAction: true,
    },
  ]

  const projects = [{ id: 1, name: "Project 1" }]

  const recentFeatures = [
    {
      title: "Dashboard Overview",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      title: "Homepage",
      url: "/homepage",
      icon: Home,
    },
  ]

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GT</span>
          </div>
          <span className="font-bold text-xl">GenTest</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    onMouseEnter={() => item.title === "Projects" && setIsProjectsHovered(true)}
                    onMouseLeave={() => item.title === "Projects" && setIsProjectsHovered(false)}
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {/* {item.hasAction && (
                    <SidebarMenuAction
                      onClick={onCreateProject}
                      className={cn("transition-opacity", isProjectsHovered ? "opacity-100" : "opacity-0")}
                    >
                      <Plus className="w-4 h-4" />
                    </SidebarMenuAction>
                  )} */}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/projects/${project.id}`}>
                      <FolderOpen className="w-4 h-4" />
                      <span>{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <div className="px-2">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              View All
              <ChevronDown className="w-3 h-3 ml-auto" />
            </Button>
          </div>
        </SidebarGroup> */}

        {/* <SidebarGroup>
          <SidebarGroupLabel>Recent features</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {recentFeatures.map((feature) => (
                <SidebarMenuItem key={feature.title}>
                  <SidebarMenuButton asChild>
                    <Link href={feature.url}>
                      <feature.icon className="w-4 h-4" />
                      <span>{feature.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          <div className="px-2">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              View All
              <ChevronDown className="w-3 h-3 ml-auto" />
            </Button>
          </div>
        </SidebarGroup> */}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback>HD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.user_metadata.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
