import { supabase } from './supabaseClient';

const LOCAL_SAVED_KEY = 'wanderplan_saved_destinations';

/**
 * Get all bookmarked destinations for current user (from Supabase or localStorage fallback)
 */
export async function getSavedDestinations(user) {
  let localList = [];
  try {
    const raw = localStorage.getItem(LOCAL_SAVED_KEY);
    localList = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  if (user && !user.isGuest && user.id) {
    try {
      const { data, error } = await supabase
        .from('saved_destinations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        // Merge Supabase with any local unsynced
        const remoteSlugs = new Set(data.map((d) => d.slug));
        const merged = [
          ...data.map((d) => d.destination_data || d),
          ...localList.filter((item) => !remoteSlugs.has(item.slug || item.id)),
        ];
        return merged;
      }
    } catch (e) {
      console.warn('Supabase getSavedDestinations error:', e);
    }
  }

  return localList;
}

/**
 * Toggle bookmarking a destination card
 */
export async function toggleSaveDestination(user, destinationItem) {
  const slug = destinationItem.slug || destinationItem.id;
  let localList = [];
  try {
    const raw = localStorage.getItem(LOCAL_SAVED_KEY);
    localList = raw ? JSON.parse(raw) : [];
  } catch (e) {}

  const exists = localList.some((item) => (item.slug || item.id) === slug);
  let updatedLocal = [];

  if (exists) {
    updatedLocal = localList.filter((item) => (item.slug || item.id) !== slug);
  } else {
    updatedLocal = [destinationItem, ...localList];
  }
  localStorage.setItem(LOCAL_SAVED_KEY, JSON.stringify(updatedLocal));

  // Sync with Supabase if real user
  if (user && !user.isGuest && user.id) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (isUuid) {
      try {
        if (exists) {
          await supabase
            .from('saved_destinations')
            .delete()
            .eq('user_id', user.id)
            .eq('slug', slug);
        } else {
          await supabase
            .from('saved_destinations')
            .insert([
              {
                id: `saved_${slug}_${Date.now()}`,
                user_id: user.id,
                slug,
                title: destinationItem.title || destinationItem.destination,
                destination_data: destinationItem,
              },
            ]);
        }
      } catch (e) {
        console.warn('Supabase toggleSaveDestination error:', e);
      }
    }
  }

  return !exists; // returns true if now saved, false if unsaved
}

/**
 * Get user preferences (default_currency, default_pace, default_budget, dietary_notes, mobility_notes)
 */
export async function getUserPreferences(user) {
  const localPref = {
    default_currency: localStorage.getItem('wanderplan_currency') || 'USD',
    default_pace: localStorage.getItem('wanderplan_pref_pace') || 'balanced',
    default_budget: localStorage.getItem('wanderplan_pref_budget') || 'moderate',
    dietary_notes: localStorage.getItem('wanderplan_dietary') || '',
    mobility_notes: localStorage.getItem('wanderplan_mobility') || '',
  };

  if (user && !user.isGuest && user.id) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (isUuid) {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          return {
            ...localPref,
            ...data,
          };
        }
      } catch (e) {}
    }
  }

  return localPref;
}

/**
 * Save user preferences
 */
export async function saveUserPreferences(user, preferences) {
  localStorage.setItem('wanderplan_currency', preferences.default_currency || 'USD');
  localStorage.setItem('wanderplan_pref_pace', preferences.default_pace || 'balanced');
  localStorage.setItem('wanderplan_pref_budget', preferences.default_budget || 'moderate');
  localStorage.setItem('wanderplan_dietary', preferences.dietary_notes || '');
  localStorage.setItem('wanderplan_mobility', preferences.mobility_notes || '');

  if (user && !user.isGuest && user.id) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (isUuid) {
      try {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            default_currency: preferences.default_currency,
            default_pace: preferences.default_pace,
            default_budget: preferences.default_budget,
            dietary_notes: preferences.dietary_notes,
            mobility_notes: preferences.mobility_notes,
            updated_at: new Date().toISOString(),
          });
      } catch (e) {
        console.warn('Supabase saveUserPreferences warning:', e);
      }
    }
  }

  return true;
}
