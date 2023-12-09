from django.db import models

class MenuItem(models.Model):
    CHOICE_STOCK = [
        ('In Stock', 'In Stock'),
        ('Out of Stock', 'Out of Stock'),
    ]
    name = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.CharField(max_length=50, choices=CHOICE_STOCK)
    image = models.ImageField(upload_to="images")

    def __str__(self):
        return self.name

class Order(models.Model):
    seat_number = models.CharField(max_length=10)  
    item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

