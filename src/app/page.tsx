import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Activity, Zap, Box } from "lucide-react";
import { HowItWorks } from "@/components/HowItWorks";
import { CCodeDemo } from "@/components/CCodeDemo";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-ping opacity-30"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse opacity-40"></div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center space-y-6 mb-16 animate-fade-in-up">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Network className="w-16 h-16 text-blue-500" />
              <h1 className="text-6xl font-bold text-white">
                Network Protocol Simulator
              </h1>
            </div>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto animate-fade-in-up animation-delay-300 transform hover:scale-105 transition-transform duration-300">
            Interactive 3D visualization of TCP and UDP protocols. Experience network communication in real-time
            with detailed packet animations and protocol demonstrations.
          </p>
          <div className="flex gap-4 justify-center pt-4 animate-fade-in-up animation-delay-500">
            <Link href="/simulator">
              <Button size="lg" className="text-lg px-8 py-6 transform hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500">
                <Activity className="w-5 h-5 mr-2 animate-pulse" />
                Launch Simulator
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto perspective-1000">
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur transform hover:scale-105 hover:rotate-y-12 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 animate-fade-in-up animation-delay-700 hover:z-10 relative group">
            <CardHeader className="transform group-hover:translate-z-4 transition-transform duration-300">
              <Box className="w-10 h-10 text-blue-500 mb-2 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
              <CardTitle className="text-white group-hover:text-blue-300 transition-colors duration-300">3D Visualization</CardTitle>
              <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                Immersive 3D environment showing client-server communication with animated packet transfers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur transform hover:scale-105 hover:rotate-y-12 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 animate-fade-in-up animation-delay-800 hover:z-10 relative group">
            <CardHeader className="transform group-hover:translate-z-4 transition-transform duration-300">
              <Network className="w-10 h-10 text-green-500 mb-2 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
              <CardTitle className="text-white group-hover:text-green-300 transition-colors duration-300">TCP Protocol</CardTitle>
              <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                Visualize TCP 3-way handshake, reliable data transfer, acknowledgments, and connection teardown
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur transform hover:scale-105 hover:rotate-y-12 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 animate-fade-in-up animation-delay-900 hover:z-10 relative group">
            <CardHeader className="transform group-hover:translate-z-4 transition-transform duration-300">
              <Zap className="w-10 h-10 text-cyan-500 mb-2 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
              <CardTitle className="text-white group-hover:text-cyan-300 transition-colors duration-300">UDP Protocol</CardTitle>
              <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                See connectionless UDP communication with fast transmission and simulated packet loss scenarios
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur transform hover:scale-105 hover:rotate-y-12 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 animate-fade-in-up animation-delay-1000 hover:z-10 relative group">
            <CardHeader className="transform group-hover:translate-z-4 transition-transform duration-300">
              <Activity className="w-10 h-10 text-purple-500 mb-2 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
              <CardTitle className="text-white group-hover:text-purple-300 transition-colors duration-300">Real-time Statistics</CardTitle>
              <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                Track packets sent, received, lost, and success rates with live activity logs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur transform hover:scale-105 hover:rotate-y-12 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 animate-fade-in-up animation-delay-1100 hover:z-10 relative group">
            <CardHeader className="transform group-hover:translate-z-4 transition-transform duration-300">
              <div className="text-4xl mb-2 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">🎮</div>
              <CardTitle className="text-white group-hover:text-yellow-300 transition-colors duration-300">Interactive Controls</CardTitle>
              <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                Control the simulation with easy-to-use buttons for handshakes, data transfer, and connection management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur transform hover:scale-105 hover:rotate-y-12 transition-all duration-500 hover:shadow-2xl hover:shadow-pink-500/20 animate-fade-in-up animation-delay-1200 hover:z-10 relative group">
            <CardHeader className="transform group-hover:translate-z-4 transition-transform duration-300">
              <div className="text-4xl mb-2 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">📚</div>
              <CardTitle className="text-white group-hover:text-pink-300 transition-colors duration-300">Educational</CardTitle>
              <CardDescription className="text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
                Perfect for learning network protocols with visual representations of every step in the communication process
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Protocol Demonstrations */}
        <div className="mt-16 max-w-6xl mx-auto animate-slide-in-left animation-delay-1300">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Protocol Demonstrations
          </h2>
          
          {/* TCP 3-Way Handshake Animation */}
          <div className="mb-16 animate-slide-in-right animation-delay-1400">
            <Card className="bg-green-950/20 border-green-800/50 backdrop-blur-sm transform hover:translate-y-[-4px] transition-all duration-700 hover:shadow-2xl hover:shadow-green-500/20">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-3 text-xl">
                  <Network className="w-6 h-6" />
                  TCP 3-Way Handshake Process
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Watch how TCP establishes a reliable connection between client and server
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-32 bg-slate-900/30 rounded-lg p-4 overflow-hidden">
                  {/* Client Node */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 animate-float-gentle">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-glow-blue">
                      <span className="text-white text-xs font-bold">CLIENT</span>
                    </div>
                  </div>
                  
                  {/* Server Node */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 animate-float-gentle animation-delay-500">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-glow-green">
                      <span className="text-white text-xs font-bold">SERVER</span>
                    </div>
                  </div>
                  
                  {/* Connection Line */}
                  <div className="absolute top-1/2 left-16 right-16 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 transform -translate-y-1/2 animate-pulse-line"></div>
                  
                  {/* SYN Packet */}
                  <div className="absolute top-8 left-16 w-8 h-6 bg-yellow-500 rounded transform animate-tcp-syn">
                    <div className="text-xs text-black font-bold text-center leading-6">SYN</div>
                  </div>
                  
                  {/* SYN-ACK Packet */}
                  <div className="absolute top-16 right-16 w-10 h-6 bg-purple-500 rounded transform animate-tcp-syn-ack">
                    <div className="text-xs text-white font-bold text-center leading-6">SYN-ACK</div>
                  </div>
                  
                  {/* ACK Packet */}
                  <div className="absolute bottom-8 left-16 w-8 h-6 bg-green-500 rounded transform animate-tcp-ack">
                    <div className="text-xs text-white font-bold text-center leading-6">ACK</div>
                  </div>
                  
                  {/* Step Indicators */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-step-1"></div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-step-2"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-step-3"></div>
                  </div>
                </div>
                
                {/* TCP Features */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-green-300 text-sm animate-slide-in-left animation-delay-1600">✅ Connection-oriented</p>
                    <p className="text-green-300 text-sm animate-slide-in-left animation-delay-1700">✅ Reliable delivery</p>
                    <p className="text-green-300 text-sm animate-slide-in-left animation-delay-1800">✅ Ordered packets</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-green-300 text-sm animate-slide-in-right animation-delay-1600">✅ Flow control</p>
                    <p className="text-green-300 text-sm animate-slide-in-right animation-delay-1700">✅ Error checking</p>
                    <p className="text-yellow-300 text-sm animate-slide-in-right animation-delay-1800">⏱️ Higher latency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* UDP Communication Animation */}
          <div className="animate-slide-in-left animation-delay-1500">
            <Card className="bg-cyan-950/20 border-cyan-800/50 backdrop-blur-sm transform hover:translate-y-[-4px] transition-all duration-700 hover:shadow-2xl hover:shadow-cyan-500/20">
              <CardHeader>
                <CardTitle className="text-cyan-400 flex items-center gap-3 text-xl">
                  <Zap className="w-6 h-6" />
                  UDP Connectionless Communication
                </CardTitle>
                <CardDescription className="text-slate-300">
                  See how UDP sends data immediately without connection setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-32 bg-slate-900/30 rounded-lg p-4 overflow-hidden">
                  {/* Client Node */}
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 animate-shake-gentle">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-glow-cyan">
                      <span className="text-white text-xs font-bold">CLIENT</span>
                    </div>
                  </div>
                  
                  {/* Server Node */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 animate-shake-gentle animation-delay-300">
                    <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center shadow-lg animate-glow-cyan">
                      <span className="text-white text-xs font-bold">SERVER</span>
                    </div>
                  </div>
                  
                  {/* Dashed Connection Line (no connection) */}
                  <div className="absolute top-1/2 left-16 right-16 h-0.5 border-t-2 border-dashed border-cyan-400/50 transform -translate-y-1/2 animate-dash-flow"></div>
                  
                  {/* UDP Packets (multiple, some lost) */}
                  <div className="absolute top-6 left-16 w-8 h-6 bg-cyan-500 rounded transform animate-udp-packet-1">
                    <div className="text-xs text-black font-bold text-center leading-6">UDP</div>
                  </div>
                  
                  <div className="absolute top-12 left-16 w-8 h-6 bg-cyan-500 rounded transform animate-udp-packet-2">
                    <div className="text-xs text-black font-bold text-center leading-6">UDP</div>
                  </div>
                  
                  {/* Lost Packet */}
                  <div className="absolute top-18 left-16 w-8 h-6 bg-red-500 rounded transform animate-udp-packet-lost">
                    <div className="text-xs text-white font-bold text-center leading-6">LOST</div>
                  </div>
                  
                  <div className="absolute bottom-6 left-16 w-8 h-6 bg-cyan-500 rounded transform animate-udp-packet-3">
                    <div className="text-xs text-black font-bold text-center leading-6">UDP</div>
                  </div>
                  
                  {/* Speed Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                    <div className="text-cyan-400 text-xs animate-pulse">⚡ FAST</div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping animation-delay-200"></div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping animation-delay-400"></div>
                  </div>
                </div>
                
                {/* UDP Features */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-cyan-300 text-sm animate-fade-in-left animation-delay-1600">⚡ No handshake</p>
                    <p className="text-cyan-300 text-sm animate-fade-in-left animation-delay-1700">⚡ Very fast</p>
                    <p className="text-cyan-300 text-sm animate-fade-in-left animation-delay-1800">⚡ Low overhead</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-red-300 text-sm animate-fade-in-right animation-delay-1600">❌ No guarantees</p>
                    <p className="text-red-300 text-sm animate-fade-in-right animation-delay-1700">❌ Packet loss possible</p>
                    <p className="text-red-300 text-sm animate-fade-in-right animation-delay-1800">❌ No ordering</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in-up animation-delay-1400">
          <Link href="/simulator">
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-slate-700 hover:bg-slate-800 transform hover:scale-110 hover:rotate-1 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-purple-500/25 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-purple-800 hover:to-blue-800 text-white hover:text-purple-200">
              Start Learning Now →
            </Button>
          </Link>
        </div>

        {/* How It Works Section */}
        <div className="mt-20">
          <HowItWorks />
        </div>

        {/* C Code Implementation Section */}
        <div className="mt-20">
          <CCodeDemo />
        </div>
      </div>
    </div>
  );
}