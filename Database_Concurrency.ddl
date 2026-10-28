UPDATE seats 
SET status = 'RESERVED', 
    version = version + 1 
WHERE seat_id = 101 
  AND status = 'AVAILABLE';
