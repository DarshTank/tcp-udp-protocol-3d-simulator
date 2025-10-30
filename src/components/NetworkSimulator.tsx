"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Activity, Send, WifiOff, CheckCircle2, XCircle } from "lucide-react";

// Types
type Protocol = "TCP" | "UDP";
type ConnectionState = "CLOSED" | "SYN_SENT" | "SYN_RECEIVED" | "ESTABLISHED" | "FIN_WAIT" | "CLOSING";
type PacketType = "SYN" | "SYN-ACK" | "ACK" | "DATA" | "FIN" | "UDP-DATA";

interface Packet {
  id: string;
  type: PacketType;
  progress: number;
  color: string;
  toServer: boolean;
}

interface Stats {
  packetsSent: number;
  packetsReceived: number;
  packetsLost: number;
  totalTime: number;
}

// Animated Packet Component - simplified without Text labels
function AnimatedPacket({ packet }: { packet: Packet }) {
  const startX = packet.toServer ? -5 : 5;
  const endX = packet.toServer ? 5 : -5;
  const x = startX + (endX - startX) * packet.progress;

  return (
    <mesh position={[x, 0, 0]} castShadow>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial 
        color={packet.color} 
        emissive={packet.color} 
        emissiveIntensity={0.5} 
      />
    </mesh>
  );
}

// 3D Scene Component
function Scene({ packets, connectionState }: { packets: Packet[]; connectionState: ConnectionState }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 12]} />
      <OrbitControls enablePan={false} minDistance={8} maxDistance={20} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      {/* Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#1a1a1a" wireframe />
      </mesh>
      
      {/* Client Node */}
      <group position={[-5, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
        </mesh>
        <Text position={[0, -1.5, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
          CLIENT
        </Text>
      </group>
      
      {/* Server Node */}
      <group position={[5, 0, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.3} />
        </mesh>
        <Text position={[0, -1.5, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
          SERVER
        </Text>
      </group>
      
      {/* Connection Line */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 0.02, 0.02]} />
        <meshStandardMaterial 
          color={connectionState === "ESTABLISHED" ? "#10b981" : "#6b7280"} 
          emissive={connectionState === "ESTABLISHED" ? "#10b981" : "#6b7280"}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Animated Packets */}
      {packets.map((packet) => (
        <AnimatedPacket key={packet.id} packet={packet} />
      ))}
    </>
  );
}

// Main Network Simulator Component
export default function NetworkSimulator() {
  const [protocol, setProtocol] = useState<Protocol>("TCP");
  const [connectionState, setConnectionState] = useState<ConnectionState>("CLOSED");
  const [packets, setPackets] = useState<Packet[]>([]);
  const [stats, setStats] = useState<Stats>({
    packetsSent: 0,
    packetsReceived: 0,
    packetsLost: 0,
    totalTime: 0,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  }, []);

  const createPacket = useCallback((type: PacketType, toServer: boolean): Packet => {
    const colors: Record<PacketType, string> = {
      "SYN": "#f59e0b",
      "SYN-ACK": "#8b5cf6",
      "ACK": "#10b981",
      "DATA": "#3b82f6",
      "FIN": "#ef4444",
      "UDP-DATA": "#06b6d4",
    };

    return {
      id: `${Date.now()}-${Math.random()}`,
      type,
      progress: 0,
      color: colors[type],
      toServer,
    };
  }, []);

  const animatePacket = useCallback((packet: Packet, onComplete: () => void) => {
    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setPackets((prev) =>
        prev.map((p) => (p.id === packet.id ? { ...p, progress } : p))
      );

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setPackets((prev) => prev.filter((p) => p.id !== packet.id));
        onComplete();
      }
    };

    setPackets((prev) => [...prev, packet]);
    animationFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // TCP 3-Way Handshake
  const performTCPHandshake = async () => {
    setIsSimulating(true);
    addLog("🔵 TCP: Starting 3-way handshake...");
    
    // Step 1: SYN
    setConnectionState("SYN_SENT");
    const synPacket = createPacket("SYN", true);
    addLog("➡️  Client sends SYN to Server");
    await new Promise<void>((resolve) => {
      animatePacket(synPacket, () => {
        setStats((prev) => ({ ...prev, packetsSent: prev.packetsSent + 1 }));
        resolve();
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Step 2: SYN-ACK
    setConnectionState("SYN_RECEIVED");
    const synAckPacket = createPacket("SYN-ACK", false);
    addLog("⬅️  Server responds with SYN-ACK");
    await new Promise<void>((resolve) => {
      animatePacket(synAckPacket, () => {
        setStats((prev) => ({ ...prev, packetsReceived: prev.packetsReceived + 1 }));
        resolve();
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Step 3: ACK
    setConnectionState("ESTABLISHED");
    const ackPacket = createPacket("ACK", true);
    addLog("➡️  Client sends ACK");
    await new Promise<void>((resolve) => {
      animatePacket(ackPacket, () => {
        setStats((prev) => ({ ...prev, packetsSent: prev.packetsSent + 1 }));
        resolve();
      });
    });

    addLog("✅ TCP: Connection ESTABLISHED");
    setIsSimulating(false);
  };

  // Send TCP Data
  const sendTCPData = async () => {
    if (connectionState !== "ESTABLISHED") {
      addLog("❌ Error: Connection not established. Perform handshake first.");
      return;
    }

    setIsSimulating(true);
    addLog("📤 TCP: Sending data packet...");

    const dataPacket = createPacket("DATA", true);
    await new Promise<void>((resolve) => {
      animatePacket(dataPacket, () => {
        setStats((prev) => ({ ...prev, packetsSent: prev.packetsSent + 1 }));
        resolve();
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 300));

    // ACK for data
    const ackPacket = createPacket("ACK", false);
    addLog("⬅️  Server acknowledges data (ACK)");
    await new Promise<void>((resolve) => {
      animatePacket(ackPacket, () => {
        setStats((prev) => ({ ...prev, packetsReceived: prev.packetsReceived + 1 }));
        resolve();
      });
    });

    addLog("✅ TCP: Data transmitted successfully");
    setIsSimulating(false);
  };

  // Close TCP Connection
  const closeTCPConnection = async () => {
    if (connectionState !== "ESTABLISHED") {
      addLog("❌ Error: No active connection to close.");
      return;
    }

    setIsSimulating(true);
    addLog("🔴 TCP: Closing connection...");
    setConnectionState("FIN_WAIT");

    const finPacket = createPacket("FIN", true);
    addLog("➡️  Client sends FIN");
    await new Promise<void>((resolve) => {
      animatePacket(finPacket, () => {
        setStats((prev) => ({ ...prev, packetsSent: prev.packetsSent + 1 }));
        resolve();
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 300));

    const ackPacket = createPacket("ACK", false);
    addLog("⬅️  Server sends ACK");
    await new Promise<void>((resolve) => {
      animatePacket(ackPacket, () => {
        setStats((prev) => ({ ...prev, packetsReceived: prev.packetsReceived + 1 }));
        resolve();
      });
    });

    setConnectionState("CLOSED");
    addLog("✅ TCP: Connection closed");
    setIsSimulating(false);
  };

  // Send UDP Data
  const sendUDPData = async () => {
    setIsSimulating(true);
    addLog("📤 UDP: Sending datagram (no handshake needed)...");

    const udpPacket = createPacket("UDP-DATA", true);
    
    // Simulate packet loss (20% chance)
    const isLost = Math.random() < 0.2;

    await new Promise<void>((resolve) => {
      animatePacket(udpPacket, () => {
        if (isLost) {
          setStats((prev) => ({ 
            ...prev, 
            packetsSent: prev.packetsSent + 1,
            packetsLost: prev.packetsLost + 1 
          }));
          addLog("❌ UDP: Packet lost (no acknowledgment)");
        } else {
          setStats((prev) => ({ 
            ...prev, 
            packetsSent: prev.packetsSent + 1,
            packetsReceived: prev.packetsReceived + 1 
          }));
          addLog("✅ UDP: Datagram delivered (unconfirmed)");
        }
        resolve();
      });
    });

    setIsSimulating(false);
  };

  const resetSimulator = useCallback(() => {
    // Cancel any ongoing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setConnectionState("CLOSED");
    setPackets([]);
    setStats({
      packetsSent: 0,
      packetsReceived: 0,
      packetsLost: 0,
      totalTime: 0,
    });
    setLogs([]);
    setIsSimulating(false);
    addLog("🔄 Simulator reset");
  }, [addLog]);

  return (
    <div className="w-full h-screen flex">
      {/* 3D Canvas */}
      <div className="flex-1 relative">
        <Canvas 
          shadows 
          gl={{ 
            preserveDrawingBuffer: true,
            antialias: true,
          }}
          dpr={[1, 2]}
        >
          <Scene packets={packets} connectionState={connectionState} />
        </Canvas>
        
        {/* Protocol Badge Overlay */}
        <div className="absolute top-4 left-4">
          <Badge variant={protocol === "TCP" ? "default" : "secondary"} className="text-lg px-4 py-2">
            <Network className="w-4 h-4 mr-2" />
            {protocol} Protocol
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-96 bg-slate-950/95 backdrop-blur border-l border-slate-800 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Network Protocol Simulator</h1>
            <p className="text-sm text-slate-400">3D visualization of TCP and UDP protocols</p>
          </div>

          {/* Protocol Selection */}
          <Tabs value={protocol} onValueChange={(v) => setProtocol(v as Protocol)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="TCP">TCP</TabsTrigger>
              <TabsTrigger value="UDP">UDP</TabsTrigger>
            </TabsList>

            {/* TCP Controls */}
            <TabsContent value="TCP" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">TCP Connection</CardTitle>
                  <CardDescription>Transmission Control Protocol - Reliable, connection-oriented</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <span className="text-sm text-slate-300">Status:</span>
                    <Badge variant={connectionState === "ESTABLISHED" ? "default" : "secondary"}>
                      {connectionState}
                    </Badge>
                  </div>

                  <Button 
                    onClick={performTCPHandshake} 
                    disabled={isSimulating || connectionState === "ESTABLISHED"}
                    className="w-full"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    3-Way Handshake
                  </Button>

                  <Button 
                    onClick={sendTCPData} 
                    disabled={isSimulating || connectionState !== "ESTABLISHED"}
                    className="w-full"
                    variant="secondary"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Data
                  </Button>

                  <Button 
                    onClick={closeTCPConnection} 
                    disabled={isSimulating || connectionState !== "ESTABLISHED"}
                    className="w-full"
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Close Connection
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">TCP Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Connection-oriented (3-way handshake)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Reliable delivery with acknowledgments</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Ordered packet delivery</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Flow control and congestion control</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* UDP Controls */}
            <TabsContent value="UDP" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">UDP Datagram</CardTitle>
                  <CardDescription>User Datagram Protocol - Fast, connectionless</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={sendUDPData} 
                    disabled={isSimulating}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send UDP Datagram
                  </Button>

                  <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg">
                    <p className="text-xs text-amber-200">
                      <WifiOff className="w-4 h-4 inline mr-1" />
                      20% packet loss simulated
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">UDP Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span>Connectionless (no handshake)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span>No acknowledgments or retransmission</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span>Faster but unreliable</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5" />
                    <span>Used for streaming, gaming, VoIP</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Packets Sent:</span>
                <span className="text-white font-mono">{stats.packetsSent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Packets Received:</span>
                <span className="text-white font-mono">{stats.packetsReceived}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Packets Lost:</span>
                <span className="text-red-400 font-mono">{stats.packetsLost}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Success Rate:</span>
                <span className="text-green-400 font-mono">
                  {stats.packetsSent > 0 
                    ? `${((stats.packetsReceived / stats.packetsSent) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                Activity Log
                <Button onClick={resetSimulator} size="sm" variant="outline">
                  Reset
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <p className="text-slate-500 text-center py-4">No activity yet</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="text-slate-300 py-1 border-b border-slate-800/50">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}