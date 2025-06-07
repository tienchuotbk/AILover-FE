import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Generates test cases based on a checklist and project settings using the Gemini API.
 *
 * @param {object} params - The parameters for generating test cases.
 * @param {string} params.checklist - The checklist to generate test cases from.
 * @param {any} params.projectSettings - The project-specific settings.
 * @returns {Promise<string | undefined>} A promise that resolves with the generated text from the Gemini API,
 * or undefined if an error occurs.
 */
export async function generateCheckListGemini({
    document,
    checklist,
    projectSettings
}: {
    document: string,
    checklist: string,
    projectSettings: any,
}) {
    // Lấy API Key từ biến môi trường hoặc một nơi lưu trữ an toàn.
    // **QUAN TRỌNG:** Không bao giờ hardcode API key trực tiếp trong code cho môi trường production.
    const API_KEY = process.env.GEMINI_API_KE || 'AIzaSyCPtMYMP9FVh3aw8oEPd3oNjWSqoulRTFY';

    if (!API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return undefined;
    }


    const modelName = "gemini-2.5-flash-preview-04-17"; // Thay thế bằng model chính xác bạn muốn dùng
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `
            You are an expert QA/QC professional in software testing. Your tasks are learn about the product documents, analyze user requirements and create structured test checklists or test cases.
            Based on the available information, you will: Analyze the feature details provided by the user Identify necessary test cases, paying special attention to project-specific characteristics Organize the checklist according to user flow from start to finish, or by functional group if requested Create a clear hierarchical structure Within each flow step, arrange test cases by priority (happy paths first, error cases, edge cases after) Organize the checklist following the sequential flow of user actions
            Based on the available information, you will:
            Analyze the feature details provided by the user
            Identify necessary test cases, paying special attention to project-specific characteristics
            Organize the checklist according to user flow from start to finish, or by functional group if requested
            Create a clear hierarchical structure
            Within each flow step, arrange test cases by priority (happy paths first, error cases, edge cases after)
            Organize the checklist following the sequential flow of user actions

            Product documentation (Optional):
            ${document}

            Project/Feature description ():
            ${checklist}

            Your response MUST be on regular text format (no coding block), no explanatory text and follow:
            No explanation text or title, just only checklist items
            Categories should be numbered sequentially (1, 2, 3, etc.)
            Subcategories within each category should be numbered using decimal notation (e.g., 1.1, 1.2, 2.1, 2.2, etc.) where the first number corresponds to the parent category
            Format each check item as: "[[priority]] [number]. [check item]"
            Individual checklist items should be numbered sequentially across all categories and subcategories (1, 2, 3, 4, etc.) regardless of which subcategory they belong to
            The numbering of checklist items should continue uninterrupted throughout the entire list Priority levels:
                [C] - Critical: Must be tested first; directly affects core functionality, security, or system stability
                [H] - High: Important but not critical; affects user experience or primary workflows
                [M] - Medium: Should be tested when possible; affects secondary functionality or edge cases
                [L] - Low: Nice to have; cosmetic issues or rare scenarios with minimal impact

            The output should be a JSON array [].
            Each element in the array should be an object {} representing a category and its subcategories. This object should have the following keys:
            id: from 1,2,3 ..., category: A string representing the major category name (extracted from lines starting with N.).
            subCategory: A string representing the subcategory name (extracted from lines starting with N.M.). Note: In the provided JSON example, the subcategory was nested directly under the category object. The array elements were grouped by category/subcategory pairs. Let's follow that structure.
            data: An array [] of objects {}. Each object in this data array represents a single test checklist item.
            Each object within the data array should have the following keys:
            priority: A string extracted from within the [[...]] brackets (e.g., "C", "H", "M", "L").
            number: An integer representing the sequential number following the priority and before the period.
            content: A string containing the text of the test item, starting from the text after the number and period.
            
            Your response MUST be a valid JSON array [].
            Each element in the array should be an object {} representing a category and its subcategories. This object should have the following keys
            `;

    const requestPayload = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ]
    };

    try {
        const result = await model.generateContent(requestPayload); // Truyền trực tiếp đối tượng request
        const response = result.response;
        const text = response.text();
        const jsonText = text.replace(/^```json\n/, "").replace(/\n```$/, "");

        // Bước 2: Parse string thành array of objects
        let resultArray;
        try {
            resultArray = JSON.parse(jsonText);
        } catch (err) {
            console.error("JSON parse error:", err);
        }

        return resultArray;
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

export async function generateTestCases(checkList: any) {
    const API_KEY = process.env.GEMINI_API_KE || 'AIzaSyCPtMYMP9FVh3aw8oEPd3oNjWSqoulRTFY';

    if (!API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return undefined;
    }

    const modelName = "gemini-2.5-flash-preview-04-17"; // Thay thế bằng model chính xác bạn muốn dùng
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });


    const prompt = `
        Generate test cases from the checklist (each test case will be display below each related check item), using the following format:
        ID: $PREFIX_001
        Checklist-ID: [Checklist ID]
        Category: [Category Name]
        Sub-Category: [Sub-Category]
        Checklist: [Checklist Item in their own language]
        Priority: [Priority Number 1-4]
        Title: [Title of testcase]
        Description: [Description of testcase]
        Step: [Step No]
        Action: [Details of test step]
        Expected: [Expected result of step]
        Test Data: [Test data or N/A if not applicable]
        Step: [Step No]
        Action: [Details of test step]
        Expected: [Expected result of step]
        Test Data: [Test data or N/A if not applicable]
        [Add additional steps as needed following the same format]
        Note: Replace $PREFIX with "LG-" and use sequential numbers (001, 002, 003,... format)
        Test Data Examples:
        email company:


        Requirements:
        Generate 20 test cases for each time
        Write testcase content, Category and Subcategory in English
        Write "Checklist" content in their language when send to you
        Each test case should have a unique ID starting with "LG-" followed by sequential numbers
        Test steps should be basic with essential actions only
        Include relevant test data from the examples provided
        Expected results should be clear and verifiable
        Each test case should focus on testing one specific aspect or scenario

        Note:
        - Detail priority:
            [C] - Critical: Must be tested first; directly affects core functionality, security, or system stability
            [H] - High: Important but not critical; affects user experience or primary workflows
            [M] - Medium: Should be tested when possible; affects secondary functionality or edge cases
            [L] - Low: Nice to have; cosmetic issues or rare scenarios with minimal impact
        - Checklist-ID is the ID of the checklist item that this test case is related to
        - Step must be array of objects, each object should have "action", "expected", "testData" keys

        Checklist:
        ${checkList}

        Your response MUST be a valid JSON array [].
        Each element in the array should be an object {} representing a test case. This object should have the following
    `;

    const requestPayload = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ]
    };

    try {
        const result = await model.generateContent(requestPayload); // Truyền trực tiếp đối tượng request
        const response = result.response;
        const text = response.text();
        const jsonText = text.replace(/^```json\n/, "").replace(/\n```$/, "");

        // Bước 2: Parse string thành array of objects
        let resultArray;
        try {
            resultArray = JSON.parse(jsonText);
        } catch (err) {
            console.error("JSON parse error:", err);
        }


        console.log('gen test case result:', resultArray);

        return resultArray;
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

export async function generateTestReport(testCases: any) {
    const API_KEY = process.env.GEMINI_API_KE || 'AIzaSyCPtMYMP9FVh3aw8oEPd3oNjWSqoulRTFY';

    if (!API_KEY) {
        console.error("GEMINI_API_KEY is not set in environment variables.");
        return undefined;
    }

    const modelName = "gemini-2.5-flash-preview-04-17"; // Thay thế bằng model chính xác bạn muốn dùng
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `
        Test cases:
        ${JSON.stringify(testCases)}

        Create a test report from a JSON list of test cases. Please analyze the data and generate a test report that includes the following sections:

        1. Test execution progress (how many test cases have been executed vs. total)
        2. Number of test cases that related to their status and their percentage
        3. Risk analysis based on failed or blocked test cases
        4. Actionable recommendations to improve the test results

        Your response MUST be a valid JSON.
        Follow format:
        {
            summary: "A brief summary of the test execution",
            executedTestCases: 10,
            totalTestCases: 20,
            executionProgressPercentage: 50,
            recommendations: [
                "Recommendation 1",
                "Recommendation 2",
                "Recommendation 3"
            ],
            statusBreakdown: {
                FAIL: {
                    count: 5,
                    percentage: 25   
                },
                PASS: {
                    count: 10,
                    percentage: 50
                },
                PENDING: {
                    count: 5,
                    percentage: 25
                },
                TOTAL: {
                    count: 20,
                    percentage: 100
                }
            }
        }
    `;

    const requestPayload = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ]
    };

    try {
        const result = await model.generateContent(requestPayload); // Truyền trực tiếp đối tượng request
        const response = result.response;
        const text = response.text();
        const jsonText = text.replace(/^```json\n/, "").replace(/\n```$/, "");

        // Bước 2: Parse string thành array of objects
        let resultArray;
        try {
            resultArray = JSON.parse(jsonText);
        } catch (err) {
            console.error("JSON parse error:", err);
        }


        console.log('gen test case result:', resultArray);

        return resultArray;
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

// --- Ví dụ cách sử dụng (Example Usage) ---
// (Bạn cần cài đặt biến môi trường GEMINI_API_KEY trước khi chạy ví dụ này)
/*
async function main() {
    const exampleChecklist = `
        - Người dùng có thể đăng nhập bằng email và mật khẩu.
        - Người dùng có thể xem danh sách sản phẩm.
        - Người dùng có thể thêm sản phẩm vào giỏ hàng.
    `;

    const exampleProjectSettings = {
        projectName: "E-commerce App",
        platform: "Web",
        targetUsers: "Khách hàngทั่วไป",
        testEnvironment: "Staging"
    };

    console.log("Requesting test cases...");
    const testCases = await generateTestCases({
        checklist: exampleChecklist,
        projectSettings: exampleProjectSettings
    });

    if (testCases) {
        console.log("\nGenerated Test Cases (JSON Text):");
        console.log(testCases);
        try {
            const parsedTestCases = JSON.parse(testCases);
            console.log("\nParsed Test Cases (JavaScript Object):");
            console.log(parsedTestCases);
        } catch (e) {
            console.error("\nCould not parse JSON response:", e);
        }
    } else {
        console.log("\nFailed to generate test cases.");
    }
}

// Để chạy ví dụ:
// 1. Cài đặt thư viện: npm install @google/generative-ai
// 2. Đặt biến môi trường: export GEMINI_API_KEY="YOUR_API_KEY" (thay YOUR_API_KEY bằng key của bạn)
// 3. Bỏ comment khối main() ở trên và chạy file (ví dụ: node your-file-name.js)
// main();
*/