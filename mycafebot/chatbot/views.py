
from django.shortcuts import render, redirect
from .models import MenuItem, Order
from .forms import OrderForm
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def menu(request):
    menu_items = MenuItem.objects.filter(stock='In Stock')
    return render(request, 'chatbot/menu.html', {'menu_items': menu_items})

def place_order(request, item_id):
    item = MenuItem.objects.get(pk=item_id)
    
    if request.method == 'POST':
        form = OrderForm(request.POST)
        if form.is_valid():
            order = form.save(commit=False)
            order.item = item
            order.total_price = item.price * order.quantity
            order.save()
            return redirect('order_history')
    else:
        form = OrderForm()

    return render(request, 'chatbot/place_order.html', {'form': form, 'item': item})

def order_history(request):
    orders = Order.objects.all()
    return render(request, 'chatbot/order_history.html', {'orders': orders})


def place_order(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            orders = data.get('orders', [])
            
            for order in orders:
                Order.objects.create(
                    seat_number=order['seat_number'],
                    item_id=order['item_id'],
                    quantity=order['quantity'],
                    total_price=order['total_price']
                )

            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)
