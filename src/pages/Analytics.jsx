import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, Clock, AlertTriangle, Users, DollarSign, Zap, Filter } from "lucide-react";
import { motion } from "framer-motion";
import MetricCard from "../components/analytics/MetricCard";
import { 
  TimeSeriesChart, 
  ProcessingTimeChart, 
  ErrorsChart, 
  ThroughputChart, 
  ErrorBreakdownChart,
  FieldAccuracyChart 
} from "../components/analytics/AnalyticsCharts";

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [documentType, setDocumentType] = useState('all');

  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ['analytics', dateRange, documentType],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateAnalytics', {
        start_date: dateRange.start,
        end_date: dateRange.end,
        document_type: documentType
      });
      return response.data;
    }
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: () => base44.entities.Document.list()
  });

  const documentTypes = ['all', ...new Set(documents.map(d => d.document_class).filter(Boolean))];

  const handleApplyFilters = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 lg:p-10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Generating analytics...</p>
        </div>
      </div>
    );
  }

  const summary = analyticsData?.summary || {};
  const timeSeries = analyticsData?.time_series || [];

  return (
    <div className="min-h-screen p-6 lg:p-10 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400 text-lg">Comprehensive insights into document processing performance</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-3xl p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Start Date</label>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="glass"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">End Date</label>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="glass"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Document Type</label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={handleApplyFilters}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Documents"
          value={summary.total_documents || 0}
          subtitle="Processed in period"
          icon={Calendar}
          gradient="from-cyan-500 to-blue-500"
          delay={0.2}
        />
        
        <MetricCard
          title="Avg Processing Time"
          value={`${Math.round((summary.avg_processing_time_ms || 0) / 1000)}s`}
          subtitle={`Range: ${Math.round((summary.min_processing_time_ms || 0) / 1000)}-${Math.round((summary.max_processing_time_ms || 0) / 1000)}s`}
          icon={Clock}
          gradient="from-purple-500 to-pink-500"
          delay={0.3}
        />
        
        <MetricCard
          title="Avg Confidence"
          value={`${summary.avg_confidence_score || 0}%`}
          subtitle={`Entity precision: ${summary.entity_precision || 0}%`}
          icon={TrendingUp}
          gradient="from-emerald-500 to-teal-500"
          delay={0.4}
        />
        
        <MetricCard
          title="Total Cost"
          value={`$${summary.estimated_total_cost || 0}`}
          subtitle={`$${summary.cost_per_document || 0} per doc`}
          icon={DollarSign}
          gradient="from-orange-500 to-red-500"
          delay={0.5}
        />
      </div>

      {/* Error & Correction Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Validation Failures"
          value={summary.validation_failures || 0}
          subtitle="Anomalies detected"
          icon={AlertTriangle}
          gradient="from-red-500 to-rose-500"
          delay={0.6}
        />
        
        <MetricCard
          title="Errors"
          value={summary.error_breakdown?.error || 0}
          subtitle={`Warnings: ${summary.error_breakdown?.warning || 0}`}
          icon={AlertTriangle}
          gradient="from-yellow-500 to-orange-500"
          delay={0.7}
        />
        
        <MetricCard
          title="Human Corrections"
          value={summary.total_corrections || 0}
          subtitle={`${summary.avg_corrections_per_doc || 0} per doc`}
          icon={Users}
          gradient="from-indigo-500 to-purple-500"
          delay={0.8}
        />
        
        <MetricCard
          title="Learning Impact"
          value={`${summary.learning_impact || 0}%`}
          subtitle="Model improvement"
          icon={Zap}
          gradient="from-pink-500 to-rose-500"
          delay={0.9}
        />
      </div>

      {/* Time Series Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <TimeSeriesChart 
          data={timeSeries}
          title="Processing Volume & Confidence Over Time"
        />
      </motion.div>

      {/* Processing Time & Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
        >
          <ProcessingTimeChart 
            data={timeSeries}
            title="Processing Time Trends"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2 }}
        >
          <ErrorsChart 
            data={timeSeries}
            title="Errors & Corrections Over Time"
          />
        </motion.div>
      </div>

      {/* Throughput & Error Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.3 }}
        >
          <ThroughputChart 
            data={analyticsData?.throughput_by_type || {}}
            title="Throughput by Document Type"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4 }}
        >
          <ErrorBreakdownChart 
            data={summary.error_breakdown || {}}
            title="Error Breakdown by Severity"
          />
        </motion.div>
      </div>

      {/* Field Accuracy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <FieldAccuracyChart 
          data={analyticsData?.field_accuracy || {}}
          title="Field-Level Accuracy (Top 10 Fields)"
        />
      </motion.div>
    </div>
  );
}