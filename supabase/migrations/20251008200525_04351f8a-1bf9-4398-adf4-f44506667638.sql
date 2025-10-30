-- Добавляем трек-номер в таблицу заказов
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS track_number TEXT UNIQUE;

-- Функция для генерации 10-значного трек-номера
CREATE OR REPLACE FUNCTION generate_track_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  track_num TEXT;
  exists_check INTEGER;
BEGIN
  LOOP
    -- Генерируем 10-значное число
    track_num := LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
    
    -- Проверяем уникальность
    SELECT COUNT(*) INTO exists_check 
    FROM public.orders 
    WHERE track_number = track_num;
    
    EXIT WHEN exists_check = 0;
  END LOOP;
  
  RETURN track_num;
END;
$$;

-- Триггер для автоматической генерации трек-номера
CREATE OR REPLACE FUNCTION set_track_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.track_number IS NULL THEN
    NEW.track_number := generate_track_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_track_number_trigger ON public.orders;
CREATE TRIGGER orders_track_number_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION set_track_number();

-- Обновляем статус по умолчанию
ALTER TABLE public.orders 
ALTER COLUMN status SET DEFAULT 'pending'::order_status;

-- Добавляем трек-номер в историю заказов
ALTER TABLE public.order_history
ADD COLUMN IF NOT EXISTS track_number TEXT;