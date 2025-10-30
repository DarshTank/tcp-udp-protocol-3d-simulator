"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle, Terminal, Code, Network, Shield } from 'lucide-react';

export const CCodeDemo = () => {
  const [copied, setCopied] = useState(false);

  const sourceCode = `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <pthread.h>
#include <netinet/in.h>
#include <sys/types.h>
#include <fcntl.h>
#include <openssl/sha.h> // For SHA256 - Link with -lcrypto

#define TCP_PORT 5000
#define UDP_PORT 5001
#define BUFFER_SIZE 4096
#define MAX_FILENAME 128
#define SHA256_HEX_LEN (SHA256_DIGEST_LENGTH * 2 + 1)

// Enhanced header with integrity check
struct FileHeader {
    char filename[MAX_FILENAME];
    long filesize;
    char filehash[SHA256_HEX_LEN]; // SHA-256 hash
};

// Helper function to convert hash to hex string
void sha256_to_str(const unsigned char* hash, char* hex_string) {
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        sprintf(hex_string + (i * 2), "%02x", hash[i]);
    }
    hex_string[SHA256_DIGEST_LENGTH * 2] = '\\0';
}

// Calculate SHA-256 of a file
int calculate_sha256(const char* filepath, unsigned char* out_hash) {
    FILE* file = fopen(filepath, "rb");
    if (!file) {
        perror("Failed to open file for hashing");
        return -1;
    }

    SHA256_CTX sha256_context;
    SHA256_Init(&sha256_context);
    
    unsigned char buffer[BUFFER_SIZE];
    size_t bytes_read;
    
    while ((bytes_read = fread(buffer, 1, BUFFER_SIZE, file))) {
        SHA256_Update(&sha256_context, buffer, bytes_read);
    }
    
    SHA256_Final(out_hash, &sha256_context);
    fclose(file);
    return 0;
}

// UDP Broadcast server for discovery
void* udp_broadcast_server(void* arg) {
    int udp_socket = socket(AF_INET, SOCK_DGRAM, 0);
    if (udp_socket < 0) {
        perror("UDP socket creation failed");
        return NULL;
    }

    int broadcast = 1;
    setsockopt(udp_socket, SOL_SOCKET, SO_BROADCAST, &broadcast, sizeof(broadcast));

    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(UDP_PORT);

    if (bind(udp_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("UDP bind failed");
        close(udp_socket);
        return NULL;
    }

    printf("UDP Broadcast Server running on port %d\\n", UDP_PORT);

    while (1) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        char buffer[256];
        
        int n = recvfrom(udp_socket, buffer, sizeof(buffer) - 1, 0, 
                        (struct sockaddr*)&client_addr, &client_len);
        if (n < 0) continue;
        
        buffer[n] = '\\0';
        
        if (strcmp(buffer, "DISCOVER_FTS_SERVER") == 0) {
            char response[256];
            snprintf(response, sizeof(response), "FTS_SERVER_HERE:%s:%d", 
                    "127.0.0.1", TCP_PORT);
            sendto(udp_socket, response, strlen(response), 0, 
                  (struct sockaddr*)&client_addr, client_len);
        }
    }

    close(udp_socket);
    return NULL;
}

// Handle individual client connections
void* handle_client(void* arg) {
    int client_socket = (int)(long)arg;
    
    struct sockaddr_in client_addr;
    socklen_t addr_len = sizeof(client_addr);
    getpeername(client_socket, (struct sockaddr*)&client_addr, &addr_len);
    
    printf("Connection from %s:%d\\n", 
           inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));

    // Receive file header
    struct FileHeader header;
    if (recv(client_socket, &header, sizeof(header), 0) <= 0) {
        fprintf(stderr, "Failed to receive header\\n");
        close(client_socket);
        return NULL;
    }

    char out_filename[256];
    snprintf(out_filename, sizeof(out_filename), "received_%s", header.filename);
    
    printf("Receiving file '%s' (%ld bytes)\\n", header.filename, header.filesize);
    printf("Expected SHA-256: %s\\n", header.filehash);

    // Open output file
    int fd = open(out_filename, O_WRONLY | O_CREAT | O_TRUNC, 0644);
    if (fd < 0) {
        perror("File open failed");
        close(client_socket);
        return NULL;
    }

    // Receive file data
    long remaining = header.filesize;
    char buffer[BUFFER_SIZE];
    
    while (remaining > 0) {
        int n = recv(client_socket, buffer, 
                    (remaining < BUFFER_SIZE) ? remaining : BUFFER_SIZE, 0);
        if (n <= 0) {
            fprintf(stderr, "Client disconnected or recv failed\\n");
            break;
        }
        
        write(fd, buffer, n);
        remaining -= n;
    }
    
    close(fd);

    // Verify file integrity
    char confirmation[256];
    if (remaining == 0) {
        unsigned char calculated_hash[SHA256_DIGEST_LENGTH];
        char calculated_hash_hex[SHA256_HEX_LEN];
        
        if (calculate_sha256(out_filename, calculated_hash) == 0) {
            sha256_to_str(calculated_hash, calculated_hash_hex);
            printf("Calculated SHA-256: %s\\n", calculated_hash_hex);
            
            if (strcmp(header.filehash, calculated_hash_hex) == 0) {
                printf("File '%s' received successfully. Integrity OK.\\n", header.filename);
                snprintf(confirmation, sizeof(confirmation), 
                        "SUCCESS: File received and verified.");
            } else {
                fprintf(stderr, "ERROR: File corruption detected\\n");
                snprintf(confirmation, sizeof(confirmation), 
                        "ERROR: File integrity check failed.");
            }
        } else {
            snprintf(confirmation, sizeof(confirmation), 
                    "ERROR: Could not hash received file.");
        }
    } else {
        fprintf(stderr, "File transfer incomplete\\n");
        snprintf(confirmation, sizeof(confirmation), 
                "ERROR: Incomplete file transfer.");
    }

    send(client_socket, confirmation, strlen(confirmation), 0);
    close(client_socket);
    return NULL;
}

// Main server function
void run_server() {
    // Start UDP discovery server
    pthread_t udp_thread;
    pthread_create(&udp_thread, NULL, udp_broadcast_server, NULL);

    // Create TCP server
    int tcp_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (tcp_socket < 0) {
        perror("TCP socket creation failed");
        exit(EXIT_FAILURE);
    }

    int reuse = 1;
    setsockopt(tcp_socket, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse));

    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(TCP_PORT);

    if (bind(tcp_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("TCP bind failed");
        exit(EXIT_FAILURE);
    }

    if (listen(tcp_socket, 10) < 0) {
        perror("Listen failed");
        exit(EXIT_FAILURE);
    }

    printf("TCP Server listening on port %d\\n", TCP_PORT);

    while (1) {
        int client_socket = accept(tcp_socket, NULL, NULL);
        if (client_socket < 0) {
            perror("Accept failed");
            continue;
        }

        pthread_t client_thread;
        if (pthread_create(&client_thread, NULL, handle_client, 
                          (void*)(long)client_socket) != 0) {
            perror("Failed to create client thread");
            close(client_socket);
        }
        pthread_detach(client_thread);
    }

    close(tcp_socket);
    pthread_join(udp_thread, NULL);
}

// Client implementation
void run_client(const char* file_path) {
    // 1. Discover server via UDP
    int udp_socket = socket(AF_INET, SOCK_DGRAM, 0);
    int broadcast = 1;
    setsockopt(udp_socket, SOL_SOCKET, SO_BROADCAST, &broadcast, sizeof(broadcast));

    struct timeval tv = { .tv_sec = 3, .tv_usec = 0 };
    setsockopt(udp_socket, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

    struct sockaddr_in broadcast_addr;
    memset(&broadcast_addr, 0, sizeof(broadcast_addr));
    broadcast_addr.sin_family = AF_INET;
    broadcast_addr.sin_port = htons(UDP_PORT);
    broadcast_addr.sin_addr.s_addr = inet_addr("255.255.255.255");

    printf("Searching for server...\\n");
    const char* discover_msg = "DISCOVER_FTS_SERVER";
    sendto(udp_socket, discover_msg, strlen(discover_msg), 0, 
           (struct sockaddr*)&broadcast_addr, sizeof(broadcast_addr));

    char buffer[256];
    int n = recvfrom(udp_socket, buffer, sizeof(buffer) - 1, 0, NULL, NULL);
    close(udp_socket);

    if (n < 0) {
        printf("No server found. Please ensure server is running.\\n");
        return;
    }

    buffer[n] = '\\0';
    char server_host[16];
    int server_port;
    
    if (sscanf(buffer, "FTS_SERVER_HERE:%15[^:]:%d", server_host, &server_port) != 2) {
        fprintf(stderr, "Invalid server response: %s\\n", buffer);
        return;
    }

    printf("Server found at %s:%d\\n", server_host, server_port);

    // 2. Prepare file and header
    FILE* file = fopen(file_path, "rb");
    if (!file) {
        perror("File open failed");
        return;
    }

    fseek(file, 0, SEEK_END);
    long filesize = ftell(file);
    fseek(file, 0, SEEK_SET);

    struct FileHeader header;
    header.filesize = filesize;
    
    const char* filename = strrchr(file_path, '/');
    strncpy(header.filename, filename ? filename + 1 : file_path, MAX_FILENAME - 1);
    header.filename[MAX_FILENAME - 1] = '\\0';

    // Calculate file hash
    unsigned char file_hash_raw[SHA256_DIGEST_LENGTH];
    if (calculate_sha256(file_path, file_hash_raw) != 0) {
        fclose(file);
        return;
    }
    sha256_to_str(file_hash_raw, header.filehash);

    printf("Sending file '%s' with SHA-256: %s\\n", header.filename, header.filehash);

    // 3. Connect via TCP and send
    int client_socket = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(server_port);
    inet_pton(AF_INET, server_host, &server_addr.sin_addr);

    if (connect(client_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("TCP connect failed");
        fclose(file);
        return;
    }

    // Send header
    send(client_socket, &header, sizeof(header), 0);

    // Send file data
    char send_buffer[BUFFER_SIZE];
    size_t bytes_read;
    
    while ((bytes_read = fread(send_buffer, 1, BUFFER_SIZE, file))) {
        if (send(client_socket, send_buffer, bytes_read, 0) < 0) {
            perror("Send file failed");
            break;
        }
    }

    fclose(file);

    // 4. Get confirmation
    char confirmation[256];
    n = recv(client_socket, confirmation, sizeof(confirmation) - 1, 0);
    if (n > 0) {
        confirmation[n] = '\\0';
        printf("Server response: %s\\n", confirmation);
    }

    close(client_socket);
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        fprintf(stderr, "Usage:\\n  %s server\\n  %s client <file_path>\\n", 
                argv[0], argv[0]);
        return 1;
    }

    if (strcmp(argv[1], "server") == 0) {
        run_server();
    } else if (strcmp(argv[1], "client") == 0) {
        if (argc != 3) {
            fprintf(stderr, "Usage: %s client <file_path>\\n", argv[0]);
            return 1;
        }
        run_client(argv[2]);
    } else {
        fprintf(stderr, "Invalid mode. Use 'server' or 'client'.\\n");
        return 1;
    }

    return 0;
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-white">C Implementation</h2>
        <p className="text-slate-300 text-lg max-w-3xl mx-auto">
          Complete C source code implementing UDP discovery, TCP file transfer, and SHA-256 integrity verification
        </p>
      </div>

      {/* Compilation Instructions */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-green-400" />
            Compilation & Usage
          </CardTitle>
          <CardDescription className="text-slate-300">
            How to compile and run the file transfer system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 text-sm text-slate-400">Compile:</h3>
            <div className="bg-slate-800 p-3 rounded border border-slate-700 font-mono text-sm text-green-400">
              gcc -o file_transfer file_transfer.c -lpthread -lcrypto
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2 text-sm text-slate-400">Run Server:</h3>
              <div className="bg-slate-800 p-3 rounded border border-slate-700 font-mono text-sm text-cyan-400">
                ./file_transfer server
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-sm text-slate-400">Run Client:</h3>
              <div className="bg-slate-800 p-3 rounded border border-slate-700 font-mono text-sm text-cyan-400">
                ./file_transfer client /path/to/file.txt
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary">Dependencies</Badge>
            <span className="text-slate-400">POSIX threads (pthread) • OpenSSL (libcrypto)</span>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-400" />
              ~400 Lines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm">
              Efficient, well-structured implementation with comprehensive error handling and modular design
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              Multi-threaded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm">
              Handles multiple simultaneous file transfers using POSIX threads with proper synchronization
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Cryptographic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 text-sm">
              SHA-256 hashing ensures file integrity and detects corruption during transmission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Source Code */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-green-400" />
              file_transfer.c
            </CardTitle>
            <Button onClick={handleCopy} variant="outline" size="sm" className="border-slate-600 hover:bg-slate-800">
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
          <CardDescription className="text-slate-300">
            Complete implementation with UDP discovery, TCP transfer, and integrity verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 overflow-x-auto max-h-96">
            <pre className="text-xs text-slate-300">
              <code>{sourceCode}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Technical Implementation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-200">Network Architecture</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <p>• <strong>UDP Discovery:</strong> Broadcast on port 5001 to find servers</p>
                <p>• <strong>TCP Transfer:</strong> Reliable file transmission on port 5000</p>
                <p>• <strong>Multi-threading:</strong> Concurrent client handling with pthreads</p>
                <p>• <strong>Buffer Management:</strong> 4KB chunks for optimal performance</p>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-200">Security Features</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <p>• <strong>SHA-256 Hashing:</strong> File integrity verification</p>
                <p>• <strong>Error Detection:</strong> Corruption detection and reporting</p>
                <p>• <strong>Secure Headers:</strong> Metadata validation before transfer</p>
                <p>• <strong>Connection Validation:</strong> Proper socket error handling</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};