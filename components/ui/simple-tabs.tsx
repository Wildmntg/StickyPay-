"use client"

import React, { useState } from "react"

interface TabsProps {
  defaultValue: string
  children: React.ReactNode
  className?: string
  onValueChange?: (value: string) => void
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: "",
  onValueChange: () => {},
})

export function SimpleTabs({ defaultValue, children, className, onValueChange }: TabsProps) {
  const [value, setValue] = useState(defaultValue)

  const handleValueChange = (newValue: string) => {
    setValue(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export function SimpleTabsList({ children, className }: TabsListProps) {
  return <div className={`grid grid-cols-3 gap-1 rounded-lg bg-muted p-1 ${className}`}>{children}</div>
}

export function SimpleTabsTrigger({ value, children, className, onClick }: TabsTriggerProps) {
  const { value: selectedValue, onValueChange } = React.useContext(TabsContext)
  const isActive = selectedValue === value

  const handleClick = () => {
    onValueChange(value)
    if (onClick) {
      onClick()
    }
  }

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={handleClick}
      className={`rounded-md px-3 py-2 text-sm font-medium ${
        isActive ? "bg-background shadow" : "text-muted-foreground"
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function SimpleTabsContent({ value, children, className }: TabsContentProps) {
  const { value: selectedValue } = React.useContext(TabsContext)
  const isActive = selectedValue === value

  if (!isActive) return null

  return <div className={className}>{children}</div>
}
