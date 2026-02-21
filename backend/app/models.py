from django.db import models
from django.core.validators import MinValueValidator

class Item(models.Model):  # Fixed inheritance here
    ALLOCATION_CHOICES = [
        ('TRAINING', 'Training Center'),
        ('NC2', 'NC II Assessment'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=50, help_text="e.g., bottles, pieces, towels")
    allocation_type = models.CharField(max_length=15, choices=ALLOCATION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_allocation_type_display()})"

class StockOutTransaction(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='stock_outs')
    quantity_deducted = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    release_date = models.DateTimeField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True, help_text="Reason for stock out or recipient")
    released_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.quantity_deducted} {self.item.unit} of {self.item.name} on {self.release_date.strftime('%Y-%m-%d')}"