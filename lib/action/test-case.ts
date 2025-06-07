import { createClient } from "@/lib/supabase/client"

export async function getTestCases(testSuiteId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("test_case")
        .select("*")
        .eq("test_suit_id", testSuiteId)
        .order("id", { ascending: false })

    if (error) {
        console.error("Error fetching test cases:", error)
        throw error
    }

    return data
}

export async function getTestCase(testCaseId: string) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("test_case")
        .select("*")
        .eq("id", testCaseId)
        .single()

    if (error) {
        console.error("Error fetching test case:", error)
        throw error
    }

    return data
}

export async function createTestCase(
    testSuiteId: string,
    title: string,
    description: string,
    category: string,
    subCategory: string,
    priority: number,
    preCondition: string,
    steps: string[],
) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("test_case")
        .insert([{
            test_suite_id: testSuiteId,
            title,
            description,
            category,
            sub_category: subCategory,
            priority,
            pre_condition: preCondition,
            steps
        }])
        .select("*")
        .single()

    if (error) {
        console.error("Error creating test case:", error)
        throw error
    }

    return data
}

export async function bulkInsertTestcase(input: any[]) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from("test_case")
        .insert(input)
        .limit(1)
    
    if (error) {
        console.error("Error buldInsertTestcase:", error)
        throw error
    } else {
        console.log('Data ne', data)
    }

}