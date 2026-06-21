/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Flame, X } from 'lucide-react';

interface NotificationToastProps {
  show: boolean;
  onClose: () => void;
  title: string;
  body: string;
  recipeId?: string;
  onViewRecipe?: (id: string) => void;
  osMode: 'ios' | 'android';
}

export default function NotificationToast({
  show,
  onClose,
  title,
  body,
  recipeId,
  onViewRecipe,
  osMode
}: NotificationToastProps) {
  // Auto-dismiss after 6.5 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const isIOS = osMode === 'ios';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="notification-toast-container"
          initial={{ opacity: 0, y: -80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          style={{ position: 'absolute' }}
          className={`top-4 left-4 right-4 z-50 pointer-events-auto cursor-pointer select-none
            ${isIOS 
              ? 'bg-neutral-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/10' 
              : 'bg-emerald-950 text-white rounded-xl p-4 shadow-lg border border-emerald-800'
            }
          `}
          onClick={() => {
            if (recipeId && onViewRecipe) {
              onViewRecipe(recipeId);
            }
            onClose();
          }}
        >
          <div className="flex items-start gap-3">
            {/* App Icon Circle */}
            <div className={`p-2 rounded-xl flex-shrink-0 flex items-center justify-center
              ${isIOS ? 'bg-sapori-red' : 'bg-sapori-green'}`}
            >
              <Bell className="w-4 h-4 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className={`font-semibold text-xs tracking-wide uppercase
                  ${isIOS ? 'text-sapori-cream-dark' : 'text-emerald-300'}`}>
                  {isIOS ? 'Sapori d’Italia • Ora' : 'Sapori d’Italia'}
                </span>
                <button
                  id="close-toast-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-white/60" />
                </button>
              </div>
              <h4 className="font-bold text-sm text-white mt-1 leading-snug">{title}</h4>
              <p className="text-xs text-white/85 mt-0.5 leading-normal line-clamp-2">{body}</p>
              
              {recipeId && (
                <div className="mt-2 text-[10px] font-semibold text-sapori-red-light bg-white/10 py-1 px-2.5 rounded-full inline-flex items-center gap-1">
                  <Flame className="w-3 h-3 anim-pulse" />
                  Premi per scoprire la ricetta d'oggi
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
