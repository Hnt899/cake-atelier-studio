import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookUpdate {
  message?: {
    chat?: {
      id: number;
    };
    text?: string;
  };
  callback_query?: {
    data?: string;
    message?: {
      chat?: {
        id: number;
      };
      message_id?: number;
    };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const update: WebhookUpdate = await req.json();
    console.log('Received update:', JSON.stringify(update, null, 2));

    // Обработка callback от кнопок
    if (update.callback_query) {
      const callbackData = update.callback_query.data;
      const chatId = update.callback_query.message?.chat?.id;

      if (!callbackData || !chatId) {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Формат: action_orderId
      // Примеры: accept_uuid, cancel_uuid, delivered_uuid
      const [action, orderId] = callbackData.split('_');

      console.log(`Processing action: ${action} for order: ${orderId}`);

      if (action === 'accept') {
        // Принять заказ - обновить статус на 'preparing'
        const { error } = await supabaseClient
          .from('orders')
          .update({ status: 'preparing' })
          .eq('id', orderId);

        if (error) {
          console.error('Error accepting order:', error);
        } else {
          console.log('Order accepted:', orderId);
        }
      } else if (action === 'cancel') {
        // Отменить заказ - переместить в историю со статусом 'cancelled'
        const { data: order, error: fetchError } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (fetchError || !order) {
          console.error('Error fetching order:', fetchError);
        } else {
          // Переносим в историю
          await supabaseClient
            .from('order_history')
            .insert({
              user_id: order.user_id,
              order_id: order.id,
              items: order.items,
              total_price: order.total_price,
              customer_name: order.customer_name,
              customer_phone: order.customer_phone,
              delivery_date: order.delivery_date,
              comment: order.comment,
              track_number: order.track_number,
            });

          // Удаляем из активных заказов
          await supabaseClient
            .from('orders')
            .delete()
            .eq('id', orderId);

          console.log('Order cancelled:', orderId);
        }
      } else if (action === 'delivered') {
        // Заказ доставлен - переместить в историю
        const { data: order, error: fetchError } = await supabaseClient
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (fetchError || !order) {
          console.error('Error fetching order:', fetchError);
        } else {
          // Переносим в историю
          await supabaseClient
            .from('order_history')
            .insert({
              user_id: order.user_id,
              order_id: order.id,
              items: order.items,
              total_price: order.total_price,
              customer_name: order.customer_name,
              customer_phone: order.customer_phone,
              delivery_date: order.delivery_date,
              comment: order.comment,
              track_number: order.track_number,
            });

          // Удаляем из активных заказов
          await supabaseClient
            .from('orders')
            .delete()
            .eq('id', orderId);

          console.log('Order delivered:', orderId);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});