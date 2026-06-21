/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, Flame, CheckCircle, Clock, Sparkles, BookOpen, UtensilsCrossed } from 'lucide-react';

interface DailyNotificationsProps {
  notificationsEnabled: boolean;
  onToggleNotifications: (enabled: boolean) => void;
  onTriggerTestNotification: (dietFocus: string) => void;
}

export default function DailyNotifications({
  notificationsEnabled,
  onToggleNotifications,
  onTriggerTestNotification
}: DailyNotificationsProps) {
  const [notificationTime, setNotificationTime] = useState<string>('12:00');
  const [dietFocus, setDietFocus] = useState<string>('Tutto il Ricettario (Classico)');
  const [isTestTriggered, setIsTestTriggered] = useState<boolean>(false);

  const timesOptions = [
    { value: '09:00', label: 'Inspirazione Mattutina (9:00)', desc: 'Ideale per meditare sulla spesa' },
    { value: '12:00', label: 'Pranzo della Tradizione (12:00)', desc: 'Suggerimenti per primi piatti' },
    { value: '19:00', label: 'Cena Regionale (19:00)', desc: 'Secondi piatti e preparazioni a lungo stufato' }
  ];

  const categoriesOptions = [
    'Tutto il Ricettario (Classico)',
    'Primi Piatti Iconici (Pasta)',
    'Saporiti Dolci Regionali',
    'Specialità di Mare (Pesce)'
  ];

  const handleTriggerTest = () => {
    setIsTestTriggered(true);
    onTriggerTestNotification(dietFocus);
    setTimeout(() => {
      setIsTestTriggered(false);
    }, 4000);
  };

  return (    <div id="notifications-setup-view" className="h-full flex flex-col bg-sapori-cream text-neutral-800">
      
      {/* Header */}
      <div className="mx-4 mt-4 bg-sapori-green text-[#FAF9F6] p-5 rounded-3xl border border-sapori-green-light/25 shadow-sm text-center flex-shrink-0">
        <h2 className="font-serif font-bold text-xl flex items-center justify-center gap-2">
          <Bell className="w-5 h-5 text-sapori-red animate-bounce" />
          Servizio Notifiche
        </h2>
        <p className="text-[11px] text-sapori-cream-dark/80 mt-1 uppercase tracking-widest font-semibold">
          Ricette del Giorno • Notifiche Push
        </p>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4 pb-20">
        
        {/* Toggle Switch Card */}
        <div className="bg-white rounded-3xl border border-sapori-green-light/10 p-5 shadow-xs mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#1B3022]">Attiva Notifiche Regionali</h3>
              <p className="text-[10px] text-[#2D4F1E]/80 mt-1 max-w-xs leading-normal">
                Ricevi un avviso push giornaliero con una ricetta d'eccellenza tipica delle regioni d'Italia.
              </p>
            </div>
            
            {/* Elegant slider checkbox toggle styled properly */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                id="notification-permission-toggle"
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => onToggleNotifications(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2D4F1E]/15 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sapori-green"></div>
            </label>
          </div>

          {notificationsEnabled && (
            <div className="mt-3.5 pt-3.5 border-t border-dashed border-sapori-green-light/15 text-[10px] text-sapori-green-light font-bold flex items-center gap-1.5 bg-emerald-500/5 p-2 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Notifiche Giornaliere Attive sul Dispositivo
            </div>
          )}
        </div>

        {/* Configuration Sections (Visible only if enabled) */}
        {notificationsEnabled ? (
          <div className="space-y-4">
            
            {/* Preferred Delivery Hours */}
            <div className="bg-white rounded-3xl border border-sapori-green-light/10 p-5 shadow-xs">
              <h3 className="font-serif font-bold text-xs text-sapori-green uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sapori-red" />
                Orario Consigliato
              </h3>

              <div className="space-y-2">
                {timesOptions.map(timeItem => {
                  const isSelected = notificationTime === timeItem.value;
                  return (
                    <div
                      key={timeItem.value}
                      onClick={() => setNotificationTime(timeItem.value)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all select-none flex items-start justify-between
                        ${isSelected 
                          ? 'bg-sapori-red/5 border-sapori-red text-sapori-red font-bold' 
                          : 'bg-[#FAF9F6]/50 border-sapori-green-light/10 hover:border-sapori-green-light/20 text-neutral-700'
                        }
                      `}
                    >
                      <div>
                        <h4 className="text-xs font-bold">{timeItem.label}</h4>
                        <p className="text-[9px] text-[#2D4F1E]/70 mt-0.5 font-medium">{timeItem.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 flex-shrink-0
                        ${isSelected ? 'border-sapori-red bg-sapori-red text-white' : 'border-[#2D4F1E]/30'}`}>
                        {isSelected && <span className="text-[8px] font-bold">✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Culinary Category Selection */}
            <div className="bg-white rounded-3xl border border-sapori-green-light/10 p-5 shadow-xs">
              <h3 className="font-serif font-bold text-xs text-sapori-green uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-sapori-red" />
                Interesse Gastronomico
              </h3>
              
              <div className="grid grid-cols-1 gap-2">
                {categoriesOptions.map(category => {
                  const isSelected = dietFocus === category;
                  return (
                    <div
                      key={category}
                      onClick={() => setDietFocus(category)}
                      className={`p-3 px-3.5 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center justify-between select-none
                        ${isSelected 
                          ? 'bg-sapori-green/5 border-sapori-green text-[#1B3022]' 
                          : 'bg-white border-sapori-green-light/10 text-neutral-600 hover:bg-neutral-50'
                        }
                      `}
                    >
                      <span>{category}</span>
                      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0
                        ${isSelected ? 'border-sapori-green bg-sapori-green text-white' : 'border-[#2D4F1E]/30'}`}>
                        {isSelected && <span className="text-[7px] font-bold">✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test Simulation Panel */}
            <div className="bg-[#FDF0E5] rounded-3xl p-5 border border-sapori-red/15 text-center relative overflow-hidden shadow-xs">
              <div className="absolute top-0 right-0 w-12 h-12 bg-sapori-red/5 rounded-bl-full" />
              <Sparkles className="w-6 h-6 text-sapori-red mx-auto mb-2" />
              
              <h4 className="font-serif font-bold text-sm text-[#1B3022]">Simulatore di Notifiche</h4>
              <p className="text-[10px] text-[#2D4F1E]/80 max-w-xs mx-auto leading-normal mt-1.5 mb-4 font-medium">
                Vuoi testare subito la ricezione push? Clicca il pulsante qui sotto: il simulatore invierà una notifica pop-up in <strong>tempo reale</strong> abbinata alle tue preferenze correnti!
              </p>

              <button
                id="test-notification-simulate-btn"
                onClick={handleTriggerTest}
                disabled={isTestTriggered}
                className={`w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-all text-white
                  ${isTestTriggered 
                    ? 'bg-neutral-400 cursor-not-allowed' 
                    : 'bg-sapori-red hover:bg-sapori-red-light'
                  }
                `}
              >
                {isTestTriggered ? 'Generazione Notifica...' : 'Invia Notifica di Prova'}
              </button>
            </div>

          </div>
        ) : (
          // Disconnected Notification Block
          <div className="text-center py-12 px-6 mt-6 bg-white rounded-3xl border border-sapori-green-light/10 mx-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-neutral-400 mb-4">
              <UtensilsCrossed className="w-8 h-8 text-[#2D4F1E]/60" />
            </div>
            <h4 className="font-serif font-bold text-[#1B3022]">App Standby</h4>
            <p className="text-xs text-[#2D4F1E]/70 max-w-xs mx-auto mt-2 leading-relaxed font-medium">
              Attiva le notifiche regionali per sintonizzare il tuo ricettario quotidiano con i consigli d'eccellenza dello chef stellato.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
