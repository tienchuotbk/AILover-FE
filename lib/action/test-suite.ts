import { createClient } from "@/lib/supabase/client"

export async function getTestSuites(projectId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("test_suite")
        .select("*")
        .eq("project_id", projectId)

    if (error) {
        console.error("Error fetching test suites:", error)
        throw error
    }

    return data
}

export async function getTestSuitesByProjects(projectIds: string[]) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("test_suite")
        .select("*")
        .in("project_id", projectIds)

    if (error) {
        console.error("Error fetching test suites by projects:", error)
        throw error
    }

    return data
}

export async function getTestSuite(testSuiteId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("test_suite")
        .select("*")
        .eq("id", testSuiteId)
        .single()

    if (error) {
        console.error("Error fetching test suite:", error)
        throw error
    }

    return data
}

export async function createTestSuite(
    name: string,
    projectId: string,
    description: string,
) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("test_suite")
        .insert([{ name, description, project_id: projectId }])
        .select("*")
        .single()

    if (error) {
        console.error("Error creating test suite:", error)
        throw error
    }
    return data
}

export async function updateTestSuite(
    testSuiteId: string,
    name: string,
    description: string,
) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("test_suite")
        .update({ name, description })
        .eq("id", testSuiteId)
        .select("*")
        .single()

    if (error) {
        console.error("Error updating test suite:", error)
        throw error
    }

    return data
}

export async function deleteTestSuite(testSuiteId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("test_suite")
        .delete()
        .eq("id", testSuiteId)
        .select("*")
        .single()

    if (error) {
        console.error("Error deleting test suite:", error)
        throw error
    }

    return data
}
