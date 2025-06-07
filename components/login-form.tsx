'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Github, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/oauth?next=/dashboard`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">GT</span>
          </div>
          <CardTitle className="text-2xl font-bold">Chào mừng đến với GenTest</CardTitle>
          <CardDescription>Đăng nhập để bắt đầu tạo test case tự động</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full h-12 text-base" onClick={handleSocialLogin} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Github className="w-5 h-5 mr-2" />
                <span>Đăng nhập bằng GitHub</span>
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600 mx-auto">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">Điều khoản dịch vụ</span> và{" "}
            <span className="text-blue-600 hover:underline cursor-pointer">Chính sách bảo mật</span> của chúng tôi.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
