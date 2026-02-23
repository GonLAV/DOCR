import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, XCircle, Hash, FileKey } from "lucide-react";
import { motion } from "framer-motion";

export default function ForensicPanel({ forensicAnalysis }) {
  if (!forensicAnalysis) return null;

  const integrityIcon = forensicAnalysis.integrity_check.doc_a_integrity === "verified" && 
                        forensicAnalysis.integrity_check.doc_b_integrity === "verified" 
    ? CheckCircle2 : XCircle;

  return (
    <Card className="glass-strong border border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Forensic Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Authenticity Score */}
        <div className="glass rounded-xl p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Authenticity Score</span>
            <div className="flex items-center gap-2">
              {React.createElement(integrityIcon, { 
                className: `w-5 h-5 ${forensicAnalysis.authenticity_score >= 90 ? 'text-emerald-400' : 'text-amber-400'}` 
              })}
              <span className="text-2xl font-bold text-white">
                {forensicAnalysis.authenticity_score}%
              </span>
            </div>
          </div>
        </div>

        {/* Fingerprint Comparison */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-white">Cryptographic Fingerprints</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Doc A:</span>
              <code className="text-gray-300 font-mono bg-black/20 px-2 py-1 rounded">
                {forensicAnalysis.doc_a_fingerprint.substring(0, 20)}...
              </code>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Doc B:</span>
              <code className="text-gray-300 font-mono bg-black/20 px-2 py-1 rounded">
                {forensicAnalysis.doc_b_fingerprint.substring(0, 20)}...
              </code>
            </div>
            <Badge className={`mt-2 ${
              forensicAnalysis.fingerprint_match 
                ? "bg-emerald-500 text-white" 
                : "bg-amber-500 text-white"
            }`}>
              {forensicAnalysis.fingerprint_match ? "Identical" : "Different"}
            </Badge>
          </div>
        </div>

        {/* Integrity Check */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileKey className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-white">Integrity Verification</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Document A</span>
              <Badge className={`text-[10px] ${
                forensicAnalysis.integrity_check.doc_a_integrity === "verified"
                  ? "bg-emerald-500 text-white"
                  : "bg-rose-500 text-white"
              }`}>
                {forensicAnalysis.integrity_check.doc_a_integrity}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Document B</span>
              <Badge className={`text-[10px] ${
                forensicAnalysis.integrity_check.doc_b_integrity === "verified"
                  ? "bg-emerald-500 text-white"
                  : "bg-rose-500 text-white"
              }`}>
                {forensicAnalysis.integrity_check.doc_b_integrity}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Metadata</span>
              <Badge className="text-[10px] bg-emerald-500 text-white">
                {forensicAnalysis.integrity_check.metadata_integrity}
              </Badge>
            </div>
          </div>
        </div>

        {/* Metadata Comparison */}
        <div className="glass rounded-xl p-4">
          <div className="text-sm font-bold text-white mb-3">Metadata Comparison</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <div className="text-gray-400">Doc A</div>
              <div className="text-gray-300">
                Tampering: <span className="capitalize text-white">
                  {forensicAnalysis.metadata_comparison.doc_a.tampering_risk}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">Doc B</div>
              <div className="text-gray-300">
                Tampering: <span className="capitalize text-white">
                  {forensicAnalysis.metadata_comparison.doc_b.tampering_risk}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}