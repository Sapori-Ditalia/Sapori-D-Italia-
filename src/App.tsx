/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import FeaturedRecipes from './components/FeaturedRecipes';
import RegionsDirectory from './components/RegionsDirectory';
import MyFavorites from './components/MyFavorites';
import DailyNotifications from './components/DailyNotifications';
import RecipeDetailModal from './components/RecipeDetailModal';
import NotificationToast from './components/NotificationToast';
import { recipesList } from './data/recipes';
import { Recipe } from './types';
import { Compass, Globe, Heart, Bell, Share2, Flame, ChefHat, Check } from 'lucide-react';

type AppTab = 'home' | 'regions' | 'favorites' | 'notifications';

export default function App() {
  // Navigation & Screen Configuration State
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [osMode, setOsMode] = useState<'ios' | 'android'>('android');

  // Dynamic lists of all recipes (traditional + generated) and favorites
  const [recipes, setRecipes] = useState<Recipe[]>(recipesList);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);

  // Simulated Push Notification Banner States
  const [toastShow, setToastShow] = useState<boolean>(false);
  const [toastTitle, setToastTitle] = useState<string>('');
  const [toastBody, setToastBody] = useState<string>('');
  const [toastRecipeId, setToastRecipeId] = useState<string | undefined>(undefined);

  // Sharing Feedback alert states
  const [shareFeedbackMsg, setShareFeedbackMsg] = useState<string | null>(null);

  // Initialize and Sync localStorage values on component load safely
  useEffect(() => {
    try {
      // 1. Gather all dynamic AI generated recipes from LocalStorage
      let loadedRecipes = [...recipesList];
      const storedAiStr = localStorage.getItem('sapori_ai_generated_recipes');
      if (storedAiStr) {
        const aiRecipes = JSON.parse(storedAiStr) as Recipe[];
        loadedRecipes = [...recipesList, ...aiRecipes];
        setRecipes(loadedRecipes);
      }

      // 2. Load favorites
      const storedFavoritesStr = localStorage.getItem('sapori_favorites');
      if (storedFavoritesStr) {
        const storedIds = JSON.parse(storedFavoritesStr) as string[];
        const matchingRecipes = loadedRecipes.filter(r => storedIds.includes(r.id));
        setFavorites(matchingRecipes);
      } else {
        // Seed default favorites (e.g. Carbonara and Margherita) on initial load for instant excitement
        const seedRecipes = loadedRecipes.filter(r => r.id === 'laz-1' || r.id === 'cam-1');
        setFavorites(seedRecipes);
        localStorage.setItem('sapori_favorites', JSON.stringify(seedRecipes.map(r => r.id)));
      }

      const storedNotifPerm = localStorage.getItem('sapori_notifications_enabled');
      if (storedNotifPerm !== null) {
        setNotificationsEnabled(storedNotifPerm === 'true');
      }
    } catch (e) {
      console.warn('LocalStorage not readable in current sandboxed frame', e);
    }
  }, []);

  // Save generated recipe to cache and append to main list
  const handleAddGeneratedRecipe = (newRecipe: Recipe) => {
    setRecipes(prev => {
      // Avoid duplicate ID insertions
      if (prev.some(r => r.id === newRecipe.id)) return prev;
      const updated = [...prev, newRecipe];
      try {
        const aiOnly = updated.filter(r => r.isAiGenerated);
        localStorage.setItem('sapori_ai_generated_recipes', JSON.stringify(aiOnly));
      } catch (e) {
        console.warn('LocalStorage error writing generated recipe', e);
      }
      return updated;
    });
  };

  // Update favorites list and save to persistent localStorage
  const handleToggleFavorite = (recipe: Recipe) => {
    const isAlreadyFav = favorites.some(r => r.id === recipe.id);
    let updated: Recipe[] = [];
    if (isAlreadyFav) {
      updated = favorites.filter(r => r.id !== recipe.id);
    } else {
      updated = [...favorites, recipe];
    }
    
    setFavorites(updated);
    try {
      localStorage.setItem('sapori_favorites', JSON.stringify(updated.map(r => r.id)));
    } catch (e) {
      console.warn(e);
    }
  };

  // Toggle notification permissions and store preferences
  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    try {
      localStorage.setItem('sapori_notifications_enabled', String(enabled));
    } catch (e) {
      console.warn(e);
    }
  };

  // Trigger test notification based on culinary preferences
  const handleTriggerTestNotification = (dietFocus: string) => {
    // Pick active category matching recipes
    let candidates = recipesList;
    if (dietFocus.includes('Pasta')) {
      candidates = recipesList.filter(r => r.ingredients.some(ing => ing.toLowerCase().includes('pasta') || ing.toLowerCase().includes('spaghetti') || ing.toLowerCase().includes('bucatini') || ing.toLowerCase().includes('orecchiette') || ing.toLowerCase().includes('strangozzi') || ing.toLowerCase().includes('maccheroncini')));
    } else if (dietFocus.includes('Dolci')) {
      candidates = recipesList.filter(r => r.id.endsWith('-4') || r.name.toLowerCase().includes('cannoli') || r.name.toLowerCase().includes('seadas') || r.name.toLowerCase().includes('tiramisù') || r.name.toLowerCase().includes('tegole'));
    } else if (dietFocus.includes('Mare') || dietFocus.includes('Pesce')) {
      candidates = recipesList.filter(r => r.ingredients.some(ing => ing.toLowerCase().includes('pesce') || ing.toLowerCase().includes('sarde') || ing.toLowerCase().includes('scoglio') || ing.toLowerCase().includes('cozze') || ing.toLowerCase().includes('vongole') || ing.toLowerCase().includes('stoccafisso')));
    }

    if (candidates.length === 0) candidates = recipesList;

    // Pick a random recipe for the push alert
    const randomIdx = Math.floor(Math.random() * candidates.length);
    const chosenRecipe = candidates[randomIdx];

    // Trigger toast configurations with beautiful messages
    setToastRecipeId(chosenRecipe.id);
    setToastTitle('💡 Consiglio dello Chef d’Oggi');
    setToastBody(`Che ne dici di preparare dei buonissimi "${chosenRecipe.name}"? Clicca qui per scoprire gli ingredienti tipici d'Abruzzo, Liguria o Sicilia.`);
    
    // Slight delay to simulate natural satellite routing lag
    setTimeout(() => {
      setToastShow(true);
    }, 1200);
  };

  // Simulated sharing action sheet copy to clipboard
  const handleShareRecipe = (recipe: Recipe) => {
    const shareText = `🍳 Sto preparando "${recipe.name}" con Sapori d'Italia! Una squisita ricetta tradizionale della regione ${recipe.region}. Tempo: ${recipe.prepTime}, Difficoltà: ${recipe.difficulty}.`;
    
    try {
      navigator.clipboard.writeText(shareText);
    } catch (e) {
      // Fallback
    }

    setShareFeedbackMsg(`Link di "${recipe.name}" copiato negli appunti! Condividilo con i tuoi contatti iOS o Android.`);
    setTimeout(() => {
      setShareFeedbackMsg(null);
    }, 4500);
  };

  const activeRecipeIsFavorite = selectedRecipe ? favorites.some(r => r.id === selectedRecipe.id) : false;

  const handleViewRecipeFromNotification = (id: string) => {
    const match = recipes.find(r => r.id === id);
    if (match) {
      setSelectedRecipe(match);
    }
  };

  return (
    <div className="h-screen w-full bg-[#FAF9F6] text-neutral-800 font-sans antialiased flex flex-col items-center justify-start overflow-hidden">
      <div className="w-full max-w-md h-full bg-sapori-cream flex flex-col shadow-xl relative md:border-x md:border-sapori-green-light/10 overflow-hidden">
      
      {/* PERSISTENT HEADER ELEMENT FOR APP IDENTITY */}
      <header className="h-14 bg-sapori-green px-4 flex items-center justify-between border-b border-sapori-green shadow-xs relative z-20 flex-shrink-0 text-white font-sans">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sapori-red rounded-lg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-extrabold text-base tracking-tight text-sapori-cream select-none">
            Sapori d'Italia
          </span>
        </div>
        
        {/* Quick regional flag visual stamp */}
        <div className="flex items-center gap-1 bg-white/10 rounded-full py-1 px-3 border border-white/15">
          <span className="text-[10px] font-bold text-sapori-cream-dark uppercase tracking-wider">
            Tradizione
          </span>
          <div className="flex gap-0.5 ml-1.5 h-2.5 w-4 rounded-xs overflow-hidden border border-black/10">
            <div className="bg-emerald-600 w-1/3 h-full" />
            <div className="bg-white w-1/3 h-full" />
            <div className="bg-red-600 w-1/3 h-full" />
          </div>
        </div>
      </header>

      {/* RENDER VIEW ACCORDING TO ACTIVE APP TAB STATE */}
      <div className="flex-1 bg-sapori-cream relative overflow-hidden">
        
        {/* Toast for push notification alert simulation */}
        <NotificationToast
          show={toastShow}
          onClose={() => setToastShow(false)}
          title={toastTitle}
          body={toastBody}
          recipeId={toastRecipeId}
          onViewRecipe={handleViewRecipeFromNotification}
          osMode={osMode}
        />

        {/* Global Share Status Overlay inside the viewport */}
        {shareFeedbackMsg && (
          <div className="absolute top-16 left-4 right-4 bg-emerald-900 border border-emerald-700 text-white text-xs p-3.5 rounded-xl z-50 flex items-start gap-2.5 shadow-xl animate-bounce">
            <Check className="w-5 h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{shareFeedbackMsg}</span>
          </div>
        )}

        {/* Tab Routers */}
        {activeTab === 'home' && (
          <FeaturedRecipes
            recipes={recipes}
            onSelectRecipe={setSelectedRecipe}
            onNavigateToRegions={() => setActiveTab('regions')}
            onAddGeneratedRecipe={handleAddGeneratedRecipe}
          />
        )}

        {activeTab === 'regions' && (
          <RegionsDirectory
            recipes={recipes}
            onSelectRecipe={setSelectedRecipe}
          />
        )}

        {activeTab === 'favorites' && (
          <MyFavorites
            favorites={favorites}
            onSelectRecipe={setSelectedRecipe}
            onNavigateToHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'notifications' && (
          <DailyNotifications
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={handleToggleNotifications}
            onTriggerTestNotification={handleTriggerTestNotification}
          />
        )}
      </div>

      {/* PERSISTENT TAB CONTROLLER BOTTOM NAVIGATION TRAY */}
      <nav className="h-16 w-full bg-white border-t border-gray-100 flex items-center justify-around px-2 py-1 flex-shrink-0 relative z-30 font-sans shadow-lg shadow-neutral-900">
        
        <button
          id="tab-home-btn"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition-colors
            ${activeTab === 'home' ? 'text-sapori-red' : 'text-neutral-400 hover:text-neutral-600'}
          `}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-wider">Scopri</span>
        </button>

        <button
          id="tab-regions-btn"
          onClick={() => setActiveTab('regions')}
          className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition-colors
            ${activeTab === 'regions' ? 'text-sapori-red' : 'text-neutral-400 hover:text-neutral-600'}
          `}
        >
          <Globe className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-1 tracking-wider">Regioni</span>
        </button>

        <button
          id="tab-favorites-btn"
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition-colors
            ${activeTab === 'favorites' ? 'text-sapori-red' : 'text-neutral-400 hover:text-neutral-600'}
          `}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${activeTab === 'favorites' && favorites.length > 0 ? 'fill-current' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-sapori-red text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-wider">Salvati</span>
        </button>

        <button
          id="tab-notifications-btn"
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center justify-center w-16 py-1 cursor-pointer transition-colors
            ${activeTab === 'notifications' ? 'text-sapori-red' : 'text-neutral-400 hover:text-neutral-600'}
          `}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {notificationsEnabled && (
              <span className="absolute top-0 right-0 bg-emerald-600 ring-2 ring-white h-2 w-2 rounded-full" />
            )}
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-wider">Notifiche</span>
        </button>

      </nav>

      {/* FULL-SCREEN RECIPE DRILL SHEETS DISPLAY */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isFavorite={activeRecipeIsFavorite}
          onToggleFavorite={handleToggleFavorite}
          onShare={handleShareRecipe}
        />
      )}

      </div>
    </div>
  );
}
