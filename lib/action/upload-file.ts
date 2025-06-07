import { createClient } from "@/lib/supabase/client"

export async function uploadFileFromBrowser(file: File) {
    const supabase = createClient()

    const fileName = `${new Date().getTime()}-${file.name}`

    const { data, error } = await supabase.storage
        .from('gentest')
        .upload(fileName, file, {
            contentType: file.type,
            upsert: true,
        })

    if (error) {
        console.error('Upload error:', error)
        throw error
    }

    const url = supabase.storage.from('gentest').getPublicUrl(fileName).data.publicUrl

    return { path: fileName, url }
}
