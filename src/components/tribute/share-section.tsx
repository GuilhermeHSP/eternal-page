'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareSectionProps {
  slug: string;
  title: string;
  accentColor: string;
}

export function ShareSection({ slug, title, accentColor }: ShareSectionProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // The full address is only known in the browser; set it after hydration so server and
  // client render the same markup first.
  const [shareUrl, setShareUrl] = useState(`/${slug}`);
  useEffect(() => {
    setShareUrl(`${window.location.origin}/${slug}`);
  }, [slug]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowMenu(!showMenu);
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`${title} - Created with EternalPage`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${title}\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-md mx-auto text-center">
        <h3 className="text-xl font-serif text-gray-800 mb-2">
          Compartilhe esta homenagem
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          Envie esta página para alguém especial
        </p>

        {/* URL display */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-6">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 bg-transparent text-sm text-gray-600 font-mono outline-none truncate"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="shrink-0"
            style={{ color: accentColor }}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Share buttons */}
        <div className="flex items-center justify-center gap-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleNativeShare}
              className="gap-2"
              style={{ backgroundColor: accentColor }}
            >
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={shareToTwitter}
              className="rounded-full"
            >
              <Twitter className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={shareToFacebook}
              className="rounded-full"
            >
              <Facebook className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="icon"
              onClick={shareToWhatsApp}
              className="rounded-full"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Fixed share button for tribute pages
interface FixedShareButtonProps {
  accentColor: string;
  onShare: () => void;
}

export function FixedShareButton({ accentColor, onShare }: FixedShareButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.3 }}
      onClick={onShare}
      className="fixed top-4 right-4 z-50 p-3 rounded-full shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white transition-colors"
      style={{ color: accentColor }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <Share2 className="h-5 w-5" />
    </motion.button>
  );
}
