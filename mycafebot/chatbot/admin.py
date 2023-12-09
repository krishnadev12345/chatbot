from django.contrib import admin
from .models import Order, MenuItem

class OrderAdmin(admin.ModelAdmin):
    list_display = ('seat_number','item', 'quantity', 'total_price')
    list_filter=['seat_number']

class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'stock', 'price', 'image')
    list_editable = ('stock',)  
    list_filter=['stock']

admin.site.register(Order, OrderAdmin)
admin.site.register(MenuItem, MenuItemAdmin)
