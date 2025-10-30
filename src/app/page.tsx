import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Activity, Zap, Box } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Network className="w-16 h-16 text-blue-500" />
              <h1 className="text-6xl font-bold text-white">Network Protocol Simulator</h1>
            </div>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Interactive 3D visualization of TCP and UDP protocols. Experience network communication in real-time
            with detailed packet animations and protocol demonstrations.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href="/simulator">
              <Button size="lg" className="text-lg px-8 py-6">
                <Activity className="w-5 h-5 mr-2" />
                Launch Simulator
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <Box className="w-10 h-10 text-blue-500 mb-2" />
              <CardTitle>3D Visualization</CardTitle>
              <CardDescription>
                Immersive 3D environment showing client-server communication with animated packet transfers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <Network className="w-10 h-10 text-green-500 mb-2" />
              <CardTitle>TCP Protocol</CardTitle>
              <CardDescription>
                Visualize TCP 3-way handshake, reliable data transfer, acknowledgments, and connection teardown
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <Zap className="w-10 h-10 text-cyan-500 mb-2" />
              <CardTitle>UDP Protocol</CardTitle>
              <CardDescription>
                See connectionless UDP communication with fast transmission and simulated packet loss scenarios
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <Activity className="w-10 h-10 text-purple-500 mb-2" />
              <CardTitle>Real-time Statistics</CardTitle>
              <CardDescription>
                Track packets sent, received, lost, and success rates with live activity logs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <div className="text-4xl mb-2">🎮</div>
              <CardTitle>Interactive Controls</CardTitle>
              <CardDescription>
                Control the simulation with easy-to-use buttons for handshakes, data transfer, and connection management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur">
            <CardHeader>
              <div className="text-4xl mb-2">📚</div>
              <CardTitle>Educational</CardTitle>
              <CardDescription>
                Perfect for learning network protocols with visual representations of every step in the communication process
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Protocol Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">TCP vs UDP</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-green-950/30 border-green-900">
              <CardHeader>
                <CardTitle className="text-green-400">TCP - Transmission Control Protocol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>✅ Connection-oriented with 3-way handshake</p>
                <p>✅ Reliable delivery with acknowledgments</p>
                <p>✅ Ordered packet delivery</p>
                <p>✅ Flow control and error checking</p>
                <p>⏱️ Slower due to overhead</p>
                <p className="pt-2 text-sm text-slate-400">Best for: Web, Email, File Transfer</p>
              </CardContent>
            </Card>

            <Card className="bg-cyan-950/30 border-cyan-900">
              <CardHeader>
                <CardTitle className="text-cyan-400">UDP - User Datagram Protocol</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-slate-300">
                <p>⚡ Connectionless (no handshake)</p>
                <p>⚡ No acknowledgments or retransmission</p>
                <p>⚡ No guaranteed order</p>
                <p>⚡ Minimal overhead</p>
                <p>🚀 Very fast transmission</p>
                <p className="pt-2 text-sm text-slate-400">Best for: Streaming, Gaming, VoIP, DNS</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Link href="/simulator">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-slate-700 hover:bg-slate-800">
              Start Learning Now →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}