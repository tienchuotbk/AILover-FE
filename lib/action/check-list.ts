import { createClient } from "@/lib/supabase/client"

export async function getCheckLists(testSuiteId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .select("*")
        .eq("test_suite_id", testSuiteId)
        .order("created_at", { ascending: false })

    if (error) {
        console.error("Error fetching checklists:", error)
        throw error
    }

    return data
}

export async function getCheckList(checkListId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .select("*")
        .eq("id", checkListId)
        .single()

    if (error) {
        console.error("Error fetching checklist:", error)
        throw error
    }

    return data
}

export async function createCheckList(
    priority: number,
    category: string,
    originalNumber: number,
    details: string,
    testSuiteId: string
) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .insert([{
            priority, category, original_number: originalNumber, details, test_suite_id: testSuiteId
        }])
        .select("*")
        .single()

    if (error) {
        console.error("Error creating checklist:", error)
        throw error
    }

    return data
}

export async function createCheckLists(checkListData: any) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .upsert(checkListData)
        .select("*")

    if (error) {
        console.error("Error creating checklist:", error)
        throw error
    }

    return data
}

export async function updateCheckList(
    checkListId: string,
    priority: number,
    category: string,
    originalNumber: number,
    details: string
) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .update({
            priority, category, original_number: originalNumber, details
        })
        .eq("id", checkListId)
        .select("*")
        .single()

    if (error) {
        console.error("Error updating checklist:", error)
        throw error
    }

    return data
}

export async function deleteCheckList(checkListId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .delete()
        .eq("id", checkListId)
        .select("*")
        .single()

    if (error) {
        console.error("Error deleting checklist:", error)
        throw error
    }

    return data
}
