import httpx
import os
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

GROQ_API_KEY = settings.GROQ_API_KEY
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

@api_view(['POST'])
def chatbot_ask(request):
    user_input = request.data.get('message', '')
    if not user_input:
        return Response({'error': 'No message provided'}, status=status.HTTP_400_BAD_REQUEST)

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "llama3-8b-8192",  # можно позже поменять на более мощную модель
        "messages": [
            {"role": "system", "content": (
                "Ты помощник на сайте Health Map. Отвечай кратко, дружелюбно и на **русском языке**. "
                "Ты объясняешь медицинские и аналитические термины, помогаешь найти больницы и маршруты."
            )},
            {"role": "user", "content": user_input}
        ],
        "temperature": 0.7
    }

    try:
        response = httpx.post(GROQ_API_URL, headers=headers, json=payload, timeout=15)
        data = response.json()
        reply = data["choices"][0]["message"]["content"]
        return Response({"reply": reply})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
