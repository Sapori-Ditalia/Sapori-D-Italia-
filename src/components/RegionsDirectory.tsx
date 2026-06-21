/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RegionInfo, Recipe } from '../types';
import { regionsList } from '../data/recipes';
import { MapPin, Globe, ArrowLeft, ArrowUpRight, Clock, Star } from 'lucide-react';

interface RegionsDirectoryProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

type MacroTabs = 'Tutti' | 'Nord' | 'Centro' | 'Sud';

export default function RegionsDirectory({
  recipes,
  onSelectRecipe
}: RegionsDirectoryProps) {
  const [activeTab, setActiveTab] = useState<MacroTabs>('Tutti');
  const [selectedRegion, setSelectedRegion] = useState<RegionInfo | null>(null);

  // Filter list of regions by macroRegion
  const filteredRegions = regionsList.filter(region => {
    if (activeTab === 'Tutti') return true;
    return region.macroRegion === activeTab;
  });

  // Fetch the 4 recipes belonging to the chosen region
  const getRegionRecipes = (regionName: string) => {
    return recipes.filter(r => r.region === regionName);
  };

  const getFlagEmoji = (macro: string) => {
    switch (macro) {
      case 'Nord': return '🏔️';
      case 'Centro': return '🏛️';
      case 'Sud': return '🌋';
      default: return '🇮🇹';
    }
  };

  return (
    <div id="regions-directory-view" className="h-full flex flex-col bg-sapori-cream text-neutral-800">
      
      {!selectedRegion ? (
        // STATE A: Show full catalog of 20 regions grouped by Nord/Centro/Sud
        <>
          {/* Header */}
          <div className="mx-4 mt-4 bg-sapori-green text-[#FAF9F6] p-5 rounded-3xl border border-sapori-green-light/25 shadow-sm text-center flex-shrink-0">
            <h2 className="font-serif font-bold text-xl">Atlante delle Regioni</h2>
            <p className="text-[11px] text-sapori-cream-dark/80 mt-1 uppercase tracking-widest font-semibold">
              20 Regioni • Cucina d'Eccellenza
            </p>
          </div>

          {/* Macro-Region Segment Control Buttons */}
          <div className="px-4 mt-4 flex-shrink-0">
            <div className="bg-sapori-cream-dark p-1 rounded-2xl grid grid-cols-4 gap-1 border border-sapori-green-light/10">
              {(['Tutti', 'Nord', 'Centro', 'Sud'] as MacroTabs[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer
                    ${activeTab === tab
                      ? 'bg-sapori-green text-white shadow-sm'
                      : 'text-neutral-600 hover:bg-neutral-100'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List/Grid of regions */}
          <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4 pb-20">
            <div className="grid grid-cols-2 gap-3">
              {filteredRegions.map(region => {
                const regionalRecipesCount = getRegionRecipes(region.name).length;
                return (
                  <div
                    key={region.name}
                    id={`region-${region.name.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setSelectedRegion(region)}
                    className="group relative bg-white border border-sapori-green-light/10 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col h-44"
                  >
                    {/* Visual Background Cover Image */}
                    <div className="h-20 w-full relative">
                      <img 
                        referrerPolicy="no-referrer"
                        src={region.image} 
                        alt={region.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <span className="absolute bottom-2 left-2 text-xs font-serif font-bold text-white flex items-center gap-1">
                        <span>{getFlagEmoji(region.macroRegion)}</span>
                        {region.name}
                      </span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-[#2D4F1E]/80">
                          <span className="font-bold text-sapori-red">Capoluogo</span>
                          <span className="font-semibold text-[#1B3022]">{region.capital}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {region.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-dashed border-sapori-green-light/10 flex items-center justify-between text-[10px] font-bold text-sapori-green-light">
                        <span>{regionalRecipesCount} Ricette tipiche</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-sapori-red" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        // STATE B: Regional Specialization (deep dive into the region's recipes)
        <div className="h-full flex flex-col">
          {/* Header details with back action */}
          <div className="mx-4 mt-4 bg-sapori-green text-white p-6 rounded-3xl border border-sapori-green-light/25 relative overflow-hidden flex-shrink-0 shadow-sm">
            {/* Overlay background for richness */}
            <div className="absolute inset-0 z-0">
              <img 
                referrerPolicy="no-referrer"
                src={selectedRegion.image} 
                className="w-full h-full object-cover opacity-20 filter blur-xs font-semibold"
              />
            </div>

            <div className="relative z-10">
              <button
                id="back-regions-list"
                onClick={() => setSelectedRegion(null)}
                className="p-1 px-3 bg-[#FAF9F6]/15 hover:bg-[#FAF9F6]/25 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Regioni
              </button>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">{getFlagEmoji(selectedRegion.macroRegion)}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
                      Cucina del {selectedRegion.macroRegion}
                    </span>
                  </div>
                  <h2 className="font-serif font-bold text-2xl text-sapori-cream mt-1 leading-tight">
                    {selectedRegion.name}
                  </h2>
                </div>
                <div className="text-right text-[10px] font-semibold text-emerald-200">
                  <span>Capoluogo: </span>
                  <span className="block text-xs font-bold text-[#FAF9F6]">{selectedRegion.capital}</span>
                </div>
              </div>

              <p className="text-xs text-sapori-cream-dark/95 leading-relaxed mt-2.5 italic font-light">
                "{selectedRegion.description}"
              </p>
            </div>
          </div>

          {/* Regional Traditional Recipes list */}
          <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-4 pb-20">
            <h3 className="font-serif font-bold text-base text-sapori-green mb-3 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sapori-red" />
              Specialità autentiche della zona ({getRegionRecipes(selectedRegion.name).length})
            </h3>

            <div className="space-y-3.5">
              {getRegionRecipes(selectedRegion.name).map((recipe, index) => (
                <div
                  key={recipe.id}
                  id={`recipe-regional-${recipe.id}`}
                  onClick={() => onSelectRecipe(recipe)}
                  className="bg-white rounded-3xl border border-sapori-green-light/10 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex"
                >
                  <div className="w-28 h-28 relative flex-shrink-0">
                    <img 
                      referrerPolicy="no-referrer"
                      src={recipe.image} 
                      alt={recipe.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-sapori-red text-[#FAF9F6] text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="p-4 flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#1B3022] leading-snug line-clamp-1">
                        {recipe.name}
                      </h4>
                      <p className="text-[10px] text-[#2D4F1E]/80 line-clamp-2 mt-1 leading-normal font-medium">
                        {recipe.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-dashed border-sapori-green-light/10 flex items-center justify-between text-[9px] text-[#2D4F1E]/65">
                      <span className="flex items-center gap-1 font-bold text-sapori-green-light">
                        <Clock className="w-3 h-3" />
                        {recipe.prepTime}
                      </span>
                      <span className="bg-[#FAF9F6] text-sapori-green-light font-extrabold text-[8px] px-2 py-0.5 rounded-md border border-sapori-green-light/10">
                        {recipe.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
