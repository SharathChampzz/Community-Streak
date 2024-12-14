"""
This module provides a WebSocket endpoint that sends motivational quotes to connected clients every 5 minutes.
"""

import asyncio
import random
from fastapi import APIRouter, WebSocket

router = APIRouter()

# List of motivational quotes
MOTIVATIONAL_QUOTES = [
    "🌟 The best way to predict the future is to create it. 🚀",
    "😊 Success is not the key to happiness. Happiness is the key to success. 💡",
    "🌈 The only limit to our realization of tomorrow is our doubts of today. 💭",
    "⏰ Don’t watch the clock; do what it does. Keep going. 💪",
    "☀️ Keep your face always toward the sunshine—and shadows will fall behind you. 🌻",
    "🏆 Success usually comes to those who are too busy to be looking for it. 🔥",
    "✨ The future belongs to those who believe in the beauty of their dreams. 🌠",
    "💡 It always seems impossible until it’s done. 🏁",
    "⚔️ The harder the conflict, the greater the triumph. 🏅",
    "📆 Do something today that your future self will thank you for. 🎯",
    "🐢 It does not matter how slowly you go as long as you do not stop. 🛤️",
    "🌌 Dream big and dare to fail. 🚀",
    "🌍 Act as if what you do makes a difference. It does. 💥",
    "💪 Believe you can and you're halfway there. 🎉",
    "🔮 What lies behind us and what lies before us are tiny matters compared to what lies within us. 🕊️",
    "⏳ Your time is limited, don’t waste it living someone else’s life. 🚢",
    "🎯 You are never too old to set another goal or to dream a new dream. 🌟",
    "🤝 Strive not to be a success, but rather to be of value. 💎",
    "🔥 Don’t be pushed around by the fears in your mind. Be led by the dreams in your heart. ❤️",
    "💎 Hardships often prepare ordinary people for an extraordinary destiny. 🛡️",
]


@router.websocket("/motivation")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint to send motivational quotes every 5 minutes."""
    await websocket.accept()

    try:
        while True:
            # Choose a random quote
            quote = random.choice(MOTIVATIONAL_QUOTES)
            await websocket.send_text(quote)

            # Wait for 5 minutes before sending the next quote
            await asyncio.sleep(300)  # 300 seconds = 5 minutes
    except Exception as e:
        print(f"WebSocket connection closed: {e}")
