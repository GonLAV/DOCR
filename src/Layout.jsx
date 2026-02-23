import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FileSearch,
  LayoutDashboard,
  Upload,
  GitCompare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { name: "Upload", icon: Upload, page: "Upload" },
  { name: "Documents", icon: FileSearch, page: "Documents" },
  { name: "Compare", icon: GitCompare, page: "Compare" },
];

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen bg-slate-50/50">
      <aside
        className={`${
          collapsed ? "w-[72px]" : "w-[260px]"
        } bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-out shrink-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-sm font-semibold text-slate-900 tracking-tight">DocIntel</h1>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Restoration Engine</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }
                `}
              >
                <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-blue-600" : ""}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-slate-400 hover:text-slate-600"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}