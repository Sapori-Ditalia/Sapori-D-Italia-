/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Recipe } from '../types';
import { 
  X, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Users, 
  Plus, 
  Minus, 
  Heart, 
  Share2, 
  Check, 
  CheckSquare, 
  Square,
  BookOpen,
  Info,
  Timer,
  Activity,
  Wine,
  Sparkles,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface ChefTip {
  title: string;
  description: string;
}

const CATEGORY_TIPS: Record<'pasta' | 'pizza' | 'carne' | 'pesce' | 'dolci' | 'risotto', ChefTip[]> = {
  pasta: [
    { title: "Acqua e sale", description: "Usa 1 litro d'acqua ogni 100g di pasta e aggiungi il sale grosso solo quando l'acqua bolle a pieno regime." },
    { title: "Cottura al dente", description: "Scola la pasta 1 o 2 minuti prima del tempo indicato; finirà di cuocere direttamente saltandola in padella con il sugo." },
    { title: "Acqua di cottura magica", description: "Conserva sempre una tazza di acqua di cottura della pasta: l'amido rilasciato aiuterà a creare un'emulsione cremosa con il condimento." }
  ],
  pizza: [
    { title: "Temperatura del forno", description: "Preriscalda il forno al massimo della sua temperatura (almeno 250°C) per non meno di 30 minuti prima di infornare la pizza." },
    { title: "Teglia sfrigolante", description: "Disponi la teglia o la pietra refrattaria nella parte più bassa del forno così che la base della pizza diventi croccante velocemente." },
    { title: "Mozzarella asciutta", description: "Taglia la mozzarella a dadini e lasciala scolare in un colino per un'ora, in modo che non rilasci troppa umidità bagnando l'impasto." }
  ],
  carne: [
    { title: "Temperatura ambiente", description: "Togli la carne dal frigorifero almeno 30-40 minuti prima di cuocerla per evitare uno shock termico che la indurirebbe." },
    { title: "Riposo post-cottura", description: "Fai riposare la carne cotta (specie bistecche e arrosti) per 5-10 minuti coperta con alluminio prima di tagliarla, così i succhi si ridistribuiranno." },
    { title: "Asciugare prima di cuocere", description: "Tampona accuratamente la carne con carta assorbente: la superficie deve essere ben asciutta affinché si formi una crosticina saporita." }
  ],
  pesce: [
    { title: "Cottura delicatissima", description: "Il pesce richiede calore gentile. Temperature troppo elevate rompono le fibre e lo rendono subito secco e stopposo." },
    { title: "Lato della pelle", description: "Se presenti filetti con pelle, inizia la cottura appoggiando questo lato sulla padella rovente per proteggere la polpa e mantenerla umida." },
    { title: "Il test dello stecchino", description: "Il pesce è pronto quando inserendo uno stecchino nella parte più spessa questo penetra facilmente e la carne si sfoglia con una forchetta." }
  ],
  dolci: [
    { title: "Temperatura degli ingredienti", description: "Burro, uova e latte devono essere rigorosamente a temperatura ambiente prima dell'impasto per legarsi alla perfezione." },
    { title: "Polveri setacciate", description: "Setaccia sempre farina, lievito e cacao prima di unirli ai liquidi per evitare fastidiosi grumi e incorporare aria utile alla lievitazione." },
    { title: "Non aprire il forno", description: "Non aprire mai lo sportello del forno durante la prima metà della cottura dei dolci lievitati, altrimenti lo sbalzo di temperatura li farà sgonfiare." }
  ],
  risotto: [
    { title: "Tostatura a secco", description: "Tosta i chicchi di riso a secco senza grassi aggiunti per 2-3 minuti fino a quando diventano semitrasparenti e bollenti al tatto." },
    { title: "Brodo sempre bollente", description: "Tieni il brodo bollente su un fuoco minimo a lato: bagnare il riso con brodo tiepido blocca la cottura e compromette la mantecatura." },
    { title: "La mantecatura all'onda", description: "Spegni il fuoco, aggiungi burro congelato a cubetti e parmigiano grattugiato. Copri per 1 minuto, poi mescola energicamente per montare la crema." }
  ]
};

function getRecipeCategory(recipe: Recipe): 'pasta' | 'pizza' | 'carne' | 'pesce' | 'dolci' | 'risotto' {
  const name = recipe.name.toLowerCase();
  const desc = recipe.description.toLowerCase();
  const id = recipe.id.toLowerCase();
  const ingredientsJoined = recipe.ingredients.join(' ').toLowerCase();

  // 1. Dolci / Dessert
  if (
    name.includes('tiramisù') || name.includes('cannol') || name.includes('cantucc') || name.includes('torta') ||
    name.includes('crostata') || name.includes('biscott') || name.includes('dolce') || name.includes('dolci') ||
    name.includes('strudel') || name.includes('seadas') || name.includes('gubana') || name.includes('rocciat') ||
    name.includes('bonet') || name.includes('tegole') || name.includes('baba') || name.includes('crema') || name.includes('panna cotta') ||
    (id.endsWith('-4') && !name.includes('pansoti') && !name.includes('spätzle') && !name.includes('pasta'))
  ) {
    return 'dolci';
  }

  // 2. Risotto / Riso / Polenta / Frico
  if (
    name.includes('risotto') || name.includes('risi e bisi') || name.includes('riso') || name.includes('sartù') ||
    name.includes('polenta') || name.includes('frico')
  ) {
    return 'risotto';
  }

  // 3. Pesce / Mare / Acciughe
  if (
    name.includes('pesce') || name.includes('mare') || name.includes('sarde') || name.includes('baccalà') ||
    name.includes('cozze') || name.includes('vongole') || name.includes('stoccafisso') || name.includes('brandacujun') ||
    name.includes('brodetto') || name.includes('cacciucco') || name.includes('scorfano') || name.includes('triglia') ||
    name.includes('tonno') || name.includes('polpo') || name.includes('acciug') || name.includes('alici') ||
    ingredientsJoined.includes('pesce') || ingredientsJoined.includes('sarde') || ingredientsJoined.includes('stoccafisso') ||
    ingredientsJoined.includes('vongole') || ingredientsJoined.includes('cozze') || ingredientsJoined.includes('acciughe')
  ) {
    return 'pesce';
  }

  // 4. Pizza / Focaccia / Piadina
  if (
    name.includes('pizza') || name.includes('focaccia') || name.includes('piadina') || 
    name.includes('sfincione') || name.includes('pane') || name.includes('schiacciata')
  ) {
    return 'pizza';
  }

  // 5. Pasta / Primi piatti
  if (
    name.includes('pasta') || name.includes('tagliatelle') || name.includes('spaghetti') || name.includes('lasagn') || 
    name.includes('tortellini') || name.includes('agnolotti') || name.includes('trofie') || name.includes('strangozzi') ||
    name.includes('pansoti') || name.includes('spätzle') || name.includes('cjarsons') || name.includes('orecchiette') ||
    name.includes('maccheroni') || name.includes('penne') || name.includes('bucatini') || name.includes('carbonara') ||
    name.includes('amatriciana') || name.includes('gricia') || name.includes('malloreddus') || name.includes('culurgiones') ||
    ingredientsJoined.includes('pasta sfoglia') || ingredientsJoined.includes('strangozzi') || ingredientsJoined.includes('trofie') ||
    ingredientsJoined.includes('sfoglia')
  ) {
    return 'pasta';
  }

  // 6. Carne
  if (
    name.includes('carne') || name.includes('bistecca') || name.includes('manzo') || name.includes('maiale') ||
    name.includes('pollo') || name.includes('agnello') || name.includes('spezzatino') || name.includes('ragù') ||
    name.includes('costine') || name.includes('porchetta') || name.includes('cotoletta') || name.includes('carbonade') ||
    name.includes('gulasch') || name.includes('vitello') || name.includes('fegato') || name.includes('brasato') ||
    name.includes('arrosto') || name.includes('polpetta') || name.includes('arrosticini') || name.includes('salsiccia') ||
    ingredientsJoined.includes('manzo') || ingredientsJoined.includes('vitello') || ingredientsJoined.includes('lonza') ||
    ingredientsJoined.includes('pancetta') || ingredientsJoined.includes('guanciale') || ingredientsJoined.includes('prosciutto') ||
    ingredientsJoined.includes('salsiccia') || ingredientsJoined.includes('pollo')
  ) {
    return 'carne';
  }

  return 'pasta';
}

function findCookingTimeInStep(stepText: string): number | null {
  const regex = /(\d+)\s*(?:-|a)?\s*(\d+)?\s*(?:minuti|min)/i;
  const match = stepText.match(regex);
  if (match) {
    if (match[2]) {
      return parseInt(match[2], 10);
    }
    return parseInt(match[1], 10);
  }
  return null;
}

interface NutritionInfo {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

const NUTRITION_DATABASE: {
  keywords: string[];
  caloriesPer100g: number;
  carbsPer100g: number;
  proteinPer100g: number;
  fatPer100g: number;
}[] = [
  {
    keywords: ["olio", "extravergine"],
    caloriesPer100g: 884,
    carbsPer100g: 0,
    proteinPer100g: 0,
    fatPer100g: 100,
  },
  {
    keywords: ["burro", "strutto", "lard"],
    caloriesPer100g: 717,
    carbsPer100g: 0.1,
    proteinPer100g: 0.8,
    fatPer100g: 81,
  },
  {
    keywords: ["pasta", "sfoglia", "trofie", "riso", "farina", "semola", "fregola", "pane", "spaghetti", "penne", "maccheroni", "lasagne"],
    caloriesPer100g: 350,
    carbsPer100g: 75,
    proteinPer100g: 12,
    fatPer100g: 1.5,
  },
  {
    keywords: ["zucchero", "caramello", "miele"],
    caloriesPer100g: 387,
    carbsPer100g: 100,
    proteinPer100g: 0,
    fatPer100g: 0,
  },
  {
    keywords: ["cioccolato", "cacao", "amaretti", "biscott"],
    caloriesPer100g: 450,
    carbsPer100g: 65,
    proteinPer100g: 6,
    fatPer100g: 18,
  },
  {
    keywords: ["manzo", "vitello", "maiale", "agnello", "guanciale", "pancetta", "salame", "salsiccia", "carne", "cosce", "costine", "spezzatino", "brasato", "vitellone", "carpaccio"],
    caloriesPer100g: 250,
    carbsPer100g: 0,
    proteinPer100g: 22,
    fatPer100g: 18,
  },
  {
    keywords: ["pollo", "tacchino", "petto"],
    caloriesPer100g: 165,
    carbsPer100g: 0,
    proteinPer100g: 31,
    fatPer100g: 3.6,
  },
  {
    keywords: ["parmigiano", "pecorino", "grana", "formaggio", "scamorza", "provolone", "gorgonzola", "taleggio", "fontina"],
    caloriesPer100g: 395,
    carbsPer100g: 2.5,
    proteinPer100g: 33,
    fatPer100g: 28,
  },
  {
    keywords: ["ricotta", "mascarpone", "mozzarella", "panna"],
    caloriesPer100g: 250,
    carbsPer100g: 3.5,
    proteinPer100g: 10,
    fatPer100g: 22,
  },
  {
    keywords: ["latte", "yogurt"],
    caloriesPer100g: 60,
    carbsPer100g: 4.8,
    proteinPer100g: 3.2,
    fatPer100g: 3.2,
  },
  {
    keywords: ["uovo", "uova"],
    caloriesPer100g: 143,
    carbsPer100g: 0.7,
    proteinPer100g: 12.6,
    fatPer100g: 9.5,
  },
  {
    keywords: ["pesce", "vongole", "cozze", "tonno", "alici", "acciughe", "crostacei", "polpo", "calamari", "gamberi", "branzino", "orata", "merluzzo"],
    caloriesPer100g: 110,
    carbsPer100g: 0.5,
    proteinPer100g: 18,
    fatPer100g: 4,
  },
  {
    keywords: ["patate", "patata", "castagne"],
    caloriesPer100g: 85,
    carbsPer100g: 19,
    proteinPer100g: 2,
    fatPer100g: 0.1,
  },
  {
    keywords: ["vino", "birra", "liquore", "rum", "marsala"],
    caloriesPer100g: 85,
    carbsPer100g: 2.5,
    proteinPer100g: 0.1,
    fatPer100g: 0,
  }
];

const GENERAL_VEGETABLE_NUTRITION = {
  calories: 25,
  carbs: 4.5,
  protein: 1.2,
  fat: 0.2
};

function parseIngredientWeightInGrams(ing: string): number {
  const lowercase = ing.toLowerCase();
  
  const gMatch = lowercase.match(/(\d+(?:\.\d+)?)\s*(?:g|gr|grammi)\b/i);
  if (gMatch) {
    return parseFloat(gMatch[1]);
  }

  const kgMatch = lowercase.match(/(\d+(?:\.\d+)?)\s*(?:kg|chilo|chili)\b/i);
  if (kgMatch) {
    return parseFloat(kgMatch[1]) * 1000;
  }

  const mlMatch = lowercase.match(/(\d+(?:\.\d+)?)\s*(?:ml|millilitri)\b/i);
  if (mlMatch) {
    return parseFloat(mlMatch[1]);
  }
  const lMatch = lowercase.match(/(\d+(?:\.\d+)?)\s*(?:l|litro|litri)\b/i);
  if (lMatch) {
    return parseFloat(lMatch[1]) * 1000;
  }

  if (lowercase.includes("uovo") || lowercase.includes("uova")) {
    const pMatch = lowercase.match(/^(\d+)/);
    if (pMatch) {
      return parseInt(pMatch[1], 10) * 55;
    }
    return 55;
  }
  
  if (lowercase.includes("patat") || lowercase.includes("spicchi") || lowercase.includes("teste")) {
    const pMatch = lowercase.match(/^(\d+)/);
    if (pMatch) {
      return parseInt(pMatch[1], 10) * 100;
    }
    return 100;
  }

  if (lowercase.includes("carot") || lowercase.includes("cipoll") || lowercase.includes("pomodor")) {
    const pMatch = lowercase.match(/^(\d+)/);
    if (pMatch) {
      return parseInt(pMatch[1], 10) * 80;
    }
    return 80;
  }

  const countMatch = lowercase.match(/^(\d+(?:\.\d+)?|\d+\/\d+)/);
  if (countMatch) {
    const val = countMatch[1];
    let count = 1;
    if (val.includes('/')) {
      const parts = val.split('/');
      count = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else {
      count = parseFloat(val);
    }
    return count * 60;
  }

  if (lowercase.includes("sale") || lowercase.includes("pepe") || lowercase.includes("chiodi") || lowercase.includes("cannella") || lowercase.includes("aromi") || lowercase.includes("erbe") || lowercase.includes("acqua")) {
    return 5;
  }

  return 100;
}

function calculateNutrition(ingredients: string[]): NutritionInfo {
  let totalCalories = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;

  for (const ing of ingredients) {
    const weight = parseIngredientWeightInGrams(ing);
    const lowercase = ing.toLowerCase();

    let matched = false;
    for (const entry of NUTRITION_DATABASE) {
      if (entry.keywords.some(kw => lowercase.includes(kw))) {
        totalCalories += (entry.caloriesPer100g / 100) * weight;
        totalCarbs += (entry.carbsPer100g / 100) * weight;
        totalProtein += (entry.proteinPer100g / 100) * weight;
        totalFat += (entry.fatPer100g / 100) * weight;
        matched = true;
        break;
      }
    }

    if (!matched) {
      totalCalories += (GENERAL_VEGETABLE_NUTRITION.calories / 100) * weight;
      totalCarbs += (GENERAL_VEGETABLE_NUTRITION.carbs / 100) * weight;
      totalProtein += (GENERAL_VEGETABLE_NUTRITION.protein / 100) * weight;
      totalFat += (GENERAL_VEGETABLE_NUTRITION.fat / 100) * weight;
    }
  }

  return {
    calories: Math.round(totalCalories),
    carbs: Math.round(totalCarbs * 10) / 10,
    protein: Math.round(totalProtein * 10) / 10,
    fat: Math.round(totalFat * 10) / 10
  };
}

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onShare: (recipe: Recipe) => void;
}

export default function RecipeDetailModal({
  recipe,
  onClose,
  isFavorite,
  onToggleFavorite,
  onShare
}: RecipeDetailModalProps) {
  if (!recipe) return null;

  // Wine recommendation states
  const [wine, setWine] = useState<{
    name: string;
    type: string;
    grape: string;
    producerRegion: string;
    pairingMotivation: string;
  } | null>(null);
  const [wineLoading, setWineLoading] = useState<boolean>(false);
  const [wineError, setWineError] = useState<string | null>(null);

  // Fetch wine pairing from backend API
  const fetchWineRecommendation = async () => {
    if (!recipe) return;
    setWineLoading(true);
    setWineError(null);
    try {
      const response = await fetch('/api/recommend-wine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeName: recipe.name,
          region: recipe.region,
          ingredients: recipe.ingredients,
          description: recipe.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Impossibile ottenere l\'abbinamento dal sommelier');
      }

      const data = await response.json();
      setWine(data);
    } catch (err: any) {
      console.error(err);
      setWineError(err.message || 'Errore nella connessione col sommelier');
    } finally {
      setWineLoading(false);
    }
  };

  // Automatically fetch wine once on mount/recipe change
  useEffect(() => {
    if (recipe && recipe.id) {
      fetchWineRecommendation();
    }
  }, [recipe.id]);

  // Track dynamic portions size, initialized to the recipe's default portions
  const [servings, setServings] = useState<number>(recipe.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState<{ [key: string]: boolean }>({});
  const [completedSteps, setCompletedSteps] = useState<{ [key: number]: boolean }>({});
  const [nutritionViewMode, setNutritionViewMode] = useState<'single' | 'total'>('single');

  // Timer States
  const [activeTimerStepIndex, setActiveTimerStepIndex] = useState<number | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);
  const [timerIsPaused, setTimerIsPaused] = useState<boolean>(false);
  const [timerFinished, setTimerFinished] = useState<boolean>(false);

  // Play Beep sound using Web Audio API when Timer completes (loops until dismissed)
  const playTimerFinishedSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playNote = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        
        gainNode.gain.setValueAtTime(0.35, start);
        gainNode.gain.exponentialRampToValueAtTime(0.01, start + dur);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(start);
        osc.stop(start + dur);
      };
      
      const now = ctx.currentTime;
      // High-pitched pleasant alert chimes
      playNote(880, now, 0.15); // A5
      playNote(1046.5, now + 0.2, 0.35); // C5
    } catch (e) {
      console.warn("Audio Context playback failed", e);
    }
  };

  // Timer interval countdown handler
  useEffect(() => {
    if (activeTimerStepIndex === null || timerIsPaused || timerFinished) return;

    const interval = setInterval(() => {
      setTimerSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimerStepIndex, timerIsPaused, timerFinished]);

  // Repeated sound playback when timer is in "finished" state
  useEffect(() => {
    if (!timerFinished) return;

    playTimerFinishedSound();
    const interval = setInterval(() => {
      playTimerFinishedSound();
    }, 2500);

    return () => clearInterval(interval);
  }, [timerFinished]);

  const getTimerDurationForStep = (stepText: string): number => {
    if (category === 'pasta') {
      return 5 * 60; // 5 minutes in seconds for pasta
    }
    if (category === 'carne') {
      return 10 * 60; // 10 minutes in seconds for carne
    }
    const parsedMin = findCookingTimeInStep(stepText);
    if (parsedMin) {
      return parsedMin * 60;
    }
    return 5 * 60; // fallback to 5 minutes
  };

  const getTimerLabelForStep = (stepText: string): string => {
    if (category === 'pasta') {
      return "5 min";
    }
    if (category === 'carne') {
      return "10 min";
    }
    const parsedMin = findCookingTimeInStep(stepText);
    if (parsedMin) {
      return `${parsedMin} min`;
    }
    return "5 min";
  };

  const handleStartTimer = (idx: number, stepText: string) => {
    const duration = getTimerDurationForStep(stepText);
    setActiveTimerStepIndex(idx);
    setTimerSecondsLeft(duration);
    setTimerIsPaused(false);
    setTimerFinished(false);
  };

  const handleCancelTimer = () => {
    setActiveTimerStepIndex(null);
    setTimerSecondsLeft(0);
    setTimerIsPaused(false);
    setTimerFinished(false);
  };

  const formatSeconds = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const servingsMultiplier = servings / (recipe.servings || 4);
  const category = getRecipeCategory(recipe);
  const chefTips = CATEGORY_TIPS[category];

  // Calculated nutritional values
  const baseNutrition = calculateNutrition(recipe.ingredients);
  const defaultServings = recipe.servings || 4;

  const singleServingNutrition = {
    calories: Math.max(90, Math.round(baseNutrition.calories / defaultServings)),
    carbs: Math.max(2, Math.round((baseNutrition.carbs / defaultServings) * 10) / 10),
    protein: Math.max(1.5, Math.round((baseNutrition.protein / defaultServings) * 10) / 10),
    fat: Math.max(1, Math.round((baseNutrition.fat / defaultServings) * 10) / 10)
  };

  const activeNutrition = {
    calories: Math.round(singleServingNutrition.calories * (nutritionViewMode === 'total' ? servings : 1)),
    carbs: Math.round(singleServingNutrition.carbs * (nutritionViewMode === 'total' ? servings : 1) * 10) / 10,
    protein: Math.round(singleServingNutrition.protein * (nutritionViewMode === 'total' ? servings : 1) * 10) / 10,
    fat: Math.round(singleServingNutrition.fat * (nutritionViewMode === 'total' ? servings : 1) * 10) / 10
  };

  const toggleIngredient = (ing: string) => {
    setCheckedIngredients(prev => ({ ...prev, [ing]: !prev[ing] }));
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Utility to parse quantity and convert to multiplier if possible
  const formatIngredientAmount = (ingredient: string): string => {
    // Look for numbers at the beginning like "350g ...", "150ml ...", "2 ...", "1/2 ..."
    const regex = /^(\d+(\.\d+)?|\d+\/\d+)\s*(g|ml|kg|l)?\b/i;
    const match = ingredient.match(regex);
    if (!match) return ingredient;

    const fullMatch = match[0];
    const amountStr = match[1];
    const unit = match[3] || "";

    // Parse fraction or decimal
    let numericAmount = 0;
    if (amountStr.includes("/")) {
      const parts = amountStr.split("/");
      numericAmount = parseFloat(parts[0]) / parseFloat(parts[1]);
    } else {
      numericAmount = parseFloat(amountStr);
    }

    if (isNaN(numericAmount)) return ingredient;

    const multipliedAmount = Math.round(numericAmount * servingsMultiplier * 10) / 10;
    
    // Replace in original string
    return ingredient.replace(regex, `${multipliedAmount}${unit ? '' + unit : ''}`);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Facile':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Media':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Difficile':
        return 'text-sapori-red bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      id="recipe-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/60 z-40 flex flex-col justify-end pointer-events-auto"
    >
      {/* Background click to close */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Sheet panel */}
      <motion.div
        id="recipe-detail-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 220 }}
        className="w-full h-[90%] bg-white rounded-t-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col"
      >
        {/* Header Drag Handle Aesthetic */}
        <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto my-3 flex-shrink-0" />

        {/* Action button header Bar */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center">
          <button
            id="back-sheet-btn"
            onClick={onClose}
            className="p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              id="share-recipe-btn"
              onClick={() => onShare(recipe)}
              className="p-2.5 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-colors"
              title="Condividi"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              id="favorite-recipe-toggle"
              onClick={() => onToggleFavorite(recipe)}
              className={`p-2.5 rounded-full backdrop-blur-md transition-colors 
                ${isFavorite 
                  ? 'bg-sapori-red text-white' 
                  : 'bg-black/40 text-white hover:bg-black/60'
                }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Scrollable Food Details */}
        <div className="flex-1 overflow-y-auto hide-scrollbar pb-10">
          
          {/* Main Visual Image Hero */}
          <div className="relative w-full h-64 overflow-hidden">
            <img 
              referrerPolicy="no-referrer"
              src={recipe.image} 
              alt={recipe.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-sapori-red text-sapori-cream text-xs font-semibold uppercase px-2.5 py-1 rounded-md tracking-wider shadow-xs">
                  {recipe.region}
                </span>
                {recipe.isAiGenerated && (
                  <span className="bg-amber-600 border border-amber-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md tracking-wide flex items-center gap-1 shadow-xs">
                    ✨ Ricetta Generata dall'AI
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-serif text-white font-bold leading-tight">
                {recipe.name}
              </h2>
            </div>
          </div>

          <div className="px-5 mt-6">
            
            {/* Quick Metadata Ribbons */}
            <div className="grid grid-cols-3 gap-3 py-4 mb-6 bg-sapori-cream-dark/50 rounded-3xl px-2 border border-sapori-green-light/10">
              <div className="flex flex-col items-center justify-center border-r border-[#2D4F1E]/15">
                <Clock className="w-4 h-4 text-sapori-green mb-1" />
                <span className="text-[10px] text-[#2D4F1E]/80 uppercase tracking-widest font-semibold">Tempo</span>
                <span className="text-xs font-bold text-gray-800">{recipe.prepTime}</span>
              </div>
              <div className="flex flex-col items-center justify-center border-r border-[#2D4F1E]/15">
                <TrendingUp className="w-4 h-4 text-sapori-green mb-1" />
                <span className="text-[10px] text-[#2D4F1E]/80 uppercase tracking-widest font-semibold">Difficoltà</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border mt-0.5 ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <MapPin className="w-4 h-4 text-sapori-green mb-1" />
                <span className="text-[10px] text-[#2D4F1E]/80 uppercase tracking-widest font-semibold">Area</span>
                <span className="text-xs font-bold text-gray-800">{recipe.macroRegion}</span>
              </div>
            </div>

            {/* Description Card */}
            <p className="text-sm text-[#2D4F1E]/90 leading-relaxed italic mb-6">
              "{recipe.description}"
            </p>

            {/* Servings Multiplier Section */}
            <div className="bg-sapori-cream-dark p-4 rounded-3xl mb-6 border border-sapori-green-light/15 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-sapori-green" />
                <div>
                  <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider">Servizio Porzioni</h4>
                  <p className="text-[10px] text-[#2D4F1E]/75">I pesi cambiano automaticamente</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white border border-sapori-green-light/15 rounded-xl p-1.5 shadow-xs">
                <button
                  id="decrease-servings"
                  onClick={() => setServings(s => Math.max(1, s - 1))}
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors text-sapori-red cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-sm text-gray-800 w-6 text-center">{servings}</span>
                <button
                  id="increase-servings"
                  onClick={() => setServings(s => Math.min(20, s + 1))}
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors text-sapori-red cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ingredients Segment */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-sapori-green" />
                <h3 className="font-serif font-bold text-lg text-sapori-green">Ingredienti ({servings} persone)</h3>
              </div>
              <div className="space-y-2.5 bg-[#FAF9F6] p-5 rounded-3xl border border-sapori-green-light/10 shadow-xs">
                {recipe.ingredients.map((ing, i) => {
                  const calculated = formatIngredientAmount(ing);
                  const isChecked = !!checkedIngredients[ing];
                  return (
                    <div 
                      key={i} 
                      onClick={() => toggleIngredient(ing)}
                      className="flex items-center gap-3 py-1 cursor-pointer select-none group"
                    >
                      <button className="text-gray-400 group-hover:text-sapori-green transition-colors cursor-pointer">
                        {isChecked ? (
                          <CheckSquare className="w-4.5 h-4.5 text-sapori-green" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-[#2D4F1E]/50" />
                        )}
                      </button>
                      <span className={`text-xs text-[#1B3022] font-semibold transition-all ${isChecked ? 'line-through text-[#2D4F1E]/55' : ''}`}>
                        {calculated}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Informazioni Nutrizionali Segment */}
            <div className="mb-6 bg-sapori-cream-dark/55 border border-sapori-green-light/10 p-5 rounded-3xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sapori-green" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-sapori-green">Informazioni Nutrizionali</h3>
                    <p className="text-[10px] text-[#2D4F1E]/75">Valori nutrizionali stimati in base agli ingredienti</p>
                  </div>
                </div>
                
                {/* Segmented Control */}
                <div className="flex bg-sapori-cream-dark border border-[#2D4F1E]/15 rounded-xl p-1 select-none w-fit self-start sm:self-auto">
                  <button
                    onClick={() => setNutritionViewMode('single')}
                    className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      nutritionViewMode === 'single'
                        ? 'bg-sapori-green text-white shadow-xs'
                        : 'text-[#2D4F1E]/70 hover:text-sapori-green'
                    }`}
                  >
                    Porzione Singola
                  </button>
                  <button
                    onClick={() => setNutritionViewMode('total')}
                    className={`px-3 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                      nutritionViewMode === 'total'
                        ? 'bg-sapori-green text-white shadow-xs'
                        : 'text-[#2D4F1E]/70 hover:text-sapori-green'
                    }`}
                  >
                    Totale ({servings} {servings === 1 ? 'porzione' : 'porzioni'})
                  </button>
                </div>
              </div>

              {/* Nutritional metrics display */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Calories */}
                <div className="bg-white/85 border border-[#2D4F1E]/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#2D4F1E]/60 mb-1">Calorie</span>
                  <span className="text-xl font-serif font-black text-sapori-red">{activeNutrition.calories}</span>
                  <span className="text-[10px] text-gray-500 font-extrabold mt-0.5">kcal</span>
                </div>

                {/* Carbs */}
                <div className="bg-white/85 border border-[#2D4F1E]/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#2D4F1E]/60 mb-1">Carboidrati</span>
                  <span className="text-xl font-serif font-black text-stone-800">{activeNutrition.carbs}g</span>
                  <div className="w-full bg-[#FAF9F6] h-1.5 rounded-full mt-2 overflow-hidden border border-black/5">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (activeNutrition.carbs / (nutritionViewMode === 'single' ? 100 : 100 * servings)) * 100)}%` }} 
                    />
                  </div>
                </div>

                {/* Protein */}
                <div className="bg-white/85 border border-[#2D4F1E]/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#2D4F1E]/60 mb-1">Proteine</span>
                  <span className="text-xl font-serif font-black text-sapori-green">{activeNutrition.protein}g</span>
                  <div className="w-full bg-[#FAF9F6] h-1.5 rounded-full mt-2 overflow-hidden border border-black/5">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (activeNutrition.protein / (nutritionViewMode === 'single' ? 40 : 40 * servings)) * 100)}%` }} 
                    />
                  </div>
                </div>

                {/* Fat */}
                <div className="bg-white/85 border border-[#2D4F1E]/5 p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-xs">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#2D4F1E]/60 mb-1">Grassi</span>
                  <span className="text-xl font-serif font-black text-amber-900">{activeNutrition.fat}g</span>
                  <div className="w-full bg-[#FAF9F6] h-1.5 rounded-full mt-2 overflow-hidden border border-black/5">
                    <div 
                      className="bg-amber-800 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (activeNutrition.fat / (nutritionViewMode === 'single' ? 35 : 35 * servings)) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Wine Pairing Segment */}
            <div className="mb-6 bg-amber-50/40 border border-amber-900/10 p-5 rounded-3xl shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Wine className="w-5 h-5 text-amber-800 animate-bounce" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-amber-900">Il Sommelier Consiglia</h3>
                    <p className="text-[10px] text-amber-800/75">Abbinamento ideale elaborato con intelligenza Gemini</p>
                  </div>
                </div>

                {!wineLoading && (
                  <button
                    onClick={fetchWineRecommendation}
                    title="Richiedi un nuovo abbinamento al sommelier"
                    disabled={wineLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100/50 border border-amber-900/15 rounded-xl text-[10px] font-extrabold text-amber-900 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.05)] disabled:opacity-50"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-800" />
                    Chiedi di nuovo
                  </button>
                )}
              </div>

              {wineLoading ? (
                <div className="flex flex-col items-center justify-center py-8 text-center bg-white/50 rounded-2xl border border-amber-900/5 min-h-[140px]">
                  <Loader2 className="w-8 h-8 text-amber-800 animate-spin mb-3" />
                  <p className="text-xs font-serif font-bold text-amber-900 animate-pulse">Il sommelier sta selezionando le migliori cantine...</p>
                  <p className="text-[10px] text-amber-800/60 mt-1">Abbinando i sapori della ecoriviera d'origine ({recipe.region})</p>
                </div>
              ) : wineError ? (
                <div className="flex flex-col items-center justify-center p-5 bg-red-50 rounded-2xl border border-red-200">
                  <p className="text-xs text-red-800 font-bold mb-3">{wineError}</p>
                  <button
                    onClick={fetchWineRecommendation}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-[11px] font-bold shadow-xs hover:bg-red-700 transition"
                  >
                    Riprova
                  </button>
                </div>
              ) : wine ? (
                <div className="bg-white/80 border border-amber-900/5 p-4 rounded-2xl shadow-xs">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      {/* Wine meta tags */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-200">
                          <Wine className="w-2.5 h-2.5 text-amber-800" />
                          {wine.producerRegion || recipe.region}
                        </span>
                        {wine.type && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-stone-100 text-stone-700 border border-stone-200">
                            {wine.type}
                          </span>
                        )}
                      </div>

                      {/* Name & Grape variety */}
                      <h4 className="font-serif font-black text-xl text-amber-950 mb-1 leading-snug">
                        {wine.name}
                      </h4>
                      {wine.grape && (
                        <p className="text-xs text-amber-900/70 font-medium">
                          <span className="font-bold">Vitigni: </span>{wine.grape}
                        </p>
                      )}
                    </div>
                    
                    {/* Visual Stamp badge */}
                    <div className="hidden sm:flex flex-col items-center justify-center p-3 bg-amber-50 rounded-xl border border-amber-200 flex-shrink-0 select-none">
                      <Sparkles className="w-5 h-5 text-amber-700 mb-1 animate-pulse" />
                      <span className="text-[9px] font-serif font-black text-amber-900 tracking-wider">SOMMELIER</span>
                      <span className="text-[8px] text-amber-800/60 font-bold uppercase tracking-widest mt-0.5">Scelta DOC</span>
                    </div>
                  </div>

                  {/* Motivation quote */}
                  <div className="mt-3.5 pt-3.5 border-t border-amber-900/10 italic text-[#2D4F1E] text-xs leading-relaxed font-medium bg-amber-50/35 p-3 rounded-xl border border-[#2D4F1E]/5">
                    "{wine.pairingMotivation}"
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center bg-white/50 rounded-2xl border border-amber-900/5">
                  <button 
                    onClick={fetchWineRecommendation}
                    className="flex items-center gap-1.5 px-4 py-2 bg-sapori-green text-white rounded-xl text-xs font-bold shadow-xs hover:bg-sapori-green-dark transition cursor-pointer"
                  >
                    <Wine className="w-4 h-4" /> Consiglia un Vino
                  </button>
                </div>
              )}
            </div>

            {/* Cooking Procedure Segment */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-sapori-green" />
                <h3 className="font-serif font-bold text-lg text-sapori-green">Procedimento</h3>
              </div>
              <div className="space-y-3.5">
                {recipe.instructions.map((step, idx) => {
                  const isCompleted = !!completedSteps[idx];
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5
                        ${isCompleted 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-[#2D4F1E]/50' 
                          : 'bg-white border-sapori-green-light/10 text-stone-700 hover:border-sapori-green-light/25 shadow-xs'
                        }
                      `}
                    >
                      {/* Step index badge */}
                      <div className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5
                        ${isCompleted 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-sapori-cream-dark text-sapori-green'
                        }
                      `}>
                        {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      {/* Step content */}
                      <div className="flex-1">
                        <p className={`text-xs leading-relaxed font-semibold transition-all ${isCompleted ? 'line-through text-gray-400 font-medium opacity-65' : 'text-[#1B3022]'}`}>
                          {step}
                        </p>
                        
                        {(findCookingTimeInStep(step) !== null || /minut|min\b|ora\b|ore\b/i.test(step)) && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {activeTimerStepIndex === idx ? (
                              <div className="flex items-center gap-2 bg-[#A52A2A] text-white px-3 py-1 rounded-full font-mono text-[11px] font-bold animate-pulse shadow-md">
                                <Timer className="w-3.5 h-3.5 animate-spin text-amber-350" />
                                <span>{formatSeconds(timerSecondsLeft)}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTimerIsPaused(p => !p);
                                  }}
                                  className="ml-1 bg-white/20 hover:bg-white/35 px-2 py-0.5 rounded text-white font-sans text-[9px] uppercase tracking-wider font-extrabold cursor-pointer"
                                >
                                  {timerIsPaused ? 'Avvia' : 'Pausa'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelTimer();
                                  }}
                                  className="bg-black/35 hover:bg-black/50 px-2 py-0.5 rounded text-white font-sans text-[9px] uppercase tracking-wider font-extrabold cursor-pointer"
                                >
                                  Annulla
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartTimer(idx, step);
                                }}
                                className="inline-flex items-center gap-1.5 text-[10px] bg-amber-500/15 hover:bg-amber-500 text-amber-850 hover:text-white px-2.5 py-1 rounded-xl font-bold transition-all shadow-2xs border border-amber-500/20 cursor-pointer"
                                title="Avvia cronometro di cottura"
                              >
                                <Timer className="w-3.5 h-3.5 text-amber-600" />
                                <span>Tip d'oro: Avvia Timer ({getTimerLabelForStep(step)})</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section Tips dello Chef */}
            <div id="chef-tips-section" className="mb-6 bg-amber-50/40 border border-amber-200/50 p-5 rounded-3xl shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">👨‍🍳</span>
                <h3 className="font-serif font-bold text-lg text-[#1B3022]">I Tips dello Chef</h3>
              </div>
              <div className="space-y-4">
                {chefTips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-lg flex-shrink-0 select-none">👨‍🍳</span>
                    <div>
                      <h4 className="font-sans font-bold text-xs text-sapori-green leading-snug">
                        {tip.title}
                      </h4>
                      <p className="text-[11px] text-[#2D4F1E]/85 leading-relaxed mt-0.5 font-medium">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Authenticity Certificate Stamp or AI Creation Note */}
            {recipe.isAiGenerated ? (
              <div className="border border-dashed border-amber-600/40 bg-amber-500/[0.04] rounded-2xl p-4 text-center mt-8">
                <span className="text-xl inline-block mb-1">✨🤖✨</span>
                <h5 className="font-serif font-bold text-sm text-amber-800">Creazione Gourmet dell'AI</h5>
                <p className="text-[11px] text-amber-900/85 max-w-xs mx-auto mt-1 leading-normal">
                  Questa ricetta è stata ideata interamente dall'Intelligenza Artificiale (Gemini API), ispirandosi alle ricche tradizioni gastronomiche locali della regione {recipe.region}.
                </p>
              </div>
            ) : (
              <div className="border border-dashed border-sapori-green-light/40 bg-sapori-cream-dark/10 rounded-2xl p-4 text-center mt-8">
                <span className="text-xl inline-block mb-1">🇮🇹</span>
                <h5 className="font-serif font-bold text-sm text-sapori-green">Ricetta Certificata</h5>
                <p className="text-[11px] text-gray-500 max-w-xs mx-auto mt-1 leading-normal">
                  Garantiamo l’autenticità di questa ricetta nel rispetto del disciplinare enogastronomico tipico della regione {recipe.region}.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Persistent Floating Kitchen Timer / Cronometro Status Bar */}
        {activeTimerStepIndex !== null && !timerFinished && (
          <div className="absolute bottom-4 left-4 right-4 bg-sapori-green text-sapori-cream px-4 py-3.5 rounded-2xl flex items-center justify-between shadow-2xl border border-white/10 z-30 select-none animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <Timer className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div className="max-w-[150px]">
                <p className="text-[10px] text-sapori-cream-dark uppercase tracking-wider font-extrabold font-sans">Passo {activeTimerStepIndex + 1}</p>
                <p className="text-[11px] text-white/95 font-medium truncate leading-tight mt-0.5">
                  {recipe.instructions[activeTimerStepIndex]}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-extrabold text-[#FDF0E5] w-12 text-center bg-white/10 py-1 px-1.5 rounded-lg border border-white/5">
                {formatSeconds(timerSecondsLeft)}
              </span>
              <button
                onClick={() => setTimerIsPaused(p => !p)}
                className="bg-white/15 hover:bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-md cursor-pointer transition-colors"
              >
                {timerIsPaused ? 'Avvia' : 'Pausa'}
              </button>
              <button
                onClick={handleCancelTimer}
                className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-1.5 rounded-md cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Celebratory Dimmer Overlays for Finished Cook Time */}
        {timerFinished && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 select-none">
            <div className="bg-sapori-cream rounded-3xl p-6 border-2 border-sapori-red text-center shadow-2xl max-w-xs animate-bounce relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-sapori-red" />
              
              <div className="w-16 h-16 bg-sapori-red-light/10 rounded-full flex items-center justify-center mb-3 animate-pulse">
                <Timer className="w-8 h-8 text-sapori-red animate-spin" />
              </div>
              
              <h4 className="font-serif font-extrabold text-[#1B3022] text-lg leading-tight mb-1">
                ⏰ Tempo Scaduto, Chef!
              </h4>
              
              <p className="text-[11px] text-gray-600 font-semibold uppercase tracking-wider mb-2">
                Categoria: {category.toUpperCase()}
              </p>
              
              <p className="text-xs text-stone-700 leading-relaxed mb-4">
                I tuoi <strong>{category === 'pasta' ? '5 minuti per la pasta al dente' : category === 'carne' ? '10 minuti di riposo ideale' : getTimerLabelForStep(recipe.instructions[activeTimerStepIndex || 0])}</strong> sono terminati sotto la sapiente guida di <em>Sapori d'Italia</em>.
              </p>
              
              <button
                onClick={() => {
                  setTimerFinished(false);
                  setActiveTimerStepIndex(null);
                }}
                className="w-full bg-sapori-red hover:bg-sapori-red-light text-white font-extrabold text-xs uppercase tracking-wider py-3 px-5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Fatto, ho controllato! 👨‍🍳
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
