'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface ReconnectOverlayProps {
  isVisible: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected';
  onReconnect: () => void;
  isReconnecting?: boolean;
}

export function ReconnectOverlay({ 
  isVisible, 
  connectionState, 
  onReconnect, 
  isReconnecting = false 
}: ReconnectOverlayProps) {
  if (!isVisible) return null;

  const getConnectionInfo = () => {
    switch (connectionState) {
      case 'disconnected':
        return {
          icon: <WifiOff className="w-8 h-8 text-red-500" />,
          title: 'Connection Lost',
          description: 'You have been disconnected from the game server.',
          action: 'Reconnect',
          variant: 'destructive' as const,
        };
      case 'connecting':
        return {
          icon: <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" />,
          title: 'Reconnecting...',
          description: 'Attempting to reconnect to the game server.',
          action: 'Cancel',
          variant: 'secondary' as const,
        };
      default:
        return null;
    }
  };

  const connectionInfo = getConnectionInfo();
  if (!connectionInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {connectionInfo.icon}
          </div>
          <CardTitle>{connectionInfo.title}</CardTitle>
          <CardDescription>{connectionInfo.description}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={onReconnect}
            variant={connectionState === 'connecting' ? 'secondary' : 'default'}
            disabled={isReconnecting}
            className="w-full"
          >
            {isReconnecting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Reconnecting...
              </>
            ) : (
              connectionInfo.action
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
