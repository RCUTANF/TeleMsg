import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
} from './ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';

interface IncomingCallDialogProps {
  open: boolean;
  onAnswer: () => void;
  onReject: () => void;
  callerName: string;
  callerAvatar: string;
  isVoiceOnly: boolean;
}

export function IncomingCallDialog({
  open,
  onAnswer,
  onReject,
  callerName,
  callerAvatar,
  isVoiceOnly
}: IncomingCallDialogProps) {
  const [isRinging, setIsRinging] = useState(false);

  useEffect(() => {
    if (open) {
      setIsRinging(true);
      // 播放铃声
      const audio = new Audio('/ringtone.mp3');
      audio.loop = true;
      audio.play().catch(err => console.log('Cannot play ringtone:', err));

      return () => {
        audio.pause();
        audio.currentTime = 0;
        setIsRinging(false);
      };
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onReject()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="relative p-8 text-center">
          {/* 来电动画背景 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute inset-0 bg-white/10 rounded-full blur-3xl ${isRinging ? 'animate-ping' : ''}`}></div>
          </div>

          {/* 来电信息 */}
          <div className="relative z-10">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                {isVoiceOnly ? (
                  <>
                    <Mic className="h-4 w-4" />
                    <span>语音来电</span>
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    <span>视频来电</span>
                  </>
                )}
              </div>
            </div>

            <Avatar className="h-32 w-32 mx-auto mb-6 ring-8 ring-white/30 shadow-2xl">
              <AvatarImage src={callerAvatar} alt={callerName} />
              <AvatarFallback className="text-5xl bg-white/20 text-white">
                {callerName[0]}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-3xl font-bold text-white mb-2">{callerName}</h2>
            <p className="text-blue-100 text-lg mb-8">
              {isRinging ? '正在呼叫您...' : '来电'}
            </p>

            {/* 操作按钮 */}
            <div className="flex items-center justify-center gap-8">
              {/* 拒绝按钮 */}
              <div className="text-center">
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-2xl"
                  onClick={onReject}
                >
                  <PhoneOff className="h-8 w-8" />
                </Button>
                <p className="text-white text-sm mt-2">拒绝</p>
              </div>

              {/* 接听按钮 */}
              <div className="text-center">
                <Button
                  size="icon"
                  className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-2xl animate-pulse"
                  onClick={onAnswer}
                >
                  <Phone className="h-8 w-8" />
                </Button>
                <p className="text-white text-sm mt-2">接听</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

