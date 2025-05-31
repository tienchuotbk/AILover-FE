// lib/actions/projects.ts
import { createClient } from "@/lib/supabase/client"

export async function getProjects(userId: any) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("project")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching projects:", error)
        throw error
    }

    return data
}

export async function getProject(projectId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("project")
        .select("*")
        .eq("id", projectId)
        .single()

    if (error) {
        console.error("Error fetching project:", error)
        throw error
    }

    return data
}

export async function createProject(name: string, description: string, settings: Record<string, any>, userId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("project")
        .insert([{ name, description, settings, user_id: userId }])
        .select("*")
        .single()

    if (error) {
        console.error("Error creating project:", error)
        throw error
    }

    return data
}

export async function updateProject(projectId: string, name: string, description: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("project")
        .update({ name, description })
        .eq("id", projectId)
        .select("*")
        .single()

    if (error) {
        console.error("Error updating project:", error)
        throw error
    }

    return data
}

export async function deleteProject(projectId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("project")
        .delete()
        .eq("id", projectId)
        .select("*")
        .single()

    if (error) {
        console.error("Error deleting project:", error)
        throw error
    }

    return data
}