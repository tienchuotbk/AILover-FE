// lib/ai/generate-test-case.ts

import OpenAI from "openai";

const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";
const token = process.env.GITHUB_TOKEN || '';

console.log('token:', token);

const client = new OpenAI({
    baseURL: endpoint,
    dangerouslyAllowBrowser: true,
    apiKey: token,
});

export async function generateTestCases({ checklist, projectSettings }: {
    checklist: string,
    projectSettings: any,
}) {
    const prompt = buildPrompt(checklist, projectSettings);

    const response = await client.chat.completions.create({
        model,
        messages: [
            {
                role: "system",
                content: `You are a professional QA engineer that writes high-quality test cases based on user input and settings.`,
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.7,
        top_p: 1,
    });

    return response.choices[0]?.message?.content;
}

function buildPrompt(checklist: string, settings: any) {
    return `
Project Settings:
- Language: ${settings.testCase?.language ?? "en"}
- Testing Types: ${Object.keys(settings.testCase?.testing_types ?? {}).join(", ")}

Checklist:
${checklist}

Instructions:
Based on the above settings and checklist, generate a detailed list of test cases. Each test case should include:
- Test title
- Precondition
- Steps
- Expected result

Format the response in Markdown or JSON for easy parsing.
  `.trim();
}
