"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Text } from "@react-three/drei";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Network, Activity, Send, WifiOff, CheckCircle2, XCircle, FileText, Upload, File, ArrowLeft, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { TCPHowItWorks } from "./TCPHowItWorks";
import { UDPHowItWorks } from "./UDPHowItWorks";

// Types
type Protocol = "TCP" | "UDP";
type ConnectionState = "CLOSED" | "SYN_SENT" | "SYN_RECEIVED" | "ESTABLISHED" | "FIN_WAIT" | "CLOSING";
type PacketType = "SYN" | "SYN-ACK" | "ACK" | "DATA" | "FIN" | "UDP-DATA" | "FILE-CHUNK" | "UDP-FILE-CHUNK";

interface Packet {
  id: string;
  type: PacketType;
  progress: number;
  color: string;
  toServer: boolean;
  fileChunkIndex?: number;
  fileName?: string;
}

interface Stats {
  packetsSent: number;
  packetsReceived: number;
  packetsLost: number;
  totalTime: number;
}

interface FileTransfer {
  name: string;
  size: number;
  chunks: number;
  currentChunk: number;
  progress: number;
  status: "idle" | "transferring" | "completed" | "failed";
  file?: File;
}

interface AnimationStep {
  title: string;
  description: string;
  type: "info" | "success" | "warning" | "error";
  duration: number;
}

interface MessagePacket {
  id: number;
  data: string;
  sequenceNumber: number;
  isLost?: boolean;
}

interface MessageTransmission {
  originalMessage: string;
  packets: MessagePacket[];
  receivedPackets: MessagePacket[];
  reconstructedMessage: string;
  status: "idle" | "transmitting" | "completed" | "failed";
}

// Enhanced Animated Packet Component with unique animations
function AnimatedPacket({ packet }: { packet: Packet }) {
  const startX = packet.toServer ? -5 : 5;
  const endX = packet.toServer ? 5 : -5;
  const x = startX + (endX - startX) * packet.progress;

  // Different animations based on packet type
  const getPacketAnimation = () => {
    const time = Date.now() * 0.001;
    
    switch (packet.type) {
      case "SYN":
        // Pulsing yellow sphere for SYN
        return {
          position: [x, Math.sin(time * 4) * 0.2, 0] as [number, number, number],
          rotation: [0, time * 2, 0] as [number, number, number],
          scale: 1 + Math.sin(time * 6) * 0.2,
          geometry: <sphereGeometry args={[0.3, 16, 16]} />,
          emissiveIntensity: 0.8 + Math.sin(time * 8) * 0.3
        };
      
      case "SYN-ACK":
        // Spinning purple octahedron
        return {
          position: [x, Math.cos(time * 3) * 0.15, 0] as [number, number, number],
          rotation: [time * 3, time * 2, time] as [number, number, number],
          scale: 1,
          geometry: <octahedronGeometry args={[0.35]} />,
          emissiveIntensity: 0.7
        };
      
      case "ACK":
        // Green checkmark-like tetrahedron
        return {
          position: [x, 0, 0] as [number, number, number],
          rotation: [0, time * 4, 0] as [number, number, number],
          scale: 1,
          geometry: <tetrahedronGeometry args={[0.3]} />,
          emissiveIntensity: 0.6
        };
      
      case "DATA":
        // Blue cube with smooth movement
        return {
          position: [x, 0, 0] as [number, number, number],
          rotation: [time, time * 0.5, 0] as [number, number, number],
          scale: 1,
          geometry: <boxGeometry args={[0.4, 0.4, 0.4]} />,
          emissiveIntensity: 0.5
        };
      
      case "FIN":
        // Red diamond shape that shrinks as it moves
        return {
          position: [x, 0, 0] as [number, number, number],
          rotation: [time * 2, time * 3, time] as [number, number, number],
          scale: 1 - packet.progress * 0.3,
          geometry: <octahedronGeometry args={[0.3]} />,
          emissiveIntensity: 0.9
        };
      
      case "UDP-DATA":
        // Fast-moving cyan sphere with trail effect
        return {
          position: [x, Math.sin(x * 2) * 0.1, 0] as [number, number, number],
          rotation: [0, 0, time * 6] as [number, number, number],
          scale: 0.8,
          geometry: <sphereGeometry args={[0.25, 12, 12]} />,
          emissiveIntensity: 1.0
        };
      
      case "FILE-CHUNK":
        // Large pink document-like shape with floating animation
        return {
          position: [x, Math.sin(time * 2 + packet.fileChunkIndex! * 0.5) * 0.1, 0] as [number, number, number],
          rotation: [0, time * 0.5, 0] as [number, number, number],
          scale: 1,
          geometry: <boxGeometry args={[0.5, 0.7, 0.1]} />,
          emissiveIntensity: 0.4
        };
      
      case "UDP-FILE-CHUNK":
        // Cyan file chunk with erratic movement (simulating unreliability)
        return {
          position: [x, Math.sin(time * 5 + packet.fileChunkIndex! * 0.8) * 0.2, Math.cos(time * 3) * 0.1] as [number, number, number],
          rotation: [time * 2, time * 3, time] as [number, number, number],
          scale: 0.9,
          geometry: <boxGeometry args={[0.4, 0.6, 0.08]} />,
          emissiveIntensity: 0.6
        };
      
      default:
        return {
          position: [x, 0, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: 1,
          geometry: <sphereGeometry args={[0.3]} />,
          emissiveIntensity: 0.5
        };
    }
  };

  const animation = getPacketAnimation();
  const isFileChunk = packet.type === "FILE-CHUNK" || packet.type === "UDP-FILE-CHUNK";

  return (
    <group position={animation.position} rotation={animation.rotation} scale={animation.scale}>
      {/* Main packet mesh */}
      <mesh castShadow>
        {animation.geometry}
        <meshStandardMaterial 
          color={packet.color} 
          emissive={packet.color} 
          emissiveIntensity={animation.emissiveIntensity}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Particle trail effect for fast packets */}
      {(packet.type === "UDP-DATA" || packet.type === "UDP-FILE-CHUNK") && (
        <>
          <mesh position={[-0.3, 0, 0]} scale={0.5}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial 
              color={packet.color} 
              emissive={packet.color} 
              emissiveIntensity={0.3}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh position={[-0.6, 0, 0]} scale={0.3}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial 
              color={packet.color} 
              emissive={packet.color} 
              emissiveIntensity={0.2}
              transparent
              opacity={0.3}
            />
          </mesh>
        </>
      )}
      
      {/* Pulsing ring effect for handshake packets */}
      {(packet.type === "SYN" || packet.type === "SYN-ACK") && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 16]} />
          <meshStandardMaterial 
            color={packet.color} 
            emissive={packet.color} 
            emissiveIntensity={0.3}
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
      
      {/* File chunk label */}
      {isFileChunk && packet.fileChunkIndex !== undefined && (
        <Text 
          position={[0, 0, 0.1]} 
          fontSize={0.12} 
          color="white" 
          anchorX="center" 
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          #{packet.fileChunkIndex + 1}
        </Text>
      )}
      
      {/* Glowing aura for important packets */}
      {(packet.type === "SYN" || packet.type === "FIN") && (
        <mesh scale={2}>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial 
            color={packet.color} 
            emissive={packet.color} 
            emissiveIntensity={0.1}
            transparent
            opacity={0.1}
          />
        </mesh>
      )}
    </group>
  );
}

// Enhanced 3D Scene Component with dynamic effects
function Scene({ packets, connectionState }: { packets: Packet[]; connectionState: ConnectionState }) {
  const time = Date.now() * 0.001;
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 8, 12]} />
      <OrbitControls enablePan={false} minDistance={8} maxDistance={20} />
      
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.6} />
      
      {/* Animated spotlight for active connections */}
      {connectionState === "ESTABLISHED" && (
        <spotLight
          position={[0, 10, 0]}
          target-position={[0, 0, 0]}
          angle={0.3}
          penumbra={0.5}
          intensity={0.8}
          color="#10b981"
        />
      )}
      
      {/* Enhanced Grid Floor with glow effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color="#1a1a1a" wireframe />
      </mesh>
      
      {/* Client Node with pulsing effect */}
      <group position={[-5, 0, 0]}>
        <mesh castShadow scale={1 + Math.sin(time * 2) * 0.05}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            emissive="#3b82f6" 
            emissiveIntensity={0.3 + Math.sin(time * 3) * 0.1} 
            metalness={0.2}
            roughness={0.3}
          />
        </mesh>
        
        {/* Client activity ring */}
        {packets.some(p => p.toServer && p.progress < 0.1) && (
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={2 + Math.sin(time * 8) * 0.3}>
            <ringGeometry args={[0.9, 1.1, 32]} />
            <meshStandardMaterial 
              color="#3b82f6" 
              emissive="#3b82f6" 
              emissiveIntensity={0.5}
              transparent
              opacity={0.3}
            />
          </mesh>
        )}
        
        <Text position={[0, -1.5, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
          CLIENT
        </Text>
      </group>
      
      {/* Server Node with connection state indication */}
      <group position={[5, 0, 0]}>
        <mesh castShadow scale={1 + Math.sin(time * 2 + Math.PI) * 0.05}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial 
            color="#10b981" 
            emissive="#10b981" 
            emissiveIntensity={connectionState === "ESTABLISHED" ? 0.5 : 0.3} 
            metalness={0.2}
            roughness={0.3}
          />
        </mesh>
        
        {/* Server activity ring */}
        {packets.some(p => !p.toServer && p.progress < 0.1) && (
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={2 + Math.sin(time * 8 + Math.PI) * 0.3}>
            <ringGeometry args={[0.9, 1.1, 32]} />
            <meshStandardMaterial 
              color="#10b981" 
              emissive="#10b981" 
              emissiveIntensity={0.5}
              transparent
              opacity={0.3}
            />
          </mesh>
        )}
        
        <Text position={[0, -1.5, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
          SERVER
        </Text>
      </group>
      
      {/* Dynamic Connection Line with data flow visualization */}
      <group>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[10, 0.04, 0.04]} />
          <meshStandardMaterial 
            color={connectionState === "ESTABLISHED" ? "#10b981" : "#6b7280"} 
            emissive={connectionState === "ESTABLISHED" ? "#10b981" : "#6b7280"}
            emissiveIntensity={connectionState === "ESTABLISHED" ? 0.6 : 0.3}
          />
        </mesh>
        
        {/* Data flow indicators */}
        {connectionState === "ESTABLISHED" && (
          <>
            {[...Array(5)].map((_, i) => (
              <mesh 
                key={i}
                position={[-4 + (time * 2 + i * 2) % 8, 0.1, 0]}
                scale={0.1}
              >
                <sphereGeometry args={[1]} />
                <meshStandardMaterial 
                  color="#10b981" 
                  emissive="#10b981" 
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            ))}
          </>
        )}
      </group>
      
      {/* Packet trail effects */}
      {packets.map((packet) => (
        <group key={`trail-${packet.id}`}>
          {/* Create trail effect for moving packets */}
          {[...Array(3)].map((_, i) => {
            const trailProgress = Math.max(0, packet.progress - (i + 1) * 0.1);
            const startX = packet.toServer ? -5 : 5;
            const endX = packet.toServer ? 5 : -5;
            const trailX = startX + (endX - startX) * trailProgress;
            
            return trailProgress > 0 ? (
              <mesh 
                key={i}
                position={[trailX, 0, 0]} 
                scale={0.1 - i * 0.02}
              >
                <sphereGeometry args={[1]} />
                <meshStandardMaterial 
                  color={packet.color} 
                  emissive={packet.color} 
                  emissiveIntensity={0.3 - i * 0.1}
                  transparent
                  opacity={0.4 - i * 0.1}
                />
              </mesh>
            ) : null;
          })}
        </group>
      ))}
      
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
  const [fileTransfer, setFileTransfer] = useState<FileTransfer | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<AnimationStep | null>(null);
  const [customMessage, setCustomMessage] = useState<string>("");
  const [messageTransmission, setMessageTransmission] = useState<MessageTransmission | null>(null);
  const [simulatePacketLoss, setSimulatePacketLoss] = useState<boolean>(false);
  const [isMessageMinimized, setIsMessageMinimized] = useState<boolean>(false);
  const [isFileTransferMinimized, setIsFileTransferMinimized] = useState<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 50));
  }, []);

  const showStep = useCallback((step: AnimationStep) => {
    setCurrentStep(step);
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
    }
    stepTimeoutRef.current = setTimeout(() => {
      setCurrentStep(null);
    }, step.duration);
  }, []);

  const downloadFile = useCallback((file: File, filename: string) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `received_${filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Convert message to packets
  const createMessagePackets = useCallback((message: string, packetSize: number = 10): MessagePacket[] => {
    const packets: MessagePacket[] = [];
    for (let i = 0; i < message.length; i += packetSize) {
      packets.push({
        id: packets.length,
        data: message.slice(i, i + packetSize),
        sequenceNumber: packets.length,
        isLost: false
      });
    }
    return packets;
  }, []);

  // TCP Message Transmission
  const sendTCPMessage = async () => {
    if (connectionState !== "ESTABLISHED") {
      addLog("❌ Error: Connection not established. Perform handshake first.");
      showStep({
        title: "Connection Required",
        description: "TCP requires an established connection before message transmission",
        type: "error",
        duration: 2500
      });
      return;
    }

    if (!customMessage.trim()) {
      addLog("❌ Error: Please enter a message to send.");
      showStep({
        title: "No Message",
        description: "Please enter a message before transmission",
        type: "error",
        duration: 2500
      });
      return;
    }

    setIsSimulating(true);
    const packets = createMessagePackets(customMessage, 8); // 8 characters per packet
    
    setMessageTransmission({
      originalMessage: customMessage,
      packets: packets,
      receivedPackets: [],
      reconstructedMessage: "",
      status: "transmitting"
    });

    const lossMessage = simulatePacketLoss ? " (with packet loss simulation)" : "";
    addLog(`📤 TCP MESSAGE: Sending "${customMessage}" in ${packets.length} packets${lossMessage}`);
    showStep({
      title: simulatePacketLoss ? "TCP with Packet Loss Simulation" : "TCP Message Transmission",
      description: simulatePacketLoss 
        ? `Simulating packet loss - TCP will detect and retransmit lost packets`
        : `Breaking message into ${packets.length} reliable packets`,
      type: simulatePacketLoss ? "warning" : "info",
      duration: 2000
    });

    const receivedPackets: MessagePacket[] = [];
    let retransmissions = 0;

    // Send each packet
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      let packetDelivered = false;
      let attempts = 0;

      while (!packetDelivered && attempts < 3) {
        attempts++;
        const attemptText = attempts > 1 ? ` (Attempt ${attempts})` : "";
        addLog(`📤 TCP PACKET ${i + 1}: "${packet.data}" (Seq: ${packet.sequenceNumber})${attemptText}`);

        // Simulate packet loss if enabled (30% chance on first attempt, 10% on retries)
        const lossChance = simulatePacketLoss ? (attempts === 1 ? 0.3 : 0.1) : 0;
        const isLost = Math.random() < lossChance;

        // Create and animate packet
        const dataPacket = createPacket("DATA", true, i, `MSG_${i}`);
        await new Promise<void>((resolve) => {
          animatePacket(dataPacket, () => {
            setStats((prev) => ({ ...prev, packetsSent: prev.packetsSent + 1 }));
            resolve();
          });
        });
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (isLost) {
          // Packet lost - no ACK received
          setStats((prev) => ({ ...prev, packetsLost: prev.packetsLost + 1 }));
          addLog(`❌ TCP PACKET ${i + 1}: LOST! No ACK received`);
          
          if (attempts === 1) {
            showStep({
              title: "Packet Lost Detected!",
              description: `TCP detected packet ${i + 1} was lost - preparing retransmission`,
              type: "error",
              duration: 2000
            });
          }

          // TCP timeout and retransmission
          addLog(`⏱️ TCP: Timeout waiting for ACK - retransmitting packet ${i + 1}`);
          retransmissions++;
          await new Promise((resolve) => setTimeout(resolve, 500)); // Timeout delay
        } else {
          // Packet received successfully
          const ackPacket = createPacket("ACK", false);
          await new Promise<void>((resolve) => {
            animatePacket(ackPacket, () => {
              setStats((prev) => ({ ...prev, packetsReceived: prev.packetsReceived + 1 }));
              receivedPackets.push(packet);
              packetDelivered = true;
              resolve();
            });
          });

          const retryText = attempts > 1 ? ` (after ${attempts - 1} retries)` : "";
          addLog(`✅ TCP PACKET ${i + 1}: Acknowledged and received${retryText}`);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // If packet still not delivered after 3 attempts (very rare)
      if (!packetDelivered) {
        addLog(`💥 TCP PACKET ${i + 1}: Failed after 3 attempts - connection may be broken`);
        showStep({
          title: "Connection Failure",
          description: "Multiple retransmission failures - connection may be broken",
          type: "error",
          duration: 3000
        });
        setIsSimulating(false);
        return;
      }
    }

    // Reconstruct message
    const reconstructedMessage = receivedPackets
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map(p => p.data)
      .join('');

    setMessageTransmission(prev => prev ? {
      ...prev,
      receivedPackets,
      reconstructedMessage,
      status: "completed"
    } : null);

    const retransmissionText = retransmissions > 0 ? ` (${retransmissions} retransmissions)` : "";
    addLog(`🎉 TCP MESSAGE: Complete! Received: "${reconstructedMessage}"${retransmissionText}`);
    
    if (retransmissions > 0) {
      showStep({
        title: "TCP Reliability Demonstrated!",
        description: `Despite ${retransmissions} packet losses, TCP successfully delivered the complete message through retransmission`,
        type: "success",
        duration: 4000
      });
    } else {
      showStep({
        title: "Message Received Successfully!",
        description: `Original: "${customMessage}" → Received: "${reconstructedMessage}"`,
        type: "success",
        duration: 4000
      });
    }

    setIsSimulating(false);
  };

  // UDP Message Transmission
  const sendUDPMessage = async () => {
    if (!customMessage.trim()) {
      addLog("❌ Error: Please enter a message to send.");
      showStep({
        title: "No Message",
        description: "Please enter a message before transmission",
        type: "error",
        duration: 2500
      });
      return;
    }

    setIsSimulating(true);
    const packets = createMessagePackets(customMessage, 6); // 6 characters per packet
    
    setMessageTransmission({
      originalMessage: customMessage,
      packets: packets,
      receivedPackets: [],
      reconstructedMessage: "",
      status: "transmitting"
    });

    addLog(`📤 UDP MESSAGE: Sending "${customMessage}" in ${packets.length} packets (unreliable)`);
    showStep({
      title: "UDP Message Transmission",
      description: `Sending ${packets.length} packets - some may be lost!`,
      type: "warning",
      duration: 2000
    });

    const receivedPackets: MessagePacket[] = [];
    let lostPackets = 0;

    // Send each packet
    for (let i = 0; i < packets.length; i++) {
      const packet = packets[i];
      const isLost = Math.random() < 0.25; // 25% packet loss for messages
      
      addLog(`📤 UDP PACKET ${i + 1}: "${packet.data}" (Seq: ${packet.sequenceNumber})`);

      // Create and animate packet
      const udpPacket = createPacket("UDP-DATA", true, i, `MSG_${i}`);
      await new Promise<void>((resolve) => {
        animatePacket(udpPacket, () => {
          setStats((prev) => ({ ...prev, packetsSent: prev.packetsSent + 1 }));
          
          if (isLost) {
            setStats((prev) => ({ ...prev, packetsLost: prev.packetsLost + 1 }));
            addLog(`❌ UDP PACKET ${i + 1}: LOST! "${packet.data}"`);
            lostPackets++;
          } else {
            setStats((prev) => ({ ...prev, packetsReceived: prev.packetsReceived + 1 }));
            receivedPackets.push(packet);
            addLog(`✅ UDP PACKET ${i + 1}: Received "${packet.data}"`);
          }
          resolve();
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    // Reconstruct message (with gaps for lost packets)
    const reconstructedMessage = packets.map(packet => {
      const received = receivedPackets.find(p => p.sequenceNumber === packet.sequenceNumber);
      return received ? received.data : '[LOST]';
    }).join('');

    const successRate = ((packets.length - lostPackets) / packets.length) * 100;

    setMessageTransmission(prev => prev ? {
      ...prev,
      receivedPackets,
      reconstructedMessage,
      status: successRate > 70 ? "completed" : "failed"
    } : null);

    if (lostPackets > 0) {
      addLog(`⚠️ UDP MESSAGE: ${lostPackets} packets lost! Received: "${reconstructedMessage}"`);
      showStep({
        title: "Message Partially Lost",
        description: `${lostPackets} packets lost. Original: "${customMessage}" → Received: "${reconstructedMessage}"`,
        type: "error",
        duration: 4000
      });
    } else {
      addLog(`🎉 UDP MESSAGE: All packets received! "${reconstructedMessage}"`);
      showStep({
        title: "Message Received Successfully!",
        description: `Lucky! No packet loss. Received: "${reconstructedMessage}"`,
        type: "success",
        duration: 4000
      });
    }

    setIsSimulating(false);
  };

  const createPacket = useCallback((type: PacketType, toServer: boolean, fileChunkIndex?: number, fileName?: string): Packet => {
    const colors: Record<PacketType, string> = {
      "SYN": "#f59e0b",
      "SYN-ACK": "#8b5cf6",
      "ACK": "#10b981",
      "DATA": "#3b82f6",
      "FIN": "#ef4444",
      "UDP-DATA": "#06b6d4",
      "FILE-CHUNK": "#ec4899",
      "UDP-FILE-CHUNK": "#06b6d4",
    };

    return {
      id: `${Date.now()}-${Math.random()}`,
      type,
      progress: 0,
      color: colors[type],
      toServer,
      fileChunkIndex,
      fileName,
    };
  }, []);

  const animatePacket = useCallback((packet: Packet, onComplete: () => void) => {
    const startTime = Date.now();
    
    // Different durations for different packet types
    const getDuration = (type: PacketType) => {
      switch (type) {
        case "SYN":
        case "SYN-ACK":
        case "ACK":
          return 1800; // Slower for handshake packets
        case "UDP-DATA":
        case "UDP-FILE-CHUNK":
          return 800; // Much faster for UDP
        case "FILE-CHUNK":
          return 1200; // Medium speed for TCP file chunks
        case "DATA":
          return 1500; // Standard speed
        case "FIN":
          return 2000; // Slower for connection termination
        default:
          return 1500;
      }
    };

    const duration = getDuration(packet.type);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      let progress = Math.min(elapsed / duration, 1);

      // Different easing functions for different packet types
      switch (packet.type) {
        case "SYN":
          // Ease-in-out for smooth handshake
          progress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          break;
        case "UDP-DATA":
        case "UDP-FILE-CHUNK":
          // Linear for UDP (no flow control)
          break;
        case "FILE-CHUNK":
          // Slight ease-out for file chunks
          progress = 1 - Math.pow(1 - progress, 2);
          break;
        case "FIN":
          // Ease-in for closing connection
          progress = progress * progress;
          break;
        default:
          // Ease-in-out for most packets
          progress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      }

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
    
    showStep({
      title: "TCP 3-Way Handshake Started",
      description: "Initiating reliable connection establishment between client and server",
      type: "info",
      duration: 2000
    });
    
    // Step 1: SYN
    setConnectionState("SYN_SENT");
    const synPacket = createPacket("SYN", true);
    addLog("➡️  Client sends SYN to Server");
    
    showStep({
      title: "Step 1: SYN (Synchronize)",
      description: "Client sends SYN packet to initiate connection with sequence number",
      type: "info",
      duration: 2000
    });
    
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
    
    showStep({
      title: "Step 2: SYN-ACK (Synchronize-Acknowledge)",
      description: "Server acknowledges client's SYN and sends its own sequence number",
      type: "info",
      duration: 2000
    });
    
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
    
    showStep({
      title: "Step 3: ACK (Acknowledge)",
      description: "Client acknowledges server's sequence number - Connection established!",
      type: "success",
      duration: 2500
    });
    
    await new Promise<void>((resolve) => {
      animatePacket(ackPacket, () => {
        setStats((prev) => ({ ...prev, packetsSent: prev.packetsSent + 1 }));
        resolve();
      });
    });

    addLog("✅ TCP: Connection ESTABLISHED");
    
    showStep({
      title: "Connection Established! ✅",
      description: "TCP connection is now ready for reliable data transmission",
      type: "success",
      duration: 3000
    });
    
    setIsSimulating(false);
  };

  // Send TCP Data
  const sendTCPData = async () => {
    if (connectionState !== "ESTABLISHED") {
      addLog("❌ Error: Connection not established. Perform handshake first.");
      showStep({
        title: "Connection Required",
        description: "TCP requires an established connection before data transmission",
        type: "error",
        duration: 2500
      });
      return;
    }

    setIsSimulating(true);
    addLog("📤 TCP: Sending data packet...");
    
    showStep({
      title: "TCP Data Transmission",
      description: "Sending data packet over established TCP connection",
      type: "info",
      duration: 2000
    });

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
    
    showStep({
      title: "Data Acknowledged",
      description: "Server confirms receipt of data packet - TCP guarantees delivery",
      type: "success",
      duration: 2500
    });
    
    await new Promise<void>((resolve) => {
      animatePacket(ackPacket, () => {
        setStats((prev) => ({ ...prev, packetsReceived: prev.packetsReceived + 1 }));
        resolve();
      });
    });

    addLog("✅ TCP: Data transmitted successfully");
    setIsSimulating(false);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      addLog(`📁 FILE: Selected "${file.name}" (${(file.size / 1024).toFixed(1)}KB)`);
    }
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Transfer File
  const transferFile = async () => {
    if (connectionState !== "ESTABLISHED") {
      addLog("❌ Error: Connection not established. Perform handshake first.");
      showStep({
        title: "Connection Required",
        description: "TCP file transfer requires an established connection",
        type: "error",
        duration: 2500
      });
      return;
    }

    if (!selectedFile) {
      addLog("❌ Error: No file selected. Please select a file first.");
      showStep({
        title: "No File Selected",
        description: "Please select a file before starting the transfer",
        type: "error",
        duration: 2500
      });
      return;
    }

    setIsSimulating(true);
    
    // Use actual file metadata
    const fileName = selectedFile.name;
    const fileSize = Math.ceil(selectedFile.size / 1024); // Convert to KB
    const chunkSize = 512; // KB per chunk
    const totalChunks = Math.ceil(fileSize / chunkSize);

    setFileTransfer({
      name: fileName,
      size: fileSize,
      chunks: totalChunks,
      currentChunk: 0,
      progress: 0,
      status: "transferring",
      file: selectedFile,
    });

    addLog(`📁 FILE: Starting transfer of "${fileName}" (${fileSize}KB)`);
    addLog(`📦 FILE: Splitting into ${totalChunks} chunks...`);
    
    showStep({
      title: "TCP File Transfer Started",
      description: `Transferring "${fileName}" (${fileSize}KB) in ${totalChunks} reliable chunks`,
      type: "info",
      duration: 2500
    });

    // Send each chunk
    for (let i = 0; i < totalChunks; i++) {
      // Update file transfer state
      setFileTransfer((prev) => prev ? {
        ...prev,
        currentChunk: i,
        progress: ((i + 1) / totalChunks) * 100,
      } : null);

      addLog(`📤 FILE: Sending chunk ${i + 1}/${totalChunks}...`);
      
      if (i === 0 || i === Math.floor(totalChunks / 2) || i === totalChunks - 1) {
        showStep({
          title: `Sending Chunk ${i + 1}/${totalChunks}`,
          description: "Each chunk is acknowledged before sending the next one",
          type: "info",
          duration: 1500
        });
      }

      // Send file chunk
      const chunkPacket = createPacket("FILE-CHUNK", true, i, fileName);
      await new Promise<void>((resolve) => {
        animatePacket(chunkPacket, () => {
          setStats((prev) => ({ ...prev, packetsSent: prev.packetsSent + 1 }));
          resolve();
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Receive ACK
      const ackPacket = createPacket("ACK", false);
      await new Promise<void>((resolve) => {
        animatePacket(ackPacket, () => {
          setStats((prev) => ({ ...prev, packetsReceived: prev.packetsReceived + 1 }));
          resolve();
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 200));

      addLog(`✅ FILE: Chunk ${i + 1}/${totalChunks} acknowledged`);
    }

    setFileTransfer((prev) => prev ? {
      ...prev,
      progress: 100,
      status: "completed",
    } : null);

    addLog(`🎉 FILE: Transfer complete! "${fileName}" received by server`);
    
    showStep({
      title: "File Transfer Complete! 🎉",
      description: `"${fileName}" successfully transferred with 100% reliability`,
      type: "success",
      duration: 3000
    });
    
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
    setFileTransfer(null);
    setIsSimulating(false);
  };

  // Send UDP Data
  const sendUDPData = async () => {
    setIsSimulating(true);
    addLog("📤 UDP: Sending datagram (no handshake needed)...");
    
    showStep({
      title: "UDP Datagram Transmission",
      description: "Sending data immediately - no connection setup required",
      type: "info",
      duration: 1500
    });

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
          showStep({
            title: "Packet Lost! ❌",
            description: "UDP packet was lost in transmission - no retransmission occurs",
            type: "error",
            duration: 2500
          });
        } else {
          setStats((prev) => ({ 
            ...prev, 
            packetsSent: prev.packetsSent + 1,
            packetsReceived: prev.packetsReceived + 1 
          }));
          addLog("✅ UDP: Datagram delivered (unconfirmed)");
          showStep({
            title: "Datagram Delivered",
            description: "UDP packet reached destination - delivery unconfirmed (best effort)",
            type: "success",
            duration: 2500
          });
        }
        resolve();
      });
    });

    setIsSimulating(false);
  };

  // UDP File Transfer
  const transferUDPFile = async () => {
    if (!selectedFile) {
      addLog("❌ Error: No file selected. Please select a file first.");
      showStep({
        title: "No File Selected",
        description: "Please select a file before starting the transfer",
        type: "error",
        duration: 2500
      });
      return;
    }

    setIsSimulating(true);
    
    // Use actual file metadata
    const fileName = selectedFile.name;
    const fileSize = Math.ceil(selectedFile.size / 1024); // Convert to KB
    const chunkSize = 256; // Smaller chunks for UDP (256KB)
    const totalChunks = Math.ceil(fileSize / chunkSize);

    setFileTransfer({
      name: fileName,
      size: fileSize,
      chunks: totalChunks,
      currentChunk: 0,
      progress: 0,
      status: "transferring",
      file: selectedFile,
    });

    addLog(`📁 UDP FILE: Starting transfer of "${fileName}" (${fileSize}KB)`);
    addLog(`📦 UDP FILE: Splitting into ${totalChunks} chunks (no reliability)...`);
    
    showStep({
      title: "UDP File Transfer Started",
      description: `Transferring "${fileName}" (${fileSize}KB) - fast but unreliable!`,
      type: "warning",
      duration: 2500
    });

    let successfulChunks = 0;
    let lostChunks = 0;

    // Send each chunk
    for (let i = 0; i < totalChunks; i++) {
      // Update file transfer state
      setFileTransfer((prev) => prev ? {
        ...prev,
        currentChunk: i,
        progress: ((i + 1) / totalChunks) * 100,
      } : null);

      addLog(`📤 UDP FILE: Sending chunk ${i + 1}/${totalChunks}...`);

      // Send UDP file chunk
      const chunkPacket = createPacket("UDP-FILE-CHUNK", true, i, fileName);
      
      // Simulate packet loss (20% chance)
      const isLost = Math.random() < 0.2;

      await new Promise<void>((resolve) => {
        animatePacket(chunkPacket, () => {
          setStats((prev) => ({ ...prev, packetsSent: prev.packetsSent + 1 }));
          
          if (isLost) {
            setStats((prev) => ({ ...prev, packetsLost: prev.packetsLost + 1 }));
            addLog(`❌ UDP FILE: Chunk ${i + 1}/${totalChunks} lost!`);
            lostChunks++;
            
            if (i % 5 === 0 && isLost) {
              showStep({
                title: `Chunk ${i + 1} Lost!`,
                description: "UDP doesn't retransmit lost packets - data may be incomplete",
                type: "error",
                duration: 1500
              });
            }
          } else {
            setStats((prev) => ({ ...prev, packetsReceived: prev.packetsReceived + 1 }));
            addLog(`✅ UDP FILE: Chunk ${i + 1}/${totalChunks} delivered (unconfirmed)`);
            successfulChunks++;
          }
          resolve();
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 150)); // Faster than TCP
    }

    const successRate = (successfulChunks / totalChunks) * 100;
    
    setFileTransfer((prev) => prev ? {
      ...prev,
      progress: 100,
      status: successRate > 80 ? "completed" : "failed",
    } : null);

    if (successRate > 80) {
      addLog(`🎉 UDP FILE: Transfer completed! ${successfulChunks}/${totalChunks} chunks delivered (${successRate.toFixed(1)}% success)`);
      showStep({
        title: "UDP Transfer Complete",
        description: `${successfulChunks}/${totalChunks} chunks delivered (${successRate.toFixed(1)}% success rate)`,
        type: "success",
        duration: 3000
      });
    } else {
      addLog(`⚠️ UDP FILE: Transfer unreliable! Only ${successfulChunks}/${totalChunks} chunks delivered (${successRate.toFixed(1)}% success)`);
      showStep({
        title: "UDP Transfer Unreliable",
        description: `Only ${successRate.toFixed(1)}% success rate - file may be corrupted`,
        type: "error",
        duration: 3000
      });
    }
    
    if (lostChunks > 0) {
      addLog(`📊 UDP FILE: ${lostChunks} chunks lost due to network conditions`);
    }

    setIsSimulating(false);
  };

  const resetSimulator = useCallback(() => {
    // Cancel any ongoing animations
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Clear step timeout
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
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
    setFileTransfer(null);
    setSelectedFile(null);
    setCurrentStep(null);
    setCustomMessage("");
    setMessageTransmission(null);
    setSimulatePacketLoss(false);
    setIsMessageMinimized(false);
    setIsFileTransferMinimized(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        
        {/* Back Button and Protocol Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="bg-slate-900/90 backdrop-blur border-slate-600 hover:bg-slate-800 text-white hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Badge variant={protocol === "TCP" ? "default" : "secondary"} className="text-lg px-4 py-2">
            <Network className="w-4 h-4 mr-2" />
            {protocol} Protocol
          </Badge>
        </div>

        {/* Animation Step Display */}
        {currentStep && (
          <div className="absolute top-4 right-4 max-w-md">
            <Card className={`bg-slate-950/95 backdrop-blur border-2 ${
              currentStep.type === "success" ? "border-green-500/50" :
              currentStep.type === "error" ? "border-red-500/50" :
              currentStep.type === "warning" ? "border-yellow-500/50" :
              "border-blue-500/50"
            }`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm flex items-center gap-2 ${
                  currentStep.type === "success" ? "text-green-400" :
                  currentStep.type === "error" ? "text-red-400" :
                  currentStep.type === "warning" ? "text-yellow-400" :
                  "text-blue-400"
                }`}>
                  {currentStep.type === "success" && <CheckCircle2 className="w-4 h-4" />}
                  {currentStep.type === "error" && <XCircle className="w-4 h-4" />}
                  {currentStep.type === "warning" && <WifiOff className="w-4 h-4" />}
                  {currentStep.type === "info" && <Activity className="w-4 h-4" />}
                  {currentStep.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-slate-300 text-sm">{currentStep.description}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Message Transmission Display Overlay */}
        {messageTransmission && (
          <div className={`absolute bottom-4 left-4 right-4 max-w-2xl mx-auto transition-all duration-300 ${
            isMessageMinimized ? 'transform translate-y-[calc(100%-3rem)]' : ''
          }`}>
            <Card className={`bg-slate-950/95 backdrop-blur ${protocol === "TCP" ? "border-blue-500/50" : "border-cyan-500/50"}`}>
              <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsMessageMinimized(!isMessageMinimized)}>
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className={`w-4 h-4 ${protocol === "TCP" ? "text-blue-500" : "text-cyan-500"}`} />
                    {protocol} Message Transmission
                    {isMessageMinimized && (
                      <span className="text-xs text-slate-400 ml-2">
                        ({messageTransmission.receivedPackets.length}/{messageTransmission.packets.length} packets)
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMessageMinimized(!isMessageMinimized);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {isMessageMinimized ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              
              {!isMessageMinimized && (
                <CardContent className="space-y-4">
                  {/* Original Message */}
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">Original Message:</div>
                    <div className="p-2 bg-slate-800 rounded text-sm text-slate-200 font-mono">
                      "{messageTransmission.originalMessage}"
                    </div>
                  </div>

                  {/* Packet Breakdown */}
                  <div className="space-y-1">
                    <div className="text-xs text-slate-400">Packet Breakdown:</div>
                    <div className="flex flex-wrap gap-1">
                      {messageTransmission.packets.map((packet, index) => {
                        const isReceived = messageTransmission.receivedPackets.some(p => p.sequenceNumber === packet.sequenceNumber);
                        const isLost = messageTransmission.status !== "idle" && !isReceived && messageTransmission.status !== "transmitting";
                        
                        return (
                          <div
                            key={packet.id}
                            className={`px-2 py-1 rounded text-xs font-mono border ${
                              messageTransmission.status === "transmitting" 
                                ? "bg-yellow-900/30 border-yellow-600 text-yellow-300"
                                : isReceived 
                                  ? "bg-green-900/30 border-green-600 text-green-300"
                                  : isLost
                                    ? "bg-red-900/30 border-red-600 text-red-300"
                                    : "bg-slate-800 border-slate-600 text-slate-300"
                            }`}
                          >
                            {packet.sequenceNumber}: "{packet.data}"
                            {isLost && " [LOST]"}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Received Message */}
                  {messageTransmission.status !== "idle" && messageTransmission.status !== "transmitting" && (
                    <div className="space-y-1">
                      <div className="text-xs text-slate-400">Received Message:</div>
                      <div className={`p-2 rounded text-sm font-mono ${
                        messageTransmission.status === "completed" 
                          ? "bg-green-900/30 border border-green-600 text-green-200"
                          : "bg-red-900/30 border border-red-600 text-red-200"
                      }`}>
                        "{messageTransmission.reconstructedMessage}"
                      </div>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-400">
                      Packets: {messageTransmission.receivedPackets.length}/{messageTransmission.packets.length} received
                      {protocol === "TCP" && simulatePacketLoss && (
                        <span className="text-red-300 ml-2">(with retransmission)</span>
                      )}
                    </div>
                    {messageTransmission.status === "completed" && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {protocol === "TCP" && simulatePacketLoss ? "Recovered" : "Complete"}
                      </Badge>
                    )}
                    {messageTransmission.status === "failed" && (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Packet Loss
                      </Badge>
                    )}
                    {messageTransmission.status === "transmitting" && (
                      <Badge variant="secondary" className="bg-yellow-600">
                        <Activity className="w-3 h-3 mr-1" />
                        Transmitting
                      </Badge>
                    )}
                  </div>

                  {/* TCP Reliability Demonstration */}
                  {protocol === "TCP" && simulatePacketLoss && messageTransmission.status === "completed" && (
                    <div className="p-2 bg-green-950/30 border border-green-600/50 rounded text-xs text-green-200">
                      <div className="font-semibold mb-1">✅ TCP Reliability Demonstrated</div>
                      <div>Despite packet losses, TCP's automatic retransmission ensured 100% reliable delivery of your message.</div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}

        {/* File Transfer Progress Overlay */}
        {fileTransfer && !messageTransmission && (
          <div className={`absolute bottom-4 left-4 right-4 max-w-md mx-auto transition-all duration-300 ${
            isFileTransferMinimized ? 'transform translate-y-[calc(100%-3rem)]' : ''
          }`}>
            <Card className={`bg-slate-950/95 backdrop-blur ${protocol === "TCP" ? "border-pink-500/50" : "border-cyan-500/50"}`}>
              <CardHeader className="pb-3 cursor-pointer" onClick={() => setIsFileTransferMinimized(!isFileTransferMinimized)}>
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${protocol === "TCP" ? "text-pink-500" : "text-cyan-500"}`} />
                    {protocol} File Transfer
                    {isFileTransferMinimized && (
                      <span className="text-xs text-slate-400 ml-2">
                        ({fileTransfer.progress.toFixed(0)}% - {fileTransfer.name})
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFileTransferMinimized(!isFileTransferMinimized);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    {isFileTransferMinimized ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              
              {!isFileTransferMinimized && (
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{fileTransfer.name}</span>
                      <span className="text-slate-400">{fileTransfer.size}KB</span>
                    </div>
                    <Progress value={fileTransfer.progress} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        {fileTransfer.status === "transferring" 
                          ? `Chunk ${fileTransfer.currentChunk + 1} / ${fileTransfer.chunks}`
                          : fileTransfer.status === "completed" 
                            ? "File received at server"
                            : "Transfer incomplete"
                        }
                      </span>
                      <span className={`font-mono ${protocol === "TCP" ? "text-pink-400" : "text-cyan-400"}`}>
                        {fileTransfer.progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  {fileTransfer.status === "completed" && (
                    <div className="space-y-2">
                      <Badge variant="default" className="w-full justify-center bg-green-500">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Transfer Complete
                      </Badge>
                      {fileTransfer.file && (
                        <Button 
                          onClick={() => downloadFile(fileTransfer.file!, fileTransfer.name)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Upload className="w-3 h-3 mr-2 rotate-180" />
                          Download Received File
                        </Button>
                      )}
                    </div>
                  )}
                  {fileTransfer.status === "failed" && (
                    <div className="space-y-2">
                      <Badge variant="destructive" className="w-full justify-center">
                        <XCircle className="w-3 h-3 mr-1" />
                        Transfer Unreliable
                      </Badge>
                      {fileTransfer.file && protocol === "UDP" && (
                        <Button 
                          onClick={() => downloadFile(fileTransfer.file!, fileTransfer.name)}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                          size="sm"
                        >
                          <Upload className="w-3 h-3 mr-2 rotate-180" />
                          Download Partial File
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}
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
            <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
              <TabsTrigger value="TCP" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">TCP</TabsTrigger>
              <TabsTrigger value="UDP" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-300">UDP</TabsTrigger>
            </TabsList>

            {/* TCP Controls */}
            <TabsContent value="TCP" className="space-y-4 mt-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm text-slate-200">TCP Connection</CardTitle>
                  <CardDescription className="text-slate-300">Transmission Control Protocol - Reliable, connection-oriented</CardDescription>
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

                  {/* Custom Message Section */}
                  <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-200">Send Custom Message</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Enter your message..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 text-sm"
                        disabled={isSimulating}
                      />
                      
                      {/* Packet Loss Simulation Toggle */}
                      <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-600">
                        <input
                          type="checkbox"
                          id="packetLossToggle"
                          checked={simulatePacketLoss}
                          onChange={(e) => setSimulatePacketLoss(e.target.checked)}
                          disabled={isSimulating}
                          className="w-4 h-4 text-red-600 bg-slate-800 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
                        />
                        <label htmlFor="packetLossToggle" className="text-xs text-slate-300 cursor-pointer">
                          Simulate packet loss (30% chance)
                        </label>
                      </div>
                      
                      <Button 
                        onClick={sendTCPMessage} 
                        disabled={isSimulating || connectionState !== "ESTABLISHED" || !customMessage.trim()}
                        className={`w-full ${simulatePacketLoss ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        size="sm"
                      >
                        <Send className="w-3 h-3 mr-2" />
                        {simulatePacketLoss ? 'Send with Packet Loss' : 'Send Message (TCP)'}
                      </Button>
                    </div>
                    
                    {/* Packet Loss Explanation */}
                    {simulatePacketLoss && (
                      <div className="p-2 bg-red-950/30 border border-red-900/50 rounded text-xs text-red-200">
                        <div className="font-semibold mb-1">🔬 Packet Loss Simulation Active</div>
                        <div>TCP will detect lost packets and automatically retransmit them, ensuring reliable delivery despite network issues.</div>
                      </div>
                    )}
                  </div>

                  {/* File Selection */}
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                    
                    <Button 
                      onClick={openFilePicker}
                      disabled={isSimulating}
                      className="w-full"
                      variant="outline"
                    >
                      <File className="w-4 h-4 mr-2" />
                      Select File
                    </Button>

                    {selectedFile && (
                      <div className="p-3 bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-blue-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white truncate">{selectedFile.name}</p>
                            <p className="text-slate-400 text-xs">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={transferFile} 
                      disabled={isSimulating || connectionState !== "ESTABLISHED" || !selectedFile}
                      className="w-full bg-pink-600 hover:bg-pink-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Transfer File
                    </Button>
                  </div>

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

              {/* TCP How It Works */}
              <div className="bg-slate-900/30 rounded-lg p-1">
                <TCPHowItWorks />
              </div>
            </TabsContent>

            {/* UDP Controls */}
            <TabsContent value="UDP" className="space-y-4 mt-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-sm text-slate-200">UDP Datagram</CardTitle>
                  <CardDescription className="text-slate-300">User Datagram Protocol - Fast, connectionless</CardDescription>
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

                  {/* Custom Message Section */}
                  <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h4 className="text-sm font-semibold text-slate-200">Send Custom Message</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        placeholder="Enter your message..."
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500 text-sm"
                        disabled={isSimulating}
                      />
                      <Button 
                        onClick={sendUDPMessage} 
                        disabled={isSimulating || !customMessage.trim()}
                        className="w-full bg-cyan-600 hover:bg-cyan-700"
                        size="sm"
                      >
                        <Send className="w-3 h-3 mr-2" />
                        Send Message (UDP)
                      </Button>
                    </div>
                  </div>

                  {/* UDP File Selection */}
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                    />
                    
                    <Button 
                      onClick={openFilePicker}
                      disabled={isSimulating}
                      className="w-full"
                      variant="outline"
                    >
                      <File className="w-4 h-4 mr-2" />
                      Select File
                    </Button>

                    {selectedFile && (
                      <div className="p-3 bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white truncate">{selectedFile.name}</p>
                            <p className="text-slate-400 text-xs">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={transferUDPFile} 
                      disabled={isSimulating || !selectedFile}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Transfer File (UDP)
                    </Button>
                  </div>

                  <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-lg">
                    <p className="text-xs text-amber-200">
                      <WifiOff className="w-4 h-4 inline mr-1" />
                      20% packet loss simulated - some chunks may be lost!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* UDP How It Works */}
              <div className="bg-slate-900/30 rounded-lg p-1">
                <UDPHowItWorks />
              </div>
            </TabsContent>
          </Tabs>

          {/* Statistics */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-sm text-slate-200">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Packets Sent:</span>
                <span className="text-blue-300 font-mono font-semibold">{stats.packetsSent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Packets Received:</span>
                <span className="text-green-300 font-mono font-semibold">{stats.packetsReceived}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Packets Lost:</span>
                <span className="text-red-300 font-mono font-semibold">{stats.packetsLost}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Success Rate:</span>
                <span className="text-cyan-300 font-mono font-semibold">
                  {stats.packetsSent > 0 
                    ? `${((stats.packetsReceived / stats.packetsSent) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between text-slate-200">
                Activity Log
                <Button onClick={resetSimulator} size="sm" variant="outline" className="border-slate-500 bg-slate-800/50 hover:bg-slate-700 text-slate-200 hover:text-white hover:border-slate-400 transition-all">
                  Reset
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-h-64 overflow-y-auto font-mono text-xs bg-slate-800/30 rounded p-3 border border-slate-700/50">
                {logs.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No activity yet</p>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="text-slate-200 py-1 border-b border-slate-700/30 last:border-b-0 hover:bg-slate-700/20 px-2 rounded transition-colors">
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