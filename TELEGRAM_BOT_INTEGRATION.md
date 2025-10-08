# Инструкции по интеграции Telegram бота

## Обзор системы

Сайт полностью подготовлен для интеграции с вашим Telegram ботом. Все заказы автоматически сохраняются в базу данных с трек-номерами и статусами.

## Структура базы данных

### Таблица `orders` (активные заказы)

Содержит все новые и активные заказы:

```typescript
{
  id: string (UUID),
  user_id: string (UUID),
  track_number: string (10 цифр, генерируется автоматически),
  customer_name: string,
  customer_phone: string,
  delivery_date: string (YYYY-MM-DD),
  items: JSON[], // Массив товаров
  total_price: number,
  comment: string | null,
  status: 'pending' | 'accepted' | 'preparing',
  created_at: timestamp,
  updated_at: timestamp
}
```

### Таблица `order_history` (завершённые заказы)

Содержит историю всех завершённых/отменённых заказов с теми же полями.

## Статусы заказов

1. **pending** - На рассмотрении (новый заказ)
2. **accepted** - Принят (админ нажал "Принять")
3. **preparing** - Готовится (то же что и accepted)
4. **cancelled** - Отменён (перенесён в историю)
5. **delivered** - Доставлен (перенесён в историю)

## API для бота

### 1. Получение новых заказов

Используйте Supabase REST API для получения заказов со статусом `pending`:

**Endpoint:**
```
GET https://hywekhhycgxyhvvfzqnx.supabase.co/rest/v1/orders?status=eq.pending&order=created_at.desc
```

**Headers:**
```
apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5d2VraGh5Y2d4eWh2dmZ6cW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTIwOTEsImV4cCI6MjA3NTE4ODA5MX0.OaRRQGGI-dQ6-toiaOwQs-XI4z9etvS-xXMnJKZOU9Y
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5d2VraGh5Y2d4eWh2dmZ6cW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTIwOTEsImV4cCI6MjA3NTE4ODA5MX0.OaRRQGGI-dQ6-toiaOwQs-XI4z9etvS-xXMnJKZOU9Y
```

### 2. Формирование сообщения для админа

```python
def format_order_message(order):
    # Формируем описание заказа
    items_description = ""
    for item in order['items']:
        if 'name' in item:
            # Торт из каталога
            items_description += f"- {item['name']} x{item['quantity']} ({item['price']} ₽)\n"
        else:
            # Кастомный торт
            items_description += "- Торт 'Создай сам':\n"
            if 'layers' in item:
                for key, value in item['layers'].items():
                    items_description += f"  {key}: {value}\n"
    
    message = f"""🆕 НОВЫЙ ЗАКАЗ

📦 Трек-номер: {order['track_number']}
👤 Имя: {order['customer_name']}
📱 Телефон: {order['customer_phone']}
📅 Дата доставки: {order['delivery_date']}

🎂 Заказ:
{items_description}

💰 Сумма: {order['total_price']} ₽

"""
    
    if order['comment']:
        message += f"💬 Комментарий:\n{order['comment']}\n"
    
    return message
```

### 3. Кнопки для админа

При новом заказе (status = 'pending'):

```python
keyboard = InlineKeyboardMarkup([
    [
        InlineKeyboardButton("✅ Принять заказ", callback_data=f"accept_{order['id']}"),
        InlineKeyboardButton("❌ Отменить", callback_data=f"cancel_{order['id']}")
    ]
])
```

После принятия заказа (status = 'preparing'):

```python
keyboard = InlineKeyboardMarkup([
    [
        InlineKeyboardButton("✅ Доставлен", callback_data=f"delivered_{order['id']}"),
        InlineKeyboardButton("❌ Отменить", callback_data=f"cancel_{order['id']}")
    ]
])
```

### 4. Обработка действий админа

#### Принять заказ (pending → preparing)

**Endpoint:**
```
PATCH https://hywekhhycgxyhvvfzqnx.supabase.co/rest/v1/orders?id=eq.{order_id}
```

**Headers:** (те же что выше)

**Body:**
```json
{
  "status": "preparing"
}
```

**Python пример:**
```python
import requests

def accept_order(order_id):
    url = f"https://hywekhhycgxyhvvfzqnx.supabase.co/rest/v1/orders?id=eq.{order_id}"
    headers = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    data = {"status": "preparing"}
    response = requests.patch(url, json=data, headers=headers)
    return response.status_code == 204
```

#### Отменить заказ (любой статус → history)

**Шаг 1 - Получить данные заказа:**
```
GET https://hywekhhycgxyhvvfzqnx.supabase.co/rest/v1/orders?id=eq.{order_id}
```

**Шаг 2 - Добавить в историю:**
```
POST https://hywekhhycgxyhvvfzqnx.supabase.co/rest/v1/order_history
```

**Body:**
```json
{
  "user_id": "{order.user_id}",
  "order_id": "{order.id}",
  "items": {order.items},
  "total_price": {order.total_price},
  "customer_name": "{order.customer_name}",
  "customer_phone": "{order.customer_phone}",
  "delivery_date": "{order.delivery_date}",
  "comment": "{order.comment}",
  "track_number": "{order.track_number}"
}
```

**Шаг 3 - Удалить из активных:**
```
DELETE https://hywekhhycgxyhvvfzqnx.supabase.co/rest/v1/orders?id=eq.{order_id}
```

**Python пример:**
```python
def cancel_order(order_id):
    base_url = "https://hywekhhycgxyhvvfzqnx.supabase.co/rest/v1"
    headers = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "Content-Type": "application/json"
    }
    
    # 1. Получаем заказ
    response = requests.get(f"{base_url}/orders?id=eq.{order_id}", headers=headers)
    order = response.json()[0]
    
    # 2. Добавляем в историю
    history_data = {
        "user_id": order["user_id"],
        "order_id": order["id"],
        "items": order["items"],
        "total_price": order["total_price"],
        "customer_name": order["customer_name"],
        "customer_phone": order["customer_phone"],
        "delivery_date": order["delivery_date"],
        "comment": order.get("comment"),
        "track_number": order["track_number"]
    }
    requests.post(f"{base_url}/order_history", json=history_data, headers=headers)
    
    # 3. Удаляем из активных
    requests.delete(f"{base_url}/orders?id=eq.{order_id}", headers=headers)
```

#### Доставлен (preparing → history)

То же самое что отменить, только заказ помечается как доставленный (уже в истории).

### 5. Отслеживание новых заказов (Realtime)

Для получения уведомлений о новых заказах в реальном времени используйте Supabase Realtime:

**Python пример (используя websockets):**
```python
from supabase import create_client, Client

url = "https://hywekhhycgxyhvvfzqnx.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
supabase: Client = create_client(url, key)

def handle_new_order(payload):
    order = payload['new']
    if order['status'] == 'pending':
        # Отправить сообщение админу
        send_order_notification(order)

# Подписка на новые заказы
supabase.table('orders').on('INSERT', handle_new_order).subscribe()
```

## Переменные для бота

### Обязательные переменные окружения:

```env
SUPABASE_URL=https://hywekhhycgxyhvvfzqnx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5d2VraGh5Y2d4eWh2dmZ6cW54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTIwOTEsImV4cCI6MjA3NTE4ODA5MX0.OaRRQGGI-dQ6-toiaOwQs-XI4z9etvS-xXMnJKZOU9Y
TELEGRAM_BOT_TOKEN=<ваш токен бота>
ADMIN_CHAT_ID=<ID чата админа>
```

### Названия функций в коде бота:

1. `get_pending_orders()` - получить заказы на рассмотрении
2. `format_order_message(order)` - форматировать сообщение
3. `accept_order(order_id)` - принять заказ
4. `cancel_order(order_id)` - отменить заказ
5. `deliver_order(order_id)` - доставить заказ
6. `handle_callback(callback_data)` - обработать нажатие кнопки

## Пример полного workflow бота

```python
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
import requests

SUPABASE_URL = "https://hywekhhycgxyhvvfzqnx.supabase.co/rest/v1"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def get_pending_orders():
    response = requests.get(
        f"{SUPABASE_URL}/orders?status=eq.pending&order=created_at.desc",
        headers=HEADERS
    )
    return response.json()

async def handle_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    
    action, order_id = query.data.split('_')
    
    if action == "accept":
        # Обновляем статус
        requests.patch(
            f"{SUPABASE_URL}/orders?id=eq.{order_id}",
            json={"status": "preparing"},
            headers=HEADERS
        )
        await query.edit_message_text("✅ Заказ принят!")
        
    elif action == "cancel":
        cancel_order(order_id)
        await query.edit_message_text("❌ Заказ отменён")
        
    elif action == "delivered":
        deliver_order(order_id)
        await query.edit_message_text("✅ Заказ доставлен!")

# Запуск бота
app = Application.builder().token("YOUR_BOT_TOKEN").build()
app.add_handler(CallbackQueryHandler(handle_callback))
app.run_polling()
```

## Тестирование

1. Создайте заказ на сайте через форму заказа
2. Проверьте, что заказ появился в БД со статусом `pending`
3. Бот должен получить уведомление и отправить сообщение админу
4. Протестируйте все кнопки (Принять, Отменить, Доставлен)
5. Проверьте, что статусы обновляются на сайте в профиле пользователя

## Важные замечания

- Трек-номер генерируется автоматически при создании заказа (10 цифр)
- Все статусы автоматически синхронизируются с сайтом
- Пользователь видит статус своего заказа в реальном времени в профиле
- История заказов хранится вечно в таблице `order_history`
