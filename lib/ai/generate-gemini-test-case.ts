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
export async function generateTestCasesGemini({ checklist, projectSettings }: {
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


    const modelName = "gemini-1.5-flash-latest"; // Thay thế bằng model chính xác bạn muốn dùng
    console.log(`Using model: ${modelName}`);
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const prompt = `
            You are an expert QA/QC professional in software testing. Your task is to analyze user requirements and create structured test checklists or test cases.
            Based on the available information, you will: Analyze the feature details provided by the user Identify necessary test cases, paying special attention to project-specific characteristics Organize the checklist according to user flow from start to finish, or by functional group if requested Create a clear hierarchical structure Within each flow step, arrange test cases by priority (happy paths first, error cases, edge cases after) Organize the checklist following the sequential flow of user actions
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
        console.log("Sending request to Gemini API with payload:", JSON.stringify(requestPayload, null, 2));
        const result = await model.generateContent(requestPayload); // Truyền trực tiếp đối tượng request
        const response = result.response;
        const text = response.text();
        console.log("Response from Gemini API:", text);
    } catch (error) {
        console.error("Error generating content:", error);
    }
    // try {
    //     const genAI = new GoogleGenerativeAI(API_KEY);
    //     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    //     // Xây dựng prompt gửi đến Gemini API
    //     // Bạn có thể tùy chỉnh cách bạn muốn kết hợp checklist và projectSettings vào prompt
    //     const prompt = `
    //         You are an expert QA/QC professional in software testing. Your task is to analyze user requirements and create structured test checklists or test cases.
    //         Based on the available information, you will: Analyze the feature details provided by the user Identify necessary test cases, paying special attention to project-specific characteristics Organize the checklist according to user flow from start to finish, or by functional group if requested Create a clear hierarchical structure Within each flow step, arrange test cases by priority (happy paths first, error cases, edge cases after) Organize the checklist following the sequential flow of user actions
    //         ${checklist}
    //         Your response MUST be on regular text format (no coding block), no explanatory text and follow:
    //         No explanation text or title, just only checklist items 
    //         Categories should be numbered sequentially (1, 2, 3, etc.) 
    //         Subcategories within each category should be numbered using decimal notation (e.g., 1.1, 1.2, 2.1, 2.2, etc.) where the first number corresponds to the parent category 
    //         Format each check item as: "[[priority]] [number]. [check item]" 
    //         Individual checklist items should be numbered sequentially across all categories and subcategories (1, 2, 3, 4, etc.) regardless of which subcategory they belong to 
    //         The numbering of checklist items should continue uninterrupted throughout the entire list Priority levels: 
    //             [C] - Critical: Must be tested first; directly affects core functionality, security, or system stability 
    //             [H] - High: Important but not critical; affects user experience or primary workflows 
    //             [M] - Medium: Should be tested when possible; affects secondary functionality or edge cases 
    //             [L] - Low: Nice to have; cosmetic issues or rare scenarios with minimal impact
    //     `;

    //     console.log("Sending prompt to Gemini API:", prompt);

    //     const result = await model.generateContent(prompt);
    //     const response = result.response;
    //     const text = response.text();

    //     console.log("Received response from Gemini API:", text);
    //     return text;

    // } catch (error) {
    //     console.error("Error calling Gemini API:", error);
    //     // Bạn có thể xử lý lỗi cụ thể hơn ở đây nếu cần
    //     return undefined;
    // }
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