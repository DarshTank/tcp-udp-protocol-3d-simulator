"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Network,
  Activity,
  Zap,
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Layers,
  Radio,
} from "lucide-react";

export const HowItWorks = () => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-white">
          How Network Protocols Work
        </h2>
        <p className="text-slate-300 text-lg max-w-3xl mx-auto">
          Understanding TCP and UDP protocols through interactive 3D
          visualization. Learn the fundamental differences between
          connection-oriented and connectionless communication.
        </p>
      </div>

      {/* Protocol Comparison Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-green-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Network className="w-6 h-6" />
              TCP - Transmission Control Protocol
            </CardTitle>
            <CardDescription className="text-slate-300">
              Connection-oriented, reliable protocol with guaranteed delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">
                  Connection establishment (3-way handshake)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">
                  Reliable data delivery with ACK
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">Ordered packet delivery</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">
                  Flow control & congestion control
                </span>
              </div>
            </div>
            <div className="p-3 bg-green-950/30 rounded-lg border border-green-900/50">
              <p className="text-xs text-green-200">
                <Shield className="w-4 h-4 inline mr-1" />
                Best for: Web browsing, email, file transfers, any application
                requiring data integrity
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-cyan-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Zap className="w-6 h-6" />
              UDP - User Datagram Protocol
            </CardTitle>
            <CardDescription className="text-slate-300">
              Connectionless, fast protocol with minimal overhead
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300">
                  No connection setup required
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300">
                  Fire-and-forget transmission
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300">
                  Minimal protocol overhead
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300">
                  High-speed data transmission
                </span>
              </div>
            </div>
            <div className="p-3 bg-cyan-950/30 rounded-lg border border-cyan-900/50">
              <p className="text-xs text-cyan-200">
                <Radio className="w-4 h-4 inline mr-1" />
                Best for: Gaming, live streaming, VoIP, DNS queries, real-time
                applications
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TCP 3-Way Handshake Detailed */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-500" />
            TCP 3-Way Handshake Process
          </CardTitle>
          <CardDescription className="text-slate-300">
            How TCP establishes a reliable connection between client and server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
                <Badge
                  variant="outline"
                  className="w-8 h-8 flex items-center justify-center text-yellow-400 border-yellow-400"
                >
                  1
                </Badge>
              </div>
              <h4 className="font-semibold text-yellow-400">
                SYN (Synchronize)
              </h4>
              <p className="text-sm text-slate-300">
                Client sends SYN packet with initial sequence number to server
              </p>
              <div className="p-3 bg-slate-800 rounded border border-slate-700">
                <code className="text-xs text-yellow-300">
                  Client → Server: SYN, Seq=100
                </code>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRight className="w-8 h-8 text-slate-500" />
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto">
                <Badge
                  variant="outline"
                  className="w-8 h-8 flex items-center justify-center text-purple-400 border-purple-400"
                >
                  2
                </Badge>
              </div>
              <h4 className="font-semibold text-purple-400">SYN-ACK</h4>
              <p className="text-sm text-slate-300">
                Server acknowledges and sends its own sequence number
              </p>
              <div className="p-3 bg-slate-800 rounded border border-slate-700">
                <code className="text-xs text-purple-300">
                  Server → Client: SYN-ACK, Seq=200, Ack=101
                </code>
              </div>
            </div>

            <div className="md:col-span-3 flex justify-center">
              <ArrowRight className="w-8 h-8 text-slate-500 rotate-90 md:rotate-0" />
            </div>

            <div className="md:col-start-2 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Badge
                  variant="outline"
                  className="w-8 h-8 flex items-center justify-center text-green-400 border-green-400"
                >
                  3
                </Badge>
              </div>
              <h4 className="font-semibold text-green-400">
                ACK (Acknowledge)
              </h4>
              <p className="text-sm text-slate-300">
                Client acknowledges server's sequence number. Connection
                established!
              </p>
              <div className="p-3 bg-slate-800 rounded border border-slate-700">
                <code className="text-xs text-green-300">
                  Client → Server: ACK, Seq=101, Ack=201
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Transmission Comparison */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-green-400 flex items-center gap-2">
              <Network className="w-5 h-5" />
              TCP Data Transmission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                <p className="text-slate-300">
                  <strong>Reliable Delivery:</strong> Every packet is
                  acknowledged
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                <p className="text-slate-300">
                  <strong>Retransmission:</strong> Lost packets are
                  automatically resent
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                <p className="text-slate-300">
                  <strong>Ordering:</strong> Packets arrive in correct sequence
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5" />
                <p className="text-slate-300">
                  <strong>Flow Control:</strong> Prevents overwhelming receiver
                </p>
              </div>
            </div>
            <div className="p-3 bg-green-950/30 rounded border border-green-900/50">
              <p className="text-xs text-green-200 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Higher latency due to acknowledgments and error checking
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              UDP Data Transmission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5" />
                <p className="text-slate-300">
                  <strong>Best Effort:</strong> No delivery guarantees
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5" />
                <p className="text-slate-300">
                  <strong>No Acknowledgments:</strong> Fire-and-forget approach
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5" />
                <p className="text-slate-300">
                  <strong>No Ordering:</strong> Packets may arrive out of
                  sequence
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5" />
                <p className="text-slate-300">
                  <strong>Minimal Overhead:</strong> Just 8-byte header
                </p>
              </div>
            </div>
            <div className="p-3 bg-cyan-950/30 rounded border border-cyan-900/50">
              <p className="text-xs text-cyan-200 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Very low latency, ideal for real-time applications
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Transfer Implementation */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-pink-500" />
            File Transfer Implementation
          </CardTitle>
          <CardDescription className="text-slate-300">
            How the simulator handles file transfers using TCP protocol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                <Badge
                  variant="outline"
                  className="w-6 h-6 flex items-center justify-center text-blue-400 border-blue-400 text-xs"
                >
                  1
                </Badge>
              </div>
              <h4 className="font-semibold text-blue-400 text-sm">
                File Selection
              </h4>
              <p className="text-xs text-slate-300">
                User selects file from device using native file picker
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto">
                <Badge
                  variant="outline"
                  className="w-6 h-6 flex items-center justify-center text-yellow-400 border-yellow-400 text-xs"
                >
                  2
                </Badge>
              </div>
              <h4 className="font-semibold text-yellow-400 text-sm">
                Chunking
              </h4>
              <p className="text-xs text-slate-300">
                File is divided into 512KB chunks for transmission
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto">
                <Badge
                  variant="outline"
                  className="w-6 h-6 flex items-center justify-center text-pink-400 border-pink-400 text-xs"
                >
                  3
                </Badge>
              </div>
              <h4 className="font-semibold text-pink-400 text-sm">
                Transmission
              </h4>
              <p className="text-xs text-slate-300">
                Each chunk sent as FILE-CHUNK packet with acknowledgment
              </p>
            </div>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Badge
                  variant="outline"
                  className="w-6 h-6 flex items-center justify-center text-green-400 border-green-400 text-xs"
                >
                  4
                </Badge>
              </div>
              <h4 className="font-semibold text-green-400 text-sm">
                Completion
              </h4>
              <p className="text-xs text-slate-300">
                Progress tracked and completion confirmed
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-800 rounded border border-slate-700">
            <h4 className="text-white font-semibold mb-2">Technical Details</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1 text-slate-300">
                <p>
                  • <strong>Chunk Size:</strong> 512 KB per packet
                </p>
                <p>
                  • <strong>Protocol:</strong> TCP for reliability
                </p>
                <p>
                  • <strong>Acknowledgment:</strong> Each chunk confirmed
                </p>
              </div>
              <div className="space-y-1 text-slate-300">
                <p>
                  • <strong>Progress Tracking:</strong> Real-time updates
                </p>
                <p>
                  • <strong>Error Handling:</strong> Connection validation
                </p>
                <p>
                  • <strong>File Types:</strong> Any file format supported
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulator Features */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">
            3D Visualization Features
          </CardTitle>
          <CardDescription className="text-slate-300">
            Interactive elements that help you understand network protocols
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800 rounded border border-slate-700">
              <h4 className="font-semibold mb-2 text-blue-400">
                Animated Packets
              </h4>
              <p className="text-sm text-slate-300">
                Watch packets travel between client and server with different
                colors for each packet type (SYN, ACK, DATA, etc.)
              </p>
            </div>
            <div className="p-4 bg-slate-800 rounded border border-slate-700">
              <h4 className="font-semibold mb-2 text-green-400">
                Real-time Statistics
              </h4>
              <p className="text-sm text-slate-300">
                Track packets sent, received, lost, and success rates with live
                updates during simulation
              </p>
            </div>
            <div className="p-4 bg-slate-800 rounded border border-slate-700">
              <h4 className="font-semibold mb-2 text-purple-400">
                Activity Logging
              </h4>
              <p className="text-sm text-slate-300">
                Detailed log of every network event with timestamps for
                educational analysis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
