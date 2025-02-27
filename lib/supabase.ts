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
  // Create a unique identifier for this save operation
  const saveId = `${userName}-${difficulty}-${Date.now()}`;
  console.log(`[${saveId}] Starting save operation`);
  
  try {
    // Validate inputs
    if (!userName || userName.trim() === '') {
      console.error(`[${saveId}] Invalid username provided`);
      return null;
    }
    
    // Normalize the username by trimming whitespace
    const normalizedUserName = userName.trim();
    
    console.log(`[${saveId}] Attempting to save score for ${normalizedUserName} (${difficulty}): ${score}`);
    
    // First, check if the user already exists with this name and difficulty
    const { data: existingRecords, error: fetchError } = await supabase
      .from('scores')
      .select('*')
      .eq('user_name', normalizedUserName)
      .eq('difficulty', difficulty);
    
    if (fetchError) {
      console.error(`[${saveId}] Error checking for existing user:`, fetchError);
      return null;
    }
    
    // If user exists, only update if the new score is higher
    if (existingRecords && existingRecords.length > 0) {
      const existingUser = existingRecords[0];
      console.log(`[${saveId}] Found existing record for ${normalizedUserName} with score ${existingUser.score}`);
      
      // Only update if the new score is higher
      if (score > existingUser.score) {
        const { data: updatedData, error: updateError } = await supabase
          .from('scores')
          .update({ score, updated_at: new Date().toISOString() })
          .eq('id', existingUser.id)
          .select();
        
        if (updateError) {
          console.error(`[${saveId}] Error updating score:`, updateError);
          return null;
        }
        
        console.log(`[${saveId}] Score updated for ${normalizedUserName} from ${existingUser.score} to ${score}`);
        return updatedData?.[0];
      } else {
        console.log(`[${saveId}] Score not updated for ${normalizedUserName} as new score (${score}) is not higher than existing score (${existingUser.score})`);
        return existingUser;
      }
    } else {
      console.log(`[${saveId}] No exact match found for ${normalizedUserName} (${difficulty}), checking for similar names`);
      
      // Check for similar usernames (case insensitive)
      const { data: similarRecords, error: similarError } = await supabase
        .from('scores')
        .select('*')
        .ilike('user_name', normalizedUserName)
        .eq('difficulty', difficulty);
      
      if (similarError) {
        console.error(`[${saveId}] Error checking for similar usernames:`, similarError);
      } else if (similarRecords && similarRecords.length > 0) {
        const similarUser = similarRecords[0];
        console.log(`[${saveId}] Found similar record for "${similarUser.user_name}" with score ${similarUser.score}`);
        
        // Only update if the new score is higher
        if (score > similarUser.score) {
          const { data: updatedData, error: updateError } = await supabase
            .from('scores')
            .update({ score, updated_at: new Date().toISOString() })
            .eq('id', similarUser.id)
            .select();
          
          if (updateError) {
            console.error(`[${saveId}] Error updating score for similar user:`, updateError);
            return null;
          }
          
          console.log(`[${saveId}] Score updated for similar user ${similarUser.user_name} from ${similarUser.score} to ${score}`);
          return updatedData?.[0];
        } else {
          console.log(`[${saveId}] Score not updated for similar user ${similarUser.user_name} as new score (${score}) is not higher than existing score (${similarUser.score})`);
          return similarUser;
        }
      }
      
      // Double check one more time before inserting (to handle race conditions)
      const { data: finalCheck, error: finalCheckError } = await supabase
        .from('scores')
        .select('*')
        .eq('user_name', normalizedUserName)
        .eq('difficulty', difficulty);
        
      if (finalCheckError) {
        console.error(`[${saveId}] Error in final check:`, finalCheckError);
      } else if (finalCheck && finalCheck.length > 0) {
        // Someone else inserted a record while we were checking
        const existingUser = finalCheck[0];
        console.log(`[${saveId}] Found record in final check for ${normalizedUserName} with score ${existingUser.score}`);
        
        // Only update if the new score is higher
        if (score > existingUser.score) {
          const { data: updatedData, error: updateError } = await supabase
            .from('scores')
            .update({ score, updated_at: new Date().toISOString() })
            .eq('id', existingUser.id)
            .select();
          
          if (updateError) {
            console.error(`[${saveId}] Error updating score in final check:`, updateError);
            return null;
          }
          
          console.log(`[${saveId}] Score updated in final check for ${normalizedUserName} from ${existingUser.score} to ${score}`);
          return updatedData?.[0];
        } else {
          console.log(`[${saveId}] Score not updated in final check for ${normalizedUserName} as new score (${score}) is not higher than existing score (${existingUser.score})`);
          return existingUser;
        }
      }
      
      // No existing record found, insert new record
      console.log(`[${saveId}] No existing record found, creating new record for ${normalizedUserName}`);
      const { data: insertedData, error: insertError } = await supabase
        .from('scores')
        .insert([{ user_name: normalizedUserName, score, difficulty }])
        .select();
      
      if (insertError) {
        console.error(`[${saveId}] Error saving new score:`, insertError);
        return null;
      }
      
      console.log(`[${saveId}] New score saved for ${normalizedUserName}: ${score}`);
      return insertedData?.[0];
    }
  } catch (error) {
    console.error(`[${saveId}] Unexpected error in saveScore:`, error);
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
