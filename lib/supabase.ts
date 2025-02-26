import { createClient } from '@supabase/supabase-js';

// These will be replaced with actual values from your Supabase project
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our database
export type Score = {
  id: number;
  user_name: string;
  score: number;
  difficulty: string;
  created_at: string;
};

// Function to save a score
export async function saveScore(userName: string, score: number, difficulty: string = 'normal') {
  try {
    console.log(`Attempting to save score for ${userName} (${difficulty}): ${score}`);
    
    // First, check if the user already exists with this name and difficulty
    const { data: existingRecords, error: fetchError } = await supabase
      .from('scores')
      .select('*')
      .eq('user_name', userName)
      .eq('difficulty', difficulty);
    
    if (fetchError) {
      console.error('Error checking for existing user:', fetchError);
      return null;
    }
    
    // If user exists, only update if the new score is higher
    if (existingRecords && existingRecords.length > 0) {
      const existingUser = existingRecords[0];
      console.log(`Found existing record for ${userName} with score ${existingUser.score}`);
      
      // Only update if the new score is higher
      if (score > existingUser.score) {
        const { data: updatedData, error: updateError } = await supabase
          .from('scores')
          .update({ score, updated_at: new Date().toISOString() })
          .eq('id', existingUser.id)
          .select();
        
        if (updateError) {
          console.error('Error updating score:', updateError);
          return null;
        }
        
        console.log(`Score updated for ${userName} from ${existingUser.score} to ${score}`);
        return updatedData?.[0];
      } else {
        console.log(`Score not updated for ${userName} as new score (${score}) is not higher than existing score (${existingUser.score})`);
        return existingUser;
      }
    } else {
      console.log(`No existing record found for ${userName} (${difficulty}), creating new record`);
      // User doesn't exist, insert new record
      const { data: insertedData, error: insertError } = await supabase
        .from('scores')
        .insert([{ user_name: userName, score, difficulty }])
        .select();
      
      if (insertError) {
        console.error('Error saving new score:', insertError);
        return null;
      }
      
      console.log(`New score saved for ${userName}: ${score}`);
      return insertedData?.[0];
    }
  } catch (error) {
    console.error('Unexpected error in saveScore:', error);
    return null;
  }
}

// Function to get top scores
export async function getTopScores(limit = 10, difficulty?: string) {
  let query = supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false });
  
  // Filter by difficulty if provided
  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }
  
  const { data, error } = await query.limit(limit);
  
  if (error) {
    console.error('Error fetching scores:', error);
    return [];
  }
  
  return data as Score[];
}
