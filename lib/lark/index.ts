const serverURL = 'http://localhost:9000'; Add commentMore actions

export async function getContentFromLarkDoc(document_id: string) {
    const response = await fetch(`${serverURL}/api/lark/document`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            documentId: document_id,
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch document content');
    }

    const data = await response.json();
    return data;
}

export async function exportTestCase(data: any) {
    const response = await fetch(`${serverURL}/api/lark/export-test-case`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error('Failed to export test case');
    }

    const result = await response.json();
    return result;
}

export async function exportTestReport(data: any) {
    const response = await fetch(`${serverURL}/api/lark/export-test-report`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),


    });

    if (!response.ok) {
        throw new Error('Failed to export test report');
    }
Add commentMore actions
    const result = await response.json();
    return result;
}