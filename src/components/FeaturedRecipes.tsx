/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { Search, Flame, Award, Clock, ArrowRight, Compass, Sparkles } from 'lucide-react';

interface FeaturedRecipesProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onNavigateToRegions: () => void;
  onAddGeneratedRecipe: (recipe: Recipe) => void;
}

export default function FeaturedRecipes({
  recipes,
  onSelectRecipe,
  onNavigateToRegions,
  onAddGeneratedRecipe
}: FeaturedRecipesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);

  // States to keep track of AI receipt synthesis
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [lastAttemptedSearch, setLastAttemptedSearch] = useState('');

  // Dictionary mapping Italian cities to regions
  const CITY_TO_REGION: Record<string, { city: string; region: string }> = {
    "roma": { city: "Roma", region: "Lazio" },
    "milano": { city: "Milano", region: "Lombardia" },
    "napoli": { city: "Napoli", region: "Campania" },
    "palermo": { city: "Palermo", region: "Sicilia" },
    "firenze": { city: "Firenze", region: "Toscana" },
    "bologna": { city: "Bologna", region: "Emilia-Romagna" },
    "venezia": { city: "Venezia", region: "Veneto" },
    "torino": { city: "Torino", region: "Piemonte" },
    "genova": { city: "Genova", region: "Liguria" },
    "bari": { city: "Bari", region: "Puglia" },
    "cagliari": { city: "Cagliari", region: "Sardegna" },
    "trento": { city: "Trento", region: "Trentino-Alto Adige" },
    "trieste": { city: "Trieste", region: "Friuli-Venezia Giulia" },
    "perugia": { city: "Perugia", region: "Umbria" },
    "ancona": { city: "Ancona", region: "Marche" },
    "potenza": { city: "Potenza", region: "Basilicata" },
    "catanzaro": { city: "Catanzaro", region: "Calabria" },
    "reggio calabria": { city: "Reggio Calabria", region: "Calabria" },
    "l'aquila": { city: "L'Aquila", region: "Abruzzo" },
    "aquila": { city: "L'Aquila", region: "Abruzzo" },
    "aosta": { city: "Aosta", region: "Valle d'Aosta" },
    "campobasso": { city: "Campobasso", region: "Molise" }
  };

  // Helper function to find a matched city from search term
  const getMatchedCity = (): { city: string; region: string } | null => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return null;
    for (const key of Object.keys(CITY_TO_REGION)) {
      if (normalizedSearch === key || normalizedSearch.includes(` ${key}`) || normalizedSearch.includes(`${key} `)) {
        return CITY_TO_REGION[key];
      }
    }
    return null;
  };

  const matchedCity = getMatchedCity();

  // Auto-generation effect when no recipe matches and user stops typing
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 3) {
      setIsGenerating(false);
      setGenerationError(null);
      return;
    }

    // Check if we have any matches in our current recipe state (including city map matches)
    const matchesSearch = recipes.some(r => {
      const normalizedSearch = searchTerm.trim().toLowerCase();
      
      // If a town coordinates to a region, check regional matching
      if (matchedCity) {
        if (r.region.toLowerCase() === matchedCity.region.toLowerCase()) {
          return true;
        }
      }

      const nameMatch = r.name.toLowerCase().includes(normalizedSearch);
      const regionMatch = r.region.toLowerCase().includes(normalizedSearch);
      const ingredientMatch = r.ingredients.some(ing => ing.toLowerCase().includes(normalizedSearch));
      return nameMatch || regionMatch || ingredientMatch;
    });

    if (matchesSearch) {
      setIsGenerating(false);
      setGenerationError(null);
      return;
    }

    // Do not re-trigger if we just failed or succeeded with this exact term
    if (searchTerm.trim().toLowerCase() === lastAttemptedSearch.toLowerCase()) {
      return;
    }

    // Debounce the call to avoid hitting the API with intermediate keystrokes
    const timer = setTimeout(async () => {
      setIsGenerating(true);
      setGenerationError(null);
      setLastAttemptedSearch(searchTerm.trim());

      try {
        const response = await fetch('/api/generate-recipe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dishName: searchTerm.trim() })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Impossibile generare la ricetta. Si prega di riprovare.");
        }

        const data: Recipe = await response.json();
        onAddGeneratedRecipe(data);
        onSelectRecipe(data);
      } catch (err: any) {
        setGenerationError(err.message || "Errore di connessione o timeout nella generazione.");
      } finally {
        setIsGenerating(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [searchTerm, recipes, lastAttemptedSearch, matchedCity]);

  // Determine dynamic greeting based on actual hour
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return 'Buongiorno';
    if (hours >= 12 && hours < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  const featured = recipes.filter(r => r.featured);
  
  // Filter other popular recipes based on search or selections
  const filteredPopular = recipes.filter(r => {
    let matchesSearch = false;
    const normalizedSearch = searchTerm.trim().toLowerCase();

    // Map city search directly to its region dishes
    if (matchedCity) {
      if (r.region.toLowerCase() === matchedCity.region.toLowerCase()) {
        matchesSearch = true;
      }
    }

    if (!matchesSearch) {
      const nameMatch = r.name.toLowerCase().includes(normalizedSearch);
      const regionMatch = r.region.toLowerCase().includes(normalizedSearch);
      const ingredientMatch = r.ingredients.some(ing => ing.toLowerCase().includes(normalizedSearch));
      matchesSearch = nameMatch || regionMatch || ingredientMatch;
    }

    const matchesDiff = activeDifficulty ? r.difficulty === activeDifficulty : true;
    return matchesSearch && matchesDiff;
  }).slice(0, 10);

  return (
    <div id="home-view-container" className="h-full flex flex-col bg-sapori-cream text-neutral-800">
      
      {/* Search & Hero Greeting Block */}
      <div className="mx-4 mt-4 bg-sapori-green text-white p-6 rounded-3xl border border-sapori-green-light/25 shadow-sm relative overflow-hidden flex-shrink-0">
        
        {/* Subtle circular background ornamentations for elegant vibe */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-sapori-red/10 rounded-full" />

        <div className="flex justify-between items-center relative z-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#FAF9F6]/85">Cucina Tradizionale</span>
            <h2 className="text-2xl font-serif font-bold text-sapori-cream mt-1">
              {getGreeting()}, <span className="text-sapori-red-light font-sans font-medium text-xl">Chef</span>! 🇮🇹
            </h2>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </div>
        </div>

        <p className="text-xs text-sapori-cream-dark/90 mt-2 relative z-10 font-light max-w-xs leading-relaxed">
          Esplora l'arte culinaria regionale d'Italia. Quale sapore delizioso desideri scoprire oggi?
        </p>

        {/* Beautiful Real-time Search Input */}
        <div className="mt-4.5 relative z-10">
          <input
            id="home-search-input"
            type="text"
            placeholder="Cerca ricette, regioni, ingredienti..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF9F6] text-[#1B3022] placeholder-[#2D4F1E]/55 rounded-2xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sapori-red transition-all shadow-xs border border-sapori-green-light/10"
          />
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* Main scrollable body */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-20">
        
        {searchTerm ? (
          // If Search Mode active
          <div className="mt-6 animate-fade-in">
            {matchedCity && (
              <div className="mb-4 bg-amber-50 border border-amber-200 text-stone-800 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-xs font-bold text-sapori-green">
                    Ricette tipiche di {matchedCity.city} ({matchedCity.region})
                  </p>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Abbiamo trovato le specialità gastronomiche tradizionali della regione di provenienza.
                  </p>
                </div>
              </div>
            )}
            <h3 className="font-serif font-bold text-lg text-sapori-green mb-3">
              Risultati della combinazione ({filteredPopular.length})
            </h3>
            {filteredPopular.length === 0 ? (
              isGenerating ? (
                /* Chef AI loader layout */
                <div className="text-center py-10 bg-white rounded-3xl border border-sapori-green-light/10 p-6 shadow-xs flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 relative mb-4">
                    <Sparkles className="w-8 h-8 animate-spin text-amber-500" />
                    <span className="absolute -top-1 -right-1 text-lg">🥣</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-sapori-green mt-1 text-center">
                    Lo Chef AI sta cucinando...
                  </h4>
                  <p className="text-xs text-stone-500 mt-2 max-w-xs leading-relaxed text-center font-medium">
                    Stiamo creando una ricetta regionale italiana originale e autentica per <strong>"{searchTerm}"</strong> usando Gemini API.
                  </p>
                  <div className="w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden mt-5 relative border border-gray-100">
                    <div className="bg-gradient-to-r from-sapori-red via-amber-500 to-emerald-500 h-full w-full rounded-full animate-pulse" />
                  </div>
                  <span className="text-[10px] text-gray-400 mt-3 uppercase tracking-widest font-bold">Invenzione gastronomica in corso</span>
                </div>
              ) : generationError ? (
                /* Error interface with retry capabilities */
                <div className="text-center py-10 bg-white rounded-3xl border border-sapori-green-light/10 p-6 shadow-xs">
                  <span className="text-2xl">⚠️</span>
                  <h4 className="font-serif font-bold text-sm text-sapori-red mt-2">Errore nella Generazione</h4>
                  <p className="text-xs text-stone-600 mt-2 max-w-xs mx-auto leading-relaxed">{generationError}</p>
                  <div className="flex gap-3 justify-center mt-6">
                    <button
                      onClick={() => {
                        setGenerationError(null);
                        setLastAttemptedSearch(''); // reset logic to allow instant retry
                      }}
                      className="py-2 px-4 bg-sapori-green text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer hover:bg-opacity-95"
                    >
                      Riprova
                    </button>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="py-2 px-4 bg-gray-100 text-[#1B3022] text-xs font-bold rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-200"
                    >
                      Annulla
                    </button>
                  </div>
                </div>
              ) : (
                /* Classic empty state transitioning into dynamic automatic AI load */
                <div className="text-center py-10 bg-white rounded-3xl border border-sapori-green-light/10 p-6 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mx-auto mb-3">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#1B3022]">Piatto non catalogato</h4>
                  <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-normal">
                    La ricetta per <strong>"{searchTerm}"</strong> non esiste nel ricettario originale.
                  </p>
                  <div className="mt-4 flex flex-col items-center justify-center gap-2">
                    <div className="text-[11px] font-bold text-[#A52A2A] bg-amber-50 border border-amber-200/50 py-1.5 px-3 rounded-lg flex items-center gap-1.5 animate-pulse">
                      <span>🥣</span>
                      <span>Attivando Chef AI di Gemini...</span>
                    </div>
                    <button
                      onClick={() => {
                        setLastAttemptedSearch(''); // Force manual trigger bypassing debounce
                      }}
                      className="mt-2 text-xs font-bold text-sapori-red hover:underline"
                    >
                      Crea ora in modalità immediata
                    </button>
                  </div>
                </div>
              )
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
                {filteredPopular.map(recipe => (
                  <div
                    key={recipe.id}
                    onClick={() => onSelectRecipe(recipe)}
                    className="bg-white rounded-3xl border border-sapori-green-light/10 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col relative"
                  >
                    <div className="h-28 w-full relative">
                      <img 
                        referrerPolicy="no-referrer"
                        src={recipe.image} 
                        alt={recipe.name} 
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/60 text-[9px] font-bold text-white px-2 py-0.5 rounded-md">
                        {recipe.region}
                      </span>
                      {recipe.isAiGenerated && (
                        <span className="absolute top-2 right-2 bg-amber-500/95 border border-amber-400 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                          ✨ AI
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <h4 className="font-bold text-xs text-[#1B3022] line-clamp-2 leading-tight">
                        {recipe.name}
                      </h4>
                      <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-dashed border-sapori-green-light/10 text-[9px] text-[#2D4F1E]/80">
                        <span className="font-bold text-sapori-red">{recipe.difficulty}</span>
                        <span>{recipe.prepTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Default Dashboard mode
          <>
            {/* Horizontal Featured slider */}
            <div className="mt-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-serif font-bold text-base text-sapori-green flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-sapori-red" />
                  Ricette Celebri In Evidenza
                </h3>
                <span className="text-[10px] text-sapori-red font-bold uppercase tracking-wider">Scelte con Cura</span>
              </div>

              {/* Horizontal scroll container */}
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 pt-1 -mx-4 px-4 snap-x">
                {featured.map(recipe => (
                  <div
                    key={recipe.id}
                    onClick={() => onSelectRecipe(recipe)}
                    className="w-11/12 xs:w-64 bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer snap-start flex-shrink-0 border border-sapori-green-light/10"
                  >
                    <div className="h-36 w-full relative">
                      <img 
                        referrerPolicy="no-referrer"
                        src={recipe.image} 
                        alt={recipe.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Flag Region Pill */}
                      <span className="absolute top-3 left-3 bg-[#FAF9F6] text-sapori-green text-[9px] font-bold px-2 py-1 rounded-md shadow-xs border border-sapori-green-light/15">
                        {recipe.region}
                      </span>

                      {/* Difficulty Label */}
                      <span className="absolute bottom-3 right-3 bg-sapori-red text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {recipe.difficulty}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-serif font-bold text-sm text-[#1B3022] line-clamp-1 leading-normal">
                        {recipe.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#2D4F1E]/80">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#2D4F1E]/60" />
                          <span>{recipe.prepTime}</span>
                        </div>
                        <div className="w-1 h-1 bg-[#2D4F1E]/30 rounded-full" />
                        <span className="font-semibold text-sapori-green-light">Origine {recipe.macroRegion}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Cooking Categories Pills */}
            <div className="mt-6 bg-sapori-cream-dark p-5 rounded-3xl border border-sapori-green-light/10 shadow-xs">
              <h4 className="text-xs font-bold text-[#A52A2A] uppercase tracking-widest mb-3">Filtro Rapido Difficoltà</h4>
              <div className="flex gap-2.5">
                {['Facile', 'Media', 'Difficile'].map(diff => (
                  <button
                    key={diff}
                    id={`filter-${diff}`}
                    onClick={() => setActiveDifficulty(activeDifficulty === diff ? null : diff)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer
                      ${activeDifficulty === diff
                        ? 'bg-sapori-red border-sapori-red text-white shadow-sm'
                        : 'bg-white border-sapori-green-light/15 text-neutral-600 hover:bg-neutral-50'
                      }
                    `}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* General Traditional Highlights List */}
            <div className="mt-6 mb-8">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-serif font-bold text-base text-sapori-green flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-sapori-red" />
                  Altre Specialità Nazionali
                </h3>
                <button
                  onClick={onNavigateToRegions}
                  className="text-xs font-bold text-sapori-red flex items-center gap-1 hover:underline"
                >
                  Tutte le Regioni
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Grid lists */}
              <div className="grid grid-cols-1 gap-3">
                {recipes.filter(r => !r.featured)
                  .filter(r => !activeDifficulty || r.difficulty === activeDifficulty)
                  .slice(0, 5).map(recipe => (
                    <div
                      key={recipe.id}
                      onClick={() => onSelectRecipe(recipe)}
                      className="bg-white rounded-2xl border border-sapori-green-light/10 p-3 flex items-center gap-3.5 cursor-pointer hover:shadow-md transition-all h-[92px]"
                    >
                      <img 
                        referrerPolicy="no-referrer"
                        src={recipe.image} 
                        alt={recipe.name} 
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-bold text-sapori-red block mb-0.5">
                          {recipe.region}
                        </span>
                        <h4 className="font-serif font-bold text-xs text-[#1B3022] truncate">
                          {recipe.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[#2D4F1E]/70 font-medium">
                          <span>{recipe.prepTime}</span>
                          <span className="text-stone-300">•</span>
                          <span>{recipe.difficulty}</span>
                        </div>
                      </div>
                      <ChevronRightArrow />
                    </div>
                ))}
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

// Minimal arrow component helper
function ChevronRightArrow() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
    </svg>
  );
}
