import React from 'react';
import { useCall } from '../../context/CallContext';
import {
  FaPhone,
  FaPhoneSlash,
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
  FaUserCircle,
} from 'react-icons/fa';

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const CallOverlay = () => {
  const {
    callState,
    callType,
    remoteUser,
    isMuted,
    isVideoOff,
    callDuration,
    attachLocalVideo,
    attachRemoteVideo,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  } = useCall();

  const isVideo = callType === 'video';
  const isActive = callState === 'active';
  const isIncoming = callState === 'incoming';
  const isRinging = callState === 'ringing';
  const isVisible = callState !== 'idle' && callState !== 'ended';
  const showVideoUI = isVideo && (isActive || isIncoming);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-4">
        {showVideoUI ? (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-6">
            <video
              ref={attachRemoteVideo}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!isVideoOff ? (
              <video
                ref={attachLocalVideo}
                autoPlay
                playsInline
                muted
                className="absolute bottom-4 right-4 w-32 h-24 rounded-lg object-cover border-2 border-white/30 shadow-lg"
              />
            ) : (
              <div className="absolute bottom-4 right-4 w-32 h-24 rounded-lg bg-sos-gray flex items-center justify-center border-2 border-white/30">
                <FaVideoSlash className="text-2xl text-gray-400" />
              </div>
            )}
          </div>
        ) : (
          <>
            <video ref={attachRemoteVideo} autoPlay playsInline className="hidden" />
            <video ref={attachLocalVideo} autoPlay playsInline muted className="hidden" />
          </>
        )}

        <div className="text-center mb-8">
          {!showVideoUI && (
            <FaUserCircle className="text-8xl text-gray-500 mx-auto mb-4" />
          )}

          <h2 className="text-2xl font-bold text-white mb-1">
            {remoteUser?.name || 'Unknown'}
          </h2>
          <p className="text-gray-400 text-sm">{remoteUser?.userId}</p>

          <p className="text-sos-red mt-3 text-lg">
            {isIncoming && `Incoming ${isVideo ? 'video' : 'voice'} call...`}
            {isRinging && 'Ringing...'}
            {isActive && formatDuration(callDuration)}
          </p>
        </div>

        <div className="flex justify-center items-center gap-4">
          {isActive && (
            <>
              <button
                type="button"
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${
                  isMuted
                    ? 'bg-red-500/30 text-red-400'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <FaMicrophoneSlash className="text-xl" />
                ) : (
                  <FaMicrophone className="text-xl" />
                )}
              </button>

              {isVideo && (
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    isVideoOff
                      ? 'bg-red-500/30 text-red-400'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                >
                  {isVideoOff ? (
                    <FaVideoSlash className="text-xl" />
                  ) : (
                    <FaVideo className="text-xl" />
                  )}
                </button>
              )}
            </>
          )}

          {isIncoming ? (
            <>
              <button
                type="button"
                onClick={acceptCall}
                className="p-5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                title="Accept"
              >
                <FaPhone className="text-2xl" />
              </button>
              <button
                type="button"
                onClick={rejectCall}
                className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                title="Decline"
              >
                <FaPhoneSlash className="text-2xl" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => endCall(true)}
              className="p-5 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
              title="End call"
            >
              <FaPhoneSlash className="text-2xl" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallOverlay;
