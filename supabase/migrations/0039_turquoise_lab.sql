/*
  # Add Therapist Rating Trigger

  1. Drop existing trigger and function if they exist
  2. Create function to update review stats
  3. Create trigger to automatically update ratings
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS update_therapist_rating_trigger ON therapist_reviews;
DROP FUNCTION IF EXISTS update_therapist_rating();

-- Create function to update review stats
CREATE OR REPLACE FUNCTION update_therapist_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE therapist_profiles
  SET 
    rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM therapist_reviews
      WHERE therapist_id = NEW.therapist_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM therapist_reviews
      WHERE therapist_id = NEW.therapist_id
    ),
    updated_at = now()
  WHERE id = NEW.therapist_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating ratings
CREATE TRIGGER update_therapist_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON therapist_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_therapist_rating();