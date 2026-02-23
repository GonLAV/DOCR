import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X, Maximize2, Minimize2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardWidget({ 
  id, 
  title, 
  icon: Icon, 
  children, 
  onRemove, 
  isExpanded = false,
  onToggleExpand
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={isExpanded ? "col-span-2" : ""}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-100 flex items-center gap-2 text-base">
              <GripVertical className="w-4 h-4 text-gray-500 cursor-move" />
              {Icon && <Icon className="w-4 h-4 text-blue-400" />}
              {title}
            </CardTitle>
            <div className="flex items-center gap-1">
              {onToggleExpand && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onToggleExpand(id)}
                  className="h-6 w-6 text-gray-400 hover:text-gray-100"
                >
                  {isExpanded ? 
                    <Minimize2 className="w-3.5 h-3.5" /> : 
                    <Maximize2 className="w-3.5 h-3.5" />
                  }
                </Button>
              )}
              {onRemove && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemove(id)}
                  className="h-6 w-6 text-gray-400 hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}