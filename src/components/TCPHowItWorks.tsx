"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Activity, ArrowRight, CheckCircle, Shield, Clock } from 'lucide-react';

export const TCPHowItWorks = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-600 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-green-400 flex items-center gap-2">
          <Network className="w-5 h-5" />
          How TCP Works
        </CardTitle>
        <CardDescription className="text-slate-300">
          Understanding the Transmission Control Protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3-Way Handshake */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">3-Way Handshake Process</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
                <Badge variant="outline" className="w-5 h-5 flex items-center justify-center text-yellow-400 border-yellow-400 text-xs">
                  1
                </Badge>
              </div>
              <p className="text-yellow-400 font-semibold">SYN</p>
              <p className="text-slate-300">Client initiates connection</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                <Badge variant="outline" className="w-5 h-5 flex items-center justify-center text-purple-400 border-purple-400 text-xs">
                  2
                </Badge>
              </div>
              <p className="text-purple-400 font-semibold">SYN-ACK</p>
              <p className="text-slate-300">Server acknowledges</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Badge variant="outline" className="w-5 h-5 flex items-center justify-center text-green-400 border-green-400 text-xs">
                  3
                </Badge>
              </div>
              <p className="text-green-400 font-semibold">ACK</p>
              <p className="text-slate-300">Connection established</p>
            </div>
          </div>
        </div>

        {/* Data Transfer */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Data Transfer</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Each data packet is acknowledged</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Lost packets are retransmitted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-slate-300">Packets arrive in order</span>
            </div>
          </div>
        </div>

        {/* File Transfer */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">File Transfer Process</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-800 rounded border border-slate-700">
              <p className="text-blue-400 font-semibold mb-1">1. File Selection</p>
              <p className="text-slate-300">Choose file from device</p>
            </div>
            <div className="p-2 bg-slate-800 rounded border border-slate-700">
              <p className="text-yellow-400 font-semibold mb-1">2. Chunking</p>
              <p className="text-slate-300">Split into 512KB chunks</p>
            </div>
            <div className="p-2 bg-slate-800 rounded border border-slate-700">
              <p className="text-pink-400 font-semibold mb-1">3. Transmission</p>
              <p className="text-slate-300">Send each chunk reliably</p>
            </div>
            <div className="p-2 bg-slate-800 rounded border border-slate-700">
              <p className="text-green-400 font-semibold mb-1">4. Verification</p>
              <p className="text-slate-300">Confirm each chunk received</p>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="p-3 bg-green-950/30 rounded border border-green-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-semibold text-sm">TCP Guarantees</span>
          </div>
          <div className="space-y-1 text-xs text-green-200">
            <p>• Reliable delivery - no data loss</p>
            <p>• Ordered delivery - packets in sequence</p>
            <p>• Error detection and correction</p>
            <p>• Flow control prevents overwhelming</p>
          </div>
        </div>

        {/* Trade-offs */}
        <div className="p-3 bg-amber-950/30 rounded border border-amber-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm">Trade-offs</span>
          </div>
          <div className="space-y-1 text-xs text-amber-200">
            <p>• Higher latency due to acknowledgments</p>
            <p>• More bandwidth overhead</p>
            <p>• Connection setup time required</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};