"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Radio, ArrowRight, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const UDPHowItWorks = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-600 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          How UDP Works
        </CardTitle>
        <CardDescription className="text-slate-300">
          Understanding the User Datagram Protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connectionless Communication */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Connectionless Communication</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto">
                <Radio className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-cyan-400 font-semibold">No Handshake</p>
              <p className="text-slate-300">Direct data transmission</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-red-400 font-semibold">No Acknowledgments</p>
              <p className="text-slate-300">Fire-and-forget approach</p>
            </div>
          </div>
        </div>

        {/* Data Transmission */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Data Transmission</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">Immediate packet transmission</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">No delivery confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-300">Minimal protocol overhead</span>
            </div>
          </div>
        </div>

        {/* File Transfer */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">UDP File Transfer</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-800 rounded border border-slate-700">
              <p className="text-blue-400 font-semibold mb-1">1. File Selection</p>
              <p className="text-slate-300">Choose file from device</p>
            </div>
            <div className="p-2 bg-slate-800 rounded border border-slate-700">
              <p className="text-yellow-400 font-semibold mb-1">2. Direct Send</p>
              <p className="text-slate-300">No connection setup</p>
            </div>
            <div className="p-2 bg-slate-800 rounded border border-slate-700">
              <p className="text-cyan-400 font-semibold mb-1">3. Fast Transfer</p>
              <p className="text-slate-300">High-speed transmission</p>
            </div>
            <div className="p-2 bg-slate-800 rounded border border-slate-700">
              <p className="text-red-400 font-semibold mb-1">4. No Guarantee</p>
              <p className="text-slate-300">Best-effort delivery</p>
            </div>
          </div>
        </div>

        {/* Packet Loss Simulation */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Packet Loss Simulation</h4>
          <div className="p-3 bg-red-950/30 rounded border border-red-900/50">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 font-semibold text-sm">20% Loss Rate</span>
            </div>
            <p className="text-xs text-red-200">
              Simulates real-world network conditions where UDP packets may be lost, 
              demonstrating the unreliable nature of the protocol.
            </p>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="p-3 bg-cyan-950/30 rounded border border-cyan-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 font-semibold text-sm">UDP Advantages</span>
          </div>
          <div className="space-y-1 text-xs text-cyan-200">
            <p>• Very low latency - no handshake delay</p>
            <p>• Minimal bandwidth overhead (8-byte header)</p>
            <p>• High throughput for real-time data</p>
            <p>• Simple protocol implementation</p>
          </div>
        </div>

        {/* Use Cases */}
        <div className="p-3 bg-purple-950/30 rounded border border-purple-900/50">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-purple-400" />
            <span className="text-purple-400 font-semibold text-sm">Best Use Cases</span>
          </div>
          <div className="space-y-1 text-xs text-purple-200">
            <p>• Live video/audio streaming</p>
            <p>• Online gaming (real-time updates)</p>
            <p>• DNS queries (quick lookups)</p>
            <p>• IoT sensor data transmission</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};