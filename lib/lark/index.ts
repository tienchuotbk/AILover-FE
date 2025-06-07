const baseURL = process.env.LARK_BASE_URL || 'https://open.larksuite.com/open-apis';
const appID = process.env.LARK_APP_ID || 'cli_a8c915c87e78d029';
const appSecret = process.env.LARK_APP_SECRET || 'D0yyvfvGTO33juMTUPoZcdwSUnvFHSMo';
const serverURL = 'http://localhost:9000'; 

export async function getTenantToken() {
    const response = await fetch(`${serverURL}/api/lark/token`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch tenant token');
    }

    const { data } = await response.json();

    console.log('data', data)

    return data.tenant_access_token || '';
}

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