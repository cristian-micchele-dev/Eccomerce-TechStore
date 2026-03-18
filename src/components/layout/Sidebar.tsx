"use client"

import { SidebarContent } from "./SidebarContent"

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col h-full bg-sidebar/10 backdrop-blur-sm border-r border-border">
      <SidebarContent />
    </aside>
  )
}
