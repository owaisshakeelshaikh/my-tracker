'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'

export function SalaryToggle({ onToggle }: { onToggle: (visible: boolean) => void }) {
  const [isVisible, setIsVisible] = useState(false)

  const handleToggle = () => {
    const newValue = !isVisible
    setIsVisible(newValue)
    onToggle(newValue)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="mb-4"
    >
      {isVisible ? (
        <>
          <EyeOff className="mr-2 h-4 w-4" />
          Hide Salary
        </>
      ) : (
        <>
          <Eye className="mr-2 h-4 w-4" />
          Show Salary
        </>
      )}
    </Button>
  )
}
