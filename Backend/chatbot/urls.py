from django.urls import path
from .views import chatbot_ask

urlpatterns = [
    path('ask/', chatbot_ask, name='chatbot-ask'),
]