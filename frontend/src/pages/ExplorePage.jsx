import React, { useState, useEffect } from 'react';
import { useRouter } from '../services/router';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { getSavedDestinations, toggleSaveDestination } from '../services/preferencesService';
import { supabase } from '../services/supabaseClient';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  BookmarkCheck, 
  Eye, 
  Compass, 
  Coins, 
  Search, 
  Filter, 
  Check, 
  Star,
  ExternalLink,
  Flame,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  ChevronRight,
  Heart
} from 'lucide-react';

export const CURATED_ITINERARIES = [
  {
    id: 'exp-kyoto',
    destination: 'Kyoto, Japan',
    title: 'Ancient Temples & Zen Kyoto',
    category: 'Cultural',
    badge: 'Trending 🔥',
    duration: '4 Days',
    budget: 'moderate',
    travel_style: 'balanced',
    interests: ['History & Culture', 'Food & Dining', 'Photography'],
    cover_image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    summary: 'Immerse yourself in Japan\'s ancient capital. Walk through thousands of vermilion torii gates at Fushimi Inari, experience serene bamboo groves, traditional tea houses in Gion, and taste exquisite matcha delicacies.',
    estimated_total_cost: '$850 - $1,100',
    highlights: ['Fushimi Inari Shrines', 'Arashiyama Bamboo Forest', 'Gion Geisha District', 'Kinkaku-ji Golden Pavilion'],
    days: [
      {
        day_number: 1,
        theme: 'Historic Shrines & Southern Kyoto',
        activities: [
          { time_slot: 'Morning', title: 'Fushimi Inari-taisha Hike', description: 'Early morning hike through thousands of vivid orange torii gates up Mount Inari.', location: 'Fushimi Ward, Kyoto', cost_estimate: 'Free', travel_tips: 'Arrive by 7:30 AM to beat tour buses.' },
          { time_slot: 'Afternoon', title: 'Tofuku-ji Zen Gardens', description: 'Stroll across Tsutenkyo Bridge overlooking maple valleys and dry rock gardens.', location: 'Higashiyama, Kyoto', cost_estimate: '$5', travel_tips: 'Ideal spot for tranquil meditation.' },
          { time_slot: 'Evening', title: 'Traditional Ramen at Gion Duck Noodles', description: 'French-inspired duck broth ramen in a cozy hidden alley.', location: 'Gion, Kyoto', cost_estimate: '$12', travel_tips: 'Cash preferred; look for the duck emoji sign.' }
        ]
      },
      {
        day_number: 2,
        theme: 'Bamboo Groves & Western Wonders',
        activities: [
          { time_slot: 'Morning', title: 'Arashiyama Bamboo Grove & Tenryu-ji', description: 'Towering green bamboo stalks swaying with the wind, followed by UNESCO temple grounds.', location: 'Ukyo Ward, Kyoto', cost_estimate: '$4', travel_tips: 'Rent a bicycle near the station for easy exploring.' },
          { time_slot: 'Afternoon', title: 'Iwatayama Monkey Park', description: 'Hike up to meet wild Japanese macaques with panoramic Kyoto city views.', location: 'Arashiyama, Kyoto', cost_estimate: '$6', travel_tips: 'Wear comfortable walking shoes.' },
          { time_slot: 'Evening', title: 'Matcha Parfait & Riverside Walk', description: 'Relax by Katsura River and enjoy authentic Uji matcha desserts.', location: 'Arashiyama Riverside', cost_estimate: '$9', travel_tips: 'Stroll across the historic Togetsukyo bridge at dusk.' }
        ]
      },
      {
        day_number: 3,
        theme: 'Golden Pavilions & Philosopher’s Trail',
        activities: [
          { time_slot: 'Morning', title: 'Kinkaku-ji (Golden Pavilion)', description: 'Marvel at the top two floors of the Zen temple covered in pure gold leaf shimmering over Mirror Pond.', location: 'Kita Ward, Kyoto', cost_estimate: '$4', travel_tips: 'Sunlight hits the gold facade best between 9-11 AM.' },
          { time_slot: 'Afternoon', title: 'Philosopher’s Path & Ginkaku-ji', description: 'A scenic stone path along a canal lined with cherry trees connecting temples.', location: 'Sakyo Ward, Kyoto', cost_estimate: '$4', travel_tips: 'Stop by local artisan pottery craft shops.' },
          { time_slot: 'Evening', title: 'Pontocho Alley Izakaya Hop', description: 'Atmospheric narrow pedestrian alley packed with wooden eateries and riverside dining.', location: 'Pontocho, Nakagyo', cost_estimate: '$25', travel_tips: 'Reserve in advance for open-air river platform seating (kawayuka).' }
        ]
      },
      {
        day_number: 4,
        theme: 'Nishiki Market & Kiyomizu-dera Vista',
        activities: [
          { time_slot: 'Morning', title: 'Kiyomizu-dera Veranda', description: 'Iconic wooden temple terrace perched without a single nail overlooking cedar trees.', location: 'Higashiyama, Kyoto', cost_estimate: '$3', travel_tips: 'Drink from Otowa Waterfall for health and success.' },
          { time_slot: 'Mid-day', title: 'Nishiki Market Street Food Tour', description: 'Known as "Kyoto\'s Kitchen", savor grilled octopus skewers, dashi tamagoyaki, and mochi.', location: 'Downtown Kyoto', cost_estimate: '$15', travel_tips: 'Eat at designated food stall counters.' },
          { time_slot: 'Evening', title: 'Sunset from Yasaka Pagoda (Ninenzaka)', description: 'Photogenic cobblestone slopes framed by ancient five-story wooden pagoda.', location: 'Ninenzaka, Kyoto', cost_estimate: 'Free', travel_tips: 'The magic hour right after lanterns turn on is breathtaking.' }
        ]
      }
    ]
  },
  {
    id: 'exp-positano',
    destination: 'Amalfi Coast, Italy',
    title: 'Cliffside Romance & Coastal Lemon Groves',
    category: 'Romantic',
    badge: 'Popular ⭐',
    duration: '4 Days',
    budget: 'luxury',
    travel_style: 'relaxed',
    interests: ['Food & Dining', 'Photography', 'Beaches & Relaxation'],
    cover_image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    summary: 'A breathtaking escape along Italy\'s sun-drenched Sorrentine peninsula. Clifftop pastel villas, sunset Aperol Spritz, private boat cruises to Capri, and fragrant wild lemon trails.',
    estimated_total_cost: '$1,600 - $2,200',
    highlights: ['Positano Cliffside Views', 'Path of the Gods Hike', 'Capri Blue Grotto Boat', 'Ravello Clifftop Gardens'],
    days: [
      {
        day_number: 1,
        theme: 'Positano Pastel Village & Beach Bliss',
        activities: [
          { time_slot: 'Morning', title: 'Spiaggia Grande Stroll', description: 'Walk through Positano’s iconic pebble beach gazing up at cascade of pastel houses.', location: 'Positano Beach', cost_estimate: 'Free', travel_tips: 'Rent sunbed early if visiting in high season.' },
          { time_slot: 'Afternoon', title: 'Boutique Shopping & Limoncello Tasting', description: 'Browse handmade linen clothes, ceramics, and sample freshly brewed iced limoncello.', location: 'Via dei Mulini', cost_estimate: '$20', travel_tips: 'Locals make the best lemon sorbet inside real frozen lemons.' },
          { time_slot: 'Evening', title: 'Sunset Cocktails at Franco’s Bar', description: 'Panoramic cliffside outdoor terrace overlooking the Mediterranean with stylish music.', location: 'Positano Clifftop', cost_estimate: '$35', travel_tips: 'Arrive 45 mins before sunset as there are no reservations.' }
        ]
      },
      {
        day_number: 2,
        theme: 'Private Yacht to Isle of Capri',
        activities: [
          { time_slot: 'Morning', title: 'Private Gozzo Boat Charter', description: 'Cruise around Faraglioni rock formations and swim in crystal turquoise sea coves.', location: 'Amalfi Sea', cost_estimate: '$150', travel_tips: 'Bring sunglasses and reef-safe sunscreen.' },
          { time_slot: 'Afternoon', title: 'Capri Island & Giardini di Augusto', description: 'Explore Capri village, sip espresso in the Piazzetta, and take in dizzying views of Via Krupp.', location: 'Capri, Italy', cost_estimate: '$30', travel_tips: 'Funicular connects marina to Capri town in 4 mins.' },
          { time_slot: 'Evening', title: 'Candlelight Seafood at Da Paolino', description: 'Dine on fresh sea bass and handmade pasta directly beneath a canopy of fragrant lemon trees.', location: 'Capri Lemon Garden', cost_estimate: '$90', travel_tips: 'Try the lemon ravioli.' }
        ]
      },
      {
        day_number: 3,
        theme: 'Ravello Gardens & Cliffside Symphonies',
        activities: [
          { time_slot: 'Morning', title: 'Villa Cimbrone Infinity Terrace', description: 'Famous Terrace of Infinity lined with classical marble busts suspended between sky and sea.', location: 'Ravello, Italy', cost_estimate: '$10', travel_tips: 'One of the most photographed viewpoints in the world.' },
          { time_slot: 'Afternoon', title: 'Villa Rufolo Cloister & Gardens', description: 'Romantic 13th-century cloisters that inspired Richard Wagner’s operas.', location: 'Piazza Vescovado, Ravello', cost_estimate: '$8', travel_tips: 'Check if there is an evening outdoor classical concert.' },
          { time_slot: 'Evening', title: 'Authentic Neapolitan Pizza in Amalfi Town', description: 'Crisp wood-fired pizza with buffalo mozzarella near the grand Amalfi Cathedral.', location: 'Amalfi Piazza', cost_estimate: '$22', travel_tips: 'Admire the 9th-century Arab-Norman cathedral facade illuminated at night.' }
        ]
      },
      {
        day_number: 4,
        theme: 'Path of the Gods (Sentiero degli Dei)',
        activities: [
          { time_slot: 'Morning', title: 'Sentiero degli Dei Hike', description: 'High cliff trail from Bomerano to Nocelle with sweeping views of the entire Amalfi coastline.', location: 'Agerola to Nocelle', cost_estimate: 'Free', travel_tips: 'Approx 3 hours; pack plenty of water and wear hiking shoes.' },
          { time_slot: 'Afternoon', title: 'Lemon Granite in Nocelle', description: 'Reward yourself at Santa Croce bar with ice-cold fresh lemon granita.', location: 'Nocelle Village', cost_estimate: '$5', travel_tips: 'Take the local shuttle bus down to Positano to save knees from 1,700 steps.' },
          { time_slot: 'Evening', title: 'Farewell Dinner at La Sponda', description: 'Romantic Michelin-starred dining lit by 400 flickering candles in Le Sirenuse.', location: 'Le Sirenuse, Positano', cost_estimate: '$140', travel_tips: 'Requires booking weeks in advance.' }
        ]
      }
    ]
  },
  {
    id: 'exp-reykjavik',
    destination: 'Reykjavik & South Coast, Iceland',
    title: 'Volcanoes, Waterfalls & Northern Lights',
    category: 'Adventure',
    badge: 'Epic ❄️',
    duration: '5 Days',
    budget: 'moderate',
    travel_style: 'fast-paced',
    interests: ['Nature & Outdoors', 'Adventure & Sports', 'Photography'],
    cover_image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
    summary: 'An otherworldly adventure through glaciers, volcanic black sand beaches, thundering waterfalls, natural geothermal hot springs, and night-sky Aurora Borealis chases.',
    estimated_total_cost: '$950 - $1,350',
    highlights: ['Golden Circle Geysir', 'Reynisfjara Black Sand Beach', 'Blue Lagoon Thermal Spa', 'Aurora Hunt'],
    days: [
      {
        day_number: 1,
        theme: 'Reykjavik City & Geothermal Rejuvenation',
        activities: [
          { time_slot: 'Morning', title: 'Hallgrimskirkja Church & Tower', description: 'Iconic volcanic basalt-inspired church with 360-degree views of Reykjavik’s colorful roofs.', location: 'Reykjavik Center', cost_estimate: '$10', travel_tips: 'Take the elevator to the tower observatory.' },
          { time_slot: 'Afternoon', title: 'Sky Lagoon Geothermal Ocean Bath', description: 'Infinity geothermal pool cliffside with a 7-step Nordic bathing ritual overlooking the North Atlantic.', location: 'Kársnes Harbour', cost_estimate: '$65', travel_tips: 'Includes cold plunge, sauna with glass ocean window, and scrub.' },
          { time_slot: 'Evening', title: 'Bæjarins Beztu Pylsur & Harpa Hall', description: 'Taste Iceland’s legendary lamb hot dog, followed by a walk through Harpa’s glowing glass honeycomb.', location: 'Old Harbour, Reykjavik', cost_estimate: '$8', travel_tips: 'Order the hot dog "eina með öllu" (with everything).' }
        ]
      },
      {
        day_number: 2,
        theme: 'The Golden Circle Highlights',
        activities: [
          { time_slot: 'Morning', title: 'Thingvellir National Park Rift', description: 'Walk between tectonic plates where North America and Eurasia are pulling apart.', location: 'Thingvellir, Iceland', cost_estimate: 'Free ($7 parking)', travel_tips: 'Historic site of the world\'s oldest ongoing parliament founded in 930 AD.' },
          { time_slot: 'Mid-day', title: 'Strokkur Geysir Eruption', description: 'Watch the geothermal fountain shoot boiling water 30 meters into the air every 6-8 minutes.', location: 'Haukadalur Valley', cost_estimate: 'Free', travel_tips: 'Stand upwind to avoid sulphur steam spray.' },
          { time_slot: 'Afternoon', title: 'Gullfoss Golden Waterfall', description: 'Massive two-tiered glacial waterfall thundering down into a deep canyon.', location: 'Hvítá River', cost_estimate: 'Free', travel_tips: 'Waterproof jackets essential—mist blows far.' }
        ]
      },
      {
        day_number: 3,
        theme: 'South Coast Waterfalls & Black Sand Beach',
        activities: [
          { time_slot: 'Morning', title: 'Walk Behind Seljalandsfoss', description: 'Rare waterfall that allows you to walk fully behind the falling water curtain.', location: 'South Coast', cost_estimate: 'Free', travel_tips: 'Have a waterproof phone case or camera cover.' },
          { time_slot: 'Afternoon', title: 'Reynisfjara Black Beach & Basalt Columns', description: 'Jet-black volcanic sand with majestic hexagonal basalt caves and roaring sea stacks.', location: 'Vik, Iceland', cost_estimate: 'Free', travel_tips: 'NEVER turn your back to the ocean; stay far away from sneaky sleeper waves.' },
          { time_slot: 'Night', title: 'Northern Lights Aurora Hunt', description: 'Drive out to dark countryside far from city lights to spot green dancing auroras.', location: 'Vik countryside', cost_estimate: 'Free', travel_tips: 'Use long exposure (3-6s) on night mode on your camera.' }
        ]
      },
      {
        day_number: 4,
        theme: 'Sólheimajökull Glacier Hike',
        activities: [
          { time_slot: 'Morning', title: 'Crampon Glacier Walk', description: 'Strap on crampons and explore ancient blue ice formations, crevasses, and ice caves with a licensed guide.', location: 'Sólheimajökull', cost_estimate: '$95', travel_tips: 'All technical gear provided by guide operator.' },
          { time_slot: 'Afternoon', title: 'Skógafoss 60m Waterfall & Steps', description: 'Vast cascade where double rainbows frequently appear on sunny days; climb 527 steps for canyon hike.', location: 'Skógar', cost_estimate: 'Free', travel_tips: 'Local museum nearby has preserved turf-roof houses.' },
          { time_slot: 'Evening', title: 'Cozy Arctic Char Dinner in Vik', description: 'Fresh pan-fried Arctic char fish with dill potatoes and local craft beer.', location: 'Vik i Myrdal', cost_estimate: '$38', travel_tips: 'Smidjan Brugghus brewpub has great local IPAs.' }
        ]
      },
      {
        day_number: 5,
        theme: 'Reykjanes Lava Fields & Blue Lagoon',
        activities: [
          { time_slot: 'Morning', title: 'Kleifarvatn & Seltún Mud Pots', description: 'Geothermal sulfur fumaroles, bubbling mud pots, and steaming red geothermal soil.', location: 'Krysuvik', cost_estimate: 'Free', travel_tips: 'Wooden boardwalks protect fragile steaming terrain.' },
          { time_slot: 'Afternoon', title: 'Blue Lagoon Mineral Soak', description: 'World-famous milky blue geothermal waters rich in silica and minerals surrounded by mossy lava.', location: 'Grindavík', cost_estimate: '$85', travel_tips: 'Coat your hair with provided conditioner to avoid mineral stiffness.' },
          { time_slot: 'Evening', title: 'Laugavegur Souvenir & Wool Shopping', description: 'Pick up an authentic hand-knit Lopapeysa wool sweater in downtown Reykjavik.', location: 'Laugavegur', cost_estimate: '$30 - $120', travel_tips: 'Look for Handknitting Association of Iceland certification.' }
        ]
      }
    ]
  },
  {
    id: 'exp-paris',
    destination: 'Paris, France',
    title: 'Gourmet Bistros & Masterpiece Art',
    category: 'Food & Art',
    badge: 'Classics 🥐',
    duration: '4 Days',
    budget: 'moderate',
    travel_style: 'balanced',
    interests: ['Art & Museums', 'Food & Dining', 'History & Culture'],
    cover_image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
    summary: 'Fall in love with the City of Light through secret Montmartre vineyards, world-class Louvre masterpieces, warm flaky morning croissants, sunset Seine cruises, and lively Latin Quarter wine bars.',
    estimated_total_cost: '$780 - $1,050',
    highlights: ['The Louvre & Mona Lisa', 'Montmartre Sacré-Cœur', 'Seine River Sunset Cruise', 'Marais Gourmet Bakeries'],
    days: [
      {
        day_number: 1,
        theme: 'Iconic Landmarks & Sunset on the Seine',
        activities: [
          { time_slot: 'Morning', title: 'Trocadéro View & Eiffel Tower Grounds', description: 'Get the best perspective of the Iron Lady from the Trocadéro marble terrace.', location: 'Champ de Mars, Paris', cost_estimate: 'Free', travel_tips: 'Arrive at sunrise for magical light with zero crowds.' },
          { time_slot: 'Afternoon', title: 'Musée d’Orsay Impressionists', description: 'Gaze upon Monet, Van Gogh, and Renoir paintings inside an ornate converted Beaux-Arts railway station.', location: '7th arrondissement', cost_estimate: '$17', travel_tips: 'Don\'t miss the giant station clock face view overlooking Sacré-Cœur.' },
          { time_slot: 'Evening', title: 'Vedettes du Pont Neuf Seine Cruise', description: '1-hour illuminated cruise passing Notre-Dame, Île de la Cité, and sparking Eiffel Tower.', location: 'Pont Neuf', cost_estimate: '$15', travel_tips: 'Time the cruise so you pass the Eiffel Tower at the top of the hour when it sparkles.' }
        ]
      },
      {
        day_number: 2,
        theme: 'Louvre Masterpieces & Palais Royal',
        activities: [
          { time_slot: 'Morning', title: 'The Louvre Museum Highlights', description: 'Winged Victory of Samothrace, Venus de Milo, and the Mona Lisa in the former royal palace.', location: '1st arrondissement', cost_estimate: '$20', travel_tips: 'Book timed-entry slot at 9:00 AM; enter via Carrousel du Louvre underground to skip lines.' },
          { time_slot: 'Afternoon', title: 'Palais-Royal Arcades & Buren Columns', description: 'Black-and-white striped art columns in the inner courtyard surrounded by peaceful lime trees.', location: 'Palais-Royal', cost_estimate: 'Free', travel_tips: 'Grab a coffee from Cafe Kitsuné.' },
          { time_slot: 'Evening', title: 'Steak Frites at Le Relais de l\'Entrecôte', description: 'Legendary single-dish bistro serving tender steak bathed in secret herb butter sauce with unlimited crispy fries.', location: 'Saint-Germain', cost_estimate: '$34', travel_tips: 'They serve a second complimentary helping of warm fries.' }
        ]
      },
      {
        day_number: 3,
        theme: 'Montmartre Artists & Hilltop Panorama',
        activities: [
          { time_slot: 'Morning', title: 'Sacré-Cœur Basilica & Secret Alleys', description: 'Climb Montmartre hill to visit the white stone dome and wander along Rue de l’Abreuvoir.', location: '18th arrondissement', cost_estimate: 'Free', travel_tips: 'Stop by La Maison Rose for photos.' },
          { time_slot: 'Afternoon', title: 'Place du Tertre Portrait Artists', description: 'Watch open-air painters and caricaturists in the village square where Picasso and Dali worked.', location: 'Montmartre', cost_estimate: 'Free', travel_tips: 'Pick up an authentic original oil sketch as a souvenir.' },
          { time_slot: 'Evening', title: 'Fondue & Wine in a Vintage Cave', description: 'Cozy traditional Savoyard cheese fondue with crusty baguette cubes and charcuterie.', location: 'Montmartre Hill', cost_estimate: '$28', travel_tips: 'Pair with crisp Savoie white wine.' }
        ]
      },
      {
        day_number: 4,
        theme: 'Le Marais Boutiques & Latin Quarter Books',
        activities: [
          { time_slot: 'Morning', title: 'Place des Vosges & Pastry Walk', description: 'Paris’s oldest planned square surrounded by symmetrical red brick facades; taste salted butter caramels.', location: 'Le Marais', cost_estimate: '$8', travel_tips: 'Victor Hugo\'s former house is located in the corner.' },
          { time_slot: 'Afternoon', title: 'L’As du Fallafel on Rue des Rosiers', description: 'World-famous pita stuffed with crispy golden chickpea fritters, fried eggplant, and spicy sauce.', location: 'Rue des Rosiers', cost_estimate: '$10', travel_tips: 'Line moves very fast; well worth the 10-minute wait.' },
          { time_slot: 'Evening', title: 'Shakespeare and Company & Notre-Dame', description: 'Historic English bookstore packed floor-to-ceiling with vintage books right across from Notre-Dame.', location: 'Latin Quarter', cost_estimate: 'Free', travel_tips: 'Upstairs piano is open for visitors to play softly.' }
        ]
      }
    ]
  },
  {
    id: 'exp-dubai',
    destination: 'Dubai, UAE',
    title: 'Futuristic Skyscrapers & Desert Dunes',
    category: 'Luxury & Modern',
    badge: 'Futuristic ⚡',
    duration: '4 Days',
    budget: 'luxury',
    travel_style: 'balanced',
    interests: ['Shopping', 'Photography', 'Adventure & Sports', 'Food & Dining'],
    cover_image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    summary: 'Experience the world\'s most ambitious metropolis: touch the sky at Burj Khalifa, cruise along Marina yacht docks, ride 4x4 dunes at sunset, and dine in underwater aquariums.',
    estimated_total_cost: '$1,200 - $1,750',
    highlights: ['Burj Khalifa Level 148', 'Red Dune 4x4 Desert Safari', 'Dubai Marina Night Walk', 'Museum of the Future'],
    days: [
      {
        day_number: 1,
        theme: 'Sky-High Downtown & Fountain Wonders',
        activities: [
          { time_slot: 'Morning', title: 'Burj Khalifa Observation Deck', description: 'Elevate to Level 124 & 125 for unmatched vistas of the skyline, desert edge, and ocean.', location: 'Downtown Dubai', cost_estimate: '$45', travel_tips: 'Book non-prime morning slot to skip massive queues.' },
          { time_slot: 'Afternoon', title: 'Dubai Mall & Giant Aquarium', description: 'Explore the largest shopping complex in the world and view the 10-million-liter suspended aquarium.', location: 'Downtown Dubai', cost_estimate: 'Free ($30 inside tunnel)', travel_tips: 'Check out the indoor human waterfall installation.' },
          { time_slot: 'Evening', title: 'Dubai Fountain Light & Water Show', description: 'Choreographed dancing fountains shooting water 150m high to international and Arabic tunes.', location: 'Burj Lake', cost_estimate: 'Free', travel_tips: 'Shows run every 30 minutes starting at 6:00 PM.' }
        ]
      },
      {
        day_number: 2,
        theme: 'Red Dunes Safari & Bedouin Camp',
        activities: [
          { time_slot: 'Morning', title: 'Museum of the Future', description: 'Architectural marvel covered in Arabic calligraphy showcasing AI, space travel, and bio-engineering.', location: 'Sheikh Zayed Rd', cost_estimate: '$40', travel_tips: 'Must book tickets weeks in advance.' },
          { time_slot: 'Afternoon', title: 'Lahbab Red Dune Bashing & Sandboarding', description: '4x4 Land Cruiser dune bashing across towering crimson desert dunes and sand surfing.', location: 'Lahbab Desert', cost_estimate: '$65', travel_tips: 'Hold on tight during dune roller-coaster drops!' },
          { time_slot: 'Evening', title: 'Barbecue Dinner & Fire Show under Stars', description: 'Traditional Bedouin desert camp with henna tattooing, falconry, grilled kebabs, and Tanoura dance.', location: 'Desert Oasis', cost_estimate: 'Included in safari', travel_tips: 'Stargazing in desert clarity is unforgettable.' }
        ]
      },
      {
        day_number: 3,
        theme: 'Dubai Marina & Palm Jumeirah',
        activities: [
          { time_slot: 'Morning', title: 'The View at The Palm', description: '52-story observatory with 360-degree views of the iconic man-made Palm Island and Arabian Gulf.', location: 'Nakheel Mall, Palm', cost_estimate: '$30', travel_tips: 'Great exhibits on how the palm islands were engineered.' },
          { time_slot: 'Afternoon', title: 'Marina Yacht Cruise', description: 'Leisurely 2-hour boat cruise between skyscrapers of Dubai Marina and JBR beachfront.', location: 'Dubai Marina Walk', cost_estimate: '$35', travel_tips: 'Complimentary drinks and snacks on deck.' },
          { time_slot: 'Evening', title: 'Dinner at Pier 7 Marina', description: 'Multi-story circular tower on the water with seven different dining terraces overlooking neon marina.', location: 'Dubai Marina Pier 7', cost_estimate: '$60', travel_tips: 'Asia Asia on the 6th floor has magnificent ambiance.' }
        ]
      },
      {
        day_number: 4,
        theme: 'Old Dubai Spice & Gold Souks',
        activities: [
          { time_slot: 'Morning', title: 'Abra Water Taxi Across Dubai Creek', description: 'Traditional wooden boat ride across the historic creek for just 1 AED (approx $0.27).', location: 'Bur Dubai to Deira', cost_estimate: '$1', travel_tips: 'The most authentic and scenic cheap thrill in Dubai.' },
          { time_slot: 'Mid-day', title: 'Gold & Spice Souk Exploration', description: 'Wander past vibrant sacks of saffron, frankincense, dried rosebuds, and dazzling gold jewelry windows.', location: 'Deira Souks', cost_estimate: 'Free', travel_tips: 'Polite haggling is customary; you can negotiate 20-30% off saffron.' },
          { time_slot: 'Evening', title: 'Al Fahidi Historic District & Tea', description: '19th-century wind-tower houses made of gypsum and coral; visit Arabian Tea House for camel milk ice cream.', location: 'Al Fahidi, Bur Dubai', cost_estimate: '$18', travel_tips: 'Taste freshly baked Emirati khubz bread with honey.' }
        ]
      }
    ]
  },
  {
    id: 'exp-goa',
    destination: 'Goa, India',
    title: 'Sun, Spice & Portuguese Heritage',
    category: 'Beaches & Heritage',
    badge: 'Tropical 🌴',
    duration: '4 Days',
    budget: 'budget',
    travel_style: 'relaxed',
    interests: ['Beaches & Relaxation', 'Food & Dining', 'History & Culture', 'Nightlife'],
    cover_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    summary: 'Laid-back vibes, golden palm-fringed sands, Portuguese colonial villas of Fontainhas, zesty Goan fish curry, spice plantations, and beachfront sunset music.',
    estimated_total_cost: '$220 - $350 (₹18,000 - ₹28,000)',
    highlights: ['Fontainhas Latin Quarter', 'Palolem Beach Kayaking', 'Old Goa Bom Jesus Basilica', 'Sunset Beach Shacks'],
    days: [
      {
        day_number: 1,
        theme: 'Colonial Latin Quarter & Mandovi River',
        activities: [
          { time_slot: 'Morning', title: 'Fontainhas Heritage Walk', description: 'Wander through Panaji\'s historic Latin Quarter with vibrant yellow, blue, and terracotta Portuguese houses.', location: 'Fontainhas, Panaji', cost_estimate: 'Free', travel_tips: 'Pop into Confeitaria 31 De Janeiro for warm Bebinca cake.' },
          { time_slot: 'Afternoon', title: 'Church of Our Lady of the Immaculate Conception', description: 'Stunning zigzag baroque staircase in the heart of the capital.', location: 'Panaji Church Square', cost_estimate: 'Free', travel_tips: 'Famous spot featured in numerous cinema scenes.' },
          { time_slot: 'Evening', title: 'Authentic Goan Thali at Ritz Classic', description: 'Traditional seafood thali with kingfish fry, crab masala, tisrya (clams), and kadi.', location: '18th June Road, Panaji', cost_estimate: '$6', travel_tips: 'Sip on refreshing solkadhi (kokum coconut milk).' }
        ]
      },
      {
        day_number: 2,
        theme: 'Old Goa Cathedrals & Spice Plantation',
        activities: [
          { time_slot: 'Morning', title: 'Basilica of Bom Jesus & Se Cathedral', description: 'UNESCO World Heritage church holding the sacred relics of St. Francis Xavier.', location: 'Old Goa', cost_estimate: 'Free', travel_tips: 'Dress respectfully covering shoulders and knees.' },
          { time_slot: 'Afternoon', title: 'Sahakari Spice Farm Tour & Buffet', description: 'Walk through plantations of vanilla, cinnamon, cardamom, and black pepper with traditional buffet lunch on banana leaf.', location: 'Ponda, Goa', cost_estimate: '$8', travel_tips: 'Enjoy welcome herbal tea and marigold garlands.' },
          { time_slot: 'Evening', title: 'Sunset at Miramar Beach', description: 'Wide flat beach where Mandovi River meets the Arabian Sea.', location: 'Miramar', cost_estimate: 'Free', travel_tips: 'Try roasted spicy corn-on-the-cob from vendors.' }
        ]
      },
      {
        day_number: 3,
        theme: 'South Goa Serenity: Palolem & Agonda',
        activities: [
          { time_slot: 'Morning', title: 'Palolem Crescent Beach & Kayaking', description: 'Gentle calm bay framed by coconut palms; kayak to Butterfly Beach or spot dolphins.', location: 'Palolem, South Goa', cost_estimate: '$7', travel_tips: 'Morning waters are glassy and crystal clear.' },
          { time_slot: 'Afternoon', title: 'Cabo de Rama Fort Viewpoint', description: 'Ancient cliffside fort ruins offering dramatic panoramas of pristine sea cliffs.', location: 'Canacona', cost_estimate: 'Free', travel_tips: 'Bring water; paths are rocky but views are unmatched.' },
          { time_slot: 'Evening', title: 'Candlelit Beach Shack Dining with Live Music', description: 'Feet in the soft sand, fairy lights, fresh butter garlic prawns, and acoustic reggae.', location: 'Agonda Beach Shack', cost_estimate: '$15', travel_tips: 'Watch waves lap up right near your table.' }
        ]
      },
      {
        day_number: 4,
        theme: 'North Goa Coastal Forts & Night Vibes',
        activities: [
          { time_slot: 'Morning', title: 'Aguada Fort & Portuguese Lighthouse', description: '17th-century freshwater storage fort standing guard over Sinquerim beach.', location: 'Candolim', cost_estimate: '$3', travel_tips: 'Visit the lower fort wall for crashing wave views.' },
          { time_slot: 'Afternoon', title: 'Anjuna Flea Market & Beach Vibes', description: 'Eclectic market with handmade jewelry, bohemian dresses, spices, and chill beach beats.', location: 'Anjuna Beach', cost_estimate: 'Free', travel_tips: 'Great place to buy souvenirs and handmade crafts.' },
          { time_slot: 'Evening', title: 'Sunset Party at Thalassa / Curlies', description: 'Iconic clifftop Greek-Goan tavern with sunset views over Vagator beach followed by ambient music.', location: 'Vagator / Siolim', cost_estimate: '$25', travel_tips: 'Pre-book sunset tables as they are in high demand.' }
        ]
      }
    ]
  }
];

export default function ExplorePage() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { formatCost } = useCurrency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activePreviewTrip, setActivePreviewTrip] = useState(null);
  const [saveLoadingId, setSaveLoadingId] = useState(null);
  const [savedSuccessId, setSavedSuccessId] = useState(null);
  const [loadedImages, setLoadedImages] = useState({});
  const [bookmarkedMap, setBookmarkedMap] = useState({});

  useEffect(() => {
    async function loadBookmarks() {
      const items = await getSavedDestinations(user);
      const map = {};
      items.forEach((it) => {
        const key = it.slug || it.id;
        if (key) map[key] = true;
      });
      setBookmarkedMap(map);
    }
    loadBookmarks();
  }, [user]);

  const handleToggleBookmark = async (e, tripItem) => {
    e.stopPropagation();
    const isNowSaved = await toggleSaveDestination(user, tripItem);
    const key = tripItem.slug || tripItem.id;
    setBookmarkedMap((prev) => ({
      ...prev,
      [key]: isNowSaved,
    }));
  };

  const categories = ['All', 'Cultural', 'Romantic', 'Adventure', 'Food & Art', 'Luxury & Modern', 'Beaches & Heritage'];

  const filteredTrips = CURATED_ITINERARIES.filter((item) => {
    const matchesSearch = 
      item.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Action: Open Full Trip in TripDetailPage
  const handleViewFullTrip = (trip) => {
    const fullTripPayload = {
      id: trip.id,
      fromExplore: true,
      destination: trip.destination,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + (trip.days.length - 1) * 86400000).toISOString().split('T')[0],
      budget: trip.budget,
      travel_style: trip.travel_style,
      interests: trip.interests,
      itinerary_data: {
        destination: trip.destination,
        summary: trip.summary,
        estimated_total_cost: trip.estimated_total_cost,
        days: trip.days,
      }
    };
    sessionStorage.setItem('viewing_trip', JSON.stringify(fullTripPayload));
    navigate('/trip/new');
  };

  // Action: Save directly to User's Dashboard
  const handleSaveToMyTrips = async (e, trip) => {
    e.stopPropagation();
    if (!user) {
      alert('Please sign in to save this curated itinerary to your personal trips!');
      navigate('/login');
      return;
    }

    setSaveLoadingId(trip.id);
    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + (trip.days.length - 1) * 86400000).toISOString().split('T')[0];

    const tripRecord = {
      id: 'trip_' + Date.now(),
      user_id: user.id,
      destination: trip.destination,
      start_date: today,
      end_date: endDate,
      budget: trip.budget,
      travel_style: trip.travel_style,
      interests: trip.interests,
      itinerary_data: {
        destination: trip.destination,
        summary: trip.summary,
        estimated_total_cost: trip.estimated_total_cost,
        days: trip.days,
      },
      created_at: new Date().toISOString(),
    };

    // Helper: always save to local storage so the trip is never lost
    const saveToLocalStorage = (t) => {
      try {
        const stored = JSON.parse(localStorage.getItem('wanderplan_local_trips') || '[]');
        const updated = [t, ...stored.filter(item => item.id !== t.id)];
        localStorage.setItem('wanderplan_local_trips', JSON.stringify(updated));
      } catch (err) {}
    };

    saveToLocalStorage(tripRecord);

    // If valid UUID format, try saving to Supabase too
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);

    if (isUuid && !user.isGuest) {
      try {
        const { data, error } = await supabase.from('trips').insert([
          {
            user_id: user.id,
            destination: trip.destination,
            start_date: today,
            end_date: endDate,
            budget: trip.budget,
            travel_style: trip.travel_style,
            interests: trip.interests,
            itinerary_data: tripRecord.itinerary_data,
          },
        ]).select();

        if (data?.[0]) {
          saveToLocalStorage(data[0]);
        }
      } catch (err) {
        console.warn('Supabase sync skipped, stored locally:', err);
      }
    }

    setSavedSuccessId(trip.id);
    setSaveLoadingId(null);
    setTimeout(() => setSavedSuccessId(null), 3000);
  };

  // Action: Customize in Home Planner
  const handleCustomizeInPlanner = (trip) => {
    sessionStorage.setItem('prefill_planner', JSON.stringify({
      destination: trip.destination,
      budget: trip.budget,
      travelStyle: trip.travel_style,
      interests: trip.interests,
    }));
    navigate('/');
  };

  return (
    <div className="explore-page-root" style={{ minHeight: '100vh', padding: '2.5rem 1.25rem 6rem 1.25rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {/* Header Hero Banner with Chatak Neon Glow */}
        <div 
          className="glass-card" 
          style={{
            position: 'relative',
            padding: '3.5rem 2.5rem',
            borderRadius: '24px',
            background: 'radial-gradient(circle at 10% 20%, rgba(255, 0, 122, 0.22) 0%, rgba(16, 22, 36, 0.95) 60%), radial-gradient(circle at 90% 80%, rgba(0, 245, 155, 0.18) 0%, rgba(16, 22, 36, 0.95) 60%)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 0, 122, 0.15)',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #ff007a, #ff6a00, #00f59b)' }} />

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(255, 0, 122, 0.15)', color: '#ff007a', border: '1px solid rgba(255, 0, 122, 0.4)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem', boxShadow: '0 0 15px rgba(255, 0, 122, 0.25)' }}>
            <Sparkles size={15} /> Handcrafted Travel Library
          </div>

          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, background: 'linear-gradient(135deg, #ffffff 40%, #00f59b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            Explore Verified Master Itineraries
          </h1>

          <p style={{ color: '#cbd5e1', fontSize: '1.15rem', marginTop: '1rem', maxWidth: '760px', lineHeight: 1.6 }}>
            Browse ready-to-travel itineraries created by local explorers and AI. <strong>Preview day-by-day plans</strong>, <strong>save them directly to your dashboard</strong>, or <strong>customize them in the AI planner</strong> in one click!
          </p>

          {/* Search & Filter Toolbar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: '#00f59b' }} />
                <input
                  type="text"
                  placeholder="Search by city, attraction, or theme (e.g. Kyoto, Beach, Safari)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-text"
                  style={{ paddingLeft: '3rem', backgroundColor: 'rgba(11, 16, 26, 0.85)', borderColor: 'rgba(0, 245, 155, 0.3)' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 700 }}>
                <Filter size={16} color="#ff6a00" /> Filter:
              </div>
            </div>

            {/* Category Chips */}
            <div style={{ display: 'flex', gap: '0.65rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.5rem 1.15rem',
                    borderRadius: '9999px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    background: selectedCategory === cat ? 'linear-gradient(135deg, #00f59b 0%, #00d2ff 100%)' : 'rgba(255, 255, 255, 0.06)',
                    color: selectedCategory === cat ? '#000000' : '#e2e8f0',
                    border: selectedCategory === cat ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: selectedCategory === cat ? '0 0 18px rgba(0, 245, 155, 0.4)' : 'none',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.95rem' }}>
          <span>Showing <strong>{filteredTrips.length}</strong> handcrafted itineraries</span>
          {selectedCategory !== 'All' && (
            <span>Filtered by: <strong style={{ color: '#00f59b' }}>{selectedCategory}</strong></span>
          )}
        </div>

        {/* Itineraries Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {filteredTrips.length === 0 ? (
            <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center' }}>
              <Compass size={48} style={{ color: '#ff6a00', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: '1.4rem', color: '#ffffff' }}>No matching itineraries found</h3>
              <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Try clearing your search query or selecting a different category.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="btn-secondary" 
                style={{ marginTop: '1.5rem' }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const isSaved = savedSuccessId === trip.id;
              const isSaving = saveLoadingId === trip.id;

              return (
                <div 
                  key={trip.id}
                  className="glass-card"
                  style={{
                    borderRadius: '22px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(16, 22, 36, 0.85)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.borderColor = 'rgba(255, 0, 122, 0.45)';
                    e.currentTarget.style.boxShadow = '0 20px 45px rgba(255, 0, 122, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.4)';
                  }}
                >
                  {/* Image Cover */}
                  <div style={{ position: 'relative', height: '210px', overflow: 'hidden' }}>
                    {/* Animated Skeleton Shimmer until image loads */}
                    {!loadedImages[trip.id] && (
                      <div className="skeleton-shimmer" style={{ position: 'absolute', inset: 0, zIndex: 1 }} />
                    )}
                    <img 
                      src={trip.cover_image} 
                      alt={trip.destination} 
                      onLoad={() => setLoadedImages((prev) => ({ ...prev, [trip.id]: true }))}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        transition: 'transform 0.4s ease, opacity 0.3s ease',
                        opacity: loadedImages[trip.id] ? 1 : 0
                      }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(9, 13, 22, 0.9) 100%)', zIndex: 2 }} />

                    {/* Badge */}
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem', zIndex: 3 }}>
                      <button
                        onClick={(e) => handleToggleBookmark(e, trip)}
                        className="bookmark-heart-btn"
                        title={bookmarkedMap[trip.slug || trip.id] ? 'Remove from Saved Destinations' : 'Save to Bookmarks'}
                      >
                        <Heart 
                          size={16} 
                          fill={bookmarkedMap[trip.slug || trip.id] ? '#ef4444' : 'transparent'} 
                          color={bookmarkedMap[trip.slug || trip.id] ? '#ef4444' : '#ffffff'} 
                        />
                      </button>

                      <div style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)', padding: '0.35rem 0.85rem', borderRadius: '9999px', color: '#00f59b', fontSize: '0.78rem', fontWeight: 800, border: '1px solid rgba(0, 245, 155, 0.35)' }}>
                        {trip.badge}
                      </div>
                    </div>

                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(255, 0, 122, 0.85)', backdropFilter: 'blur(4px)', padding: '0.3rem 0.75rem', borderRadius: '9999px', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, zIndex: 3 }}>
                      {trip.category}
                    </div>

                    {/* Destination Title on Image */}
                    <div style={{ position: 'absolute', bottom: '1rem', left: '1.25rem', right: '1.25rem', zIndex: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#00f59b', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <MapPin size={13} /> {trip.destination}
                      </div>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: '0.2rem 0 0 0', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                        {trip.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '1.1rem' }}>
                    <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.55, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {trip.summary}
                    </p>

                    {/* Metadata Chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <span className="neon-pill-sm">
                        <Clock size={12} color="#00f59b" /> {trip.duration}
                      </span>
                      <span className="neon-pill-sm">
                        <Coins size={12} color="#ff6a00" /> {trip.budget}
                      </span>
                      <span className="neon-pill-sm">
                        <Compass size={12} color="#ff007a" /> {trip.travel_style}
                      </span>
                      {trip.estimated_total_cost && (
                        <span className="neon-pill-sm" style={{ color: '#00f59b', borderColor: 'rgba(0, 245, 155, 0.4)' }}>
                          {formatCost(trip.estimated_total_cost)}
                        </span>
                      )}
                    </div>

                    {/* Key Highlights */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ff6a00', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.45rem' }}>
                        ⭐ Highlights Included
                      </span>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {trip.highlights.slice(0, 3).map((hl, i) => (
                          <li key={i} style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <CheckCircle2 size={13} color="#00f59b" /> {hl}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons: Direct Utility */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingTop: '0.5rem' }}>
                      
                      {/* Main Button: Full View Plan */}
                      <button
                        onClick={() => handleViewFullTrip(trip)}
                        className="btn-glow"
                        style={{ width: '100%', justifyContent: 'center', padding: '0.75rem 1rem' }}
                      >
                        <Eye size={16} /> View Full Itinerary ({trip.days.length} Days)
                      </button>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                        {/* Save to My Trips */}
                        <button
                          onClick={(e) => handleSaveToMyTrips(e, trip)}
                          disabled={isSaving || isSaved}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: isSaved ? '#00f59b' : 'rgba(255, 255, 255, 0.08)',
                            color: isSaved ? '#000000' : '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {isSaving ? (
                            <Loader2 size={14} className="spinner" />
                          ) : isSaved ? (
                            <Check size={14} />
                          ) : (
                            <BookmarkCheck size={14} color="#00f59b" />
                          )}
                          {isSaved ? 'Saved!' : 'Save Trip'}
                        </button>

                        {/* Customize in Planner */}
                        <button
                          onClick={() => handleCustomizeInPlanner(trip)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.35rem',
                            padding: '0.6rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: 'rgba(255, 106, 0, 0.15)',
                            color: '#ffaa55',
                            border: '1px solid rgba(255, 106, 0, 0.4)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <Sparkles size={14} color="#ff6a00" /> Customize
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
