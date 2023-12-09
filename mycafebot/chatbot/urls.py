# chatbot/urls.py
from django.urls import path
from .views import menu, place_order, order_history

urlpatterns = [
    path('', menu, name='menu'),
    # path('place_order/<int:item_id>/', place_order, name='place_order'),
    # path('order_history/', order_history, name='order_history'),
    path('api/place-order/', place_order, name='place_order'),
]
