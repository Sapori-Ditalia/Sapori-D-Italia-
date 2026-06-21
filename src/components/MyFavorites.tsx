/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Recipe } from '../types';
import { Heart, Search, Utensils, Award, Clock, ArrowRight } from 'lucide-react';

interface MyFavoritesProps {
  favorites: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onNavigateToHome: () => void;
}

export default function MyFavorites({
  favorites,
  onSelectRecipe,
  onNavigateToHome
}: MyFavoritesProps) {
  return (
    <div id="favorites-view" className="h-full flex flex-col bg-sapori-cream text-neutral-800">
      
      {/* Header */}
      <div className="mx-4 mt-4 bg-sapori-green text-[#FAF9F6] p-5 rounded-3xl border border-sapori-green-light/25 shadow-sm text-center flex-shrink-0">
        <h2 className="font-serif font-bold text-xl flex items-center justify-center gap-2">
          <Heart className="w-5 h-5 fill-sapori-red text-sapori-red animate-pulse" />
          Ricette Preferite
        </h2>
        <p className="text-[11px] text-sapori-cream-dark/80 mt-1 uppercase tracking-widest font-semibold">
          Il tuo ricettario personale d'eccellenza
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4 pb-20">
        
        {favorites.length === 0 ? (
          // Empty State view
          <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-white rounded-3xl border border-sapori-green-light/10 mt-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-sapori-red mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-serif font-bold text-base text-sapori-green">Nessuna ricetta salvata</h3>
            <p className="text-xs text-gray-500 mt-2 max-w-xs leading-normal">
              Non hai ancora aggiunto ricette ai tuoi preferiti. Premi l'icona del cuore <Heart className="w-3.5 h-3.5 inline text-sapori-red" /> presente su qualsiasi ricetta tradizionale per conservarla qui!
            </p>
            <button
              id="empty-fav-discover-btn"
              onClick={onNavigateToHome}
              className="mt-6 py-2.5 px-6 bg-sapori-red text-white text-xs font-bold rounded-xl shadow-xs hover:bg-sapori-red-light transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              Scopri le ricette della Tradizione
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          // Grid collection of favorited food items
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs text-stone-500 uppercase tracking-widest font-bold">Tutti i Salvati</span>
              <span className="text-xs bg-sapori-red/10 text-sapori-red px-2.5 py-0.5 rounded-full font-extrabold">
                {favorites.length} {favorites.length === 1 ? 'Ricetta' : 'Ricette'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {favorites.map(recipe => (
                <div
                   key={recipe.id}
                   id={`favorite-card-${recipe.id}`}
                   onClick={() => onSelectRecipe(recipe)}
                   className="bg-white rounded-3xl border border-sapori-green-light/10 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="h-28 w-full relative">
                    <img 
                      referrerPolicy="no-referrer"
                      src={recipe.image} 
                      alt={recipe.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    
                    {/* Region badge */}
                    <span className="absolute bottom-2 left-2 bg-black/60 text-[9px] font-bold text-white px-2 py-0.5 rounded">
                      {recipe.region}
                    </span>

                    {recipe.isAiGenerated && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                        ✨ AI
                      </span>
                    )}

                    {/* Sweet heart stamp on the top right */}
                    <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#FAF9F6] flex items-center justify-center text-sapori-red shadow-xs">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-xs text-[#1B3022] line-clamp-2 leading-tight">
                        {recipe.name}
                      </h4>
                    </div>

                    <div className="pt-2 mt-2 border-t border-dashed border-sapori-green-light/10 flex items-center justify-between text-[10px] text-[#2D4F1E]/80 font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#2D4F1E]/50" />
                        {recipe.prepTime}
                      </span>
                      <span className="text-sapori-red font-bold">{recipe.difficulty}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick cook inspiration tip */}
            <div className="bg-[#FDF0E5] border border-sapori-green-light/10 rounded-3xl p-4.5 flex gap-3.5 mt-6 items-start shadow-xs">
              <div className="p-2.5 bg-sapori-green rounded-xl text-white">
                <Utensils className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h5 className="text-xs font-bold text-sapori-green uppercase tracking-wider">Pronto in Cucina</h5>
                <p className="text-[11px] text-[#2D4F1E]/80 mt-1 leading-relaxed font-medium">
                  Puoi sintonizzare le dosi degli ingredienti digitando il numero ideale di ospiti direttamente nel dettaglio ricetta. Buon lavoro!
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
