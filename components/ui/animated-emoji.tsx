"use client";

import Image from "next/image";
import fluentEmojis from "@/lib/fluent-emojis.json";

interface AnimatedEmojiProps {
  emoji: string;
  className?: string;
  size?: number; // Optional size to override className dimensions
}

export function AnimatedEmoji({ emoji, className = "w-5 h-5", size }: AnimatedEmojiProps) {
  if (!emoji) return null;

  // Sometimes emojis come with variation selectors, remove it to match our map
  const cleanEmoji = emoji.replace('\uFE0F', '');
  
  // @ts-ignore - json indexing
  const url = fluentEmojis[emoji] || fluentEmojis[cleanEmoji];

  if (url) {
    if (size) {
      return (
        <Image
          src={url}
          alt={emoji}
          width={size}
          height={size}
          className={`object-contain ${className}`}
        />
      );
    }
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <Image
          src={url}
          alt={emoji}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 32px, 64px"
        />
      </div>
    );
  }

  // Fallback to native text emoji if not found in our mapping
  return <span className={`inline-flex items-center justify-center leading-none shrink-0 ${className}`}>{emoji}</span>;
}
