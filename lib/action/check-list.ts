import { createClient } from "@/lib/supabase/client"

export async function getCheckLists(testSuiteId: string, versionLastest?: number) {
    const supabase = createClient()
    const { data, error } = versionLastest? await supabase
        .from("check_list")
        .select("*")
        .eq("testSuiteId", testSuiteId)
        .eq("version", versionLastest) : await supabase
        .from("check_list")
        .select("*")
        .eq("testSuiteId", testSuiteId)

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

export async function getCheckListByTestSuiteId(testSuiteIds: string[]) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .select("*")
        .in("testSuiteId", testSuiteIds)

    if (error) {
        console.error("Error fetching checklists by test suite IDs:", error)
        throw error
    }

    return data

}

export async function getVersionLastest() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .select("version")
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle(); // Không lỗi nếu không có dòng nào

    if (error) {
        console.error("Error fetching latest version:", error)
        throw error;
    }

    // Nếu không có bản ghi nào => version = 1
    const currentVersion = data?.version ?? 0;
    return Number(currentVersion) + 1;
}

export async function getListVersion(testSuiteId?: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .select("version") // lấy tất cả version
        .eq("testSuiteId", testSuiteId)
        .order("version", { ascending: false })

    if (error) {
        console.error("Error fetching list of versions:", error)
        throw error;
    }

    // Lọc các version duy nhất
    const uniqueVersions = [...new Set(data.map(item => item.version))];
    return uniqueVersions;
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
    dataUpdate: any,
) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .update({
            ...dataUpdate,
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


export async function updateStatusChecklist(checkListId: number | string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("check_list")
        .update({
            completed: 1,
        })
        .eq("id", checkListId)
        .select("*")
        .single()

    if (error) {
        console.error("Error updating checklist status:", error)
        throw error
    }

    return data
}
